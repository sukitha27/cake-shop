import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Sparkles, ShoppingBag, ArrowRight, Loader2, Bot, User, Trash2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';
import { Product } from '../App';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  products?: Product[];
}

interface ChatBotProps {
  products: Product[];
  onViewProduct: (product: Product) => void;
  formatPrice: (price: number) => string;
}

export function ChatBot({ products, onViewProduct, formatPrice }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm Maggie, your Magnolia Bakery assistant. How can I help you find the perfect treat today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<any>(null);

  // Initialize chat session
  useEffect(() => {
    if (!products.length) return;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      
      // Optimize product list for system instruction to save tokens
      const productList = products.map(p => `- ${p.name} (${p.category}): ${formatPrice(p.price)} - ${p.description?.substring(0, 100)}...`).join('\n');

      const systemInstruction = `You are Maggie, a friendly and helpful AI assistant for Magnolia Bakery. 
      You help customers find products, answer questions about ingredients, and provide recommendations.
      
      Magnolia Bakery is famous for its Banana Pudding, cupcakes, and classic American desserts. 
      We started in NYC's West Village in 1996.
      
      Our current product catalog:
      ${productList}
      
      Guidelines:
      - Be warm, sweet, and professional.
      - If a customer asks for a recommendation, suggest 2-3 specific products from our catalog.
      - Keep responses concise and use markdown for formatting.
      - If you mention a product that exists in our catalog, format it exactly as [Product Name].
      - Do not make up products that are not in the list.
      - If you don't know something, be honest and offer to help with something else.
      - If asked about locations, mention we have several locations in NYC (West Village, Upper West Side, Grand Central, etc.) and nationwide shipping.`;

      chatRef.current = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: { systemInstruction }
      });
    } catch (error) {
      console.error("Failed to initialize Gemini chat:", error);
    }
  }, [products]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!isOpen && messages.length > 1 && messages[messages.length - 1].role === 'assistant') {
      setUnreadCount(prev => prev + 1);
    }
  }, [messages, isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    setUnreadCount(0);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: "Hi! I'm Maggie, your Magnolia Bakery assistant. How can I help you find the perfect treat today?",
        timestamp: new Date()
      }
    ]);
    // Re-initialize chat session to clear history
    if (products.length) {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const productList = products.map(p => `- ${p.name} (${p.category}): ${formatPrice(p.price)} - ${p.description?.substring(0, 100)}...`).join('\n');
      const systemInstruction = `You are Maggie, a friendly and helpful AI assistant for Magnolia Bakery. 
      You help customers find products, answer questions about ingredients, and provide recommendations.
      
      Magnolia Bakery is famous for its Banana Pudding, cupcakes, and classic American desserts. 
      We started in NYC's West Village in 1996.
      
      Our current product catalog:
      ${productList}
      
      Guidelines:
      - Be warm, sweet, and professional.
      - If a customer asks for a recommendation, suggest 2-3 specific products from our catalog.
      - Keep responses concise and use markdown for formatting.
      - If you mention a product that exists in our catalog, format it exactly as [Product Name].
      - Do not make up products that are not in the list.
      - If you don't know something, be honest and offer to help with something else.
      - If asked about locations, mention we have several locations in NYC (West Village, Upper West Side, Grand Central, etc.) and nationwide shipping.`;

      chatRef.current = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: { systemInstruction }
      });
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      if (!chatRef.current) {
        throw new Error("Chat session not initialized");
      }

      const response = await chatRef.current.sendMessage({ message: input });
      const aiContent = response.text || "I'm sorry, I couldn't process that request.";

      // Extract products mentioned in the response
      const mentionedProducts = products.filter(p => aiContent.includes(`[${p.name}]`));

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiContent.replace(/\[|\]/g, ''), // Remove brackets for display
        timestamp: new Date(),
        products: mentionedProducts.length > 0 ? mentionedProducts : undefined
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: "I'm having a little trouble connecting right now. Could you try again in a moment?",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] right-4 sm:bottom-6 sm:right-6 z-[60] print:hidden">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-20 right-0 w-[calc(100vw-2rem)] sm:w-[380px] h-[70vh] sm:h-[550px] max-h-[600px] bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 bg-primary flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <Bot className="text-slate-900" size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tighter">Maggie</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={handleClearChat}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-900"
                  title="Clear Chat"
                >
                  <Trash2 size={18} />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-900"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
            >
              {messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user' ? 'bg-slate-100 dark:bg-slate-800' : 'bg-primary/10'
                  }`}>
                    {msg.role === 'user' ? <User size={16} className="text-slate-500" /> : <Sparkles size={16} className="text-primary" />}
                  </div>
                  <div className={`space-y-3 max-w-[80%] ${msg.role === 'user' ? 'items-end' : ''}`}>
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' 
                        : 'bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                    }`}>
                      <Markdown>{msg.content}</Markdown>
                    </div>
                    
                    {msg.products && (
                      <div className="grid grid-cols-1 gap-2">
                        {msg.products.map(p => (
                          <button
                            key={p.name}
                            onClick={() => onViewProduct(p)}
                            className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl hover:border-primary transition-all group text-left"
                          >
                            <img src={p.image} alt={p.alt} className="w-12 h-12 rounded-xl object-cover" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{p.name}</p>
                              <div className="flex items-center gap-2">
                                <p className="text-[10px] text-primary font-bold">{formatPrice(p.price)}</p>
                                {p.stockQuantity <= 0 && (
                                  <span className="text-[8px] px-1.5 py-0.5 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded uppercase font-bold tracking-wider">
                                    Out of Stock
                                  </span>
                                )}
                              </div>
                            </div>
                            <ArrowRight size={14} className="text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Loader2 size={16} className="text-primary animate-spin" />
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-6 border-t border-slate-100 dark:border-slate-800">
              <div className="relative">
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask Maggie anything..."
                  className="w-full pl-5 pr-12 py-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-slate-900 rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:scale-95"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={isOpen ? () => setIsOpen(false) : handleOpen}
        className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-500 relative ${
          isOpen ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-primary text-slate-900'
        }`}
      >
        {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
        
        {!isOpen && unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-4 border-white dark:border-slate-950">
            {unreadCount}
          </div>
        )}
      </motion.button>
    </div>
  );
}
