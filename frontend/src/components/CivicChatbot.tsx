import React, { useState } from 'react';

type Message = { role: 'user' | 'assistant'; content: string };
const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
export function CivicChatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function send(e: React.FormEvent) {
    e.preventDefault();
    const question = input.trim();
    if (!question || busy) return;
    const previous = messages;
    setMessages([...previous, { role: 'user', content: question }]);
    setInput(''); setBusy(true); setError('');
    try {
      const response = await fetch(`${API}/api/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: question, history: previous }) });
      if (!response.ok) throw new Error('AI assistant is unavailable. Please try again.');
      const data = await response.json();
      if (typeof data.answer !== 'string' || !data.answer.trim()) throw new Error('The assistant returned an empty answer.');
      setMessages(m => [...m, { role: 'assistant', content: data.answer }]);
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to reach assistant.'); }
    finally { setBusy(false); }
  }
  return <div className="fixed bottom-5 right-5 z-50">
    {open && <section className="mb-3 w-[min(90vw,360px)] h-[440px] bg-white rounded-2xl shadow-2xl border flex flex-col overflow-hidden" aria-label="RabtaaAI civic assistant">
      <header className="bg-emerald-800 text-white p-4 font-semibold">RabtaaAI Civic Assistant</header>
      <div className="flex-1 overflow-y-auto p-3 space-y-3" aria-live="polite">
        {messages.length === 0 && <p className="text-sm text-gray-600">Ask how to report a problem or find civic services.</p>}
        {messages.map((m, i) => <p key={i} className={`text-sm p-3 rounded-xl whitespace-pre-wrap ${m.role === 'user' ? 'bg-emerald-100 ml-7' : 'bg-gray-100 mr-7'}`}>{m.content}</p>)}
        {busy && <p className="text-sm text-gray-500">Thinking…</p>}
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      </div>
      <form onSubmit={send} className="p-3 border-t flex gap-2"><input aria-label="Ask the civic assistant" className="min-w-0 flex-1 border rounded-lg p-2 text-sm" value={input} onChange={e => setInput(e.target.value)} placeholder="Ask a question…" /><button disabled={busy} className="bg-emerald-800 text-white px-3 rounded-lg disabled:opacity-50">Send</button></form>
    </section>}
    <button onClick={() => setOpen(o => !o)} className="bg-emerald-800 text-white shadow-lg rounded-full px-5 py-3" aria-expanded={open}>{open ? 'Close chat' : 'Civic Assistant'}</button>
  </div>;
}
