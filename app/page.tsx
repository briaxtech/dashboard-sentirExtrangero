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
          <p className="text-muted-foreground">Cargando métricas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 overflow-auto pt-20 pl-64">
          <div className="p-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">Dashboard de Métricas</h2>
              <p className="text-muted-foreground">Análisis en tiempo real de consultas procesadas</p>
            </motion.div>

            {/* KPIs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {metrics && (
                <>
                  <KPICard
                    title="Total Procesados"
                    value={metrics.totalProcessed}
                    icon={<Mail size={24} />}
                    delay={0}
                  />
                  <KPICard
                    title="Tasa de Respuesta"
                    value={metrics.responseRate.toFixed(1)}
                    unit="%"
                    icon={<CheckCircle size={24} />}
                    delay={0.1}
                  />
                  <KPICard
                    title="Tasa de Ambigüedad"
                    value={metrics.ambiguityRate.toFixed(1)}
                    unit="%"
                    icon={<AlertCircle size={24} />}
                    delay={0.2}
                  />
                  <KPICard
                    title="Confianza Media"
                    value={metrics.avgConfidence.toFixed(2)}
                    icon={<TrendingUp size={24} />}
                    delay={0.3}
                  />
                </>
              )}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
