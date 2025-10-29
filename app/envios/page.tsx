"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Sidebar } from "@/components/sidebar"
import { Topbar } from "@/components/topbar"
import type { LogItem } from "@/lib/types"
import { countBy, groupByDate, meanConfidence } from "@/lib/utils-metrics"
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

const PIE_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"]

export default function EnviosPage() {
  const [logs, setLogs] = useState<LogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    async function fetchLogs() {
      try {
        const response = await fetch("/api/logs")
        const data: LogItem[] = await response.json()
        setLogs(data.filter((item) => item.resultado === "ENVIADO"))
      } catch (error) {
        console.error("Error fetching logs:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
  }, [])

  const groupedByDate = useMemo(() => groupByDate(logs), [logs])
  const chartData = useMemo(() => {
    return Object.entries(groupedByDate)
      .map(([date, items]) => ({
        date: new Date(date).toLocaleDateString("es-ES", { month: "short", day: "numeric" }),
        count: items.length,
        avgConfidence: parseFloat(meanConfidence(items).toFixed(2)),
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [groupedByDate])

  const totalEnviados = logs.length
  const avgConfidenceEnviados = totalEnviados > 0 ? meanConfidence(logs) * 100 : 0
  const promedioPorDia =
    totalEnviados > 0 ? totalEnviados / Math.max(Object.keys(groupedByDate).length, 1) : 0

  const templateBreakdown = useMemo(
    () =>
      Object.entries(countBy(logs, "template_key")).map(([template, count]) => ({
        name: template,
        value: count,
      })),
    [logs],
  )

  const confidenceRanges = useMemo(() => {
    const high = logs.filter((log) => log.confidence >= 0.8).length
    const medium = logs.filter((log) => log.confidence >= 0.5 && log.confidence < 0.8).length
    const low = logs.filter((log) => log.confidence < 0.5).length
    return { high, medium, low }
  }, [logs])

  const percent = (value: number) => (totalEnviados > 0 ? ((value / totalEnviados) * 100).toFixed(1) : "0.0")

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
              className="rounded-3xl border border-border/60 bg-card p-8 shadow-md"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-wide text-muted-foreground">Performance de envios</p>
                  <h1 className="text-3xl font-bold text-foreground mt-1">Consultas enviadas</h1>
                  <p className="text-muted-foreground mt-2">
                    Analisis diario del volumen enviado y la confianza obtenida en cada flujo automatizado.
                  </p>
                </div>
                <div className="rounded-2xl bg-primary/10 px-6 py-4 text-right">
                  <p className="text-xs uppercase text-primary/70">Promedio diario</p>
                  <p className="text-3xl font-semibold text-primary mt-1">{promedioPorDia.toFixed(1)}</p>
                </div>
              </div>
            </motion.div>

            {loading ? (
              <div className="py-20 text-center">
                <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-4 border-accent/30 border-t-accent" />
                <p className="text-muted-foreground">Cargando envios...</p>
              </div>
            ) : (
              <>
                <div className="grid gap-6 md:grid-cols-3">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-3xl border border-border/60 bg-card p-6 shadow-md"
                  >
                    <p className="text-sm font-medium text-muted-foreground">Total enviados</p>
                    <p className="text-4xl font-bold text-foreground mt-2">{totalEnviados}</p>
                    <p className="text-xs text-muted-foreground mt-3">
                      Conversaciones que avanzaron a la siguiente etapa del flujo.
                    </p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-3xl border border-border/60 bg-card p-6 shadow-md"
                  >
                    <p className="text-sm font-medium text-muted-foreground">Confianza promedio</p>
                    <p className="text-4xl font-bold text-primary mt-2">{avgConfidenceEnviados.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground mt-3">
                      Basado en la puntuacion de confianza agregada por el modelo.
                    </p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-3xl border border-border/60 bg-card p-6 shadow-md"
                  >
                    <p className="text-sm font-medium text-muted-foreground">Rango de confianza</p>
                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-foreground">Alta (80-100%)</span>
                        <span className="text-muted-foreground">
                          {confidenceRanges.high} ({percent(confidenceRanges.high)}%)
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-foreground">Media (50-80%)</span>
                        <span className="text-muted-foreground">
                          {confidenceRanges.medium} ({percent(confidenceRanges.medium)}%)
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-foreground">Baja (0-50%)</span>
                        <span className="text-muted-foreground">
                          {confidenceRanges.low} ({percent(confidenceRanges.low)}%)
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="rounded-3xl border border-border/60 bg-card p-6 shadow-md"
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-6">
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">Evolucion diaria</h2>
                      <p className="text-sm text-muted-foreground">
                        Volumen de envios y confianza asociada por fecha.
                      </p>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" />
                      <XAxis
                        dataKey="date"
                        stroke="var(--muted-foreground)"
                        tickLine={false}
                        axisLine={false}
                        style={{ fontSize: "12px" }}
                      />
                      <YAxis
                        yAxisId="left"
                        stroke="var(--muted-foreground)"
                        tickLine={false}
                        axisLine={false}
                        style={{ fontSize: "12px" }}
                        allowDecimals={false}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="var(--muted-foreground)"
                        tickLine={false}
                        axisLine={false}
                        style={{ fontSize: "12px" }}
                      />
                      <Tooltip
                        cursor={{ stroke: "var(--primary)", strokeDasharray: "4 4", strokeWidth: 1 }}
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: "12px",
                          boxShadow: "0 12px 32px rgba(20, 19, 33, 0.08)",
                        }}
                        labelStyle={{ color: "var(--foreground)" }}
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="count"
                        stroke="var(--chart-1)"
                        strokeWidth={3}
                        dot={{ r: 4, fill: "var(--chart-1)" }}
                        activeDot={{ r: 6 }}
                        name="Envios"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="avgConfidence"
                        stroke="var(--chart-2)"
                        strokeWidth={2}
                        strokeDasharray="6 6"
                        dot={false}
                        name="Confianza"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="rounded-3xl border border-border/60 bg-card p-6 shadow-md"
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-6">
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">Plantillas con mas envios</h2>
                      <p className="text-sm text-muted-foreground">
                        Distribucion de envios por plantilla aplicada.
                      </p>
                    </div>
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                      Total {totalEnviados}
                    </span>
                  </div>
                  {templateBreakdown.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No se registraron envios con plantillas asignadas.</p>
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                      <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                          <Pie
                            data={templateBreakdown}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={90}
                            paddingAngle={6}
                            dataKey="value"
                          >
                            {templateBreakdown.map((entry, index) => (
                              <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "var(--card)",
                              border: "1px solid var(--border)",
                              borderRadius: "12px",
                              boxShadow: "0 12px 32px rgba(20, 19, 33, 0.08)",
                            }}
                            labelStyle={{ color: "var(--foreground)" }}
                            formatter={(value: number, name: string) => {
                              const percentage = totalEnviados > 0 ? Math.round((value / totalEnviados) * 100) : 0
                              return [`${value} (${percentage}%)`, name]
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="space-y-3">
                        {templateBreakdown
                          .sort((a, b) => b.value - a.value)
                          .map((item, index) => {
                            const color = PIE_COLORS[index % PIE_COLORS.length]
                            const percentage = percent(item.value)
                            return (
                              <div
                                key={item.name}
                                className="flex items-center justify-between rounded-2xl border border-border/60 bg-secondary/40 px-4 py-3"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                                  <div>
                                    <p className="text-sm font-semibold text-foreground">{item.name}</p>
                                    <p className="text-xs text-muted-foreground">{percentage}% de los envios</p>
                                  </div>
                                </div>
                                <span className="text-sm font-medium text-foreground">{item.value}</span>
                              </div>
                            )
                          })}
                      </div>
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
