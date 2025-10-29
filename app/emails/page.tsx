"use client"

import { useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Sidebar } from "@/components/sidebar"
import { Topbar } from "@/components/topbar"
import type { FilterState, LogItem } from "@/lib/types"
import { ChevronDown, ExternalLink, Filter } from "lucide-react"

const STATUS_STYLES: Record<string, string> = {
  ENVIADO: "bg-[#e7f6ef] text-[#1f7a54] border border-[#bae8cc]",
  PENDIENTE: "bg-[#fff4d4] text-[#9a6b0f] border border-[#f5e0a6]",
  NO_RESPONDER: "bg-[#fde4e4] text-[#9f1b1f] border border-[#f3bcbc]",
}

export default function EmailsPage() {
  const [logs, setLogs] = useState<LogItem[]>([])
  const [filteredLogs, setFilteredLogs] = useState<LogItem[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const [filters, setFilters] = useState<FilterState>({
    startDate: undefined,
    endDate: undefined,
    resultado: [],
    template_key: [],
    minConfidence: undefined,
    searchText: undefined,
  })

  useEffect(() => {
    async function fetchLogs() {
      try {
        const params = new URLSearchParams()
        if (filters.startDate) params.append("startDate", filters.startDate)
        if (filters.endDate) params.append("endDate", filters.endDate)
        if (filters.resultado?.length) params.append("resultado", filters.resultado.join(","))
        if (filters.template_key?.length) params.append("template_key", filters.template_key.join(","))
        if (filters.minConfidence !== undefined) params.append("minConfidence", String(filters.minConfidence))
        if (filters.searchText) params.append("search", filters.searchText)

        const res = await fetch(`/api/logs?${params.toString()}`)
        const data = await res.json()
        setLogs(data)
        setFilteredLogs(data)
      } catch (error) {
        console.error("Error fetching logs:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
  }, [filters])

  const uniqueTemplates = useMemo(() => Array.from(new Set(logs.map((log) => log.template_key))), [logs])

  const hasActiveFilters =
    filters.startDate ||
    filters.endDate ||
    (filters.resultado?.length || 0) > 0 ||
    (filters.template_key?.length || 0) > 0 ||
    filters.minConfidence !== undefined ||
    filters.searchText

  const toggleResultado = (resultado: string) => {
    setFilters((prev) => ({
      ...prev,
      resultado: prev.resultado?.includes(resultado)
        ? prev.resultado.filter((r) => r !== resultado)
        : [...(prev.resultado || []), resultado],
    }))
  }

  const toggleTemplate = (template: string) => {
    setFilters((prev) => ({
      ...prev,
      template_key: prev.template_key?.includes(template)
        ? prev.template_key.filter((t) => t !== template)
        : [...(prev.template_key || []), template],
    }))
  }

  const clearFilters = () => {
    setFilters({
      startDate: undefined,
      endDate: undefined,
      resultado: [],
      template_key: [],
      minConfidence: undefined,
      searchText: undefined,
    })
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background via-white to-background">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex flex-1 flex-col md:ml-64">
        <Topbar onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />
        <main className="flex-1 overflow-auto px-4 pb-16 pt-24 sm:px-6 md:px-10 md:pb-20 md:pt-28">
          <div className="mx-auto max-w-6xl space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-wide text-muted-foreground">Bandeja centralizada</p>
                  <h1 className="text-3xl font-bold text-foreground mt-1">Emails procesados</h1>
                  <p className="text-muted-foreground">
                    Explora los mensajes clasificados por el asistente y filtra por estado, plantilla o confianza.
                  </p>
                </div>
                <button
                  onClick={() => setShowFilters((prev) => !prev)}
                  className="inline-flex items-center gap-2 self-start rounded-xl border border-border/70 bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <Filter size={18} />
                  {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
                </button>
              </div>
            </motion.div>

            <AnimatePresence initial={false}>
              {showFilters && (
                <motion.div
                  key="filters"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden rounded-3xl border border-border/60 bg-card p-6 shadow-md"
                >
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Buscar</label>
                      <input
                        type="text"
                        placeholder="Email, message ID, thread ID..."
                        value={filters.searchText || ""}
                        onChange={(event) =>
                          setFilters((prev) => ({
                            ...prev,
                            searchText: event.target.value || undefined,
                          }))
                        }
                        className="w-full rounded-xl border border-border/60 bg-input px-4 py-3 text-sm text-foreground shadow-sm focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">Fecha inicio</label>
                        <input
                          type="date"
                          value={filters.startDate?.split("T")[0] || ""}
                          onChange={(event) =>
                            setFilters((prev) => ({
                              ...prev,
                              startDate: event.target.value ? `${event.target.value}T00:00:00Z` : undefined,
                            }))
                          }
                          className="w-full rounded-xl border border-border/60 bg-input px-4 py-3 text-sm text-foreground shadow-sm focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">Fecha fin</label>
                        <input
                          type="date"
                          value={filters.endDate?.split("T")[0] || ""}
                          onChange={(event) =>
                            setFilters((prev) => ({
                              ...prev,
                              endDate: event.target.value ? `${event.target.value}T23:59:59Z` : undefined,
                            }))
                          }
                          className="w-full rounded-xl border border-border/60 bg-input px-4 py-3 text-sm text-foreground shadow-sm focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-6 md:grid-cols-3">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Resultado</label>
                      <div className="flex flex-wrap gap-2">
                        {["ENVIADO", "PENDIENTE", "NO_RESPONDER"].map((resultado) => {
                          const active = filters.resultado?.includes(resultado)
                          return (
                            <button
                              key={resultado}
                              onClick={() => toggleResultado(resultado)}
                              className={`rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${active ? "border-primary bg-primary/10 text-primary" : "border-border/60 bg-card text-muted-foreground hover:border-primary/30"}`}
                              type="button"
                            >
                              {resultado}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Template</label>
                      <div className="flex flex-wrap gap-2">
                        {uniqueTemplates.map((template) => {
                          const active = filters.template_key?.includes(template)
                          return (
                            <button
                              key={template}
                              onClick={() => toggleTemplate(template)}
                              className={`rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${active ? "border-primary bg-primary/10 text-primary" : "border-border/60 bg-card text-muted-foreground hover:border-primary/30"}`}
                              type="button"
                            >
                              {template}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Confianza minima</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={5}
                        value={filters.minConfidence !== undefined ? filters.minConfidence : ""}
                        onChange={(event) =>
                          setFilters((prev) => ({
                            ...prev,
                            minConfidence:
                              event.target.value === ""
                                ? undefined
                                : Math.min(100, Math.max(0, Number.parseFloat(event.target.value))),
                          }))
                        }
                        placeholder="0 a 100"
                        className="w-full rounded-xl border border-border/60 bg-input px-4 py-3 text-sm text-foreground shadow-sm focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  {hasActiveFilters && (
                    <div className="mt-6 flex flex-wrap justify-end">
                      <button
                        onClick={clearFilters}
                        className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/20"
                        type="button"
                      >
                        Limpiar filtros
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <p>
                Mostrando <span className="font-semibold text-foreground">{filteredLogs.length}</span> de{" "}
                <span className="font-semibold text-foreground">{logs.length}</span> resultados
              </p>
              <p>Actualizado automaticamente al aplicar filtros</p>
            </div>

            {loading ? (
              <div className="py-20 text-center">
                <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-4 border-accent/30 border-t-accent" />
                <p className="text-muted-foreground">Cargando emails...</p>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border/60 bg-card/60 py-16 text-center shadow-inner">
                <p className="text-md font-semibold text-foreground">Sin resultados</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Ajusta los criterios de busqueda para encontrar las consultas deseadas.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredLogs.map((log, index) => {
                  const statusClass = STATUS_STYLES[log.resultado] || "bg-secondary text-secondary-foreground border"
                  return (
                    <motion.div
                      key={log.messageId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                    >
                      <div
                        className="cursor-pointer rounded-3xl border border-border/70 bg-card p-5 shadow-md transition-all hover:border-primary/30 hover:shadow-lg"
                        onClick={() => setExpandedId((prev) => (prev === log.messageId ? null : log.messageId))}
                      >
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="font-mono text-sm text-muted-foreground">{log.from}</span>
                              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}>
                                {log.resultado}
                              </span>
                              <span className="text-xs font-medium text-muted-foreground">
                                Confianza {(log.confidence * 100).toFixed(0)}%
                              </span>
                            </div>
                            <p className="text-lg font-semibold text-foreground">{log.titulo || log.template_key}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(log.fecha).toLocaleString("es-ES")}
                            </p>
                          </div>
                          <ChevronDown
                            size={20}
                            className={`shrink-0 text-muted-foreground transition-transform ${expandedId === log.messageId ? "rotate-180" : ""}`}
                          />
                        </div>

                        <AnimatePresence initial={false}>
                          {expandedId === log.messageId && (
                            <motion.div
                              key="details"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-5 space-y-4 overflow-hidden border-t border-border/60 pt-4"
                            >
                              <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                  <p className="text-xs font-semibold uppercase text-muted-foreground">Motivo</p>
                                  <p className="text-sm leading-relaxed text-foreground">{log.motivo}</p>
                                </div>
                                <div className="space-y-2">
                                  <p className="text-xs font-semibold uppercase text-muted-foreground">Razonamiento</p>
                                  <p className="text-sm leading-relaxed text-foreground">{log.rationale}</p>
                                </div>
                              </div>
                              <div className="grid gap-4 md:grid-cols-3">
                                <div>
                                  <p className="text-xs font-semibold uppercase text-muted-foreground">Template</p>
                                  <p className="font-mono text-sm text-foreground">{log.template_key}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold uppercase text-muted-foreground">Message ID</p>
                                  <p className="font-mono text-sm text-foreground">{log.messageId}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold uppercase text-muted-foreground">Thread ID</p>
                                  <p className="font-mono text-sm text-foreground">{log.threadId}</p>
                                </div>
                              </div>
                              {log.pdf_url && (
                                <a
                                  href={log.pdf_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
                                >
                                  Ver PDF
                                  <ExternalLink size={14} />
                                </a>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
