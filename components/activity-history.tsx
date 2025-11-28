"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Scale, Clock, CheckCircle2, AlertCircle, Copy, ExternalLink, Trash2, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ActivityEntry {
  ual: string
  topic: string
  trustScore: number
  verdict: string
  timestamp: string
  status: "confirmed" | "pending" | "failed"
}

export function ActivityHistory() {
  const [history, setHistory] = useState<ActivityEntry[]>([])
  const { toast } = useToast()

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = () => {
    const stored = JSON.parse(localStorage.getItem("activity-history") || "[]")
    setHistory(stored)
  }

  const clearHistory = () => {
    if (confirm("Are you sure you want to clear all activity history?")) {
      localStorage.removeItem("activity-history")
      setHistory([])
      toast({
        title: "History Cleared",
        description: "Activity history has been cleared",
      })
    }
  }

  const deleteEntry = (ual: string) => {
    const updated = history.filter((entry) => entry.ual !== ual)
    localStorage.setItem("activity-history", JSON.stringify(updated))
    setHistory(updated)
    toast({
      title: "Entry Deleted",
      description: "Activity entry has been removed",
    })
  }

  const copyUAL = (ual: string) => {
    navigator.clipboard.writeText(ual)
    toast({
      title: "Copied",
      description: "UAL copied to clipboard",
    })
  }

  const confirmedEntries = history.filter((e) => e.status === "confirmed")
  const pendingEntries = history.filter((e) => e.status === "pending")
  const failedEntries = history.filter((e) => e.status === "failed")

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Activity History</h1>
            <p className="text-muted-foreground">Track all published Community Notes and their status</p>
          </div>
          {history.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearHistory}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear History
            </Button>
          )}
        </div>

        {/* Stats */}
        {history.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              label="Total Published"
              value={history.length}
              icon={<Clock className="h-5 w-5 text-primary" />}
            />
            <StatCard
              label="Confirmed"
              value={confirmedEntries.length}
              icon={<CheckCircle2 className="h-5 w-5 text-success" />}
            />
            <StatCard
              label="Pending"
              value={pendingEntries.length}
              icon={<RefreshCw className="h-5 w-5 text-warning" />}
            />
            <StatCard
              label="Failed"
              value={failedEntries.length}
              icon={<AlertCircle className="h-5 w-5 text-critical" />}
            />
          </div>
        )}

        {/* Activity List */}
        {history.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Activity Yet</h3>
              <p className="text-muted-foreground mb-6">
                Start comparing content and publishing Community Notes to see your activity here.
              </p>
              <Link href="/">
                <Button>Start Comparison</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all">All ({history.length})</TabsTrigger>
              <TabsTrigger value="confirmed">Confirmed ({confirmedEntries.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({pendingEntries.length})</TabsTrigger>
              <TabsTrigger value="failed">Failed ({failedEntries.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <ActivityList entries={history} onCopy={copyUAL} onDelete={deleteEntry} />
            </TabsContent>
            <TabsContent value="confirmed" className="space-y-4">
              <ActivityList entries={confirmedEntries} onCopy={copyUAL} onDelete={deleteEntry} />
            </TabsContent>
            <TabsContent value="pending" className="space-y-4">
              <ActivityList entries={pendingEntries} onCopy={copyUAL} onDelete={deleteEntry} />
            </TabsContent>
            <TabsContent value="failed" className="space-y-4">
              <ActivityList entries={failedEntries} onCopy={copyUAL} onDelete={deleteEntry} />
            </TabsContent>
          </Tabs>
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
          <Link href="/community-notes">
            <Button variant="ghost" size="sm">
              Community Notes
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

function ActivityList({
  entries,
  onCopy,
  onDelete,
}: {
  entries: ActivityEntry[]
  onCopy: (ual: string) => void
  onDelete: (ual: string) => void
}) {
  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">No entries in this category</CardContent>
      </Card>
    )
  }

  return (
    <>
      {entries.map((entry) => (
        <Card key={entry.ual}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <Link href={`/topics/${encodeURIComponent(entry.ual)}`}>
                    <h3 className="text-lg font-semibold text-foreground hover:text-primary transition-colors">
                      {entry.topic}
                    </h3>
                  </Link>
                  <StatusBadge status={entry.status} />
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Trust Score: {entry.trustScore}/100</span>
                    <span className="capitalize">{entry.verdict.replace(/_/g, " ")}</span>
                    <span>{new Date(entry.timestamp).toLocaleString()}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono bg-muted px-2 py-1 rounded truncate max-w-2xl">{entry.ual}</code>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button size="sm" variant="outline" onClick={() => onCopy(entry.ual)}>
                  <Copy className="h-3.5 w-3.5 mr-1" />
                  Copy
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <a
                    href={`https://dkg-testnet.origintrail.io/explore?ual=${encodeURIComponent(entry.ual)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3.5 w-3.5 mr-1" />
                    DKG
                  </a>
                </Button>
                <Button size="sm" variant="ghost" onClick={() => onDelete(entry.ual)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  )
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">{icon}</div>
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "confirmed":
      return (
        <Badge variant="default" className="gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Confirmed
        </Badge>
      )
    case "pending":
      return (
        <Badge variant="secondary" className="gap-1">
          <RefreshCw className="h-3 w-3" />
          Pending
        </Badge>
      )
    case "failed":
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Failed
        </Badge>
      )
    default:
      return null
  }
}
