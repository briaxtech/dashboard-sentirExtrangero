import { type NextRequest, NextResponse } from "next/server"
import { filterLogs } from "@/lib/utils-metrics"
import { fetchLogsFromSheet } from "@/lib/server/googleSheets"

export const dynamic = "force-dynamic"

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

    let logs = await fetchLogsFromSheet()

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
