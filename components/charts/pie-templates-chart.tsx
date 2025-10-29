"use client"

import type { LogItem } from "@/lib/types"
import { countBy } from "@/lib/utils-metrics"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"

interface PieTemplatesChartProps {
  data: LogItem[]
}

export function PieTemplatesChart({ data }: PieTemplatesChartProps) {
  const templateCounts = Object.entries(countBy(data, "template_key")).map(([key, count]) => ({
    name: key,
    value: count,
  }))

  const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"]

  return (
    <div className="rounded-2xl border border-border/50 bg-card shadow-lg p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Distribución de plantillas</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={templateCounts}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value}`}
            outerRadius={80}
            fill="var(--chart-1)"
            dataKey="value"
          >
            {templateCounts.map((entry, index) => (
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
    </div>
  )
}
