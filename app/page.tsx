'use client';
import { useState } from 'react';

export default function Home() {
  const [msg, setMsg] = useState('');
  const [answer, setAnswer] = useState<string>('');
  const [loading, setLoading] = useState(false);

  async function send() {
    setLoading(true);
    setAnswer('');
    try {
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      });
      const data = await r.json();
      setAnswer(data.answer ?? data.error ?? 'Error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 720, margin: '40px auto', fontFamily: 'ui-sans-serif' }}>
      {/* Title */}
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 4 }}>
        Vlad&apos;s Private AI
      </h1>
      {/* Subtitle */}
      <p style={{ color: '#666', marginBottom: 20 }}>
        Based on OpenAI GPT-4o mini (lightweight & private)
      </p>

      <textarea
        rows={6}
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        placeholder="Type your question here..."
        style={{ width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 8 }}
      />
      <div style={{ marginTop: 12 }}>
        <button
          onClick={send}
          disabled={!msg.trim() || loading}
          style={{ padding: '10px 16px', borderRadius: 8, background: '#111', color: '#fff' }}
        >
          {loading ? 'Thinking…' : 'Send'}
        </button>
      </div>
      {answer && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            border: '1px solid #eee',
            borderRadius: 8,
            background: '#fafafa',
          }}
        >
          <b>Answer</b>
          <div style={{ whiteSpace: 'pre-wrap', marginTop: 8 }}>{answer}</div>
        </div>
      )}
    </main>
  );
}
