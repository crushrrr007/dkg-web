import type { ContentData } from "./analysis-schema"

const WIKIPEDIA_API_BASE = "https://en.wikipedia.org/w/api.php"

const HEADERS = {
  "User-Agent": "CompareDKG/1.0 (https://v0.dev; contact@example.com) fetch/1.0",
  Accept: "application/json",
}

async function fetchWithRetry(url: string, maxRetries = 3): Promise<Response> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, { headers: HEADERS })

      if (response.status === 429) {
        const waitTime = Math.pow(2, attempt) * 1000
        console.log(`[v0] Rate limited, waiting ${waitTime}ms before retry ${attempt + 1}`)
        await new Promise((resolve) => setTimeout(resolve, waitTime))
        continue
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return response
    } catch (error) {
      lastError = error as Error
      if (attempt < maxRetries - 1) {
        const waitTime = Math.pow(2, attempt) * 500
        await new Promise((resolve) => setTimeout(resolve, waitTime))
      }
    }
  }

  throw lastError || new Error("Failed after retries")
}

export async function fetchWikipediaByTopic(topic: string): Promise<ContentData | null> {
  try {
    // First, search for the topic
    const searchParams = new URLSearchParams({
      action: "query",
      list: "search",
      srsearch: topic,
      format: "json",
      origin: "*",
    })

    const searchResponse = await fetchWithRetry(`${WIKIPEDIA_API_BASE}?${searchParams}`)
    const searchData = await searchResponse.json()

    if (!searchData.query?.search?.length) {
      return null
    }

    const pageTitle = searchData.query.search[0].title
    return fetchWikipediaByTitle(pageTitle)
  } catch (error) {
    console.error("Wikipedia search error:", error)
    return null
  }
}

export async function fetchWikipediaByTitle(title: string): Promise<ContentData | null> {
  try {
    // First get the full plain text extract with a much higher limit
    const extractParams = new URLSearchParams({
      action: "query",
      titles: title,
      prop: "extracts",
      explaintext: "true",
      exsectionformat: "plain",
      format: "json",
      origin: "*",
    })

    const extractResponse = await fetchWithRetry(`${WIKIPEDIA_API_BASE}?${extractParams}`)
    const extractData = await extractResponse.json()

    const pages = extractData.query?.pages
    if (!pages) return null

    const pageId = Object.keys(pages)[0]
    if (pageId === "-1") return null

    const page = pages[pageId]
    let fullContent = page.extract || ""

    console.log(`[v0] Wikipedia extract length: ${fullContent.length} characters`)

    if (fullContent.length < 5000) {
      console.log(`[v0] Content too short, fetching via parse API...`)

      const parseParams = new URLSearchParams({
        action: "parse",
        page: title,
        prop: "text",
        format: "json",
        origin: "*",
      })

      try {
        const parseResponse = await fetchWithRetry(`${WIKIPEDIA_API_BASE}?${parseParams}`)
        const parseData = await parseResponse.json()

        if (parseData.parse?.text?.["*"]) {
          // Strip HTML tags to get plain text
          const htmlContent = parseData.parse.text["*"]
          const plainText = htmlContent
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
            .replace(/<[^>]+>/g, " ")
            .replace(/&nbsp;/g, " ")
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'")
            .replace(/\[\d+\]/g, "") // Remove reference numbers like [1], [2]
            .replace(/\s+/g, " ")
            .trim()

          if (plainText.length > fullContent.length) {
            fullContent = plainText
            console.log(`[v0] Parse API content length: ${fullContent.length} characters`)
          }
        }
      } catch (parseError) {
        console.log(`[v0] Parse API fallback failed, using extract content`)
      }
    }

    const sectionsParams = new URLSearchParams({
      action: "parse",
      page: title,
      prop: "sections",
      format: "json",
      origin: "*",
    })

    let sections: Array<{ title: string; content: string }> = []

    try {
      const sectionsResponse = await fetchWithRetry(`${WIKIPEDIA_API_BASE}?${sectionsParams}`)
      const sectionsData = await sectionsResponse.json()

      if (sectionsData.parse?.sections) {
        sections = sectionsData.parse.sections
          .filter((s: any) => s.toclevel <= 2) // Only top-level sections
          .map((s: any) => ({
            title: s.line,
            content: "", // Content is in the main extract
          }))
      }
    } catch (sectionsError) {
      console.log(`[v0] Sections fetch failed, continuing without sections`)
    }

    const maxLength = 50000 // Allow up to 50k characters
    if (fullContent.length > maxLength) {
      fullContent = fullContent.substring(0, maxLength) + "..."
      console.log(`[v0] Content truncated to ${maxLength} characters`)
    }

    console.log(`[v0] Final Wikipedia content length: ${fullContent.length} characters`)

    return {
      title: page.title,
      content: fullContent,
      sections,
      url: `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
      fetchedAt: new Date().toISOString(),
    }
  } catch (error) {
    console.error("Wikipedia fetch error:", error)
    return null
  }
}

export async function fetchWikipediaByUrl(url: string): Promise<ContentData | null> {
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split("/wiki/")
    if (pathParts.length < 2) return null

    const title = decodeURIComponent(pathParts[1])
    return fetchWikipediaByTitle(title)
  } catch (error) {
    console.error("Wikipedia URL parse error:", error)
    return null
  }
}
