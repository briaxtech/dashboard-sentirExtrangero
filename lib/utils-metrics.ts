import type { LogItem, KPIMetrics } from "./types"

export function groupByDate(items: LogItem[]): Record<string, LogItem[]> {
  return items.reduce(
    (acc, item) => {
      const date = item.fecha.split("T")[0]
      if (!acc[date]) acc[date] = []
      acc[date].push(item)
      return acc
    },
    {} as Record<string, LogItem[]>,
  )
}

export function countBy<T extends Record<string, any>>(items: T[], key: keyof T): Record<string, number> {
  return items.reduce(
    (acc, item) => {
      const k = String(item[key])
      acc[k] = (acc[k] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )
}

export function meanConfidence(items: LogItem[]): number {
  if (items.length === 0) return 0
  return items.reduce((sum, item) => sum + item.confidence, 0) / items.length
}

export function calculateKPIs(items: LogItem[]): KPIMetrics {
  const total = items.length
  const enviados = items.filter((i) => i.resultado === "ENVIADO").length
  const pendientes = items.filter((i) => i.resultado === "PENDIENTE").length
  const noResponder = items.filter((i) => i.resultado === "NO_RESPONDER").length

  return {
    totalProcessed: total,
    enviados,
    responseRate: total > 0 ? (enviados / total) * 100 : 0,
    pendientes,
    ambiguityRate: total > 0 ? (pendientes / total) * 100 : 0,
    noResponder,
    rejectionRate: total > 0 ? (noResponder / total) * 100 : 0,
    avgConfidence: meanConfidence(items),
    avgConfidenceEnviados: meanConfidence(items.filter((i) => i.resultado === "ENVIADO")),
  }
}

export function filterLogs(items: LogItem[], filters: any): LogItem[] {
  return items.filter((item) => {
    if (filters.startDate && item.fecha < filters.startDate) return false
    if (filters.endDate && item.fecha > filters.endDate) return false
    if (filters.resultado?.length && !filters.resultado.includes(item.resultado)) return false
    if (filters.template_key?.length && !filters.template_key.includes(item.template_key)) return false
    if (filters.minConfidence && item.confidence < filters.minConfidence) return false
    if (filters.searchText) {
      const text = filters.searchText.toLowerCase()
      return (
        item.from.toLowerCase().includes(text) ||
        item.threadId.toLowerCase().includes(text) ||
        item.messageId.toLowerCase().includes(text)
      )
    }
    return true
  })
}

export function exportToCsv(rows: LogItem[], filename: string) {
  const headers = ["fecha", "messageId", "threadId", "from", "template_key", "resultado", "confidence", "titulo"]
  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const val = row[h as keyof LogItem]
          return typeof val === "string" && val.includes(",") ? `"${val}"` : val
        })
        .join(","),
    ),
  ].join("\n")

  const blob = new Blob([csv], { type: "text/csv" })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
}
