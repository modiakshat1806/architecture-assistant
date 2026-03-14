// src/pages/Chat.tsx
import { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Bot, AlertCircle } from "lucide-react";

type Message = {
  id: string;
  role: "ai" | "user";
  content: string;
  timestamp: string;
};

export default function Chat() {

  const [messages, setMessages] = useState<Message[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  /*
  ===============================
  Load clarifications from pipeline
  ===============================
  */

  useEffect(() => {
    const raw = localStorage.getItem("blueprint_project_data");
    if (!raw) return;

    const data = JSON.parse(raw);
    const clarifications = data.clarifications || [];
    setQuestions(clarifications);

    // Only show the FIRST question initially
    if (clarifications.length > 0) {
      const firstQ = clarifications[0];
      const initialMsg: Message = {
        id: "ai-0",
        role: "ai",
        content: firstQ.question || firstQ,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages([initialMsg]);
    }
  }, []);

  /*
  ===============================
  Auto scroll
  ===============================
  */

  useEffect(() => {

    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }

  }, [messages, isTyping]);

  /*
  ===============================
  Send message
  ===============================
  */

  const handleSendMessage = async (e?: React.FormEvent, customValue?: string) => {
    e?.preventDefault();
    const content = customValue || inputValue;
    if (!content.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    // Simulate a brief delay for AI "thought"
    setTimeout(() => {
      const nextIndex = currentIndex + 1;
      
      if (nextIndex < questions.length) {
        const nextQ = questions[nextIndex];
        const aiMsg: Message = {
          id: Date.now().toString(),
          role: "ai",
          content: nextQ.question || nextQ,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
          })
        };
        setMessages((prev) => [...prev, aiMsg]);
        setCurrentIndex(nextIndex);
      } else {
        // Fallback to API if all predefined questions are answered
        const aiMsg: Message = {
          id: Date.now().toString(),
          role: "ai",
          content: "Thank you! I've collected all the clarifications needed for the PRD.",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
          })
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
      setIsTyping(false);
    }, 1000);
  };

  const handleChipClick = (text: string) => {
    handleSendMessage(undefined, text);
  };

  const currentOptions = questions[currentIndex]?.options || []

  return (

    <DashboardLayout>

      <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto gap-4">

        {/* HEADER */}

        <div>

          <h1 className="text-3xl font-bold text-white tracking-tight">
            PRD Clarification
          </h1>

          <p className="text-zinc-400 mt-1 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            Resolve ambiguities detected in the PRD
          </p>

        </div>

        {/* CHAT CARD */}

        <Card className="flex-1 flex flex-col bg-zinc-900 border-zinc-800 overflow-hidden">

          <CardHeader className="border-b border-zinc-800 bg-zinc-950/50">

            <CardTitle className="text-white text-sm flex items-center gap-2">
              <div className="w-6 h-6 flex items-center justify-center rounded-full border border-amber-500 bg-amber-500/10">
                <span className="text-amber-500 font-bold text-[10px]">B</span>
              </div>
              Blueprint AI Architect
            </CardTitle>

          </CardHeader>

          {/* MESSAGES */}

          <CardContent
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-6"
          >

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-4 max-w-[85%] ${msg.role === "user"
                  ? "ml-auto flex-row-reverse"
                  : ""
                  }`}
              >
                <div className={`w-8 h-8 flex items-center justify-center rounded-full border ${msg.role === "ai" ? "border-amber-500 bg-amber-500/10" : "border-zinc-700 bg-zinc-800"
                  }`}>
                  {msg.role === "ai" ? (
                    <span className="text-amber-500 font-bold text-sm">B</span>
                  ) : (
                    <span className="text-zinc-400 text-xs">U</span>
                  )}
                </div>

                <div
                  className={`flex flex-col ${msg.role === "user"
                    ? "items-end"
                    : "items-start"
                    }`}
                >
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed
                    ${msg.role === "user"
                        ? "bg-orange-600 text-white shadow-lg shadow-orange-900/20"
                        : "bg-zinc-800 text-zinc-200 border border-zinc-700"
                      }`}
                  >
                    {msg.content}
                  </div>

                  <span className="text-[10px] text-zinc-500 mt-1">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-4">
                <div className="w-8 h-8 flex items-center justify-center rounded-full border border-amber-500 bg-amber-500/10">
                  <span className="text-amber-500 font-bold text-sm">B</span>
                </div>
                <div className="bg-zinc-800 border border-zinc-700 px-4 py-3 rounded-xl text-zinc-400 text-sm italic">
                  Bot is typing...
                </div>
              </div>
            )}

          </CardContent>

          {/* QUICK SUGGESTIONS */}

          <div className="px-6 pb-4 pt-2 bg-zinc-900 flex flex-wrap gap-2">
            {(currentOptions.length > 0 ? currentOptions.slice(0, 3) : [
              "I'll provide more details shortly.",
              "That sounds like a good approach.",
              "Let's stick with the current plan."
            ]).map((option: string, i: number) => (
              <Button
                key={i}
                size="sm"
                variant="secondary"
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700 rounded-full px-4"
                onClick={() => handleChipClick(option)}
              >
                {option}
              </Button>
            ))}
          </div>

          {/* INPUT */}

          <div className="p-4 bg-zinc-950 border-t border-zinc-800">

            <form
              onSubmit={handleSendMessage}
              className="relative flex items-center"
            >

              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your clarification..."
                className="pr-12 bg-zinc-900 border-zinc-700 text-white"
              />

              <Button
                type="submit"
                size="icon"
                className="absolute right-1.5 h-9 w-9"
                disabled={!inputValue.trim() || isTyping}
              >
                <Send className="w-4 h-4" />
              </Button>

            </form>

          </div>

        </Card>

      </div>

    </DashboardLayout>
  )
}