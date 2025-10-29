"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Sidebar } from "@/components/sidebar"
import { Topbar } from "@/components/topbar"
import type { LogItem } from "@/lib/types"
import { groupByDate, meanConfidence, countBy } from "@/lib/utils-metrics"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

export default function EnviosPage() {
  const [logs, setLogs] = useState<LogItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch("/api/logs")
        const data = await res.json()
        setLogs(data.filter((l: LogItem) => l.resultado === "ENVIADO"))
      } catch (error) {
        console.error("Error fetching logs:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
  }, [])

  const grouped = groupByDate(logs)
  const chartData = Object.entries(grouped)
    .map(([date, items]) => ({
      date: new Date(date).toLocaleDateString("es-ES", { month: "short", day: "numeric" }),
      count: items.length,
      avgConfidence: meanConfidence(items),
    }))
    .sort((a, b) => a.date.localeCompare(b.date))

  const totalEnviados = logs.length
  const avgConfidenceEnviados = meanConfidence(logs)

  const templateBreakdown = Object.entries(countBy(logs, "template_key")).map(([template, count]) => ({
    name: template,
    value: count,
  }))

  const confidenceRanges = {
    high: logs.filter((l) => l.confidence >= 0.8).length,
    medium: logs.filter((l) => l.confidence >= 0.5 && l.confidence < 0.8).length,
    low: logs.filter((l) => l.confidence < 0.5).length,
  }

  const colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"]

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 overflow-auto pt-20 pl-64">
          <div className="p-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">Envíos</h2>
              <p className="text-muted-foreground">Resumen de consultas enviadas</p>
            </motion.div>

            {loading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Cargando envíos...</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-border/50 bg-card shadow-lg p-6"
                  >
                    <p className="text-sm text-muted-foreground mb-2">Total Enviados</p>
                    <p className="text-4xl font-bold text-accent">{totalEnviados}</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-2xl border border-border/50 bg-card shadow-lg p-6"
                  >
                    <p className="text-sm text-muted-foreground mb-2">Confianza Promedio</p>
                    <p className="text-4xl font-bold text-accent">{(avgConfidenceEnviados * 100).toFixed(1)}%</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-2xl border border-border/50 bg-card shadow-lg p-6"
                  >
                    <p className="text-sm text-muted-foreground mb-2">Promedio por día</p>
                    <p className="text-4xl font-bold text-accent">
                      {(totalEnviados / (Object.keys(grouped).length || 1)).toFixed(1)}
                    </p>
                  </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-2xl border border-border/50 bg-card shadow-lg p-6"
                  >
                    <p className="text-sm text-muted-foreground mb-2">Alta confianza (≥80%)</p>
                    <p className="text-3xl font-bold text-green-400">{confidenceRanges.high}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {((confidenceRanges.high / totalEnviados) * 100).toFixed(1)}% del total
                    </p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="rounded-2xl border border-border/50 bg-card shadow-lg p-6"
                  >
                    <p className="text-sm text-muted-foreground mb-2">Confianza media (50-80%)</p>
                    <p className="text-3xl font-bold text-yellow-400">{confidenceRanges.medium}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {((confidenceRanges.medium / totalEnviados) * 100).toFixed(1)}% del total
                    </p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="rounded-2xl border border-border/50 bg-card shadow-lg p-6"
                  >
                    <p className="text-sm text-muted-foreground mb-2">Baja confianza (&lt;50%)</p>
                    <p className="text-3xl font-bold text-red-400">{confidenceRanges.low}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {((confidenceRanges.low / totalEnviados) * 100).toFixed(1)}% del total
                    </p>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="rounded-2xl border border-border/50 bg-card shadow-lg p-6"
                >
                  <h3 className="text-lg font-semibold text-foreground mb-4">Evolución de envíos</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis stroke="var(--muted-foreground)" style={{ fontSize: "12px" }} />
                      <YAxis stroke="var(--muted-foreground)" style={{ fontSize: "12px" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                        }}
                        labelStyle={{ color: "var(--foreground)" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="var(--chart-1)"
                        strokeWidth={2}
                        dot={{ fill: "var(--chart-1)", r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="rounded-2xl border border-border/50 bg-card shadow-lg p-6"
                >
                  <h3 className="text-lg font-semibold text-foreground mb-4">Distribución por plantilla</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={templateBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="var(--chart-1)"
                        dataKey="value"
                      >
                        {templateBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                        }}
                        labelStyle={{ color: "var(--foreground)" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </motion.div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
