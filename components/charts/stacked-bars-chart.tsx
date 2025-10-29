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
    <div className="rounded-3xl border border-border/70 bg-card shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Estado de las respuestas</h3>
          <p className="text-sm text-muted-foreground">
            Distribucion de resultados en el flujo operativo actual.
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
            cursor={{ fill: "var(--primary)", fillOpacity: 0.08 }}
            contentStyle={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              boxShadow: "0 12px 32px rgba(20, 19, 33, 0.08)",
            }}
            labelStyle={{ color: "var(--foreground)" }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ paddingBottom: 16, fontSize: "12px" }}
          />
          <Bar dataKey="ENVIADO" name="Enviado" stackId="a" fill="var(--chart-1)" radius={[0, 0, 0, 0]} />
          <Bar dataKey="PENDIENTE" name="Pendiente" stackId="a" fill="var(--chart-2)" radius={[0, 0, 0, 0]} />
          <Bar dataKey="NO_RESPONDER" name="No responder" stackId="a" fill="var(--chart-3)" radius={[12, 12, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
