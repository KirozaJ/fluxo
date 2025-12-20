import { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/Button';
import { BotIcon, SendIcon, XIcon, MessageSquareIcon, SparklesIcon } from 'lucide-react';
import { aiContextService } from '../../services/aiContext';
import { supabase } from '../../lib/supabase';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export const AIChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: "Hi! I'm Fluxo AI. I can analyze your spending and help you budget. Ask me anything!",
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: inputValue,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsLoading(true);

        try {
            // 1. Gather context
            const context = await aiContextService.gatherContext();

            // 2. Call Edge Function
            const { data, error } = await supabase.functions.invoke('chat-financial-advisor', {
                body: {
                    userMessage: userMsg.content,
                    context: context
                }
            });

            if (error) throw error;

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.reply || "I'm having trouble thinking right now. Please try again.",
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiMsg]);

        } catch (error: any) {
            console.error('AI Error:', error);
            // Try to extract the specific backend error message if available
            let errorMessage = "Sorry, I encountered an error connecting to the brain. 🧠❌";

            if (error && error.message) {
                // Check if it's a JSON stringified error from our backend
                try {
                    // Sometimes the error object from supabase-js might wrap the response
                    if (error.context && typeof error.context.json === 'function') {
                        const json = await error.context.json();
                        if (json.error) errorMessage = `Error: ${json.error}`;
                    } else {
                        errorMessage = `Error: ${error.message}`;
                    }
                } catch (e) {
                    errorMessage = `Error: ${error.message}`;
                }
            }

            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: errorMessage,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
            {/* Chat Window */}
            <div className={`
                pointer-events-auto
                bg-surface border border-white/10 shadow-2xl rounded-2xl overflow-hidden
                w-[350px] sm:w-[400px] h-[500px] flex flex-col
                transition-all duration-300 origin-bottom-right
                mb-4
                ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-10 pointer-events-none absolute'}
            `}>
                {/* Header */}
                <div className="bg-primary/10 p-4 border-b border-white/5 flex items-center justify-between backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary rounded-xl shadow-lg shadow-primary/20">
                            <BotIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-text-main">Fluxo AI</h3>
                            <div className="flex items-center gap-1.5">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                <span className="text-xs text-text-muted">Online</span>
                            </div>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="hover:bg-white/10 rounded-full h-8 w-8">
                        <XIcon className="w-4 h-4" />
                    </Button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`
                                max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed
                                ${msg.role === 'user'
                                    ? 'bg-primary text-white rounded-tr-none shadow-lg shadow-primary/10'
                                    : 'bg-secondary/10 border border-white/5 text-text-main rounded-tl-none'}
                            `}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-secondary/10 border border-white/5 p-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                                <SparklesIcon className="w-4 h-4 text-primary animate-pulse" />
                                <span className="text-xs text-text-muted animate-pulse">Thinking...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 bg-surface border-t border-white/5">
                    <form onSubmit={handleSubmit} className="relative">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Ask about your budget..."
                            className="w-full bg-secondary/5 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors text-text-main placeholder:text-text-muted"
                        />
                        <button
                            type="submit"
                            disabled={!inputValue.trim() || isLoading}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-primary rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                        >
                            <SendIcon className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            </div>

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    pointer-events-auto
                    h-14 w-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95
                    ${isOpen ? 'bg-secondary text-text-main rotate-90' : 'bg-primary text-white rotate-0'}
                `}
            >
                {isOpen ? <XIcon className="w-6 h-6" /> : <MessageSquareIcon className="w-6 h-6" />}
            </button>
        </div>
    );
};
