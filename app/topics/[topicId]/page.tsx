import { Suspense } from "react"
import { TopicDetailView } from "@/components/topic-detail-view"
import { LoadingSkeleton } from "@/components/loading-skeleton"

export default async function TopicDetailPage({ 
  params 
}: { 
  params: Promise<{ topicId: string }> | { topicId: string } 
}) {
  const resolvedParams = params instanceof Promise ? await params : params
  const topicId = decodeURIComponent(resolvedParams.topicId)
  
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <TopicDetailView topicId={topicId} />
    </Suspense>
  )
}
