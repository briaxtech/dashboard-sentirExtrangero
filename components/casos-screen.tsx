"use client"

import { LayoutWrapper } from "./layout-wrapper"
import type { Screen } from "@/app/page"

interface CasosScreenProps {
  onNavigate: (screen: Screen) => void
}

export function CasosScreen({ onNavigate }: CasosScreenProps) {
  return (
    <LayoutWrapper activeScreen="casos" onNavigate={onNavigate}>
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Casos</h1>
          <p className="text-gray-600 mb-8">Gestiona los casos de inmigración de tus clientes</p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="text-sm text-gray-600 mb-1">Casos activos</div>
              <div className="text-3xl font-bold text-gray-900">34</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="text-sm text-gray-600 mb-1">En revisión</div>
              <div className="text-3xl font-bold text-[#25D4CE]">8</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="text-sm text-gray-600 mb-1">Aprobados</div>
              <div className="text-3xl font-bold text-green-600">12</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="text-sm text-gray-600 mb-1">Pendientes</div>
              <div className="text-3xl font-bold text-orange-600">6</div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Casos recientes</h2>
            <div className="space-y-3">
              {[
                {
                  id: "CASO-2024-045",
                  cliente: "Roberto Jiménez",
                  tipo: "Visa de trabajo H-1B",
                  fecha: "15 Ene 2024",
                  estado: "En revisión",
                },
                {
                  id: "CASO-2024-044",
                  cliente: "Carmen López",
                  tipo: "Residencia permanente",
                  fecha: "12 Ene 2024",
                  estado: "Aprobado",
                },
                {
                  id: "CASO-2024-043",
                  cliente: "Diego Ramírez",
                  tipo: "Reunificación familiar",
                  fecha: "10 Ene 2024",
                  estado: "Pendiente",
                },
              ].map((caso) => (
                <div key={caso.id} className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{caso.id}</div>
                    <div className="text-sm text-gray-600">{caso.cliente}</div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-900">{caso.tipo}</div>
                    <div className="text-xs text-gray-500">{caso.fecha}</div>
                  </div>
                  <div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        caso.estado === "Aprobado"
                          ? "bg-green-100 text-green-700"
                          : caso.estado === "En revisión"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {caso.estado}
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
