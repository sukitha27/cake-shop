import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Sparkles, ChevronRight } from 'lucide-react';
import { Product, FALLBACK_IMAGE } from '../App';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  recommendedProducts?: Product[];
  isLoading?: boolean;
}

interface ChatBotProps {
  products: Product[];
  onViewProduct?: (product: Product) => void;
}

const SUGGESTED_QUESTIONS = [
  "What's your best seller? 🏆",
  "Show me gluten-free options 🌾",
  "Something special for a birthday? 🎂",
  "I'm a chocolate lover! 🍫",
];

function parseProductTags(content: string, products: Product[]): Product[] {
  const found: Product[] = [];
  const regex = /\[PRODUCT:\s*([^\]]+)\]/gi;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const name = match[1].trim().toLowerCase();
    const product = products.find(
      p => p.name.toLowerCase().includes(name) || name.includes(p.name.toLowerCase())
    );
    if (product && !found.find(f => f.name === product.name)) found.push(product);
  }
  return found;
}

function stripProductTags(content: string): string {
  return content.replace(/\[PRODUCT:\s*[^\]]+\]/gi, '').replace(/\s{2,}/g, ' ').trim();
}

export const ChatBot = React.memo(function ChatBot({ products, onViewProduct }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        setMessages([{
          id: 'welcome',
          role: 'assistant',
          content: "Hi! I'm Maggie 🧁 Magnolia's AI assistant. I can recommend treats, check ingredients, or help you find the perfect gift. What are you looking for today?",
        }]);
      }, 300);
    }
    if (isOpen) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 350);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', content: text };
    const loadingMsg: Message = { id: 'loading', role: 'assistant', content: '', isLoading: true };

    setMessages(prev => [...prev, userMsg, loadingMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages
        .filter(m => !m.isLoading)
        .map(m => ({ role: m.role, content: m.content }));

      const catalog = products
        .map(p =>
          `- ${p.name} ($${p.price.toFixed(2)}, ${p.category}): ${p.description || ''}${
            p.dietaryTags?.length ? ` [${p.dietaryTags.join(', ')}]` : ''
          } | Stock: ${p.stockQuantity}`
        )
        .join('\n');

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 400,
          system: `You are Maggie, the warm and enthusiastic AI assistant for Magnolia Bakery — a beloved NYC bakery famous for cupcakes, banana pudding, cakes, and brownies.

Product catalog:
${catalog}

Guidelines:
- Keep responses concise: 1-2 sentences + recommendations
- When recommending specific products, always include [PRODUCT: exact product name] for each one
- If a product is out of stock (stockQuantity: 0), don't recommend it
- Match dietary restrictions to product tags
- Be warm, playful, and passionate about baked goods
- Never invent products not listed above`,
          messages: [...history, { role: 'user', content: text }],
        }),
      });

      const data = await response.json();
      const raw = data.content?.[0]?.text || "Oops, I had a little brain freeze! Try asking me again 🧁";
      const recommended = parseProductTags(raw, products);
      const clean = stripProductTags(raw);

      setMessages(prev =>
        prev.map(m =>
          m.id === 'loading'
            ? { ...m, id: `a-${Date.now()}`, content: clean, isLoading: false, recommendedProducts: recommended }
            : m
        )
      );

      if (!isOpen) setUnread(c => c + 1);
    } catch {
      setMessages(prev =>
        prev.map(m =>
          m.id === 'loading'
            ? { ...m, id: `err-${Date.now()}`, content: "Something went wrong — I need a quick cupcake break! Please try again 🧁", isLoading: false }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [messages, products, isLoading, isOpen]);

  return (
    <>
      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed bottom-24 right-6 z-[70] w-[360px] max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden"
            style={{ height: 500 }}
            role="dialog"
            aria-label="Bakery AI Assistant"
          >
            {/* Header */}
            <div className="bg-primary px-4 py-3 flex items-center gap-3 flex-shrink-0">
              <div className="w-9 h-9 rounded-full bg-white/25 flex items-center justify-center text-lg select-none">
                🧁
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-slate-900 text-sm leading-none">Maggie</p>
                <p className="text-[10px] text-slate-700 font-semibold mt-0.5">Magnolia's AI Assistant</p>
              </div>
              <span className="flex items-center gap-1 text-[10px] font-bold text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Online
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/25 rounded-full transition-colors ml-1"
                aria-label="Close chat"
              >
                <X className="w-4 h-4 text-slate-900" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(msg => (
                <div key={msg.id}>
                  <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'assistant' && (
                      <span className="text-base mr-1.5 self-end mb-0.5 select-none">🧁</span>
                    )}
                    <div
                      className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-primary text-slate-900 font-semibold rounded-br-md'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-md'
                      }`}
                    >
                      {msg.isLoading ? (
                        <span className="flex gap-1 items-center py-0.5">
                          {[0, 150, 300].map(d => (
                            <span
                              key={d}
                              className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
                              style={{ animationDelay: `${d}ms` }}
                            />
                          ))}
                        </span>
                      ) : (
                        msg.content
                      )}
                    </div>
                  </div>

                  {/* Product recommendation cards */}
                  {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                    <div className="mt-2 ml-8 space-y-2">
                      {msg.recommendedProducts.map(product => (
                        <motion.button
                          key={product.name}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ type: 'spring', damping: 20 }}
                          onClick={() => {
                            onViewProduct?.(product);
                            setIsOpen(false);
                          }}
                          className="w-full flex items-center gap-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-2.5 hover:border-primary hover:shadow-md transition-all text-left group"
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-11 h-11 rounded-xl object-cover flex-shrink-0"
                            onError={e => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{product.name}</p>
                            <p className="text-xs text-primary font-bold">${product.price.toFixed(2)}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors flex-shrink-0" />
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Suggested questions — only shown after welcome */}
              {messages.length === 1 && (
                <div className="space-y-2 mt-1">
                  {SUGGESTED_QUESTIONS.map(q => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="w-full text-left text-xs px-3 py-2 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary hover:text-primary transition-all font-medium"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex gap-2 flex-shrink-0">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
                placeholder="Ask about our treats…"
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-primary transition-all dark:text-white placeholder:text-slate-400 disabled:opacity-50"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-40 flex-shrink-0"
                aria-label="Send message"
              >
                <Send className="w-4 h-4 text-slate-900" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating toggle button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', delay: 1.2, stiffness: 260, damping: 20 }}
        onClick={() => setIsOpen(o => !o)}
        className={`fixed bottom-6 right-6 z-[70] w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-200 ${
          isOpen
            ? 'bg-slate-900 dark:bg-white scale-95'
            : 'bg-primary hover:scale-110 hover:shadow-primary/40'
        }`}
        aria-label={isOpen ? 'Close bakery assistant' : 'Open bakery assistant'}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="w-5 h-5 text-white dark:text-slate-900" />
            </motion.div>
          ) : (
            <motion.div key="spark" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }} className="relative">
              <Sparkles className="w-5 h-5 text-slate-900" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white" />
              {unread > 0 && (
                <span className="absolute -top-2 -left-2 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                  {unread}
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
});
