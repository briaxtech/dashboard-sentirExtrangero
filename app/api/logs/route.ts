import { type NextRequest, NextResponse } from "next/server"
import type { LogItem } from "@/lib/types"
import { filterLogs } from "@/lib/utils-metrics"

export const dynamic = "force-dynamic"

const SAMPLE_LOGS: LogItem[] = [
  {
    fecha: "2025-02-12T09:15:00.000Z",
    messageId: "req-2025-02-12-01",
    threadId: "thr-2025-02-12-a",
    from: "familia@sentirextranjero.com",
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
    fecha: "2025-02-18T16:42:00.000Z",
    messageId: "req-2025-02-18-02",
    threadId: "thr-2025-02-12-a",
    from: "familia@sentirextranjero.com",
    template_key: "RESIDENCIA_FAMILIAR",
    motivo:
      "Se envian comprobantes de matrimonio y reserva de vuelos para complementar el expediente de residencia familiar.",
    titulo: "Documentacion adicional residencia familiar",
    confidence: 0.9,
    rationale: "La evidencia cubre los requisitos principales, solo resta validar empadronamiento.",
    pdf_url: null,
    resultado: "ENVIADO",
  },
  {
    fecha: "2025-03-05T11:12:00.000Z",
    messageId: "req-2025-03-05-01",
    threadId: "thr-2025-03-05-a",
    from: "consultas@sentirextranjero.com",
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
    fecha: "2025-03-22T08:05:00.000Z",
    messageId: "req-2025-03-22-01",
    threadId: "thr-2025-03-22-a",
    from: "contacto@sentirextranjero.com",
    template_key: "ARRAIGO_SOCIAL",
    motivo:
      "Persona con tres anos en Espana solicita orientacion para iniciar arraigo social con contrato a tiempo parcial.",
    titulo: "Consulta arraigo social contrato parcial",
    confidence: 0.7,
    rationale:
      "Aplica el flujo de arraigo social, pero se debe validar que el contrato cumpla con horas y salario minimo.",
    pdf_url: null,
    resultado: "ENVIADO",
  },
  {
    fecha: "2025-04-01T17:30:00.000Z",
    messageId: "req-2025-04-01-02",
    threadId: "thr-2025-03-05-a",
    from: "consultas@sentirextranjero.com",
    template_key: "NACIONALIDAD_RESIDENCIA",
    motivo:
      "Se envia resolucion de empadronamiento continuo y se solicita verificacion final antes de presentar la nacionalidad.",
    titulo: "Revision final nacionalidad por residencia",
    confidence: 0.88,
    rationale: "La documentacion ya cumple con el tiempo minimo y las partidas estan apostilladas.",
    pdf_url: null,
    resultado: "ENVIADO",
  },
  {
    fecha: "2025-04-15T10:25:00.000Z",
    messageId: "req-2025-04-15-01",
    threadId: "thr-2025-04-15-a",
    from: "info@sentirextranjero.com",
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
  {
    fecha: "2025-05-03T13:18:00.000Z",
    messageId: "req-2025-05-03-01",
    threadId: "thr-2025-05-03-a",
    from: "empresas@sentirextranjero.com",
    template_key: "PERMISO_TRABAJO",
    motivo:
      "Empresa tecnologica solicita listado de requisitos para contratar a ingeniero argentino recien graduado.",
    titulo: "Solicitud permiso de trabajo inicial",
    confidence: 0.74,
    rationale:
      "Aplica el flujo PERMISO_TRABAJO, falta confirmar titulacion homologada y contrato superior al salario minimo.",
    pdf_url: null,
    resultado: "PENDIENTE",
  },
  {
    fecha: "2025-05-20T15:52:00.000Z",
    messageId: "req-2025-05-20-01",
    threadId: "thr-2025-05-03-a",
    from: "empresas@sentirextranjero.com",
    template_key: "PERMISO_TRABAJO",
    motivo:
      "Se adjunta contrato actualizado con salario revisado y se pide confirmacion para enviar al cliente.",
    titulo: "Confirmacion contrato permiso trabajo",
    confidence: 0.86,
    rationale:
      "El contrato cumple con la jornada y salario exigidos. Solo falta confirmar la colegiacion del ingeniero.",
    pdf_url: null,
    resultado: "ENVIADO",
  },
  {
    fecha: "2025-06-11T09:45:00.000Z",
    messageId: "req-2025-06-11-01",
    threadId: "thr-2025-06-11-a",
    from: "apoyo@sentirextranjero.com",
    template_key: "RENOVACION_TARJETA",
    motivo:
      "Cliente con tarjeta comunitaria a punto de vencer solicita recordar documentacion y tiempos para renovacion.",
    titulo: "Recordatorio renovacion tarjeta comunitaria",
    confidence: 0.67,
    rationale:
      "Encaja con RENOVACION_TARJETA. Se debe pedir certificado de convivencia actualizado y medios economicos.",
    pdf_url: null,
    resultado: "PENDIENTE",
  },
  {
    fecha: "2025-07-04T18:10:00.000Z",
    messageId: "req-2025-07-04-01",
    threadId: "thr-2025-07-04-a",
    from: "consultas@sentirextranjero.com",
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
    fecha: "2025-08-16T12:00:00.000Z",
    messageId: "req-2025-08-16-01",
    threadId: "thr-2025-08-16-a",
    from: "emprendedores@sentirextranjero.com",
    template_key: "EMPRENDEDOR_LEY",
    motivo:
      "Emprendedor venezolano solicita guia para aplicar a residencia por actividad emprendedora con plan de negocio en fintech.",
    titulo: "Residencia emprendedor fintech",
    confidence: 0.73,
    rationale:
      "El plan se ajusta a la categoria EMPRENDEDOR_LEY, pero falta validar certificacion ENISA y proyecciones financieras.",
    pdf_url: null,
    resultado: "PENDIENTE",
  },
  {
    fecha: "2025-09-22T07:40:00.000Z",
    messageId: "req-2025-09-22-01",
    threadId: "thr-2025-09-22-a",
    from: "apoyo@sentirextranjero.com",
    template_key: "ASILO",
    motivo:
      "Familia que ya registro solicitud de proteccion internacional consulta pasos para renovar la tarjeta roja.",
    titulo: "Renovacion tarjeta roja asilo",
    confidence: 0.82,
    rationale:
      "La solicitud ya esta en tramite, corresponde responder con guia de renovacion y plazos en comisaria.",
    pdf_url: null,
    resultado: "ENVIADO",
  },
  {
    fecha: "2025-10-28T11:05:00.000Z",
    messageId: "req-2025-10-28-01",
    threadId: "thr-2025-10-28-a",
    from: "seguimiento@sentirextranjero.com",
    template_key: "RESIDENCIA_FAMILIAR",
    motivo:
      "Se confirma cita en extranjeria para familiar de ciudadano y se pide verificar la carta de invitacion final.",
    titulo: "Verificacion carta invitacion extranjeria",
    confidence: 0.93,
    rationale:
      "La respuesta final esta lista para enviarse. Se recomienda adjuntar comprobante de alojamiento y seguro medico.",
    pdf_url: null,
    resultado: "ENVIADO",
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
