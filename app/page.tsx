"use client"

import { useState } from "react"
import { OnboardingScreen } from "@/components/onboarding-screen"
import { FacturacionScreen } from "@/components/facturacion-screen"
import { ConsultasScreen } from "@/components/consultas-screen"
import { CasosScreen } from "@/components/casos-screen"

export type Screen = "facturacion" | "consultas" | "casos" | "automatizacion"

export default function DashboardPage() {
  const [activeScreen, setActiveScreen] = useState<Screen>("automatizacion")

  return (
    <>
      {activeScreen === "facturacion" && <FacturacionScreen onNavigate={setActiveScreen} />}
      {activeScreen === "consultas" && <ConsultasScreen onNavigate={setActiveScreen} />}
      {activeScreen === "casos" && <CasosScreen onNavigate={setActiveScreen} />}
      {activeScreen === "automatizacion" && <OnboardingScreen onNavigate={setActiveScreen} />}
    </>
  )
}
