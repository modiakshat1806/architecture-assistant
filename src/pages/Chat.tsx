// src/pages/Chat.tsx
import { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Bot, Sparkles, AlertCircle } from "lucide-react";

// Types for our chat
type Message = {
  id: string;
  role: "ai" | "user";
  content: string;
  timestamp: string;
};

// Mock initial conversation
const initialMessages: Message[] = [
  {
    id: "1",
    role: "ai",
    content: "I've reviewed your PRD for the 'E-Commerce Replatforming'. The requirements for the cart system are clear, but I found a potential edge case regarding payment processing.",
    timestamp: "10:00 AM"
  },
  {
    id: "2",
    role: "ai",
    content: "You mentioned using Stripe, but the PRD doesn't specify how we should handle webhook failures if our server goes down. Should we implement a dead-letter queue for retry logic, or rely on Stripe's built-in retries?",
    timestamp: "10:00 AM"
  }
];

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputValue("");
    setIsTyping(true);

    // Mock AI response
    setTimeout(() => {
      const newAiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: "Got it. I'll update the architecture to include an SQS queue specifically for Stripe webhook fallback events. This will add slightly to the infrastructure complexity but ensures 0% data loss.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, newAiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const handleChipClick = (text: string) => {
    setInputValue(text);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)] min-h-[600px] max-w-4xl mx-auto gap-4">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">PRD Clarification</h1>
          <p className="text-zinc-400 mt-1 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            2 pending clarifications required
          </p>
        </div>

        {/* Chat Interface */}
        <Card className="flex-1 flex flex-col bg-zinc-900 border-zinc-800 overflow-hidden shadow-xl">
          <CardHeader className="border-b border-zinc-800 pb-4 bg-zinc-950/50 flex flex-row items-center justify-between">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary-500" />
              Blueprint AI Architect
            </CardTitle>
            <span className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-full font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Online
            </span>
          </CardHeader>

          {/* Messages Area */}
          <CardContent 
            className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar" 
            ref={scrollRef}
          >
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex gap-4 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : ""}`}
              >
                <Avatar className={`w-8 h-8 border ${msg.role === "ai" ? "border-primary-500/50 bg-primary-500/10" : "border-zinc-700"}`}>
                  {msg.role === "ai" ? (
                    <Bot className="w-5 h-5 text-primary-400 m-auto" />
                  ) : (
                    <AvatarImage src="https://github.com/shadcn.png" />
                  )}
                  <AvatarFallback>{msg.role === "ai" ? "AI" : "U"}</AvatarFallback>
                </Avatar>
                
                <div className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  <div className={`
                    px-4 py-3 rounded-2xl text-sm leading-relaxed
                    ${msg.role === "user" 
                      ? "bg-primary-600 text-white rounded-tr-none" 
                      : "bg-zinc-800 text-zinc-200 rounded-tl-none border border-zinc-700"}
                  `}>
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-zinc-500 mt-1 px-1">{msg.timestamp}</span>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-4 max-w-[85%]">
                <Avatar className="w-8 h-8 border border-primary-500/50 bg-primary-500/10">
                  <Bot className="w-5 h-5 text-primary-400 m-auto" />
                </Avatar>
                <div className="bg-zinc-800 border border-zinc-700 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
          </CardContent>

          {/* Quick Action Chips */}
          <div className="px-6 pb-2 pt-2 bg-zinc-900 flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs bg-zinc-950 border-zinc-700 text-zinc-300 hover:text-white rounded-full"
              onClick={() => handleChipClick("Let's implement a dead-letter queue (SQS) to be safe.")}
            >
              Suggest: Use SQS Dead-Letter Queue
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs bg-zinc-950 border-zinc-700 text-zinc-300 hover:text-white rounded-full"
              onClick={() => handleChipClick("Stripe's built-in retries are fine for MVP.")}
            >
              Suggest: Rely on Stripe retries
            </Button>
          </div>

          {/* Input Area */}
          <div className="p-4 bg-zinc-950 border-t border-zinc-800">
            <form onSubmit={handleSendMessage} className="relative flex items-center">
              <Input 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your clarification..." 
                className="pr-12 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 h-12 rounded-xl focus-visible:ring-primary-500"
              />
              <Button 
                type="submit" 
                size="icon" 
                className={`absolute right-1.5 h-9 w-9 rounded-lg transition-all ${inputValue.trim() ? "bg-primary hover:brightness-110 text-white" : "bg-zinc-800 text-zinc-500"}`}
                disabled={!inputValue.trim() || isTyping}
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </Card>

      </div>
    </DashboardLayout>
  );
}