"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { BarChart3, Mail, Layout, Send, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "Metricas", icon: BarChart3 },
  { href: "/emails", label: "Emails", icon: Mail },
  { href: "/plantillas", label: "Plantillas", icon: Layout },
  { href: "/envios", label: "Envios", icon: Send },
  { href: "/chat", label: "Asistente IA", icon: MessageSquare },
]

type SidebarProps = {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity md:hidden",
          isOpen ? "opacity-100 pointer-events-auto" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar px-6 py-8 shadow-sm transition-transform",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0",
        )}
        aria-label="Menu principal"
      >
        <div className="mb-10 flex items-start justify-between">
          <Link href="/" className="flex items-center gap-2" onClick={onClose}>
            <Image src="/sentir-logo.svg" alt="Sentir Extranjero" width={160} height={40} priority />
          </Link>
        </div>
        <p className="text-xs leading-snug text-muted-foreground">
          Seguimiento centralizado de las consultas y el rendimiento operativo.
        </p>

        <nav className="mt-8 flex-1 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                onClick={onClose}
              >
                <motion.div
                  whileHover={{ x: 4 }}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                      : "text-sidebar-foreground hover:bg-sidebar-accent",
                  )}
                >
                  <Icon size={20} aria-hidden="true" />
                  <span>{item.label}</span>
                </motion.div>
              </Link>
            )
          })}
        </nav>

        <div className="mt-6 border-t border-sidebar-border pt-4">
          <p className="text-xs text-muted-foreground">(c) 2025 Sentir Extranjero</p>
        </div>
      </aside>
    </>
  )
}
