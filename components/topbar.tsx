"use client"

import { motion } from "framer-motion"
import { Search, Calendar, Settings } from "lucide-react"

export function Topbar() {
  return (
    <motion.header
      initial={{ y: -60 }}
      animate={{ y: 0 }}
      className="fixed top-0 right-0 left-64 h-16 border-b border-border/50 bg-card/50 backdrop-blur-sm flex items-center justify-between px-6 z-40"
    >
      <div className="flex items-center gap-4 flex-1">
        <div className="relative flex-1 max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <input
            type="text"
            placeholder="Buscar..."
            aria-label="Buscar en el dashboard"
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-input border border-border/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          aria-label="Filtrar por rango de fechas"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-input border border-border/50 text-foreground hover:bg-input/80 transition-colors"
        >
          <Calendar size={18} />
          <span className="text-sm">Últimos 30 días</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          aria-label="Abrir configuración"
          className="p-2 rounded-lg hover:bg-input transition-colors"
        >
          <Settings size={20} className="text-muted-foreground" />
        </motion.button>
      </div>
    </motion.header>
  )
}
