// app/api/chat/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ChatBody = { message?: string };

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4o-mini';

function redact(input: string) {
  return input
    .replace(/\b[\w.+-]+@[\w.-]+\.\w+\b/g, '<email>')
    .replace(/\b\d{16}\b/g, '<card>')
    .replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, '<ip>');
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Missing OPENAI_API_KEY' }), { status: 500 });
    }

    const body = (await req.json()) as ChatBody;
    const userMsg = String(body?.message ?? '').slice(0, 4000);
    if (!userMsg.trim()) {
      return new Response(JSON.stringify({ error: 'Empty message' }), { status: 400 });
    }

    const sanitized = redact(userMsg);

    const r = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: sanitized }],
        temperature: 0.2,
      }),
    });

    if (!r.ok) {
      const text = await r.text();
      return new Response(JSON.stringify({ error: text }), { status: r.status });
    }

    const data = await r.json();
    const answer = data?.choices?.[0]?.message?.content ?? '';

    return new Response(JSON.stringify({ answer }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message ?? 'Server error' }), { status: 500 });
  }
}
