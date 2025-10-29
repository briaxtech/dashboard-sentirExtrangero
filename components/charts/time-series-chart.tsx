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
      avgConfidence: meanConfidence(items),
    }))
    .sort((a, b) => a.date.localeCompare(b.date))

  return (
    <div className="rounded-2xl border border-border/50 bg-card shadow-lg p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Emails por día</h3>
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
    </div>
  )
}
