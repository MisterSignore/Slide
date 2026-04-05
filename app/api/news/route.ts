import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import type { NewsBrief, Category, Story } from '@/types/news';

export const maxDuration = 60;

// ── Cache ────────────────────────────────────────────────────────────────────
const CACHE_TTL_MS = 30 * 60 * 1000;
let cache: { data: NewsBrief; expiresAt: number } | null = null;

function getCached(): NewsBrief | null {
  if (cache && Date.now() < cache.expiresAt) return cache.data;
  return null;
}

// ── Category definitions ──────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'wirtschaft',   label: 'Wirtschaft',   emoji: '📈', query: 'Deutsche und europäische Wirtschaft, DAX, Märkte, OEMs, Unternehmensberatung, M&A' },
  { id: 'politik',      label: 'Politik',       emoji: '🏛️', query: 'Deutsche Innenpolitik, EU-Politik, Geopolitik USA China Naher Osten' },
  { id: 'international',label: 'International', emoji: '🌍', query: 'Globale Ereignisse die ein Strategy Consultant in München kennen sollte' },
  { id: 'tech_ai',      label: 'Tech & AI',     emoji: '🤖', query: 'KI-Modelle, Big Tech, Startups, Automatisierung, Zukunft der Arbeit' },
  { id: 'fun_trends',   label: 'Fun & Trends',  emoji: '✨', query: 'Gen-Z-Kultur, virale Momente, neue Apps, Lifestyle-Trends' },
];

const SYSTEM_PROMPT =
  'Du bist News-Kurator für Luis, 30, Senior Consultant in München (Fokus: Automotive, KI, EU-Politik). ' +
  'Antworte NUR mit einem JSON-Array, kein Markdown, keine Erklärungen.';

// ── Fetch one category in parallel ───────────────────────────────────────────
async function fetchCategory(
  anthropic: Anthropic,
  cat: (typeof CATEGORIES)[0],
  today: string,
  isoNow: string,
): Promise<Category> {
  const prompt =
    `Heute ist ${today}. Suche nach 2-3 aktuellen Nachrichten der letzten 24 Stunden zum Thema: ${cat.query}.\n\n` +
    `Antworte NUR mit einem JSON-Array (kein Markdown):\n` +
    `[{"title":"Schlagzeile auf Deutsch","summary":"2-3 Sätze auf Deutsch.","why_it_matters":"1 Satz Relevanz für Strategy Consultant.","sentiment":"neutral","source":"Quellenname","url":"https://...","read_time_seconds":45}]`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tools: [{ type: 'web_search_20250305', name: 'web_search' }] as any,
      messages: [{ role: 'user', content: prompt }],
    });

    const textBlock = response.content.find((b) => b.type === 'text');
    if (!textBlock) return { id: cat.id, label: cat.label, emoji: cat.emoji, stories: [] };

    const text = (textBlock as Anthropic.TextBlock).text.trim()
      .replace(/^```(?:json)?\s*/im, '').replace(/\s*```$/im, '').trim();

    const arr = JSON.parse(text.slice(text.indexOf('['), text.lastIndexOf(']') + 1));
    const stories: Story[] = (Array.isArray(arr) ? arr : []).map((s: Partial<Story>) => ({
      title: s.title ?? '',
      summary: s.summary ?? '',
      why_it_matters: s.why_it_matters ?? '',
      sentiment: (['positive', 'neutral', 'negative'].includes(s.sentiment ?? '') ? s.sentiment : 'neutral') as Story['sentiment'],
      source: s.source ?? '',
      url: s.url ?? '',
      read_time_seconds: s.read_time_seconds ?? 45,
    }));

    return { id: cat.id, label: cat.label, emoji: cat.emoji, stories };
  } catch (err) {
    console.error(`[news] Category ${cat.id} failed:`, err);
    return { id: cat.id, label: cat.label, emoji: cat.emoji, stories: [] };
  }
}

// ── Main fetch: all categories in parallel ────────────────────────────────────
async function fetchBrief(): Promise<NewsBrief> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const today = new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const isoNow = new Date().toISOString();

  const categories = await Promise.all(
    CATEGORIES.map((cat) => fetchCategory(anthropic, cat, today, isoNow))
  );

  return { generated_at: isoNow, categories };
}

// ── GET /api/news ─────────────────────────────────────────────────────────────
export async function GET(request: Request) {
  const forceRefresh = new URL(request.url).searchParams.get('refresh') === '1';

  if (!forceRefresh && cache && Date.now() < cache.expiresAt) {
    return NextResponse.json(cache.data, { headers: { 'X-Cache': 'HIT' } });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });
  }

  try {
    const brief = await fetchBrief();
    cache = { data: brief, expiresAt: Date.now() + CACHE_TTL_MS };
    return NextResponse.json(brief, { headers: { 'X-Cache': 'MISS' } });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unbekannter Fehler';
    console.error('[API /news]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
