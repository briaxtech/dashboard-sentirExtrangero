"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Sidebar } from "@/components/sidebar"
import { Topbar } from "@/components/topbar"
import { BarChart3, Loader, Mail, MessageSquare, Send, Zap } from "lucide-react"
import type { LogItem } from "@/lib/types"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const QUICK_ACTIONS = [
  {
    icon: BarChart3,
    label: "Resumen de metricas",
    prompt: "Dame un resumen de las metricas principales del dashboard.",
  },
  {
    icon: Mail,
    label: "Analisis de emails",
    prompt: "Cual es el estado actual de los emails procesados?",
  },
  {
    icon: Zap,
    label: "Plantillas destacadas",
    prompt: "Que plantillas son las mas utilizadas y como rinden?",
  },
  {
    icon: MessageSquare,
    label: "Recomendaciones",
    prompt: "Que recomendaciones tienes para mejorar nuestro proceso?",
  },
]

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState<LogItem[]>([])
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function fetchContext() {
      try {
        const res = await fetch("/api/logs")
        const data = await res.json()
        setLogs(data)
      } catch (error) {
        console.error("Error fetching context:", error)
      }
    }
    fetchContext()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (event: React.FormEvent, customMessage?: string) => {
    event.preventDefault()
    const messageToSend = customMessage || input
    if (!messageToSend.trim()) return

    const userMessage: Message = {
      id: `${Date.now()}`,
      role: "user",
      content: messageToSend,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const context = {
        totalLogs: logs.length,
        enviados: logs.filter((item) => item.resultado === "ENVIADO").length,
        pendientes: logs.filter((item) => item.resultado === "PENDIENTE").length,
        noResponder: logs.filter((item) => item.resultado === "NO_RESPONDER").length,
        avgConfidence: logs.length > 0 ? logs.reduce((sum, item) => sum + item.confidence, 0) / logs.length : 0,
        templates: Array.from(new Set(logs.map((item) => item.template_key))),
      }

      const response = await fetch("/api/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageToSend, context }),
      })

      if (!response.ok) throw new Error("Failed to get response")

      const data = await response.json()
      const assistantMessage: Message = {
        id: `${Date.now() + 1}`,
        role: "assistant",
        content: data.reply || "No se recibio respuesta del asistente.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: Message = {
        id: `${Date.now() + 1}`,
        role: "assistant",
        content: "Ocurrio un problema al procesar tu mensaje. Intenta nuevamente en unos instantes.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background via-white to-background">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex flex-1 flex-col md:ml-64">
        <Topbar onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />
        <main className="flex-1 overflow-hidden px-4 pb-16 pt-24 sm:px-6 md:px-10 md:pb-20 md:pt-28">
          <div className="mx-auto flex h-full max-w-5xl flex-col">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Asistente inteligente</h1>
              <p className="text-muted-foreground mt-2">
                Conversa con un copiloto entrenado con los datos del dashboard para obtener respuestas accionables.
              </p>
            </motion.div>

            <div className="flex-1 overflow-auto rounded-3xl border border-border/50 bg-card shadow-md p-6">
              <div className="space-y-6">
                {messages.length === 0 && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="rounded-3xl border border-dashed border-border/60 bg-secondary/40 p-6 text-center">
                      <p className="text-lg font-semibold text-foreground">Bienvenido al asistente de Sentir Extranjero</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Lanza una consulta o utiliza una de las acciones rapidas para empezar.
                      </p>
                    </div>
                    <div className="mt-6 grid gap-3 md:grid-cols-2">
                      {QUICK_ACTIONS.map((action, index) => {
                        const Icon = action.icon
                        return (
                          <motion.button
                            key={action.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 * index }}
                            type="button"
                            onClick={(event) => handleSendMessage(event as any, action.prompt)}
                            className="group rounded-2xl border border-border/70 bg-card px-4 py-5 text-left shadow-sm transition-all hover:border-primary/40 hover:shadow-lg"
                          >
                            <div className="flex items-start gap-3">
                              <span className="rounded-2xl bg-primary/10 p-2 text-primary transition-transform group-hover:scale-110">
                                <Icon size={18} />
                              </span>
                              <div>
                                <p className="text-sm font-semibold text-foreground">{action.label}</p>
                                <p className="text-xs text-muted-foreground mt-2">{action.prompt}</p>
                              </div>
                            </div>
                          </motion.button>
                        )
                      })}
                    </div>
                  </motion.div>
                )}

                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xl rounded-3xl px-5 py-4 shadow-sm ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "border border-border/50 bg-secondary/30 text-foreground"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs mt-3 opacity-70">
                        {message.timestamp.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </motion.div>
                ))}

                <AnimatePresence>
                  {loading && (
                    <motion.div
                      key="typing"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="flex justify-start"
                    >
                      <div className="rounded-3xl border border-border/70 bg-card px-4 py-3 shadow-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Loader size={16} className="animate-spin text-primary" />
                          <span className="text-sm font-medium">El asistente esta escribiendo...</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-border/70 bg-card px-6 py-5 shadow-md">
              <form onSubmit={handleSendMessage} className="flex flex-col gap-3 md:flex-row md:items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Escribe tu pregunta..."
                  disabled={loading}
                  className="flex-1 rounded-2xl border border-border/60 bg-input px-5 py-3 text-sm text-foreground shadow-sm focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send size={18} />
                  Enviar
                </motion.button>
              </form>
              <p className="text-xs text-muted-foreground mt-3">
                El asistente utiliza los datos recientes de log para contextualizar cada respuesta.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
