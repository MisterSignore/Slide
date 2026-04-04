import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ok: true,
    hasApiKey: !!process.env.ANTHROPIC_API_KEY,
    apiKeyPrefix: process.env.ANTHROPIC_API_KEY?.slice(0, 12) ?? 'NOT SET',
    timestamp: new Date().toISOString(),
    node: process.version,
  });
}
