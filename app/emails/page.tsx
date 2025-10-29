"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Sidebar } from "@/components/sidebar"
import { Topbar } from "@/components/topbar"
import type { LogItem, FilterState } from "@/lib/types"
import { ChevronDown, ExternalLink, Filter } from "lucide-react"

export default function EmailsPage() {
  const [logs, setLogs] = useState<LogItem[]>([])
  const [filteredLogs, setFilteredLogs] = useState<LogItem[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

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

  const getResultadoBadgeColor = (resultado: string) => {
    switch (resultado) {
      case "ENVIADO":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      case "PENDIENTE":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      case "NO_RESPONDER":
        return "bg-red-500/20 text-red-300 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30"
    }
  }

  const handleResultadoToggle = (resultado: string) => {
    setFilters((prev) => ({
      ...prev,
      resultado: prev.resultado?.includes(resultado)
        ? prev.resultado.filter((r) => r !== resultado)
        : [...(prev.resultado || []), resultado],
    }))
  }

  const handleTemplateToggle = (template: string) => {
    setFilters((prev) => ({
      ...prev,
      template_key: prev.template_key?.includes(template)
        ? prev.template_key.filter((t) => t !== template)
        : [...(prev.template_key || []), template],
    }))
  }

  const handleClearFilters = () => {
    setFilters({
      startDate: undefined,
      endDate: undefined,
      resultado: [],
      template_key: [],
      minConfidence: undefined,
      searchText: undefined,
    })
  }

  const uniqueTemplates = Array.from(new Set(logs.map((log) => log.template_key)))
  const hasActiveFilters =
    filters.startDate ||
    filters.endDate ||
    (filters.resultado?.length || 0) > 0 ||
    (filters.template_key?.length || 0) > 0 ||
    filters.minConfidence !== undefined ||
    filters.searchText

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 overflow-auto pt-20 pl-64">
          <div className="p-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-3xl font-bold text-foreground">Emails</h2>
                  <p className="text-muted-foreground">Tabla detallada de consultas procesadas</p>
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
                >
                  <Filter size={18} />
                  Filtros
                </button>
              </div>
            </motion.div>

            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-2xl border border-border/50 bg-card shadow-lg p-6 mb-6 space-y-4"
              >
                {/* Search */}
                <div>
                  <label className="text-sm font-semibold text-foreground mb-2 block">Buscar</label>
                  <input
                    type="text"
                    placeholder="Email, Message ID, Thread ID..."
                    value={filters.searchText || ""}
                    onChange={(e) => setFilters((prev) => ({ ...prev, searchText: e.target.value || undefined }))}
                    className="w-full px-3 py-2 rounded-lg bg-input border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-2 block">Fecha Inicio</label>
                    <input
                      type="date"
                      value={filters.startDate?.split("T")[0] || ""}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          startDate: e.target.value ? `${e.target.value}T00:00:00Z` : undefined,
                        }))
                      }
                      className="w-full px-3 py-2 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-2 block">Fecha Fin</label>
                    <input
                      type="date"
                      value={filters.endDate?.split("T")[0] || ""}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          endDate: e.target.value ? `${e.target.value}T23:59:59Z` : undefined,
                        }))
                      }
                      className="w-full px-3 py-2 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                </div>

                {/* Resultado Filter */}
                <div>
                  <label className="text-sm font-semibold text-foreground mb-2 block">Estado</label>
                  <div className="flex gap-2 flex-wrap">
                    {["ENVIADO", "PENDIENTE", "NO_RESPONDER"].map((resultado) => (
                      <button
                        key={resultado}
                        onClick={() => handleResultadoToggle(resultado)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          filters.resultado?.includes(resultado)
                            ? "bg-accent text-accent-foreground"
                            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        }`}
                      >
                        {resultado}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Template Filter */}
                <div>
                  <label className="text-sm font-semibold text-foreground mb-2 block">Plantilla</label>
                  <div className="flex gap-2 flex-wrap">
                    {uniqueTemplates.map((template) => (
                      <button
                        key={template}
                        onClick={() => handleTemplateToggle(template)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          filters.template_key?.includes(template)
                            ? "bg-accent text-accent-foreground"
                            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        }`}
                      >
                        {template}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Confidence Threshold */}
                <div>
                  <label className="text-sm font-semibold text-foreground mb-2 block">
                    Confianza Mínima: {filters.minConfidence ? (filters.minConfidence * 100).toFixed(0) : "0"}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={filters.minConfidence || 0}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        minConfidence: Number.parseFloat(e.target.value) || undefined,
                      }))
                    }
                    className="w-full"
                  />
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <button
                    onClick={handleClearFilters}
                    className="w-full px-4 py-2 rounded-lg bg-destructive/20 text-destructive hover:bg-destructive/30 transition-colors text-sm font-medium"
                  >
                    Limpiar Filtros
                  </button>
                )}
              </motion.div>
            )}

            {/* Results Count */}
            <div className="mb-4 text-sm text-muted-foreground">
              Mostrando {filteredLogs.length} de {logs.length} resultados
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Cargando emails...</p>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No se encontraron resultados con los filtros aplicados</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredLogs.map((log, idx) => (
                  <motion.div
                    key={log.messageId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <div
                      className="rounded-2xl border border-border/50 bg-card shadow-lg p-4 cursor-pointer transition-all hover:border-accent/50"
                      onClick={() => setExpandedId(expandedId === log.messageId ? null : log.messageId)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm font-mono text-muted-foreground">{log.from}</span>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium border ${getResultadoBadgeColor(log.resultado)}`}
                            >
                              {log.resultado}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Confianza: {(log.confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                          <p className="text-sm text-foreground">{log.titulo || log.template_key}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(log.fecha).toLocaleString("es-ES")}
                          </p>
                        </div>
                        <ChevronDown
                          size={20}
                          className={`text-muted-foreground transition-transform ${
                            expandedId === log.messageId ? "rotate-180" : ""
                          }`}
                        />
                      </div>

                      {expandedId === log.messageId && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 pt-4 border-t border-border/50 space-y-3"
                        >
                          <div>
                            <p className="text-xs font-semibold text-accent mb-1">Motivo</p>
                            <p className="text-sm text-foreground">{log.motivo}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-accent mb-1">Razonamiento</p>
                            <p className="text-sm text-foreground">{log.rationale}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs font-semibold text-accent mb-1">Template</p>
                              <p className="text-sm text-foreground font-mono">{log.template_key}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-accent mb-1">Message ID</p>
                              <p className="text-sm text-foreground font-mono">{log.messageId}</p>
                            </div>
                          </div>
                          {log.pdf_url && (
                            <a
                              href={log.pdf_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-sm text-accent hover:text-accent/80 transition-colors"
                            >
                              Ver PDF <ExternalLink size={14} />
                            </a>
                          )}
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
