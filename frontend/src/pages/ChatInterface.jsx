import { useState, useEffect, useRef } from 'react';
import { sendChatMessage, fetchChatHistory, clearChatHistory } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Send, Bot, User, Trash2, Zap, TrendingUp, DollarSign, ShoppingCart } from 'lucide-react';

const SUGGESTIONS = [
  { icon: DollarSign, text: 'What is my total spending?' },
  { icon: TrendingUp, text: 'Where do I spend the most?' },
  { icon: ShoppingCart, text: 'Show my top 3 categories' },
  { icon: Zap, text: 'Any unusual spending patterns?' },
];

export default function ChatInterface() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    fetchChatHistory()
      .then(res => {
        if (res.data.length === 0) {
          setMessages([{
            role: 'assistant',
            content: `Hey ${user?.name?.split(' ')[0] || 'there'}! 👋 I'm your AI financial advisor. I have access to all your real transaction data.\n\nAsk me anything — like "Where did I overspend?" or "What's my biggest expense category?"`,
          }]);
        } else {
          setMessages(res.data);
        }
      })
      .catch(() => {
        setMessages([{ role: 'assistant', content: "Hi! I couldn't load your chat history. Please refresh." }]);
      });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (text) => {
    const msg = text || input;
    if (!msg.trim() || isTyping) return;
    setInput('');
    setMessages(p => [...p, { role: 'user', content: msg }]);
    setIsTyping(true);
    setError('');
    try {
      const res = await sendChatMessage(msg);
      setMessages(p => [...p, { role: 'assistant', content: res.data.response }]);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'No OpenAI key configured. Add OPENAI_API_KEY to backend/.env';
      setMessages(p => [...p, { role: 'assistant', content: `⚠️ ${errMsg}` }]);
    } finally { setIsTyping(false); }
  };

  const handleClear = async () => {
    await clearChatHistory();
    setMessages([{ role: 'assistant', content: 'History cleared! What would you like to know about your finances?' }]);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', padding: '24px 32px', gap: 16 }}>
      {/* Header */}
      <div className="fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, #6c63ff20, #22d3ee10)', border: '1px solid rgba(108,99,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={20} color="#a5b4fc" />
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: 'white', margin: 0 }}>AI Financial Advisor</h1>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: 0 }}>Powered by your real expense data · GPT-4</p>
          </div>
        </div>
        <button onClick={handleClear} className="btn-ghost" style={{ padding: '8px 14px', fontSize: 12 }}>
          <Trash2 size={13} /> Clear history
        </button>
      </div>

      {/* Messages */}
      <div className="surface-card fade-up-1" style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', animation: 'fadeUp 0.3s ease' }}>
            {/* Avatar */}
            <div style={{
              width: 34, height: 34, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: msg.role === 'user'
                ? 'linear-gradient(135deg, #6c63ff, #4f46e5)'
                : 'rgba(34,211,238,0.12)',
              border: msg.role === 'user' ? 'none' : '1px solid rgba(34,211,238,0.2)',
            }}>
              {msg.role === 'user' ? <User size={16} color="white" /> : <Bot size={16} color="#22d3ee" />}
            </div>

            {/* Bubble */}
            <div style={{
              maxWidth: '72%',
              padding: '12px 16px',
              borderRadius: msg.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
              background: msg.role === 'user'
                ? 'linear-gradient(135deg, #6c63ff, #4f46e5)'
                : 'rgba(255,255,255,0.05)',
              border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.06)',
              color: msg.role === 'user' ? 'white' : 'rgba(255,255,255,0.8)',
              fontSize: 14,
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
            }}>
              {msg.content}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(34,211,238,0.12)', border: '1px solid rgba(34,211,238,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Bot size={16} color="#22d3ee" />
            </div>
            <div style={{ padding: '14px 18px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '4px 16px 16px 16px', display: 'flex', gap: 6, alignItems: 'center' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#a5b4fc', animation: `bounce 1.2s ${i * 0.15}s infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions (only on first load) */}
      {messages.length <= 1 && (
        <div className="fade-up-2" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flexShrink: 0 }}>
          {SUGGESTIONS.map(({ icon: Icon, text }) => (
            <button key={text} onClick={() => handleSend(text)} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px',
              background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.15)',
              borderRadius: 10, color: '#a5b4fc', fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(108,99,255,0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(108,99,255,0.08)'}>
              <Icon size={13} /> {text}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="surface-card fade-up-3" style={{ padding: '12px 16px', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask about your spending, trends, or budget..."
            disabled={isTyping}
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'rgba(255,255,255,0.8)', fontSize: 14 }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="btn-primary"
            style={{ padding: '10px 16px', flexShrink: 0 }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes bounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }
      `}</style>
    </div>
  );
}
