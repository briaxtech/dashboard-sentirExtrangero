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
      className="rounded-2xl border border-border/50 bg-card shadow-lg p-6 transition-all duration-200 hover:shadow-xl hover:border-accent/50"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-muted-foreground mb-2">{title}</p>
          <div className="flex items-baseline gap-1">
            <p className="text-3xl font-bold text-foreground">{value}</p>
            {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
          </div>
        </div>
        <div className="text-accent/50">{icon}</div>
      </div>
    </motion.div>
  )
}
