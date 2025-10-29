"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import { Sidebar } from "@/components/sidebar"
import { Topbar } from "@/components/topbar"
import { Send, Loader, MessageSquare, BarChart3, Mail, Zap } from "lucide-react"
import type { LogItem } from "@/lib/types"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState<LogItem[]>([])
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent, customMessage?: string) => {
    e.preventDefault()
    const messageToSend = customMessage || input
    if (!messageToSend.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
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
        enviados: logs.filter((l) => l.resultado === "ENVIADO").length,
        pendientes: logs.filter((l) => l.resultado === "PENDIENTE").length,
        noResponder: logs.filter((l) => l.resultado === "NO_RESPONDER").length,
        avgConfidence: logs.length > 0 ? logs.reduce((sum, l) => sum + l.confidence, 0) / logs.length : 0,
        templates: Array.from(new Set(logs.map((l) => l.template_key))),
      }

      const response = await fetch("/api/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageToSend,
          context,
        }),
      })

      if (!response.ok) throw new Error("Failed to get response")

      const data = await response.json()
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply || "No response received",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Error al procesar tu mensaje. Por favor, intenta de nuevo.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    {
      icon: BarChart3,
      label: "Resumen de métricas",
      prompt: "Dame un resumen de las métricas principales del dashboard",
    },
    {
      icon: Mail,
      label: "Análisis de emails",
      prompt: "¿Cuál es el estado actual de los emails procesados?",
    },
    {
      icon: Zap,
      label: "Plantillas más usadas",
      prompt: "¿Cuáles son las plantillas más utilizadas y cuál es su rendimiento?",
    },
    {
      icon: MessageSquare,
      label: "Recomendaciones",
      prompt: "¿Qué recomendaciones tienes para mejorar nuestro proceso?",
    },
  ]

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 flex flex-col pt-20 pl-64">
          <div className="flex-1 overflow-auto p-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">Chat con IA</h2>
              <p className="text-muted-foreground">Asistente inteligente para análisis de consultas</p>
            </motion.div>

            <div className="space-y-4 max-w-3xl">
              {messages.length === 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">Inicia una conversación con el asistente IA</p>
                    <p className="text-sm text-muted-foreground">
                      Puedes hacer preguntas sobre las métricas, plantillas o consultas procesadas
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {quickActions.map((action, idx) => {
                      const Icon = action.icon
                      return (
                        <motion.button
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          onClick={(e) => {
                            e.preventDefault()
                            handleSendMessage(e as any, action.prompt)
                          }}
                          className="rounded-2xl border border-border/50 bg-card shadow-lg p-4 text-left hover:border-accent/50 transition-all group"
                        >
                          <div className="flex items-start gap-3">
                            <Icon size={20} className="text-accent mt-1 group-hover:scale-110 transition-transform" />
                            <div>
                              <p className="text-sm font-medium text-foreground">{action.label}</p>
                              <p className="text-xs text-muted-foreground mt-1">{action.prompt}</p>
                            </div>
                          </div>
                        </motion.button>
                      )
                    })}
                  </div>
                </motion.div>
              )}

              {messages.map((msg, idx) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xl px-4 py-3 rounded-lg ${
                      msg.role === "user"
                        ? "bg-accent text-accent-foreground"
                        : "rounded-2xl border border-border/50 bg-card shadow-lg"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <p className="text-xs mt-2 opacity-70">
                      {msg.timestamp.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </motion.div>
              ))}

              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="rounded-2xl border border-border/50 bg-card shadow-lg px-4 py-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Loader size={16} className="animate-spin text-accent" />
                      <p className="text-sm text-muted-foreground">Escribiendo...</p>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="border-t border-border/50 bg-card/50 backdrop-blur-sm p-6 pl-8">
            <form onSubmit={handleSendMessage} className="max-w-3xl flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe tu pregunta..."
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-lg bg-input border border-border/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-50 transition-all"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={loading || !input.trim()}
                className="px-6 py-3 rounded-lg bg-accent text-accent-foreground font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send size={18} />
                Enviar
              </motion.button>
            </form>
            <p className="text-xs text-muted-foreground mt-3">
              El asistente tiene acceso a los datos del dashboard para proporcionar análisis contextualizados
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
