import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export const Support: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi there! I am the GreenLens Support Assistant. How can I help you today?',
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Gemini API key not found. Please set GEMINI_API_KEY in your environment.');
      }

      const ai = new GoogleGenAI({ apiKey: apiKey });
      
      const prompt = `You are the GreenLens Support Assistant. Help users and drivers with questions about the GreenLens platform.
      
      Context about GreenLens:
      - Users can request garbage pickups, scan waste to identify categories (Recyclable, Wet, Hazardous, etc.), and earn rewards.
      - Drivers accept pickup requests, complete them, and earn money and eco-points.
      - Users can track pickup status and report garbage hotspots.
      - Municipalities manage pickups and monitor city stats.
      
      User message: ${input}
      
      Respond conversationally, concisely, and helpfully.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text || 'I am sorry, I could not process that request.',
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error generating AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I am having trouble connecting right now. Please try again later.',
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 bg-white">
      <div className="bg-[#16a34a] text-white p-4 shadow-md z-10">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-full">
            <Bot size={24} />
          </div>
          <div>
            <h2 className="font-bold text-lg">GreenLens Support</h2>
            <p className="text-emerald-100 text-xs">AI Assistant</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex animate-in fade-in slide-in-from-bottom-2 duration-300 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-2`}>
              <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                msg.sender === 'user' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-green-600 shadow-sm'
              }`}>
                {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div
                className={`p-3 rounded-xl text-sm shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
                <span className={`text-[10px] block mt-1 ${msg.sender === 'user' ? 'text-green-100' : 'text-gray-400'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex max-w-[80%] flex-row gap-2">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-100 text-green-600 shadow-sm flex items-center justify-center">
                <Bot size={16} />
              </div>
              <div className="p-4 rounded-xl bg-gray-100 text-gray-800 shadow-sm flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-green-500" />
                <span className="text-sm text-gray-500">AI typing...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="px-4 py-3 bg-white border-t border-gray-200">
        <div className="flex items-center gap-2 bg-white p-1 rounded-full border border-gray-300 shadow-sm focus-within:ring-2 focus-within:ring-green-500 transition-all">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[40px] text-sm py-2 px-4 text-gray-800"
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="p-2 rounded-full bg-green-600 text-white disabled:opacity-50 disabled:bg-gray-400 transition-colors flex-shrink-0 hover:bg-green-700"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
