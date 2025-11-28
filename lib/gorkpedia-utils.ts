/**
 * Constructs a Grokipedia URL from a topic name
 * URL format: https://grokipedia.com/page/Climate_change (only first letter capitalized)
 */
export function constructGorkpediaUrl(topic: string): string {
  const words = topic.trim().split(/\s+/)
  const slug = words
    .map((word, index) => {
      if (index === 0) {
        // First word: capitalize first letter only
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      }
      // Other words: all lowercase
      return word.toLowerCase()
    })
    .join("_")

  console.log("[v0] Constructed Grokipedia URL for topic:", topic, "->", slug)

  return `https://grokipedia.com/page/${slug}`
}

/**
 * Fetches Grokipedia content by topic name
 */
export async function fetchGorkpediaByTopic(topic: string): Promise<any> {
  const url = constructGorkpediaUrl(topic)
  console.log("[v0] Fetching Grokipedia content from:", url)

  try {
    const response = await fetch(`/api/fetch-gorkpedia?url=${encodeURIComponent(url)}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch Grokipedia content: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error("[v0] Error fetching Grokipedia by topic:", error)
    throw error
  }
}
