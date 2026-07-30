import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { chat } from '../api';

export default function ChatWidget() {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ text: "Hi! I'm ShopBot. How can I help you today?", isBot: true }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEnd = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  if (!isAuthenticated) return null;

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setMessages((prev) => [...prev, { text, isBot: false }]);
    setInput('');
    setLoading(true);
    try {
      const data = await chat.send(text);
      setMessages((prev) => [...prev, { text: data.response, isBot: true }]);
    } catch {
      setMessages((prev) => [...prev, { text: "Sorry, I'm having trouble. Please try again.", isBot: true }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
      >
        <i className={`fas ${open ? 'fa-times' : 'fa-comments'} text-xl`}></i>
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-slide-up">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-4">
            <div className="flex items-center space-x-3">
              <i className="fas fa-robot text-xl"></i>
              <div>
                <h3 className="font-semibold">ShopBot</h3>
                <p className="text-xs text-white/70">Online - Ask me anything!</p>
              </div>
            </div>
          </div>

          <div className="h-80 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.isBot ? 'justify-start' : 'justify-end'}`}>
                {m.isBot && <i className="fas fa-robot text-indigo-600 mt-1 mr-2"></i>}
                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                  m.isBot ? 'bg-white border border-gray-200 text-gray-700 rounded-tl-sm' : 'bg-indigo-600 text-white rounded-tr-sm'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <i className="fas fa-robot text-indigo-600 mt-1 mr-2"></i>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 flex space-x-1.5">
                  <span className="typing-dot w-2 h-2 bg-gray-400 rounded-full inline-block"></span>
                  <span className="typing-dot w-2 h-2 bg-gray-400 rounded-full inline-block"></span>
                  <span className="typing-dot w-2 h-2 bg-gray-400 rounded-full inline-block"></span>
                </div>
              </div>
            )}
            <div ref={messagesEnd}></div>
          </div>

          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-center space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all"
                maxLength={1000}
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="w-10 h-10 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white rounded-xl flex items-center justify-center transition-colors"
              >
                <i className="fas fa-paper-plane text-sm"></i>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
