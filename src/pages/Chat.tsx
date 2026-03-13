
import { useState, useEffect, useRef } from "react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Bot, AlertCircle } from "lucide-react"

type Message = {
  id: string
  role: "ai" | "user"
  content: string
  timestamp: string
}


type Clarification = {
  id: string
  question: string
  options: string[]
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)


  


const [questions, setQuestions] = useState<Clarification[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  const scrollRef = useRef<HTMLDivElement | null>(null)

  const projectId = localStorage.getItem("projectId")

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  useEffect(() => {
    if (!projectId) {
      return
    }

    const loadQuestions = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/projects/${projectId}/clarifications`
        )

        if (!res.ok) {
          throw new Error(`Failed to load clarifications: ${res.status}`)
        }

        const data = await res.json()

        let list: Clarification[] = []

        if (Array.isArray(data)) {
          list = data
        } else if (Array.isArray(data?.questions)) {
          list = data.questions
        } else {
          list = []
        }

        setQuestions(list)

        if (list.length > 0) {
          setMessages([
            {
              id: Date.now().toString(),
              role: "ai",
              content: list[0].question,
              timestamp: "Now",
            },
          ])
        }
      } catch (err) {
        console.error(err)
      }
    }

    loadQuestions()
  }, [projectId])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!inputValue.trim()) return

    await submitAnswer(inputValue)
  }

  const submitAnswer = async (answer: string) => {
    if (!answer.trim()) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: answer,
      timestamp: new Date().toLocaleTimeString(),
    }

    setMessages((prev) => [...prev, userMsg])

    const current = questions[currentIndex]
    if (!current) {
      return
    }

    const question = current.question

    setInputValue("")
    setIsTyping(true)

    try {
      if (projectId) {
        await fetch(
          `http://localhost:5000/api/projects/${projectId}/clarifications`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              question,
              answer,
            }),
          }
        )
      }

      const next = currentIndex + 1

      if (next < questions.length) {
        setCurrentIndex(next)

        const aiMsg: Message = {
          id: Date.now().toString() + "-ai",
          role: "ai",
          content: questions[next].question,
          timestamp: "Now",
        }

        setMessages((prev) => [...prev, aiMsg])
      } else {
        const aiMsg: Message = {
          id: Date.now().toString() + "-done",
          role: "ai",
          content: "All clarification questions are completed.",
          timestamp: "Now",
        }

        setMessages((prev) => [...prev, aiMsg])
      }
    } catch (err) {
      console.error(err)
    }

    setIsTyping(false)
  }

  const currentOptions = questions[currentIndex]?.options || []

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto gap-4">

        <div>
          <h1 className="text-3xl font-bold text-white">PRD Clarification</h1>
          <p className="text-zinc-400 mt-1 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            {questions.length > 0
               ? `Question ${currentIndex + 1} of ${questions.length}`
               : "No clarification questions"}
          </p>
        </div>

        <Card className="flex-1 flex flex-col bg-zinc-900/95 border-zinc-800 shadow-[0_0_0_1px_rgba(251,146,60,0.08),0_20px_45px_rgba(0,0,0,0.35)]">

          <CardHeader className="border-b border-zinc-800">
            <CardTitle className="text-white flex items-center gap-2">
              <Bot className="w-5 h-5" />
              Blueprint AI Architect
            </CardTitle>
          </CardHeader>

          <CardContent
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-6"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${
                  msg.role === "user" ? "justify-end" : ""
                }`}
              >
                <Avatar>
                  {msg.role === "ai" ? (
                    <AvatarFallback className="bg-orange-500 text-white font-semibold">
                      B
                    </AvatarFallback>
                  ) : (
                    <>
                      <AvatarImage src="https://github.com/shadcn.png" />
                      <AvatarFallback>U</AvatarFallback>
                    </>
                  )}
                </Avatar>

                <div
                  className={`px-4 py-3 rounded-xl text-sm max-w-[78%] border ${
                    msg.role === "user"
                      ? "bg-orange-500 text-white border-orange-400/60"
                      : "bg-zinc-800 text-white border-zinc-700"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
            <div className="flex gap-3">
            <Avatar>
            <Bot className="w-5 h-5 m-auto" />
            </Avatar>

            <div className="bg-zinc-800 px-4 py-3 rounded-xl text-sm text-white animate-pulse">
            Thinking...
            </div>
            </div>
          )}

            {currentOptions.length > 0 && !isTyping && (
              <div className="pt-2">
                <p className="text-xs uppercase tracking-wide text-zinc-400 mb-2">
                  Suggested answers
                </p>
                <div className="flex flex-wrap gap-2">
                  {currentOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => void submitAnswer(option)}
                      className="px-3 py-2 rounded-lg border border-orange-500/40 bg-zinc-900 text-orange-300 hover:bg-orange-500 hover:text-white transition-colors text-sm"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>

          <div className="p-4 border-t border-zinc-800 bg-zinc-900/80">
            <form onSubmit={sendMessage} className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your answer..."
                className="border-zinc-700 bg-zinc-950/80 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-orange-500"
              />

              <Button
                type="submit"
                disabled={!inputValue || isTyping}
                className="bg-orange-500 hover:bg-orange-600 text-white"
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

