"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Loader2 } from "lucide-react"

export function DemoWidget() {
  const router = useRouter()
  const [topic, setTopic] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic.trim()) return

    setIsLoading(true)
    const params = new URLSearchParams({
      topic: topic.trim(),
      depth: "quick",
    })
    router.push(`/compare?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex gap-3 p-2 bg-card border border-border rounded-xl shadow-sm">
        <Input
          type="text"
          placeholder="Enter a topic, e.g. Climate Change, Moon Landing..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="flex-1 h-12 border-0 bg-transparent text-base focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        <Button type="submit" disabled={isLoading || !topic.trim()} size="lg" className="px-8 h-12">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Comparing...
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Compare Now
            </>
          )}
        </Button>
      </div>
      <p className="mt-3 text-sm text-muted-foreground text-center">
        Enter any topic to compare Gorkpedia against Wikipedia
      </p>
    </form>
  )
}
