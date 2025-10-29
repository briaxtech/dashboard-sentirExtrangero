"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Bell, Calendar, Menu, Search, Settings, X } from "lucide-react"

type TopbarProps = {
  onToggleSidebar: () => void
}

export function Topbar({ onToggleSidebar }: TopbarProps) {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const mobileSearchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isMobileSearchOpen) {
      mobileSearchRef.current?.focus()
    }
  }, [isMobileSearchOpen])

  return (
    <>
      <motion.header
        initial={{ y: -60 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-40 h-16 border-b border-border/80 bg-card/95 backdrop-blur-sm shadow-sm md:left-64 md:h-20"
      >
        <div className="flex h-full items-center justify-between gap-2 px-4 sm:px-6 md:px-8">
          <div className="flex flex-1 items-center gap-2 md:gap-4">
            <button
              type="button"
              onClick={onToggleSidebar}
              aria-label="Abrir menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-card text-muted-foreground shadow-sm transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 md:hidden"
            >
              <Menu size={20} />
            </button>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Resumen general</p>
              <h2 className="truncate text-xl font-semibold text-foreground sm:text-2xl md:text-3xl">Dashboard</h2>
            </div>
            <div className="relative hidden flex-1 items-center lg:ml-8 lg:flex lg:max-w-md">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Buscar en el panel"
                aria-label="Buscar en el dashboard"
                className="w-full rounded-xl border border-border/70 bg-input px-12 py-3 text-sm text-foreground shadow-sm transition focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            <button
              type="button"
              onClick={() => setIsMobileSearchOpen(true)}
              aria-label="Abrir buscador"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-card text-muted-foreground shadow-sm transition-colors hover:text-primary lg:hidden"
            >
              <Search size={18} />
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              type="button"
              aria-label="Filtrar por rango de fechas"
              className="hidden items-center gap-2 rounded-xl border border-border/60 bg-secondary px-3 py-2 text-xs font-medium text-secondary-foreground shadow-sm transition-colors hover:bg-secondary/80 lg:flex"
            >
              <Calendar size={16} />
              <span>Ultimos 30 dias</span>
            </motion.button>
            <button
              type="button"
              aria-label="Filtrar por rango de fechas"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-card text-muted-foreground transition-colors hover:text-primary lg:hidden"
            >
              <Calendar size={18} />
            </button>
            <button
              type="button"
              aria-label="Ver notificaciones"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-card text-muted-foreground transition-colors hover:text-primary"
            >
              <Bell size={18} />
            </button>
            <button
              type="button"
              aria-label="Abrir configuracion"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-card text-muted-foreground transition-colors hover:text-primary"
            >
              <Settings size={18} />
            </button>
            <div className="hidden items-center gap-3 border-l border-border/60 pl-4 lg:flex">
              <div className="text-right leading-tight">
                <p className="text-xs font-medium text-foreground">Equipo Sentir</p>
                <p className="text-[11px] text-muted-foreground">sentir@extranjero.com</p>
              </div>
              <div className="relative h-10 w-10 overflow-hidden rounded-full border border-border/80 shadow-sm">
                <Image src="/sentir-favicon.png" alt="Sentir Extranjero" fill className="object-cover" />
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <div
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity md:hidden ${
          isMobileSearchOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setIsMobileSearchOpen(false)}
      >
        <div
          className="mx-4 mt-24 rounded-2xl border border-border/60 bg-card p-4 shadow-lg"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Buscar en el panel</p>
            <button
              type="button"
              aria-label="Cerrar buscador"
              onClick={() => setIsMobileSearchOpen(false)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/60 text-muted-foreground transition-colors hover:text-primary"
            >
              <X size={16} />
            </button>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-input px-4 py-3">
            <Search size={18} className="text-muted-foreground" />
            <input
              ref={mobileSearchRef}
              type="text"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Buscar por palabras clave"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Escribe para filtrar resultados en el dashboard. El buscador completo esta disponible en pantallas grandes.
          </p>
        </div>
      </div>
    </>
  )
}
