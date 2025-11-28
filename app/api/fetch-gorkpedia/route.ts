import { type NextRequest, NextResponse } from "next/server"
import { scrapeGorkpedia } from "@/lib/scraper"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const url = searchParams.get("url")

  console.log("[v0] Gorkpedia API called with URL:", url)

  if (!url) {
    return NextResponse.json({ error: "URL parameter is required" }, { status: 400 })
  }

  try {
    const content = await scrapeGorkpedia(url)

    if (!content) {
      console.log("[v0] Gorkpedia content is null")
      return NextResponse.json({ error: "Could not fetch Gorkpedia content" }, { status: 404 })
    }

    console.log("[v0] Gorkpedia fetch successful:")
    console.log("[v0] - Title:", content.title)
    console.log("[v0] - Content length:", content.content?.length || 0, "characters")
    console.log("[v0] - Sections:", content.sections?.length || 0)

    return NextResponse.json(content)
  } catch (error) {
    console.error("[v0] Gorkpedia API error:", error)
    return NextResponse.json({ error: "Failed to fetch Gorkpedia content" }, { status: 500 })
  }
}
