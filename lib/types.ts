export type LogItem = {
  fecha: string // ISO
  messageId: string
  threadId: string
  from: string
  template_key: string
  motivo: string
  titulo: string | null
  confidence: number // 0..1
  rationale: string
  pdf_url: string | null
  resultado: "ENVIADO" | "PENDIENTE" | "NO_RESPONDER"
}

export type FilterState = {
  startDate?: string
  endDate?: string
  resultado?: string[]
  template_key?: string[]
  minConfidence?: number
  searchText?: string
}

export type KPIMetrics = {
  totalProcessed: number
  enviados: number
  responseRate: number
  pendientes: number
  ambiguityRate: number
  noResponder: number
  rejectionRate: number
  avgConfidence: number
  avgConfidenceEnviados: number
}
