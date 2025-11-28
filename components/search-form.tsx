"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Link, Loader2, Zap, Microscope } from "lucide-react"

export function SearchForm() {
  const router = useRouter()
  const [topic, setTopic] = useState("")
  const [gorkpediaUrl, setGorkpediaUrl] = useState("")
  const [analysisDepth, setAnalysisDepth] = useState<"quick" | "comprehensive">("quick")
  const [isLoading, setIsLoading] = useState(false)

  const handleTopicCompare = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic.trim()) return

    setIsLoading(true)
    const params = new URLSearchParams({
      topic: topic.trim(),
      depth: analysisDepth,
    })
    router.push(`/compare?${params.toString()}`)
  }

  const handleUrlCompare = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!gorkpediaUrl.trim()) return

    setIsLoading(true)
    const params = new URLSearchParams({
      gorkpedia: gorkpediaUrl.trim(),
      depth: analysisDepth,
    })
    if (topic.trim()) {
      params.set("topic", topic.trim())
    }
    router.push(`/compare?${params.toString()}`)
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      <Tabs defaultValue="topic" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-muted p-1 rounded-lg">
          <TabsTrigger
            value="topic"
            className="flex items-center gap-2 rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm"
          >
            <Search className="h-4 w-4" />
            Search by Topic
          </TabsTrigger>
          <TabsTrigger
            value="url"
            className="flex items-center gap-2 rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm"
          >
            <Link className="h-4 w-4" />
            Enter URL
          </TabsTrigger>
        </TabsList>

        <TabsContent value="topic" className="mt-6">
          <form onSubmit={handleTopicCompare} className="space-y-6">
            {/* Instructions box */}
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
              <h3 className="font-medium text-sm text-foreground">How it works:</h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Enter any topic you want to verify</li>
                <li>We'll automatically fetch both Gorkpedia and Wikipedia articles</li>
                <li>Google AI compares them and detects hallucinations</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic-search" className="text-left block text-sm font-medium text-foreground">
                Topic Name <span className="text-critical">*</span>
              </Label>
              <Input
                id="topic-search"
                placeholder="e.g., Climate change, Moon landing, Albert Einstein..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
                className="h-11 bg-card border-border text-foreground placeholder:text-muted-foreground rounded-lg"
              />
              <p className="text-xs text-muted-foreground">
                Just enter a topic name - we'll find both articles automatically
              </p>
            </div>

            <div className="flex items-end gap-3">
              <DepthSelector value={analysisDepth} onChange={setAnalysisDepth} />
              <Button type="submit" className="h-11 px-6 rounded-lg font-medium" disabled={isLoading || !topic.trim()}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Starting Analysis...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Compare Topic
                  </>
                )}
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="url" className="mt-6">
          <form onSubmit={handleUrlCompare} className="space-y-6">
            {/* Instructions box */}
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
              <h3 className="font-medium text-sm text-foreground">How it works:</h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Enter a Gorkpedia article URL to analyze</li>
                <li>We'll automatically fetch the matching Wikipedia article</li>
                <li>Google AI compares both and detects hallucinations</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic" className="text-left block text-sm font-medium text-foreground">
                Topic <span className="text-muted-foreground font-normal">(optional, helps matching)</span>
              </Label>
              <Input
                id="topic"
                placeholder="e.g., Climate change, Moon landing..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="h-11 bg-card border-border text-foreground placeholder:text-muted-foreground rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gorkpedia-url" className="text-left block text-sm font-medium text-foreground">
                Gorkpedia Article URL <span className="text-critical">*</span>
              </Label>
              <Input
                id="gorkpedia-url"
                type="url"
                placeholder="https://gorkpedia.com/article/..."
                value={gorkpediaUrl}
                onChange={(e) => setGorkpediaUrl(e.target.value)}
                required
                className="h-11 bg-card border-border text-foreground placeholder:text-muted-foreground rounded-lg"
              />
              <p className="text-xs text-muted-foreground">
                We'll scrape this Gorkpedia article and compare it to Wikipedia
              </p>
            </div>

            <div className="flex items-end gap-3">
              <DepthSelector value={analysisDepth} onChange={setAnalysisDepth} />
              <Button
                type="submit"
                className="h-11 px-6 rounded-lg font-medium"
                disabled={isLoading || !gorkpediaUrl.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Starting Analysis...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Compare Articles
                  </>
                )}
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function DepthSelector({
  value,
  onChange,
}: {
  value: "quick" | "comprehensive"
  onChange: (v: "quick" | "comprehensive") => void
}) {
  return (
    <div className="flex-1 space-y-2">
      <Label className="text-left block text-sm font-medium text-foreground">Analysis</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-11 bg-card border-border rounded-lg">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="quick">
            <div className="flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-warning" />
              Quick scan
            </div>
          </SelectItem>
          <SelectItem value="comprehensive">
            <div className="flex items-center gap-2">
              <Microscope className="h-3.5 w-3.5 text-primary" />
              Deep analysis
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
