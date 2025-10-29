import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, context } = body

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Get webhook URL from environment
    const webhookUrl = process.env.N8N_WEBHOOK_URL
    if (!webhookUrl) {
      return NextResponse.json({ error: "Webhook not configured" }, { status: 500 })
    }

    // Forward to n8n webhook
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        context,
        timestamp: new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      throw new Error(`Webhook returned ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json({
      reply: data.reply || data.message || "Response received",
      meta: data.meta,
    })
  } catch (error) {
    console.error("Error in assist endpoint:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
