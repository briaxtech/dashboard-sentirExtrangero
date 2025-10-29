"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Sidebar } from "@/components/sidebar"
import { Topbar } from "@/components/topbar"
import { KPICard } from "@/components/kpi-card"
import { TimeSeriesChart } from "@/components/charts/time-series-chart"
import { StackedBarsChart } from "@/components/charts/stacked-bars-chart"
import { PieTemplatesChart } from "@/components/charts/pie-templates-chart"
import type { LogItem, KPIMetrics } from "@/lib/types"
import { calculateKPIs } from "@/lib/utils-metrics"
import { Mail, CheckCircle, AlertCircle, TrendingUp } from "lucide-react"

export default function Dashboard() {
  const [logs, setLogs] = useState<LogItem[]>([])
  const [metrics, setMetrics] = useState<KPIMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch("/api/logs")
        const data = await res.json()
        setLogs(data)
        setMetrics(calculateKPIs(data))
      } catch (error) {
        console.error("Error fetching logs:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando metricas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background via-white to-background">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex flex-1 flex-col md:ml-64">
        <Topbar onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />
        <main className="flex-1 overflow-auto px-4 pb-16 pt-24 sm:px-6 md:px-10 md:pb-20 md:pt-28">
          <div className="mx-auto max-w-6xl space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="rounded-3xl border border-border/60 bg-card shadow-md p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6"
            >
              <div>
                <p className="text-sm font-medium text-primary/80 uppercase tracking-wider">Sentir Extranjero</p>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mt-2">
                  Estado general de las operaciones
                </h1>
                <p className="text-muted-foreground mt-3 max-w-xl">
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {metrics && (
                <>
                  <KPICard
                    title="Total procesados"
                    value={metrics.totalProcessed}
                    icon={<Mail size={20} />}
                    delay={0}
                  />
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
