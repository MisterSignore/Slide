import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'No API key' }, { status: 500 });
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  // Step 1: Test basic Claude call without web_search
  try {
    const simple = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 100,
      messages: [{ role: 'user', content: 'Say "ok" in JSON: {"status":"ok"}' }],
    });
    const simpleText = simple.content.find((b) => b.type === 'text');

    // Step 2: Test with web_search for one category
    let searchResult: string | null = null;
    let searchError: string | null = null;
    let stopReason: string | null = null;
    let contentTypes: string[] = [];

    try {
      const search = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 512,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tools: [{ type: 'web_search_20250305', name: 'web_search' }] as any,
        messages: [{ role: 'user', content: 'Search for todays top tech news and return ONE result as JSON array: [{"title":"...","source":"..."}]' }],
      });
      stopReason = search.stop_reason;
      contentTypes = search.content.map((b) => b.type);
      const textBlock = search.content.find((b) => b.type === 'text');
      searchResult = textBlock ? (textBlock as Anthropic.TextBlock).text.slice(0, 300) : null;
    } catch (e) {
      searchError = e instanceof Error ? e.message : String(e);
    }

    return NextResponse.json({
      simpleCall: { ok: !!simpleText, text: simpleText ? (simpleText as Anthropic.TextBlock).text : null },
      webSearch: { stopReason, contentTypes, result: searchResult, error: searchError },
    });
  } catch (e) {
    return NextResponse.json({
      error: e instanceof Error ? e.message : String(e),
    }, { status: 500 });
  }
}
