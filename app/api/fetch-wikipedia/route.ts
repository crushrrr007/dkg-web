import { type NextRequest, NextResponse } from "next/server"
import { fetchWikipediaByTopic, fetchWikipediaByUrl } from "@/lib/wikipedia"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const topic = searchParams.get("topic")
  const url = searchParams.get("url")

  try {
    let content

    if (url) {
      content = await fetchWikipediaByUrl(url)
    } else if (topic) {
      content = await fetchWikipediaByTopic(topic)
    } else {
      return NextResponse.json({ error: "Either topic or url parameter is required" }, { status: 400 })
    }

    if (!content) {
      return NextResponse.json({ error: "Could not fetch Wikipedia content" }, { status: 404 })
    }

    return NextResponse.json(content)
  } catch (error) {
    console.error("Wikipedia API error:", error)
    return NextResponse.json({ error: "Failed to fetch Wikipedia content" }, { status: 500 })
  }
}
