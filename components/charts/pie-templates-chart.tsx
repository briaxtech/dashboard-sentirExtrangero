"use client"

import type { LogItem } from "@/lib/types"
import { countBy } from "@/lib/utils-metrics"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"

interface PieTemplatesChartProps {
  data: LogItem[]
}

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"]

export function PieTemplatesChart({ data }: PieTemplatesChartProps) {
  const templateCounts = Object.entries(countBy(data, "template_key")).map(([key, count]) => ({
    name: key,
    value: count,
  }))

  const total = templateCounts.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="rounded-3xl border border-border/70 bg-card shadow-md p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Participacion por plantilla</h3>
          <p className="text-sm text-muted-foreground">
            Identifica que flujos concentran la mayor carga de consultas.
          </p>
        </div>
        <span className="whitespace-nowrap rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary/80">
          Total {total}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={templateCounts}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={90}
              paddingAngle={6}
              dataKey="value"
            >
              {templateCounts.map((entry, index) => (
                <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
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
                const percent = total > 0 ? Math.round((value / total) * 100) : 0
                return [`${value} (${percent}%)`, name]
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="space-y-3">
          {templateCounts
            .sort((a, b) => b.value - a.value)
            .map((item, index) => {
              const percent = total > 0 ? ((item.value / total) * 100).toFixed(1) : "0.0"
              return (
                <div
                  key={item.name}
                  className="flex items-center justify-between rounded-2xl border border-border/60 bg-secondary/40 px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      aria-hidden="true"
                    />
                    <div>
                      <p className="truncate text-sm font-semibold text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{percent}% de los casos</p>
                    </div>
                  </div>
                  <span className="ml-4 shrink-0 text-sm font-medium text-foreground">{item.value}</span>
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}
