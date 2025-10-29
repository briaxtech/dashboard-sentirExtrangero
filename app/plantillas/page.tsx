"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Sidebar } from "@/components/sidebar"
import { Topbar } from "@/components/topbar"
import type { LogItem } from "@/lib/types"
import { countBy, meanConfidence } from "@/lib/utils-metrics"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { CheckCircle, TrendingUp, Users } from "lucide-react"

const PIE_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"]

type TemplateStat = {
  key: string
  count: number
  avgConfidence: number
  enviados: number
  pendientes: number
  noResponder: number
  successRate: number
  responseRate: number
}

export default function PlantillasPage() {
  const [logs, setLogs] = useState<LogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    async function fetchLogs() {
      try {
        const response = await fetch("/api/logs")
        const data: LogItem[] = await response.json()
        setLogs(data)
      } catch (error) {
        console.error("Error fetching logs:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
  }, [])

  const templateStats: TemplateStat[] = useMemo(() => {
    return Object.entries(countBy(logs, "template_key")).map(([key, count]) => {
      const templateLogs = logs.filter((log) => log.template_key === key)
      const enviados = templateLogs.filter((log) => log.resultado === "ENVIADO").length
      const pendientes = templateLogs.filter((log) => log.resultado === "PENDIENTE").length
      const noResponder = templateLogs.filter((log) => log.resultado === "NO_RESPONDER").length
      const avgConfidence = meanConfidence(templateLogs)
      const successRate = count > 0 ? (enviados / count) * 100 : 0
      const responseRate = count > 0 ? (enviados / count) * 100 : 0
      return {
        key,
        count,
        avgConfidence,
        enviados,
        pendientes,
        noResponder,
        successRate,
        responseRate,
      }
    })
  }, [logs])

  const chartData = templateStats.map((stat) => ({
    name: stat.key,
    enviados: stat.enviados,
    pendientes: stat.pendientes,
    noResponder: stat.noResponder,
  }))

  const confidenceDistribution = templateStats.map((stat) => ({
    name: stat.key,
    value: Number.parseFloat((stat.avgConfidence * 100).toFixed(1)),
  }))

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background via-white to-background">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex flex-1 flex-col md:ml-64">
        <Topbar onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />
        <main className="flex-1 overflow-auto px-4 pb-16 pt-24 sm:px-6 md:px-10 md:pb-20 md:pt-28">
          <div className="mx-auto w-full max-w-[1200px] space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-border/60 bg-card p-8 shadow-md"
            >
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-3">
                  <p className="text-sm uppercase tracking-wide text-muted-foreground">Analitica de plantillas</p>
                  <h1 className="mt-1 text-3xl font-bold text-foreground">Uso y rendimiento por plantilla</h1>
                  <p className="mt-2 text-muted-foreground">
                    Evalua el comportamiento de cada plantilla y detecta oportunidades de optimizacion.
                  </p>
                </div>
                <div className="w-full rounded-2xl bg-primary/10 px-6 py-4 text-right sm:max-w-xs sm:self-end">
                  <p className="text-xs uppercase text-primary/70">Total plantillas activas</p>
                  <p className="mt-1 text-3xl font-semibold text-primary">{templateStats.length}</p>
                </div>
              </div>
            </motion.div>

            {loading ? (
              <div className="py-20 text-center">
                <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-4 border-accent/30 border-t-accent" />
                <p className="text-muted-foreground">Cargando plantillas...</p>
              </div>
            ) : (
              <>
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-3xl border border-border/60 bg-card p-6 shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total de plantillas</p>
                        <p className="text-4xl font-bold text-foreground mt-2">{templateStats.length}</p>
                      </div>
                      <span className="rounded-2xl bg-primary/10 p-3 text-primary">
                        <Users size={24} />
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-4">
                      Plantillas con al menos una clasificacion registrada.
                    </p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-3xl border border-border/60 bg-card p-6 shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Usos totales</p>
                        <p className="text-4xl font-bold text-foreground mt-2">{logs.length}</p>
                      </div>
                      <span className="rounded-2xl bg-primary/10 p-3 text-primary">
                        <TrendingUp size={24} />
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-4">
                      Registros evaluados por el asistente en el periodo actual.
                    </p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-3xl border border-border/60 bg-card p-6 shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Tasa de exito promedio</p>
                        <p className="text-4xl font-bold text-primary mt-2">
                          {templateStats.length > 0
                            ? (
                                templateStats.reduce((sum, stat) => sum + stat.successRate, 0) /
                                templateStats.length
                              ).toFixed(1)
                            : "0.0"}
                          %
                        </p>
                      </div>
                      <span className="rounded-2xl bg-primary/10 p-3 text-primary">
                        <CheckCircle size={24} />
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-4">
                      Porcentaje de consultas enviadas frente al total de cada plantilla.
                    </p>
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
                      <h2 className="text-lg font-semibold text-foreground">Distribucion de confianza</h2>
                      <p className="text-sm text-muted-foreground">
                        Promedio de confianza obtenido por plantilla.
                      </p>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie
                        data={confidenceDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={90}
                        dataKey="value"
                        paddingAngle={6}
                      >
                        {confidenceDistribution.map((entry, index) => (
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
                        formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
                >
                  {templateStats.map((stat, index) => (
                    <div
                      key={stat.key}
                      className="rounded-3xl border border-border/60 bg-card p-6 shadow-md transition-shadow hover:shadow-lg"
                    >
                      <h3 className="truncate text-lg font-semibold text-foreground">{stat.key}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stat.count} registros analizados en total.
                      </p>

                      <div className="mt-5 space-y-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Enviados</span>
                          <span className="font-semibold text-foreground">{stat.enviados}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Pendientes</span>
                          <span className="font-semibold text-foreground">{stat.pendientes}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">No responder</span>
                          <span className="font-semibold text-foreground">{stat.noResponder}</span>
                        </div>
                      </div>

                      <div className="mt-5">
                        <p className="text-xs text-muted-foreground">Confianza promedio</p>
                        <p className="text-xl font-semibold text-primary mt-1">
                          {(stat.avgConfidence * 100).toFixed(1)}%
                        </p>
                      </div>

                      <div className="mt-4">
                        <p className="text-xs text-muted-foreground">Tasa de respuesta</p>
                        <div className="mt-2 h-2 w-full rounded-full bg-secondary">
                          <div
                            className="h-2 rounded-full bg-primary transition-all"
                            style={{ width: `${Math.min(stat.responseRate, 100)}%` }}
                          />
                        </div>
                        <p className="text-xs text-foreground mt-2">{stat.responseRate.toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="rounded-3xl border border-border/60 bg-card p-6 shadow-md"
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-6">
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">Comparativa por estado</h2>
                      <p className="text-sm text-muted-foreground">
                        Visualiza como se distribuyen los resultados para cada plantilla.
                      </p>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" />
                      <XAxis
                        dataKey="name"
                        stroke="var(--muted-foreground)"
                        tickLine={false}
                        axisLine={false}
                        style={{ fontSize: "12px" }}
                      />
                      <YAxis
                        stroke="var(--muted-foreground)"
                        tickLine={false}
                        axisLine={false}
                        style={{ fontSize: "12px" }}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: "12px",
                          boxShadow: "0 12px 32px rgba(20, 19, 33, 0.08)",
                        }}
                        labelStyle={{ color: "var(--foreground)" }}
                      />
                      <Legend wrapperStyle={{ fontSize: "12px" }} />
                      <Bar dataKey="enviados" stackId="a" fill="var(--chart-1)" name="Enviados" radius={[8, 8, 0, 0]} />
                      <Bar
                        dataKey="pendientes"
                        stackId="a"
                        fill="var(--chart-2)"
                        name="Pendientes"
                        radius={[8, 8, 0, 0]}
                      />
                      <Bar
                        dataKey="noResponder"
                        stackId="a"
                        fill="var(--chart-3)"
                        name="No responder"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
