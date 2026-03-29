import Parser from 'rss-parser';
import Anthropic from '@anthropic-ai/sdk';
import { RSS_FEEDS } from './rssFeeds.js';
import { insertArticles, getLatestFetchDate } from './db.js';
import crypto from 'crypto';

const rssParser = new Parser({
  timeout: 10000,
  headers: { 'User-Agent': 'Slide-NewsApp/1.0' },
});

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Fetch raw items from all RSS feeds for a given category or all
async function fetchRssItems(feeds) {
  const results = [];
  await Promise.allSettled(
    feeds.map(async (feed) => {
      try {
        const parsed = await rssParser.parseURL(feed.url);
        const items = (parsed.items || []).slice(0, 8).map((item) => ({
          title: item.title?.trim() ?? '',
          description: item.contentSnippet?.trim() ?? item.summary?.trim() ?? '',
          link: item.link ?? item.guid ?? '',
          pubDate: item.pubDate ?? item.isoDate ?? new Date().toISOString(),
          sourceName: feed.name,
          category: feed.category,
        }));
        results.push(...items);
      } catch (err) {
        console.warn(`[RSS] Failed to fetch ${feed.name}: ${err.message}`);
      }
    })
  );
  return results;
}

// Ask Claude to filter, summarize, and enrich the raw items
async function enrichWithClaude(rawItems, category) {
  if (rawItems.length === 0) return [];

  const itemsText = rawItems
    .slice(0, 40)
    .map(
      (item, i) =>
        `[${i}] SOURCE: ${item.sourceName} | CATEGORY: ${item.category}\nTITLE: ${item.title}\nSNIPPET: ${item.description.substring(0, 300)}\nURL: ${item.link}`
    )
    .join('\n\n---\n\n');

  const categoryInstructions = {
    all: 'Mix of all topics',
    politik: 'Global politics, international relations, elections, conflicts',
    wirtschaft: 'Global economy, markets, companies, trade',
    tech: 'Technology, AI, startups, science breakthroughs',
    faszinierend: 'Fascinating science, nature, discoveries, mind-blowing facts',
    fun: 'Amusing, quirky, surprising, feel-good stories',
  };

  const prompt = `You are the editorial AI for "Slide" - a premium news app for curious, intelligent readers.

Below are raw RSS feed items (category focus: ${categoryInstructions[category] || 'all topics'}).

Your task: Select the TOP 10 most newsworthy, interesting, or surprising items and return them as a JSON array.

For each selected item, provide:
- "index": the original [index] number
- "title": A punchy, engaging German headline (max 80 chars). Rewrite if needed to be compelling.
- "summary": 2-3 sentences in German explaining what happened and the key facts.
- "why_it_matters": One crisp German sentence: why should readers care? What's the bigger picture?
- "image_keyword": 1-2 English words describing a visual concept for this story (for background imagery)
- "category": one of: politik, wirtschaft, tech, faszinierend, fun

Rules:
- Prefer stories with broad relevance or surprising angles
- Skip pure clickbait, duplicates, or purely local stories with no global angle
- Be concise and direct - no filler language
- Output ONLY valid JSON array, no markdown, no explanation

RSS ITEMS:
${itemsText}`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content[0].text.trim();
    // Strip markdown code blocks if present
    const jsonText = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    const enriched = JSON.parse(jsonText);

    return enriched.map((item) => {
      const original = rawItems[item.index] ?? rawItems[0];
      return {
        title: item.title ?? original.title,
        summary: item.summary ?? '',
        why_it_matters: item.why_it_matters ?? '',
        category: item.category ?? original.category,
        source_name: original.sourceName,
        source_url: original.link,
        image_keyword: item.image_keyword ?? 'news',
        fetched_at: new Date().toISOString().split('T')[0],
        published_date: original.pubDate,
        external_id: crypto
          .createHash('md5')
          .update(original.link + original.title)
          .digest('hex'),
      };
    });
  } catch (err) {
    console.error('[Claude] Enrichment failed:', err.message);
    return [];
  }
}

// Main refresh function - called by cron or on-demand
export async function refreshNews() {
  console.log('[NewsService] Starting news refresh...');
  const startTime = Date.now();

  // Group feeds by category and process in parallel
  const categories = ['politik', 'wirtschaft', 'tech', 'faszinierend', 'fun'];
  const allArticles = [];

  await Promise.allSettled(
    categories.map(async (cat) => {
      const feeds = RSS_FEEDS.filter((f) => f.category === cat);
      const raw = await fetchRssItems(feeds);
      console.log(`[RSS] ${cat}: fetched ${raw.length} raw items`);
      const enriched = await enrichWithClaude(raw, cat);
      console.log(`[Claude] ${cat}: enriched ${enriched.length} articles`);
      allArticles.push(...enriched);
    })
  );

  if (allArticles.length > 0) {
    insertArticles(allArticles);
    console.log(
      `[NewsService] Done. Inserted ${allArticles.length} articles in ${((Date.now() - startTime) / 1000).toFixed(1)}s`
    );
  }

  return allArticles.length;
}
