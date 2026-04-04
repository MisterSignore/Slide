import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import type { NewsBrief } from '@/types/news';

// Vercel: allow up to 60s for Claude + web_search
export const maxDuration = 60;

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
const SYSTEM_PROMPT =
  'Du bist ein persönlicher News-Kurator für Luis, 30 Jahre alt, ' +
  'Senior Consultant bei einer Top-Unternehmensberatung in München. ' +
  'Sein Fokus liegt auf Automotive-Industrie, KI-Disruption, europäischer Politik und Makro-Trends. ' +
  'Priorisiere Nachrichten der letzten 24 Stunden, die für ihn beruflich und persönlich relevant sind. ' +
  'Antworte NUR mit validem JSON, kein Markdown, keine Erklärungen.';

// ── User prompt ───────────────────────────────────────────────────────────────
function buildPrompt(): string {
  const today = new Date().toLocaleDateString('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const isoNow = new Date().toISOString();

  return `Heute ist ${today}. Suche nach den wichtigsten Nachrichten der letzten 24 Stunden und erstelle einen vollständigen News-Brief mit genau 5 Kategorien (je 3-4 Stories).

Kategorien:
1. wirtschaft – Deutsche & europäische Wirtschaft, DAX, Märkte, OEMs, Unternehmensberatung, M&A
2. politik – Deutsche Innenpolitik, EU-Politik, Geopolitik (USA, China, Naher Osten)
3. international – Globale Ereignisse, die ein Strategy Consultant in München kennen sollte
4. tech_ai – KI-Modelle, Big Tech, Startups, Automatisierung, Zukunft der Arbeit
5. fun_trends – Gen-Z-Kultur, virale Momente, neue Apps/Produkte, Lifestyle-Trends

Antworte NUR mit diesem JSON (kein Markdown, kein Text davor/danach):
{"generated_at":"${isoNow}","categories":[{"id":"wirtschaft","label":"Wirtschaft","emoji":"📈","stories":[{"title":"...","summary":"2-3 Sätze auf Deutsch.","why_it_matters":"1 Satz Relevanz für Strategy Consultant.","sentiment":"positive","source":"Reuters","url":"https://...","read_time_seconds":45}]},{"id":"politik","label":"Politik","emoji":"🏛️","stories":[]},{"id":"international","label":"International","emoji":"🌍","stories":[]},{"id":"tech_ai","label":"Tech & AI","emoji":"🤖","stories":[]},{"id":"fun_trends","label":"Fun & Trends","emoji":"✨","stories":[]}]}

Regeln:
- sentiment: exakt "positive", "neutral" oder "negative"
- read_time_seconds: 30-120
- Nur reale Nachrichten der letzten 24 Stunden
- Je Kategorie 3-4 Stories
- generated_at muss "${isoNow}" sein`;
}

// ── Single-call fetch (web_search_20250305 is server-side at Anthropic) ───────
async function fetchBriefFromClaude(): Promise<NewsBrief> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 16000,
    system: SYSTEM_PROMPT,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tools: [{ type: 'web_search_20250305', name: 'web_search' }] as any,
    messages: [{ role: 'user', content: buildPrompt() }],
  });

  // web_search is server-side: Anthropic returns tool_use + tool_result + text in one response
  const textBlock = response.content.find((b) => b.type === 'text');
  if (!textBlock) {
    console.error('[API /news] No text block. stop_reason:', response.stop_reason, 'content types:', response.content.map(b => b.type));
    throw new Error(`Claude returned no text (stop_reason: ${response.stop_reason})`);
  }

  const text = (textBlock as Anthropic.TextBlock).text.trim();
  const parsed = extractJSON(text);
  if (!parsed) {
    console.error('[API /news] JSON parse failed. Raw text (first 500):', text.slice(0, 500));
    throw new Error('Claude response konnte nicht als JSON geparst werden');
  }

  return parsed;
}

// ── JSON extractor with fallback ──────────────────────────────────────────────
function extractJSON(text: string): NewsBrief | null {
  const cleaned = text
    .replace(/^```(?:json)?\s*/im, '')
    .replace(/\s*```$/im, '')
    .trim();

  try {
    const parsed = JSON.parse(cleaned);
    if (isValidBrief(parsed)) return parsed;
  } catch {}

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

  if (!forceRefresh) {
    const cached = getCached();
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          'X-Cache': 'HIT',
          'X-Cache-Expires': new Date(cache!.expiresAt).toISOString(),
        },
      });
    }
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });
  }

  try {
    const brief = await fetchBriefFromClaude();
    setCache(brief);
    return NextResponse.json(brief, { headers: { 'X-Cache': 'MISS' } });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unbekannter Fehler';
    console.error('[API /news] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
