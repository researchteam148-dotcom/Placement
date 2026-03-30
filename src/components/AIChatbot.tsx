'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

const suggestedQuestions = [
    'How to prepare for TCS interview?',
    'Tips for coding round preparation',
    'How to write a good resume?',
    'Common HR interview questions',
];


const AIChatbot = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Only show chatbot for students
    if (!user || user.role !== 'student') return null;

    const sendMessage = async (text?: string) => {
        const messageText = text || input.trim();
        if (!messageText || isLoading) return;

        const userMessage: Message = { role: 'user', content: messageText };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/chatbot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessage].map(m => ({
                        role: m.role,
                        content: m.content,
                    })),
                    studentContext: user ? {
                        name: user.name || '',
                        email: user.email || '',
                        branch: user.branch || '',
                        regNo: user.regNo || '',
                        cgpa: user.cgpa || '',
                        gradYear: user.gradYear || '',
                        skills: user.skills || [],
                        backlogs: user.backlogs,
                    } : null,
                }),
            });

            const data = await res.json();
            if (data.response) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I couldn\'t process that. Please try again.' }]);
            }
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Network error. Please check your connection.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Floating Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-2xl shadow-indigo-300 flex items-center justify-center transition-all active:scale-90"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-48px)] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
                        style={{ maxHeight: '500px' }}
                    >
                        {/* Header */}
                        <div className="bg-indigo-600 px-5 py-4 flex items-center gap-3">
                            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                                <Bot size={20} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-sm">AI Interview Assistant</h3>
                                <p className="text-indigo-200 text-xs">Powered by DeepSeek</p>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: '250px', maxHeight: '340px' }}>
                            {messages.length === 0 ? (
                                <div className="text-center py-6">
                                    <Sparkles size={32} className="mx-auto text-indigo-300 mb-3" />
                                    <p className="text-sm font-bold text-slate-700 mb-1">Hi! I&apos;m your AI Assistant</p>
                                    <p className="text-xs text-slate-400 mb-4">Ask me anything about interviews & placements</p>
                                    <div className="space-y-2">
                                        {suggestedQuestions.map(q => (
                                            <button
                                                key={q}
                                                onClick={() => sendMessage(q)}
                                                className="block w-full text-left px-3 py-2 bg-indigo-50 hover:bg-indigo-100 rounded-xl text-xs font-medium text-indigo-700 transition-colors"
                                            >
                                                {q}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                messages.map((msg, i) => (
                                    <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        {msg.role === 'assistant' && (
                                            <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <Bot size={14} className="text-indigo-600" />
                                            </div>
                                        )}
                                        <div className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm font-medium ${msg.role === 'user'
                                                ? 'bg-indigo-600 text-white rounded-br-md'
                                                : 'bg-slate-100 text-slate-700 rounded-bl-md'
                                            }`}>
                                            <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                        </div>
                                        {msg.role === 'user' && (
                                            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <User size={14} className="text-white" />
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                            {isLoading && (
                                <div className="flex gap-2 items-start">
                                    <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Bot size={14} className="text-indigo-600" />
                                    </div>
                                    <div className="bg-slate-100 px-4 py-3 rounded-2xl rounded-bl-md">
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-3 border-t border-slate-100">
                            <form
                                onSubmit={e => { e.preventDefault(); sendMessage(); }}
                                className="flex gap-2"
                            >
                                <input
                                    type="text"
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    placeholder="Ask about interviews..."
                                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                    disabled={isLoading}
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading || !input.trim()}
                                    className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl transition-all"
                                >
                                    <Send size={16} />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AIChatbot;
