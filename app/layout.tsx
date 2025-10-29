import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"

export const metadata: Metadata = {
  title: "Sentir Extranjero Dashboard",
  description: "Panel operativo para el seguimiento de consultas",
  generator: "v0.app",
  icons: {
    icon: "/sentir-favicon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-screen bg-background text-foreground antialiased font-sans">
        <div className="min-h-screen">{children}</div>
      </body>
    </html>
  )
}
