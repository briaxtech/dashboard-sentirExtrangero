import { google, sheets_v4 } from "googleapis"
import type { LogItem } from "@/lib/types"

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"]
let sheetsClient: sheets_v4.Sheets | null = null

function getEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing environment variable ${name}`)
  }
  return value
}

function getSheetsClient(): sheets_v4.Sheets {
  if (sheetsClient) {
    return sheetsClient
  }

  const clientEmail = getEnv("GOOGLE_CLIENT_EMAIL")
  const privateKey = getEnv("GOOGLE_PRIVATE_KEY").replace(/\\n/g, "\n")

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: SCOPES,
  })

  sheetsClient = google.sheets({ version: "v4", auth })
  return sheetsClient
}

function normalizeString(value: string | undefined | null): string | null {
  if (!value) return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function parseLogRow(row: string[]): LogItem | null {
  const [
    fecha,
    messageId,
    threadId,
    from,
    template_key,
    motivo,
    titulo,
    confidence,
    rationale,
    pdf_url,
    resultado,
  ] = row.map((value) => value ?? "")

  if (!fecha || !messageId) {
    return null
  }

  const confidenceNumber = confidence ? Number.parseFloat(confidence) : 0
  const normalizedResultado = resultado.toUpperCase()
  const allowedResultados: LogItem["resultado"][] = ["ENVIADO", "PENDIENTE", "NO_RESPONDER"]
  const resultadoValue = allowedResultados.includes(normalizedResultado as LogItem["resultado"])
    ? (normalizedResultado as LogItem["resultado"])
    : "PENDIENTE"

  return {
    fecha,
    messageId,
    threadId,
    from,
    template_key,
    motivo,
    titulo: normalizeString(titulo),
    confidence: Number.isFinite(confidenceNumber) ? confidenceNumber : 0,
    rationale: rationale || "",
    pdf_url: normalizeString(pdf_url),
    resultado: resultadoValue,
  }
}

export async function fetchLogsFromSheet(): Promise<LogItem[]> {
  const spreadsheetId = getEnv("GOOGLE_SHEETS_SPREADSHEET_ID")
  const range = getEnv("GOOGLE_SHEETS_RANGE")
  const sheets = getSheetsClient()

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  })

  const rows = response.data.values ?? []
  if (rows.length <= 1) {
    return []
  }

  const [, ...dataRows] = rows

  return dataRows
    .map((row) => parseLogRow(row))
    .filter((row): row is LogItem => row !== null)
}
