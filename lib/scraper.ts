import type { ContentData } from "./analysis-schema"

export async function scrapeGorkpedia(url: string): Promise<ContentData | null> {
  try {
    console.log("[v0] Fetching Grokipedia URL:", url)

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
    })

    console.log("[v0] Grokipedia response status:", response.status)

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`)
    }

    const html = await response.text()
    console.log("[v0] Grokipedia HTML length:", html.length, "characters")

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    let title = titleMatch ? titleMatch[1].trim() : "Unknown Title"
    title = title
      .replace(/ - .*$/, "")
      .replace(/ \| .*$/, "")
      .trim()
    console.log("[v0] Grokipedia title:", title)

    let content = ""
    const extractedSections: { heading: string; content: string }[] = []

    // Strategy 1: Look for specific Grokipedia content containers
    const contentSelectors = [
      /<div[^>]*class="[^"]*article-content[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
      /<div[^>]*class="[^"]*page-content[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
      /<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
      /<div[^>]*class="[^"]*wiki-content[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
      /<div[^>]*class="[^"]*entry-content[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
      /<div[^>]*class="[^"]*post-content[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
      /<div[^>]*class="[^"]*main-content[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
      /<div[^>]*id="content"[^>]*>([\s\S]*?)<\/div>/gi,
      /<div[^>]*id="main-content"[^>]*>([\s\S]*?)<\/div>/gi,
    ]

    for (const selector of contentSelectors) {
      const matches = html.matchAll(selector)
      for (const match of matches) {
        const extracted = stripHtml(match[1])
        if (extracted.length > content.length) {
          content = extracted
          console.log("[v0] Found content via selector, length:", extracted.length)
        }
      }
    }

    // Strategy 2: Try article tag
    if (content.length < 1000) {
      const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i)
      if (articleMatch) {
        const extracted = stripHtml(articleMatch[1])
        if (extracted.length > content.length) {
          content = extracted
          console.log("[v0] Found content via article tag, length:", extracted.length)
        }
      }
    }

    // Strategy 3: Try main tag
    if (content.length < 1000) {
      const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)
      if (mainMatch) {
        const extracted = stripHtml(mainMatch[1])
        if (extracted.length > content.length) {
          content = extracted
          console.log("[v0] Found content via main tag, length:", extracted.length)
        }
      }
    }

    // Strategy 4: Extract all paragraph content
    if (content.length < 1000) {
      const paragraphs: string[] = []
      const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi
      let pMatch
      while ((pMatch = pRegex.exec(html)) !== null) {
        const pContent = stripHtml(pMatch[1])
        if (pContent.length > 50) {
          // Only include substantial paragraphs
          paragraphs.push(pContent)
        }
      }
      if (paragraphs.length > 0) {
        const combined = paragraphs.join("\n\n")
        if (combined.length > content.length) {
          content = combined
          console.log("[v0] Found content via paragraphs, count:", paragraphs.length, "length:", combined.length)
        }
      }
    }

    // Strategy 5: Last resort - extract body content
    if (content.length < 500) {
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
      if (bodyMatch) {
        const extracted = stripHtml(bodyMatch[1])
        if (extracted.length > content.length) {
          content = extracted
          console.log("[v0] Found content via body tag, length:", extracted.length)
        }
      }
    }

    const headingRegex = /<h([2-4])[^>]*>([\s\S]*?)<\/h\1>/gi
    let headingMatch
    const headings: { level: number; text: string; index: number }[] = []

    while ((headingMatch = headingRegex.exec(html)) !== null) {
      headings.push({
        level: Number.parseInt(headingMatch[1]),
        text: stripHtml(headingMatch[2]),
        index: headingMatch.index,
      })
    }

    // Extract content between headings
    for (let i = 0; i < headings.length; i++) {
      const currentHeading = headings[i]
      const nextHeading = headings[i + 1]

      const startIndex = currentHeading.index
      const endIndex = nextHeading ? nextHeading.index : html.length

      const sectionHtml = html.slice(startIndex, endIndex)
      const sectionContent = stripHtml(sectionHtml)

      if (sectionContent.length > 20) {
        extractedSections.push({
          heading: currentHeading.text,
          content: sectionContent.slice(0, 5000), // Limit section content
        })
      }
    }

    console.log("[v0] Extracted sections count:", extractedSections.length)
    console.log("[v0] Final Grokipedia content length:", content.length, "characters")

    const maxLength = 50000
    if (content.length > maxLength) {
      content = content.slice(0, maxLength)
      console.log("[v0] Grokipedia content truncated to", maxLength, "characters")
    }

    return {
      title,
      content,
      sections: extractedSections,
      url,
      fetchedAt: new Date().toISOString(),
    }
  } catch (error) {
    console.error("[v0] Grokipedia scraping error:", error)
    return null
  }
}

function stripHtml(html: string): string {
  return (
    html
      // Remove scripts and styles first
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, "")
      // Remove navigation and structural elements
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
      .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, "")
      .replace(/<form[^>]*>[\s\S]*?<\/form>/gi, "")
      // Remove comments
      .replace(/<!--[\s\S]*?-->/g, "")
      // Remove all remaining HTML tags
      .replace(/<[^>]+>/g, " ")
      // Decode HTML entities
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(Number.parseInt(num)))
      .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(Number.parseInt(hex, 16)))
      // Clean up whitespace
      .replace(/\s+/g, " ")
      .trim()
  )
}
