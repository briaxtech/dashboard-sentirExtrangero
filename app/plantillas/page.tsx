"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Sidebar } from "@/components/sidebar"
import { Topbar } from "@/components/topbar"
import type { LogItem } from "@/lib/types"
import { countBy, meanConfidence } from "@/lib/utils-metrics"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, Users, CheckCircle } from "lucide-react"

export default function PlantillasPage() {
  const [logs, setLogs] = useState<LogItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch("/api/logs")
        const data = await res.json()
        setLogs(data)
      } catch (error) {
        console.error("Error fetching logs:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
  }, [])

  const templateStats = Object.entries(countBy(logs, "template_key")).map(([key, count]) => {
    const templateLogs = logs.filter((l) => l.template_key === key)
    return {
      key,
      count,
      avgConfidence: meanConfidence(templateLogs),
      enviados: templateLogs.filter((l) => l.resultado === "ENVIADO").length,
      pendientes: templateLogs.filter((l) => l.resultado === "PENDIENTE").length,
      noResponder: templateLogs.filter((l) => l.resultado === "NO_RESPONDER").length,
      successRate: count > 0 ? (templateLogs.filter((l) => l.resultado === "ENVIADO").length / count) * 100 : 0,
      responseRate: (templateLogs.filter((l) => l.resultado === "ENVIADO").length / count) * 100,
    }
  })

  const chartData = templateStats.map((stat) => ({
    name: stat.key,
    Enviados: stat.enviados,
    Pendientes: stat.pendientes,
    "No Responder": stat.noResponder,
  }))

  const confidenceData = templateStats.map((stat) => ({
    name: stat.key,
    value: Math.round(stat.avgConfidence * 100),
  }))

  const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"]

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 overflow-auto pt-20 pl-64">
          <div className="p-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">Plantillas</h2>
              <p className="text-muted-foreground">Análisis de uso y rendimiento de plantillas</p>
            </motion.div>

            {loading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Cargando plantillas...</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-border/50 bg-card shadow-lg p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Total Plantillas</p>
                        <p className="text-3xl font-bold text-accent">{templateStats.length}</p>
                      </div>
                      <Users size={32} className="text-accent/50" />
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-2xl border border-border/50 bg-card shadow-lg p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Total Usos</p>
                        <p className="text-3xl font-bold text-accent">{logs.length}</p>
                      </div>
                      <TrendingUp size={32} className="text-accent/50" />
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-2xl border border-border/50 bg-card shadow-lg p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Tasa Éxito Promedio</p>
                        <p className="text-3xl font-bold text-green-400">
                          {(templateStats.reduce((sum, s) => sum + s.successRate, 0) / templateStats.length).toFixed(0)}
                          %
                        </p>
                      </div>
                      <CheckCircle size={32} className="text-green-400/50" />
                    </div>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="rounded-2xl border border-border/50 bg-card shadow-lg p-6"
                >
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Distribución de Resultados por Plantilla
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
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
                      <Legend />
                      <Bar dataKey="Enviados" stackId="a" fill="var(--chart-1)" />
                      <Bar dataKey="Pendientes" stackId="a" fill="var(--chart-2)" />
                      <Bar dataKey="No Responder" stackId="a" fill="var(--chart-3)" />
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="rounded-2xl border border-border/50 bg-card shadow-lg p-6"
                >
                  <h3 className="text-lg font-semibold text-foreground mb-4">Confianza Promedio por Plantilla</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={confidenceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {confidenceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {templateStats.map((stat, idx) => (
                    <motion.div
                      key={stat.key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="rounded-2xl border border-border/50 bg-card shadow-lg p-6"
                    >
                      <h3 className="text-lg font-semibold text-foreground mb-4">{stat.key}</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <p className="text-xs text-muted-foreground">Total de usos</p>
                          <p className="text-xl font-bold text-accent">{stat.count}</p>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-xs text-muted-foreground">Tasa de éxito</p>
                          <p className="text-xl font-bold text-green-400">{stat.successRate.toFixed(0)}%</p>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-xs text-muted-foreground">Confianza promedio</p>
                          <p className="text-xl font-bold text-foreground">{(stat.avgConfidence * 100).toFixed(0)}%</p>
                        </div>
                        <div className="pt-3 border-t border-border/50 space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-green-400">Enviados</span>
                            <span className="font-semibold">{stat.enviados}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-yellow-400">Pendientes</span>
                            <span className="font-semibold">{stat.pendientes}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-red-400">No Responder</span>
                            <span className="font-semibold">{stat.noResponder}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Tasa de respuesta</p>
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div
                              className="bg-accent h-2 rounded-full transition-all"
                              style={{ width: `${stat.responseRate}%` }}
                            />
                          </div>
                          <p className="text-xs text-foreground mt-1">{stat.responseRate.toFixed(1)}%</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="rounded-2xl border border-border/50 bg-card shadow-lg p-6"
                >
                  <h3 className="text-lg font-semibold text-foreground mb-4">Comparativa de plantillas por estado</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
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
                      <Legend />
                      <Bar dataKey="enviados" fill="var(--chart-1)" name="Enviados" />
                      <Bar dataKey="pendientes" fill="var(--chart-2)" name="Pendientes" />
                      <Bar dataKey="noResponder" fill="var(--chart-3)" name="No Responder" />
                    </BarChart>
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
