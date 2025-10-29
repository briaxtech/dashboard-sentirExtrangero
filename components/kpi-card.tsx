"use client"

import { motion } from "framer-motion"
import type React from "react"

interface KPICardProps {
  title: string
  value: string | number
  unit?: string
  icon: React.ReactNode
  delay?: number
}

export function KPICard({ title, value, unit, icon, delay = 0 }: KPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="group relative overflow-hidden rounded-3xl border border-border/70 bg-card p-6 shadow-md transition-all duration-200 hover:border-primary/30 hover:shadow-xl"
    >
      <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/10" />
      <div className="flex items-start justify-between mb-6">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-2 rounded-xl bg-secondary px-3 py-1 text-sm font-semibold text-secondary-foreground shadow-sm">
            {title}
          </span>
          <div className="flex items-baseline gap-2">
            <p className="text-[2.625rem] font-bold leading-none tracking-tight text-foreground">{value}</p>
            {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
          </div>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
      </div>
      <div className="text-xs text-muted-foreground">
        Variacion diaria calculada con base en los ultimos registros sincronizados.
      </div>
    </motion.div>
  )
}
