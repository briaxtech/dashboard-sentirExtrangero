"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import type { DateRange } from "react-day-picker"
import { endOfDay, startOfDay, subDays } from "date-fns"
import { Sidebar } from "@/components/sidebar"
import { Topbar } from "@/components/topbar"
import { KPICard } from "@/components/kpi-card"
import { TimeSeriesChart } from "@/components/charts/time-series-chart"
import { StackedBarsChart } from "@/components/charts/stacked-bars-chart"
import { PieTemplatesChart } from "@/components/charts/pie-templates-chart"
import type { LogItem, KPIMetrics } from "@/lib/types"
import { calculateKPIs } from "@/lib/utils-metrics"
import { Mail, CheckCircle, AlertCircle, TrendingUp } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"

const RESULTADO_OPTIONS: LogItem["resultado"][] = ["ENVIADO", "PENDIENTE", "NO_RESPONDER"]

function buildDefaultDateRange(): DateRange {
  const today = new Date()
  return {
    from: subDays(today, 29),
    to: today,
  }
}

export default function Dashboard() {
  const [logs, setLogs] = useState<LogItem[]>([])
  const [metrics, setMetrics] = useState<KPIMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => buildDefaultDateRange())
  const [searchQuery, setSearchQuery] = useState("")
  const [minConfidence, setMinConfidence] = useState(0)
  const [selectedResultados, setSelectedResultados] = useState<LogItem["resultado"][]>(() => [...RESULTADO_OPTIONS])

  const debouncedSearchQuery = useDebounce(searchQuery, 350)

  const fetchLogs = useCallback(async () => {
    const isInitialLoad = !hasLoadedOnce
    if (isInitialLoad) {
      setLoading(true)
    } else {
      setIsRefreshing(true)
    }

    try {
      const params = new URLSearchParams()

      if (dateRange?.from) {
        params.set("startDate", startOfDay(dateRange.from).toISOString())
      }

      if (dateRange?.to) {
        params.set("endDate", endOfDay(dateRange.to).toISOString())
      }

      const trimmedSearch = debouncedSearchQuery.trim()
      if (trimmedSearch.length > 0) {
        params.set("search", trimmedSearch)
      }

      if (minConfidence > 0) {
        params.set("minConfidence", (minConfidence / 100).toString())
      }

      if (selectedResultados.length > 0 && selectedResultados.length < RESULTADO_OPTIONS.length) {
        params.set("resultado", selectedResultados.join(","))
      }

      const queryString = params.toString()
      const res = await fetch(`/api/logs${queryString ? `?${queryString}` : ""}`)

      if (!res.ok) {
        throw new Error(`Failed to fetch logs: ${res.statusText}`)
      }

      const data: LogItem[] = await res.json()
      data.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      setLogs(data)
      setMetrics(calculateKPIs(data))
    } catch (error) {
      console.error("Error fetching logs:", error)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
      setHasLoadedOnce(true)
    }
  }, [dateRange, debouncedSearchQuery, minConfidence, selectedResultados, hasLoadedOnce])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const pendingNotifications = useMemo(() => {
    return [...logs]
      .filter((log) => log.resultado === "PENDIENTE")
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, 6)
  }, [logs])

  const handleResultadoChange = (status: LogItem["resultado"], checked: boolean) => {
    setSelectedResultados((prev) => {
      if (checked) {
        const merged = prev.includes(status) ? prev : [...prev, status]
        return RESULTADO_OPTIONS.filter((option) => merged.includes(option))
      }

      return prev.filter((option) => option !== status)
    })
  }

  const handlePreferencesReset = () => {
    setMinConfidence(0)
    setSelectedResultados([...RESULTADO_OPTIONS])
  }

  const handleNotificationSelect = (log: LogItem) => {
    const value = log.threadId || log.messageId || log.from
    setSearchQuery(value)
  }

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range)
  }

  if (loading && !hasLoadedOnce) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-accent/30 border-t-accent" />
          <p className="text-muted-foreground">Cargando metricas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background via-white to-background">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex flex-1 flex-col md:ml-64">
        <Topbar
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          dateRange={dateRange}
          onDateRangeChange={handleDateRangeChange}
          notifications={pendingNotifications}
          onNotificationSelect={handleNotificationSelect}
          minConfidence={minConfidence}
          onMinConfidenceChange={setMinConfidence}
          selectedResultados={selectedResultados}
          onResultadosChange={handleResultadoChange}
          onResetPreferences={handlePreferencesReset}
          isRefreshing={isRefreshing}
        />
        <main className="flex-1 overflow-auto px-4 pb-16 pt-24 sm:px-6 md:px-10 md:pb-20 md:pt-28">
          <div className="mx-auto max-w-6xl space-y-8">
            {isRefreshing && hasLoadedOnce && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="mx-auto flex w-fit items-center gap-2 rounded-full border border-border/60 bg-card px-4 py-1.5 text-xs text-muted-foreground shadow-sm"
              >
                <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                Actualizando datos...
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col gap-6 rounded-3xl border border-border/60 bg-card p-8 shadow-md md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="text-sm font-medium uppercase tracking-wider text-primary/80">Sentir Extranjero</p>
                <h1 className="mt-2 text-3xl font-bold text-foreground md:text-4xl">Estado general de las operaciones</h1>
                <p className="mt-3 max-w-xl text-muted-foreground">
                  Revisa el pulso de las consultas gestionadas, el nivel de respuesta del equipo y los indicadores de
                  confianza generados por los flujos automatizados.
                </p>
              </div>
              <div className="flex flex-col items-start gap-3">
                <span className="text-sm text-muted-foreground">Actualizado el</span>
                <span className="text-2xl font-semibold text-foreground">
                  {new Date().toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {metrics && (
                <>
                  <KPICard title="Total procesados" value={metrics.totalProcessed} icon={<Mail size={20} />} delay={0} />
                  <KPICard
                    title="Tasa de respuesta"
                    value={metrics.responseRate.toFixed(1)}
                    unit="%"
                    icon={<CheckCircle size={20} />}
                    delay={0.1}
                  />
                  <KPICard
                    title="Tasa de ambiguedad"
                    value={metrics.ambiguityRate.toFixed(1)}
                    unit="%"
                    icon={<AlertCircle size={20} />}
                    delay={0.2}
                  />
                  <KPICard
                    title="Confianza media"
                    value={metrics.avgConfidence.toFixed(2)}
                    icon={<TrendingUp size={20} />}
                    delay={0.3}
                  />
                </>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <TimeSeriesChart data={logs} />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <PieTemplatesChart data={logs} />
              </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <StackedBarsChart data={logs} />
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  )
}
