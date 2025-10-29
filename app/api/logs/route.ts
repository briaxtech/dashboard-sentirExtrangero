import { type NextRequest, NextResponse } from "next/server"
import type { LogItem } from "@/lib/types"
import { filterLogs } from "@/lib/utils-metrics"

export const dynamic = "force-dynamic"

// Sample data - in production, this would come from Google Sheets API
const SAMPLE_LOGS: LogItem[] = [
  {
    fecha: "2025-10-28T15:10:59.759Z",
    messageId: "19a2af24f82a35c5",
    threadId: "19a2af24f82a35c5",
    from: "inmobiliariamezzadri2019@gmail.com",
    template_key: "FAMILIARES_ESPAÑOLES",
    motivo:
      "Se consulta sobre la situación de la esposa marroquí de español tras matrimonio, para residencia/NIE. Pero no queda claro si buscan residir en España próximamente.",
    titulo: "PENDIENTE",
    confidence: 0.5,
    rationale:
      "La consulta abarca varios aspectos: visado de cónyuges, NIE y ventajas legales para la pareja marroquí de español. Hay duda entre plantillas.",
    pdf_url: null,
    resultado: "PENDIENTE",
  },
  {
    fecha: "2025-10-28T15:55:08.736Z",
    messageId: "19a2af24f82a35c5",
    threadId: "19a2af24f82a35c5",
    from: "inmobiliariamezzadri2019@gmail.com",
    template_key: "FAMILIARES_ESPAÑOLES",
    motivo:
      "La consulta es sobre la residencia legal de cónyuge extranjero (marroquí) de español, tras boda en Reino Unido y viviendo fuera de España.",
    titulo: "Solicitud de información",
    confidence: 0.92,
    rationale: "Descripción plenamente cubierta.",
    pdf_url: null,
    resultado: "ENVIADO",
  },
  {
    fecha: "2025-10-28T15:59:22.142Z",
    messageId: "19a2b8aca620f549",
    threadId: "19a2b8aca620f549",
    from: "inmobiliariamezzadri2019@gmail.com",
    template_key: "NACIONALIDAD_RESIDENCIA",
    motivo:
      "Trata nacionalidad por residencia, pero podría no aplicar a recién nacidos o si es por nacimiento ius soli.",
    titulo: "PENDIENTE",
    confidence: 0.45,
    rationale:
      "El caso es de un hijo nacido en España de padres brasileños sin empadronamiento suficiente, buscando nacionalidad.",
    pdf_url: null,
    resultado: "PENDIENTE",
  },
  {
    fecha: "2025-10-28T16:02:21.581Z",
    messageId: "19a2b8e05a572413",
    threadId: "19a2b8e05a572413",
    from: "inmobiliariamezzadri2019@gmail.com",
    template_key: "FAMILIARES_ESPAÑOLES",
    motivo:
      "Aplica si buscan residencia en España como cónyuge marroquí de español, pero no está aclarado si se mudarán a España.",
    titulo: "PENDIENTE",
    confidence: 0.5,
    rationale:
      "El cliente pregunta sobre la situación migratoria de su futura cónyuge marroquí tras casarse en Reino Unido.",
    pdf_url: null,
    resultado: "PENDIENTE",
  },
  {
    fecha: "2025-10-28T16:03:19.475Z",
    messageId: "19a2b8e7e2ce950b",
    threadId: "19a2b8e7e2ce950b",
    from: "inmobiliariamezzadri2019@gmail.com",
    template_key: "ASILO",
    motivo: "No se confirma si la persona YA está en trámite de asilo, solo muestra intención de residencia por asilo.",
    titulo: "Solicitud de información",
    confidence: 0.2,
    rationale: "La plantilla ASILO exige explícitamente estar en trámite.",
    pdf_url: null,
    resultado: "NO_RESPONDER",
  },
]

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    // Parse filters from query params
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

    // Apply filters
    if (Object.values(filters).some((v) => v)) {
      logs = filterLogs(logs, filters)
    }

    // Sort by date descending
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
