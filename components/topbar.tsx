"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Bell, Calendar, Loader2, Menu, Search, Settings, X } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { differenceInCalendarDays, format, formatDistanceToNow, isSameDay, startOfDay, subDays } from "date-fns"
import { es } from "date-fns/locale"
import type { LogItem } from "@/lib/types"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type TopbarProps = {
  onToggleSidebar: () => void
  searchValue?: string
  onSearchChange?: (value: string) => void
  dateRange?: DateRange
  onDateRangeChange?: (range: DateRange | undefined) => void
  notifications?: LogItem[]
  onNotificationSelect?: (notification: LogItem) => void
  minConfidence?: number
  onMinConfidenceChange?: (value: number) => void
  selectedResultados?: LogItem["resultado"][]
  onResultadosChange?: (status: LogItem["resultado"], checked: boolean) => void
  onResetPreferences?: () => void
  isRefreshing?: boolean
}

const RESULTADO_LABELS: Record<LogItem["resultado"], string> = {
  ENVIADO: "Enviados",
  PENDIENTE: "Pendientes",
  NO_RESPONDER: "No responder",
}

function getDateRangeLabel(range: DateRange | undefined): string {
  if (range?.from && range?.to) {
    const start = startOfDay(range.from)
    const end = startOfDay(range.to)
    const today = startOfDay(new Date())
    const defaultStart = startOfDay(subDays(today, 29))

    if (start.getTime() === defaultStart.getTime() && end.getTime() === today.getTime()) {
      return "Ultimos 30 dias"
    }

    if (isSameDay(start, end)) {
      return format(start, "d MMM yyyy", { locale: es })
    }

    const includeYear = start.getFullYear() !== end.getFullYear()
    const startPattern = includeYear ? "d MMM yyyy" : "d MMM"
    return `${format(start, startPattern, { locale: es })} – ${format(end, "d MMM yyyy", { locale: es })}`
  }

  return "Todo el historial"
}

export function Topbar({
  onToggleSidebar,
  searchValue,
  onSearchChange,
  dateRange,
  onDateRangeChange,
  notifications,
  onNotificationSelect,
  minConfidence,
  onMinConfidenceChange,
  selectedResultados,
  onResultadosChange,
  onResetPreferences,
  isRefreshing,
}: TopbarProps) {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const mobileSearchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isMobileSearchOpen) {
      mobileSearchRef.current?.focus()
    }
  }, [isMobileSearchOpen])

  const defaultResultados = useMemo(
    () => Object.keys(RESULTADO_LABELS) as LogItem["resultado"][],
    [],
  )

  const isSearchControlled = typeof onSearchChange === "function" && searchValue !== undefined
  const [internalSearch, setInternalSearch] = useState("")
  const currentSearch = isSearchControlled ? (searchValue as string) : internalSearch
  const updateSearch = (value: string) => {
    if (isSearchControlled) {
      onSearchChange?.(value)
    } else {
      setInternalSearch(value)
    }
  }

  const isDateRangeControlled = typeof onDateRangeChange === "function"
  const [internalDateRange, setInternalDateRange] = useState<DateRange | undefined>(() => {
    if (isDateRangeControlled) {
      return dateRange
    }
    const today = new Date()
    return {
      from: subDays(today, 29),
      to: today,
    }
  })
  const currentDateRange = isDateRangeControlled ? dateRange : internalDateRange
  const updateDateRange = (range: DateRange | undefined) => {
    if (isDateRangeControlled) {
      onDateRangeChange?.(range)
    } else {
      setInternalDateRange(range)
    }
  }

  useEffect(() => {
    if (isDateRangeControlled) {
      setInternalDateRange(dateRange)
    }
  }, [isDateRangeControlled, dateRange])

  const isMinConfidenceControlled = typeof onMinConfidenceChange === "function" && typeof minConfidence === "number"
  const [internalMinConfidence, setInternalMinConfidence] = useState(0)
  const currentMinConfidence = isMinConfidenceControlled ? (minConfidence as number) : internalMinConfidence
  const updateMinConfidence = (value: number) => {
    if (isMinConfidenceControlled) {
      onMinConfidenceChange?.(value)
    } else {
      setInternalMinConfidence(value)
    }
  }

  const isResultadosControlled = typeof onResultadosChange === "function" && Array.isArray(selectedResultados)
  const [internalResultados, setInternalResultados] = useState<LogItem["resultado"][]>(defaultResultados)
  const currentResultados = isResultadosControlled ? (selectedResultados as LogItem["resultado"][]) : internalResultados
  const updateResultados = (status: LogItem["resultado"], checked: boolean) => {
    if (isResultadosControlled) {
      onResultadosChange?.(status, checked)
    } else {
      setInternalResultados((prev) => {
        if (checked) {
          const merged = prev.includes(status) ? prev : [...prev, status]
          return defaultResultados.filter((option) => merged.includes(option))
        }
        return prev.filter((option) => option !== status)
      })
    }
  }

  const handleResetPreferences = () => {
    onResetPreferences?.()
    if (!isMinConfidenceControlled) {
      setInternalMinConfidence(0)
    }
    if (!isResultadosControlled) {
      setInternalResultados(defaultResultados)
    }
  }

  const safeNotifications = notifications ?? []
  const pendingCount = safeNotifications.length
  const dateRangeLabel = useMemo(() => getDateRangeLabel(currentDateRange), [currentDateRange])

  type QuickPreset = "today" | "7" | "30" | "all"

  const selectedPreset = useMemo<QuickPreset | "custom">(() => {
    if (!currentDateRange?.from || !currentDateRange?.to) {
      return "all"
    }

    const today = startOfDay(new Date())
    const start = startOfDay(currentDateRange.from)
    const end = startOfDay(currentDateRange.to)

    if (start.getTime() === today.getTime() && end.getTime() === today.getTime()) {
      return "today"
    }

    if (end.getTime() === today.getTime()) {
      const diff = differenceInCalendarDays(end, start)
      if (diff === 6) return "7"
      if (diff === 29) return "30"
    }

    return "custom"
  }, [currentDateRange])

  const handleQuickRange = (preset: QuickPreset) => {
    const today = startOfDay(new Date())

    if (preset === "all") {
      updateDateRange(undefined)
      setIsDatePopoverOpen(false)
      return
    }

    if (preset === "today") {
      updateDateRange({ from: today, to: today })
      setIsDatePopoverOpen(false)
      return
    }

    const days = preset === "7" ? 6 : 29
    const start = subDays(today, days)

    updateDateRange({ from: start, to: today })
    setIsDatePopoverOpen(false)
  }

  const quickPresets: Array<{ key: QuickPreset; label: string; description: string }> = [
    {
      key: "today",
      label: "Hoy",
      description: "Incluye solo las interacciones del dia actual.",
    },
    {
      key: "7",
      label: "Ultimos 7 dias",
      description: "Ideal para seguimientos semanales del equipo.",
    },
    {
      key: "30",
      label: "Ultimos 30 dias",
      description: "Vista mensual recomendada para el dashboard.",
    },
    {
      key: "all",
      label: "Todo el historial",
      description: "Consulta todos los registros sin filtros temporales.",
    },
  ]

  return (
    <>
      <motion.header
        initial={{ y: -60 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-40 h-16 border-b border-border/80 bg-card/95 shadow-sm backdrop-blur-sm md:left-64 md:h-20"
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
            <div className="relative hidden flex-1 items-center lg:ml-8 lg:flex lg:max-w-sm">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                value={currentSearch}
                onChange={(event) => updateSearch(event.target.value)}
                placeholder="Buscar por remitente, hilo o ID de mensaje"
                aria-label="Buscar en el dashboard"
                className="h-10 w-full rounded-xl border border-border/70 bg-input pl-12 pr-12 text-sm text-foreground shadow-sm transition focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
              />
              {currentSearch && (
                <button
                  type="button"
                  aria-label="Limpiar busqueda"
                  onClick={() => updateSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-primary"
                >
                  <X size={16} />
                </button>
              )}
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

            <Popover open={isDatePopoverOpen} onOpenChange={setIsDatePopoverOpen}>
              <div className="flex items-center">
                <PopoverTrigger asChild>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    aria-label="Filtrar por rango de fechas"
                    className="hidden items-center gap-2 rounded-xl border border-border/60 bg-secondary px-4 py-2 text-xs font-medium text-secondary-foreground shadow-sm transition-colors hover:bg-secondary/80 lg:flex"
                  >
                    <Calendar size={16} />
                    <span>{dateRangeLabel}</span>
                  </motion.button>
                </PopoverTrigger>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    aria-label="Filtrar por rango de fechas"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-card text-muted-foreground transition-colors hover:text-primary lg:hidden"
                  >
                    <Calendar size={18} />
                  </button>
                </PopoverTrigger>
              </div>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="space-y-3 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Rango de fechas</p>
                      <p className="text-xs text-muted-foreground">{dateRangeLabel}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      onClick={() => {
                        updateDateRange(undefined)
                        setIsDatePopoverOpen(false)
                      }}
                    >
                      Quitar
                    </Button>
                  </div>
                  <div className="grid gap-2">
                    {quickPresets.map((preset) => (
                      <button
                        key={preset.key}
                        type="button"
                        onClick={() => handleQuickRange(preset.key)}
                        className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${
                          selectedPreset === preset.key
                            ? "border-primary/60 bg-primary/10 text-primary"
                            : "border-border/70 bg-card hover:border-primary/40 hover:bg-primary/5"
                        }`}
                      >
                        <div>
                          <p className="text-sm font-semibold">{preset.label}</p>
                          <p className="text-xs text-muted-foreground">{preset.description}</p>
                        </div>
                        {selectedPreset === preset.key && (
                          <span className="rounded-full bg-primary px-2 py-1 text-[10px] font-semibold text-primary-foreground">
                            Activo
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Popover open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label="Ver notificaciones"
                  className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-card text-muted-foreground transition-colors hover:text-primary"
                >
                  <Bell size={18} />
                  {pendingCount > 0 && (
                    <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-white">
                      {pendingCount > 9 ? "9+" : pendingCount}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 space-y-3 p-4" align="end">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Alertas pendientes</p>
                    <p className="text-xs text-muted-foreground">
                      Consulta rapido las gestiones que aun requieren accion.
                    </p>
                  </div>
                  {pendingCount > 0 && <Badge variant="secondary">{pendingCount}</Badge>}
                </div>
                <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
                  {pendingCount === 0 ? (
                    <p className="text-sm text-muted-foreground">No hay consultas pendientes por responder.</p>
                  ) : (
                    safeNotifications.map((item) => (
                      <button
                        key={item.messageId}
                        type="button"
                        onClick={() => {
                          const keyword = item.threadId || item.messageId || item.from
                          updateSearch(keyword)
                          onNotificationSelect?.(item)
                          setIsNotificationsOpen(false)
                        }}
                        className="w-full rounded-xl border border-border/70 bg-card/40 px-3 py-3 text-left transition-colors hover:border-primary/60 hover:bg-primary/5"
                      >
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">{RESULTADO_LABELS[item.resultado]}</span>
                          <span>{formatDistanceToNow(new Date(item.fecha), { addSuffix: true, locale: es })}</span>
                        </div>
                        <p className="mt-1 text-sm font-semibold text-foreground">
                          {item.titulo || item.template_key || "Consulta sin titulo"}
                        </p>
                        <p
                          className="mt-1 text-xs text-muted-foreground"
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {item.motivo}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>

            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <DialogTrigger asChild>
                <button
                  type="button"
                  aria-label="Abrir configuracion"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-card text-muted-foreground transition-colors hover:text-primary"
                >
                  <Settings size={18} />
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Preferencias del dashboard</DialogTitle>
                  <DialogDescription>
                    Ajusta los filtros por defecto para mantener tus metricas enfocadas en lo importante.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="confidence-slider">Confianza minima</Label>
                      <span className="text-sm font-semibold text-foreground">{currentMinConfidence}%</span>
                    </div>
                    <Slider
                      id="confidence-slider"
                      value={[currentMinConfidence]}
                      min={0}
                      max={100}
                      step={5}
                      onValueChange={(value) => updateMinConfidence(value[0] ?? 0)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Se ocultaran las consultas con un nivel de confianza inferior al porcentaje seleccionado.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-foreground">Estados visibles</p>
                    <div className="grid gap-2">
                      {(Object.keys(RESULTADO_LABELS) as LogItem["resultado"][]).map((status) => {
                        const checked = currentResultados.includes(status)
                        return (
                          <label
                            key={status}
                            htmlFor={`status-${status}`}
                            className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-card px-3 py-2"
                          >
                            <div className="flex items-center gap-3">
                              <Checkbox
                                id={`status-${status}`}
                                checked={checked}
                                onCheckedChange={(checkedState) => updateResultados(status, checkedState === true)}
                              />
                              <span className="text-sm font-medium text-foreground">{RESULTADO_LABELS[status]}</span>
                            </div>
                            <Badge variant={checked ? "secondary" : "outline"}>{checked ? "Activo" : "Oculto"}</Badge>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="ghost" onClick={handleResetPreferences}>
                    Restablecer
                  </Button>
                  <DialogClose asChild>
                    <Button type="button" onClick={() => setIsSettingsOpen(false)}>
                      Aplicar
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {isRefreshing && (
              <span className="hidden items-center gap-2 text-xs text-muted-foreground lg:inline-flex">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                Actualizando
              </span>
            )}

            <div className="hidden items-center gap-3 border-l border-border/60 pl-4 lg:flex">
              <div className="leading-tight text-right">
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
              value={currentSearch}
              onChange={(event) => updateSearch(event.target.value)}
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
