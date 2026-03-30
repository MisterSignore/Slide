import Anthropic from '@anthropic-ai/sdk';
import { insertArticles } from './db.js';
import crypto from 'crypto';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const CATEGORY_QUERIES = {
  politik: {
    label: 'Globale Politik',
    query: 'top global political news today: elections, conflicts, diplomacy, international relations',
  },
  wirtschaft: {
    label: 'Wirtschaft',
    query: 'top economic and business news today: markets, companies, trade, economy',
  },
  tech: {
    label: 'Tech & AI',
    query: 'top technology and AI news today: artificial intelligence, startups, science breakthroughs, software',
  },
  faszinierend: {
    label: 'Faszinierend',
    query: 'fascinating science and nature news today: discoveries, space, biology, surprising facts, mind-blowing findings',
  },
  fun: {
    label: 'Fun & Kurios',
    query: 'funny quirky surprising uplifting news today: unusual events, unexpected records, feel-good stories',
  },
};

// Use Claude with web_search to find and summarize news for a category
async function fetchCategoryWithWebSearch(cat, config) {
  const today = new Date().toLocaleDateString('de-DE', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const prompt = `Du bist der Redaktions-KI für "Slide" - eine Premium News App für neugierige, intelligente Leser. Heute ist der ${today}.

Suche nach den wichtigsten und interessantesten aktuellen Nachrichten zum Thema: ${config.query}

Wähle die TOP 8 Geschichten aus und gib sie als JSON Array zurück.

Für jede Geschichte:
- "title": Packende deutsche Schlagzeile (max 80 Zeichen) - direkt, klar, keine Clickbait-Floskeln
- "summary": 2-3 Sätze auf Deutsch: Was ist passiert? Welche Fakten sind wichtig?
- "why_it_matters": Ein prägnanter deutscher Satz: Warum ist das relevant? Was ist das große Bild?
- "source_name": Name der Quelle (z.B. "Reuters", "BBC", "The Guardian")
- "source_url": URL des Originalartikels (falls verfügbar)
- "image_keyword": 1-2 englische Wörter als visuelles Konzept (z.B. "parliament", "rocket", "stock market")
- "category": "${cat}"

Regeln:
- Nur real existierende, aktuelle Nachrichten - keine erfundenen Geschichten
- Bevorzuge Geschichten mit überregionaler Relevanz
- Keine Duplikate, kein reines Clickbait
- Antworte NUR mit dem JSON Array, kein Markdown, keine Erklärung`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages: [{ role: 'user', content: prompt }],
    });

    // Extract the final text response (after tool use)
    const textBlock = message.content.find((b) => b.type === 'text');
    if (!textBlock) {
      console.warn(`[Claude] No text response for ${cat}`);
      return [];
    }

    const jsonText = textBlock.text.trim()
      .replace(/^```json\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const articles = JSON.parse(jsonText);

    return articles.map((item) => ({
      title: item.title ?? '',
      summary: item.summary ?? '',
      why_it_matters: item.why_it_matters ?? '',
      category: cat,
      source_name: item.source_name ?? 'Slide',
      source_url: item.source_url ?? '',
      image_keyword: item.image_keyword ?? 'news',
      fetched_at: new Date().toISOString().split('T')[0],
      published_date: new Date().toISOString(),
      external_id: crypto
        .createHash('md5')
        .update(cat + item.title + new Date().toISOString().split('T')[0])
        .digest('hex'),
    }));
  } catch (err) {
    console.error(`[Claude] Failed for ${cat}:`, err.message);
    return [];
  }
}

// Main refresh function - called by cron or on-demand
export async function refreshNews() {
  console.log('[NewsService] Starting news refresh via Claude web search...');
  const startTime = Date.now();

  const categories = Object.entries(CATEGORY_QUERIES);
  const allArticles = [];

  // Process sequentially to avoid rate limits
  for (const [cat, config] of categories) {
    console.log(`[Claude] Fetching ${config.label}...`);
    const articles = await fetchCategoryWithWebSearch(cat, config);
    console.log(`[Claude] ${cat}: got ${articles.length} articles`);
    allArticles.push(...articles);
  }

  if (allArticles.length > 0) {
    insertArticles(allArticles);
    console.log(
      `[NewsService] Done. Inserted ${allArticles.length} articles in ${((Date.now() - startTime) / 1000).toFixed(1)}s`
    );
  } else {
    console.warn('[NewsService] No articles fetched - check API key and web_search availability');
  }

  return allArticles.length;
}
