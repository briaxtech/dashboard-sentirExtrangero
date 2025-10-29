"use client"

import { CheckCircle2 } from "lucide-react"
import { LayoutWrapper } from "./layout-wrapper"
import type { Screen } from "@/app/page"

const steps = [
  {
    id: 1,
    name: "Análisis inicial",
    description: "Configuración de parámetros y análisis de necesidades del estudio",
    completed: true,
  },
  {
    id: 2,
    name: "Creación agente IA",
    description: "Entrenamiento del agente con casos y documentación legal",
    completed: true,
  },
  {
    id: 3,
    name: "Integración email",
    description: "Conexión con sistema de correo electrónico",
    completed: false,
  },
  {
    id: 4,
    name: "Validación legal",
    description: "Revisión de cumplimiento normativo y protocolos",
    completed: false,
  },
  {
    id: 5,
    name: "Automatización activa",
    description: "Sistema listo para gestión automatizada de casos",
    completed: false,
  },
]

interface OnboardingScreenProps {
  onNavigate: (screen: Screen) => void
}

export function OnboardingScreen({ onNavigate }: OnboardingScreenProps) {
  return (
    <LayoutWrapper activeScreen="automatizacion" onNavigate={onNavigate}>
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-gray-200 p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3 text-balance">Proceso de Automatización</h1>
          <p className="text-gray-600 mb-12 text-pretty">
            Configura tu agente de IA para automatizar la gestión de casos de inmigración
          </p>

          {/* Steps */}
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex gap-4">
                {/* Icon and Line */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      step.completed ? "bg-[#25D4CE] text-white" : "border-2 border-gray-300 bg-white"
                    }`}
                  >
                    {step.completed && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-0.5 h-16 ${step.completed ? "bg-[#25D4CE]" : "bg-gray-200"}`} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{step.name}</h3>
                  <p className="text-sm text-gray-600 text-pretty">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </LayoutWrapper>
  )
}
