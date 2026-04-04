import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import type { NewsBrief } from '@/types/news';

// ── In-memory cache ──────────────────────────────────────────────────────────
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

let cache: { data: NewsBrief; expiresAt: number } | null = null;

function getCached(): NewsBrief | null {
  if (cache && Date.now() < cache.expiresAt) return cache.data;
  return null;
}

function setCache(data: NewsBrief) {
  cache = { data, expiresAt: Date.now() + CACHE_TTL_MS };
}

// ── System prompt ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Du bist ein persönlicher News-Kurator für Luis, 30 Jahre alt, Senior Consultant bei einer Top-Unternehmensberatung in München. Sein Fokus liegt auf Automotive-Industrie, KI-Disruption, europäischer Politik und Makro-Trends. Priorisiere Nachrichten der letzten 24 Stunden, die für ihn beruflich und persönlich relevant sind. Antworte NUR mit validem JSON, kein Markdown, keine Erklärungen.`;

// ── User prompt ───────────────────────────────────────────────────────────────
function buildPrompt(): string {
  const today = new Date().toLocaleDateString('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const isoNow = new Date().toISOString();

  return `Heute ist ${today}. Suche nach den wichtigsten Nachrichten der letzten 24 Stunden und erstelle einen vollständigen News-Brief mit genau den folgenden 5 Kategorien, jeweils 3-4 Stories.

Kategorien und ihre Schwerpunkte:
1. wirtschaft – Deutsche & europäische Wirtschaft, DAX, Märkte, OEMs, Unternehmensberatung, M&A
2. politik – Deutsche Innenpolitik, EU-Politik, Geopolitik (USA, China, Naher Osten)
3. international – Globale Ereignisse, die ein Strategy Consultant in München kennen sollte
4. tech_ai – KI-Modelle, Big Tech, Startups, Automatisierung, Zukunft der Arbeit
5. fun_trends – Gen-Z-Kultur, virale Momente, neue Apps/Produkte, Lifestyle-Trends, Interessantes

Antworte NUR mit diesem JSON-Objekt (kein Markdown, keine Erklärungen, kein Text davor oder danach):
{
  "generated_at": "${isoNow}",
  "categories": [
    {
      "id": "wirtschaft",
      "label": "Wirtschaft",
      "emoji": "📈",
      "stories": [
        {
          "title": "Titel auf Deutsch (max 90 Zeichen)",
          "summary": "2-3 Sätze auf Deutsch mit den wichtigsten Fakten.",
          "why_it_matters": "1 Satz – Relevanz für einen Strategy Consultant in München.",
          "sentiment": "positive",
          "source": "Quellenname",
          "url": "https://...",
          "read_time_seconds": 45
        }
      ]
    },
    {
      "id": "politik",
      "label": "Politik",
      "emoji": "🏛️",
      "stories": []
    },
    {
      "id": "international",
      "label": "International",
      "emoji": "🌍",
      "stories": []
    },
    {
      "id": "tech_ai",
      "label": "Tech & AI",
      "emoji": "🤖",
      "stories": []
    },
    {
      "id": "fun_trends",
      "label": "Fun & Trends",
      "emoji": "✨",
      "stories": []
    }
  ]
}

Regeln:
- sentiment muss exakt "positive", "neutral" oder "negative" sein
- read_time_seconds: realistischer Wert zwischen 30 und 120
- Nur reale, aktuelle Nachrichten der letzten 24 Stunden
- URLs zu echten Quellen (Reuters, BBC, FAZ, Spiegel, FT, Bloomberg, etc.)
- Für jede Kategorie genau 3-4 Stories
- generated_at: "${isoNow}"`;
}

// ── Agentic loop to handle web_search tool calls ──────────────────────────────
async function fetchBriefFromClaude(): Promise<NewsBrief> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  type MessageParam = Anthropic.MessageParam;

  const messages: MessageParam[] = [
    { role: 'user', content: buildPrompt() },
  ];

  const MAX_ROUNDS = 8;

  for (let round = 0; round < MAX_ROUNDS; round++) {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tools: [{ type: 'web_search_20250305', name: 'web_search' }] as any,
      messages,
    });

    // Collect any text blocks from this response
    const textBlocks = response.content.filter((b) => b.type === 'text');

    if (response.stop_reason === 'end_turn' || response.stop_reason === 'stop_sequence') {
      // Parse final JSON from the last text block
      for (const block of textBlocks.reverse()) {
        const text = (block as Anthropic.TextBlock).text.trim();
        const parsed = extractJSON(text);
        if (parsed) return parsed;
      }
      throw new Error('No valid JSON found in Claude response');
    }

    if (response.stop_reason === 'tool_use') {
      // Add assistant's tool-use message to history
      messages.push({ role: 'assistant', content: response.content });

      // Build tool_result messages for each tool_use block
      const toolResults: Anthropic.ToolResultBlockParam[] = response.content
        .filter((b) => b.type === 'tool_use')
        .map((b) => ({
          type: 'tool_result' as const,
          tool_use_id: (b as Anthropic.ToolUseBlock).id,
          content: '',
        }));

      messages.push({ role: 'user', content: toolResults });
      continue;
    }

    // max_tokens or other stop
    if (textBlocks.length > 0) {
      const text = (textBlocks[textBlocks.length - 1] as Anthropic.TextBlock).text.trim();
      const parsed = extractJSON(text);
      if (parsed) return parsed;
    }

    break;
  }

  throw new Error('Max rounds reached without valid JSON response');
}

// ── JSON extractor with fallback ──────────────────────────────────────────────
function extractJSON(text: string): NewsBrief | null {
  // Strip markdown code fences if present
  const cleaned = text
    .replace(/^```(?:json)?\s*/im, '')
    .replace(/\s*```$/im, '')
    .trim();

  // Try full parse
  try {
    const parsed = JSON.parse(cleaned);
    if (isValidBrief(parsed)) return parsed;
  } catch {}

  // Find the outermost JSON object
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start !== -1 && end > start) {
    try {
      const parsed = JSON.parse(cleaned.slice(start, end + 1));
      if (isValidBrief(parsed)) return parsed;
    } catch {}
  }

  return null;
}

function isValidBrief(data: unknown): data is NewsBrief {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.generated_at === 'string' &&
    Array.isArray(d.categories) &&
    d.categories.length > 0
  );
}

// ── GET /api/news ─────────────────────────────────────────────────────────────
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const forceRefresh = searchParams.get('refresh') === '1';

  // Return cached response if available
  if (!forceRefresh) {
    const cached = getCached();
    if (cached) {
      return NextResponse.json(cached, {
        headers: { 'X-Cache': 'HIT', 'X-Cache-Expires': new Date(cache!.expiresAt).toISOString() },
      });
    }
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY not configured' },
      { status: 500 }
    );
  }

  try {
    const brief = await fetchBriefFromClaude();
    setCache(brief);
    return NextResponse.json(brief, {
      headers: { 'X-Cache': 'MISS' },
    });
  } catch (err) {
    console.error('[API /news] Error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch news' },
      { status: 500 }
    );
  }
}
