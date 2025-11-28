import { Skeleton } from "@/components/ui/skeleton"
import { Scale } from "lucide-react"

export function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">compareDKG</span>
          </div>
          <Skeleton className="h-9 w-36" />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* Summary Stats Skeleton */}
        <div className="mb-6 space-y-4">
          <Skeleton className="h-40 w-full rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-20 rounded-lg" />
            <Skeleton className="h-20 rounded-lg" />
            <Skeleton className="h-20 rounded-lg" />
          </div>
        </div>

        {/* Content Viewers Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Skeleton className="h-[450px] rounded-lg" />
          <Skeleton className="h-[450px] rounded-lg" />
        </div>

        {/* Results Skeleton */}
        <Skeleton className="h-96 rounded-lg" />
      </main>
    </div>
  )
}
