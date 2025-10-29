"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { BarChart3, Mail, Layout, Send, MessageSquare } from "lucide-react"

const navItems = [
  { href: "/", label: "Métricas", icon: BarChart3 },
  { href: "/emails", label: "Emails", icon: Mail },
  { href: "/plantillas", label: "Plantillas", icon: Layout },
  { href: "/envios", label: "Envíos", icon: Send },
  { href: "/chat", label: "Asistente IA", icon: MessageSquare },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <motion.aside
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className="fixed left-0 top-0 h-screen w-64 border-r border-border/50 bg-sidebar p-6 flex flex-col z-50"
    >
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-accent">Legal Dashboard</h1>
        <p className="text-xs text-muted-foreground mt-1">Análisis de métricas operativas</p>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href} aria-current={isActive ? "page" : undefined}>
              <motion.div
                whileHover={{ x: 4 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/20"
                }`}
              >
                <Icon size={20} aria-hidden="true" />
                <span className="text-sm font-medium">{item.label}</span>
              </motion.div>
            </Link>
          )
        })}
      </nav>

      <div className="pt-4 border-t border-sidebar-border">
        <p className="text-xs text-muted-foreground">© 2025 Legal Dashboard</p>
      </div>
    </motion.aside>
  )
}
