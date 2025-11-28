import { NextResponse } from "next/server"
import { checkDKGHealth } from "@/lib/dkg-client"

export async function GET() {
  try {
    const dkgHealth = await checkDKGHealth()

    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        api: {
          status: "operational",
        },
        dkg: dkgHealth,
        "google-genai": {
          status: process.env.GOOGLE_GENAI_API_KEY ? "configured" : "not_configured",
        },
      },
    }

    return NextResponse.json(health)
  } catch (error) {
    console.error("[v0] Health check error:", error)
    return NextResponse.json(
      {
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
