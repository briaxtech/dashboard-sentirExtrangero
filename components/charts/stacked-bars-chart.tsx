"use client"

import type { LogItem } from "@/lib/types"
import { countBy } from "@/lib/utils-metrics"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface StackedBarsChartProps {
  data: LogItem[]
}

export function StackedBarsChart({ data }: StackedBarsChartProps) {
  const resultadoCounts = countBy(data, "resultado")
  const chartData = [
    {
      name: "Resultados",
      ENVIADO: resultadoCounts["ENVIADO"] || 0,
      PENDIENTE: resultadoCounts["PENDIENTE"] || 0,
      NO_RESPONDER: resultadoCounts["NO_RESPONDER"] || 0,
    },
  ]

  return (
    <div className="rounded-2xl border border-border/50 bg-card shadow-lg p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Distribución de resultados</h3>
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
          <Bar dataKey="ENVIADO" stackId="a" fill="var(--chart-1)" />
          <Bar dataKey="PENDIENTE" stackId="a" fill="var(--chart-2)" />
          <Bar dataKey="NO_RESPONDER" stackId="a" fill="var(--chart-3)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
