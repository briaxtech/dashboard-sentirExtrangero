import { type NextRequest, NextResponse } from "next/server"
import type { LogItem } from "@/lib/types"
import { filterLogs } from "@/lib/utils-metrics"

export const dynamic = "force-dynamic"

const SAMPLE_LOGS: LogItem[] = [
  {
    fecha: "2025-10-28T15:10:59.759Z",
    messageId: "19a2af24f82a35c5",
    threadId: "19a2af24f82a35c5",
    from: "clientes@sentirextranjero.com",
    template_key: "RESIDENCIA_FAMILIAR",
    motivo:
      "Pareja casada en Reino Unido consulta requisitos para trasladarse a Espana con residencia por familiar de ciudadano.",
    titulo: "Residencia familiar en Espana",
    confidence: 0.78,
    rationale:
      "Coincide con el flujo de reagrupacion por conyuge. Falta confirmar documentacion adicional sobre el matrimonio.",
    pdf_url: null,
    resultado: "PENDIENTE",
  },
  {
    fecha: "2025-10-28T15:55:08.736Z",
    messageId: "19a2af24f82a36aa",
    threadId: "19a2af24f82a36aa",
    from: "consultas@sentirextranjero.com",
    template_key: "RESIDENCIA_FAMILIAR",
    motivo:
      "Equipo solicita checklist final para enviar respuesta a familiar de ciudadano español que reside fuera de la Union Europea.",
    titulo: "Checklist residencia familiar",
    confidence: 0.92,
    rationale: "Documentacion completa y alineada con la guia RESIDENCIA_FAMILIAR.",
    pdf_url: null,
    resultado: "ENVIADO",
  },
  {
    fecha: "2025-10-28T15:59:22.142Z",
    messageId: "19a2b8aca620f549",
    threadId: "19a2b8aca620f549",
    from: "contacto@sentirextranjero.com",
    template_key: "NACIONALIDAD_RESIDENCIA",
    motivo:
      "Familia consulta opciones de nacionalidad por residencia para hijo nacido en Espana con padres recien regularizados.",
    titulo: "Nacionalidad para hijo nacido en Espana",
    confidence: 0.61,
    rationale:
      "Coincide con NACIONALIDAD_RESIDENCIA pero requiere validar tiempo efectivo de residencia de los tutores.",
    pdf_url: null,
    resultado: "PENDIENTE",
  },
  {
    fecha: "2025-10-28T16:02:21.581Z",
    messageId: "19a2b8e05a572413",
    threadId: "19a2b8e05a572413",
    from: "info@sentirextranjero.com",
    template_key: "RESIDENCIA_REAGRUPACION",
    motivo:
      "Padres desean reagrupar a hija universitaria que reside en Espana y necesitan confirmar requisitos economicos.",
    titulo: "Reagrupacion de hija universitaria",
    confidence: 0.84,
    rationale:
      "Se ajusta al flujo de reagrupacion. Es necesario adjuntar acreditacion de medios economicos y matricula.",
    pdf_url: null,
    resultado: "ENVIADO",
  },
  {
    fecha: "2025-10-28T16:03:19.475Z",
    messageId: "19a2b8e7e2ce950b",
    threadId: "19a2b8e7e2ce950b",
    from: "apoyo@sentirextranjero.com",
    template_key: "ASILO",
    motivo:
      "Consultante evalua iniciar tramite de proteccion internacional pero aun no presento solicitud formal en comisaria.",
    titulo: "Consulta inicial sobre asilo",
    confidence: 0.32,
    rationale:
      "La plantilla ASILO requiere expediente iniciado. El asesoramiento debe limitarse a pasos preliminares.",
    pdf_url: null,
    resultado: "NO_RESPONDER",
  },
]

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    const filters = {
      startDate: searchParams.get("startDate"),
      endDate: searchParams.get("endDate"),
      resultado: searchParams.get("resultado")?.split(","),
      template_key: searchParams.get("template_key")?.split(","),
      minConfidence: searchParams.get("minConfidence")
        ? Number.parseFloat(searchParams.get("minConfidence")!)
        : undefined,
      searchText: searchParams.get("search"),
    }

    let logs = [...SAMPLE_LOGS]

    if (Object.values(filters).some((value) => value)) {
      logs = filterLogs(logs, filters)
    }

    logs.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())

    return NextResponse.json(logs, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    })
  } catch (error) {
    console.error("Error fetching logs:", error)
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 })
  }
}
