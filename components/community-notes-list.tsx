"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Scale, Search, Copy, ExternalLink, FileText, Calendar, TrendingUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CommunityNoteEntry {
  ual: string
  topic: string
  trustScore: number
  verdict: string
  timestamp: string
}

export function CommunityNotesList() {
  const [notes, setNotes] = useState<CommunityNoteEntry[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [minTrust, setMinTrust] = useState<string>("0")
  const [maxTrust, setMaxTrust] = useState<string>("100")
  const [verdictFilter, setVerdictFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "trust-high" | "trust-low">("newest")
  const { toast } = useToast()

  useEffect(() => {
    loadNotes()
  }, [])

  const loadNotes = () => {
    const history = JSON.parse(localStorage.getItem("activity-history") || "[]")
    setNotes(history)
  }

  const filteredNotes = useMemo(() => {
    let filtered = [...notes]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (note) => note.topic.toLowerCase().includes(query) || note.ual.toLowerCase().includes(query),
      )
    }

    // Trust score filter
    const minScore = Number.parseInt(minTrust) || 0
    const maxScore = Number.parseInt(maxTrust) || 100
    filtered = filtered.filter((note) => note.trustScore >= minScore && note.trustScore <= maxScore)

    // Verdict filter
    if (verdictFilter !== "all") {
      filtered = filtered.filter((note) => note.verdict === verdictFilter)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        case "oldest":
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        case "trust-high":
          return b.trustScore - a.trustScore
        case "trust-low":
          return a.trustScore - b.trustScore
        default:
          return 0
      }
    })

    return filtered
  }, [notes, searchQuery, minTrust, maxTrust, verdictFilter, sortBy])

  const copyUAL = (ual: string) => {
    navigator.clipboard.writeText(ual)
    toast({
      title: "Copied",
      description: "UAL copied to clipboard",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Community Notes</h1>
          <p className="text-muted-foreground">Browse and search published verification notes</p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Search */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label htmlFor="search" className="sr-only">
                    Search
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by topic or UAL..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="trust-high">Highest Trust</SelectItem>
                    <SelectItem value="trust-low">Lowest Trust</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="minTrust" className="text-sm mb-2 block">
                    Min Trust Score
                  </Label>
                  <Input
                    id="minTrust"
                    type="number"
                    min="0"
                    max="100"
                    value={minTrust}
                    onChange={(e) => setMinTrust(e.target.value)}
                    className="h-10"
                  />
                </div>
                <div>
                  <Label htmlFor="maxTrust" className="text-sm mb-2 block">
                    Max Trust Score
                  </Label>
                  <Input
                    id="maxTrust"
                    type="number"
                    min="0"
                    max="100"
                    value={maxTrust}
                    onChange={(e) => setMaxTrust(e.target.value)}
                    className="h-10"
                  />
                </div>
                <div>
                  <Label htmlFor="verdict" className="text-sm mb-2 block">
                    Verdict
                  </Label>
                  <Select value={verdictFilter} onValueChange={setVerdictFilter}>
                    <SelectTrigger id="verdict" className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Verdicts</SelectItem>
                      <SelectItem value="reliable">Reliable</SelectItem>
                      <SelectItem value="mostly_reliable">Mostly Reliable</SelectItem>
                      <SelectItem value="questionable">Questionable</SelectItem>
                      <SelectItem value="unreliable">Unreliable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-4 text-sm text-muted-foreground">
          Showing {filteredNotes.length} of {notes.length} notes
        </div>

        {/* Notes List */}
        {filteredNotes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Community Notes Found</h3>
              <p className="text-muted-foreground mb-6">
                {notes.length === 0
                  ? "Start by comparing content and publishing your first Community Note."
                  : "Try adjusting your search filters."}
              </p>
              {notes.length === 0 && (
                <Link href="/">
                  <Button>Start Comparison</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredNotes.map((note) => (
              <Card key={note.ual} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <Link href={`/topics/${encodeURIComponent(note.ual)}`}>
                          <h3 className="text-lg font-semibold text-foreground hover:text-primary transition-colors">
                            {note.topic}
                          </h3>
                        </Link>
                        <Badge variant={getVerdictVariant(note.verdict)}>{note.verdict.replace(/_/g, " ")}</Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(note.timestamp).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <TrendingUp className="h-3.5 w-3.5" />
                          Trust: {note.trustScore}/100
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono bg-muted px-2 py-1 rounded truncate max-w-md">
                          {note.ual}
                        </code>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button size="sm" variant="default" asChild>
                        <Link href={`/topics/${encodeURIComponent(note.ual)}`}>
                          <FileText className="h-3.5 w-3.5 mr-1" />
                          View Details
                        </Link>
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => copyUAL(note.ual)}>
                        <Copy className="h-3.5 w-3.5 mr-1" />
                        Copy UAL
                      </Button>
                      <Button size="sm" variant="outline" asChild>
                        <a
                          href={`https://dkg-testnet.origintrail.io/explore?ual=${encodeURIComponent(note.ual)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-3.5 w-3.5 mr-1" />
                          Explorer
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function Header() {
  return (
    <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
      <div className="mx-auto max-w-6xl px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Scale className="h-4 w-4 text-primary" />
          </div>
          <span className="font-semibold text-foreground">compareDKG</span>
        </Link>
        <nav className="flex items-center gap-3">
          <Link href="/activity">
            <Button variant="ghost" size="sm">
              Activity
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" size="sm" className="h-9 bg-transparent">
              New Comparison
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  )
}

function getVerdictVariant(verdict: string): "default" | "secondary" | "destructive" | "outline" {
  switch (verdict) {
    case "reliable":
      return "default"
    case "mostly_reliable":
      return "secondary"
    case "questionable":
      return "outline"
    case "unreliable":
      return "destructive"
    default:
      return "outline"
  }
}
