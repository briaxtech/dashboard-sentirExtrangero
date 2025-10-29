"use client"

import type { LogItem } from "@/lib/types"
import { groupByDate, meanConfidence } from "@/lib/utils-metrics"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface TimeSeriesChartProps {
  data: LogItem[]
}

export function TimeSeriesChart({ data }: TimeSeriesChartProps) {
  const grouped = groupByDate(data)
  const chartData = Object.entries(grouped)
    .map(([date, items]) => ({
      date: new Date(date).toLocaleDateString("es-ES", { month: "short", day: "numeric" }),
      count: items.length,
      avgConfidence: parseFloat(meanConfidence(items).toFixed(2)),
    }))
    .sort((a, b) => a.date.localeCompare(b.date))

  return (
    <div className="rounded-3xl border border-border/70 bg-card shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Consultas gestionadas por dia</h3>
          <p className="text-sm text-muted-foreground">
            Seguimiento de volumen diario junto al promedio de confianza generado.
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
            cursor={{ stroke: "var(--primary)", strokeWidth: 1, strokeDasharray: "3 3" }}
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
            dot={{ fill: "var(--chart-1)", r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="avgConfidence"
            stroke="var(--chart-2)"
            strokeWidth={2}
            strokeDasharray="6 6"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
