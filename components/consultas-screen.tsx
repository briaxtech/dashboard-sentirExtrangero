"use client"

import { LayoutWrapper } from "./layout-wrapper"
import type { Screen } from "@/app/page"

interface ConsultasScreenProps {
  onNavigate: (screen: Screen) => void
}

export function ConsultasScreen({ onNavigate }: ConsultasScreenProps) {
  return (
    <LayoutWrapper activeScreen="consultas" onNavigate={onNavigate}>
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Consultas</h1>
          <p className="text-gray-600 mb-8">Gestiona las consultas y comunicaciones con clientes</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="text-sm text-gray-600 mb-1">Consultas activas</div>
              <div className="text-3xl font-bold text-gray-900">18</div>
              <div className="text-sm text-[#25D4CE] mt-2">+3 esta semana</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="text-sm text-gray-600 mb-1">Pendientes de respuesta</div>
              <div className="text-3xl font-bold text-gray-900">5</div>
              <div className="text-sm text-orange-600 mt-2">Requieren atención</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="text-sm text-gray-600 mb-1">Resueltas este mes</div>
              <div className="text-3xl font-bold text-gray-900">42</div>
              <div className="text-sm text-green-600 mt-2">+12% vs mes anterior</div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Consultas recientes</h2>
            <div className="space-y-3">
              {[
                {
                  id: 1,
                  cliente: "Pedro Sánchez",
                  asunto: "Renovación de visa de trabajo",
                  fecha: "Hace 2 horas",
                  estado: "Pendiente",
                },
                {
                  id: 2,
                  cliente: "Laura Fernández",
                  asunto: "Consulta sobre residencia permanente",
                  fecha: "Hace 5 horas",
                  estado: "En proceso",
                },
                {
                  id: 3,
                  cliente: "Miguel Torres",
                  asunto: "Documentación para reunificación familiar",
                  fecha: "Ayer",
                  estado: "Resuelta",
                },
              ].map((consulta) => (
                <div key={consulta.id} className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{consulta.cliente}</div>
                    <div className="text-sm text-gray-600">{consulta.asunto}</div>
                  </div>
                  <div className="text-right mr-6">
                    <div className="text-sm text-gray-500">{consulta.fecha}</div>
                  </div>
                  <div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        consulta.estado === "Resuelta"
                          ? "bg-green-100 text-green-700"
                          : consulta.estado === "En proceso"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {consulta.estado}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  )
}
