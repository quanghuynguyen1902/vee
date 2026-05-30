import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Plus, X } from 'lucide-react';

export default function ChatPanel({ contextSentence }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setError('');
    setLoading(true);

    try {
      const context = contextSentence
        ? `Ngườ dùng đang làm bài tập với câu: "${contextSentence.vi}" (Tiếng Anh: "${contextSentence.en.join(' ')}"). `
        : '';

      const payloadMessages = nextMessages.map((m) => ({
        role: m.role,
        content: m.role === 'user' && context && messages.length === 0 ? context + m.content : m.content
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: payloadMessages })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Lỗi ${res.status}`);
      }

      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setError(err.message || 'Lỗi gửi tin nhắn');
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function clearChat() {
    setMessages([]);
    setError('');
    setInput('');
  }

  if (!isOpen) {
    return (
      <button className="chat-fab" onClick={() => setIsOpen(true)} title="Hỏi AI">
        <Bot size={22} />
      </button>
    );
  }

  return (
    <div className="chat-popup">
      <div className="chat-panel">
        <div className="chat-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Bot size={18} />
            <span>Hỏi AI</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <button className="chat-new-btn" onClick={clearChat} title="Đoạn chat mới">
              <Plus size={16} />
            </button>
            <button className="chat-close-btn" onClick={() => setIsOpen(false)} title="Đóng">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="chat-empty">
              <Bot size={32} />
              <p>Hỏi AI về từ vựng, ngữ pháp, hoặc cách dịch câu này.</p>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`chat-bubble ${m.role}`}>
              <div className="chat-avatar">
                {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>
              <div className="chat-content">
                <div className="chat-text">{m.content}</div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="chat-bubble assistant">
              <div className="chat-avatar">
                <Bot size={14} />
              </div>
              <div className="chat-content">
                <div className="chat-text">
                  <Loader2 size={14} className="spin" />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="chat-error">
              {error}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <div className="chat-input-area">
          <input
            type="text"
            className="chat-input"
            placeholder="Nhập câu hỏi..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button
            className="chat-send-btn"
            onClick={handleSend}
            disabled={loading || !input.trim()}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
