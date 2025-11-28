import { type NextRequest, NextResponse } from "next/server"
import { fetchFromDKG } from "@/lib/dkg-client"

export async function GET(request: NextRequest, { params }: { params: { ual: string } }) {
  try {
    const ual = params.ual

    console.log("[v0] Fetching Community Note by UAL:", ual)

    const communityNote = await fetchFromDKG(ual)

    if (!communityNote) {
      return NextResponse.json({ error: "Community Note not found" }, { status: 404 })
    }

    return NextResponse.json({ communityNote })
  } catch (error) {
    console.error("[v0] Fetch Community Note error:", error)
    return NextResponse.json({ error: "Failed to fetch Community Note" }, { status: 500 })
  }
}
