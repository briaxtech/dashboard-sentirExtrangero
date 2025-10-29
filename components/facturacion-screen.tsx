"use client"

import { LayoutWrapper } from "./layout-wrapper"
import type { Screen } from "@/app/page"

interface FacturacionScreenProps {
  onNavigate: (screen: Screen) => void
}

export function FacturacionScreen({ onNavigate }: FacturacionScreenProps) {
  return (
    <LayoutWrapper activeScreen="facturacion" onNavigate={onNavigate}>
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Facturación</h1>
          <p className="text-gray-600 mb-8">Gestiona las facturas y pagos de tus clientes</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="text-sm text-gray-600 mb-1">Facturas pendientes</div>
              <div className="text-3xl font-bold text-gray-900">12</div>
              <div className="text-sm text-[#25D4CE] mt-2">$24,500.00</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="text-sm text-gray-600 mb-1">Pagadas este mes</div>
              <div className="text-3xl font-bold text-gray-900">28</div>
              <div className="text-sm text-green-600 mt-2">$56,200.00</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="text-sm text-gray-600 mb-1">Vencidas</div>
              <div className="text-3xl font-bold text-gray-900">3</div>
              <div className="text-sm text-red-600 mt-2">$4,800.00</div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Facturas recientes</h2>
            <div className="space-y-3">
              {[
                { id: "FAC-2024-001", cliente: "María González", monto: "$2,500.00", estado: "Pagada" },
                { id: "FAC-2024-002", cliente: "Carlos Rodríguez", monto: "$3,200.00", estado: "Pendiente" },
                { id: "FAC-2024-003", cliente: "Ana Martínez", monto: "$1,800.00", estado: "Vencida" },
              ].map((factura) => (
                <div key={factura.id} className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{factura.id}</div>
                    <div className="text-sm text-gray-600">{factura.cliente}</div>
                  </div>
                  <div className="text-right mr-6">
                    <div className="font-semibold text-gray-900">{factura.monto}</div>
                  </div>
                  <div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        factura.estado === "Pagada"
                          ? "bg-green-100 text-green-700"
                          : factura.estado === "Pendiente"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {factura.estado}
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
