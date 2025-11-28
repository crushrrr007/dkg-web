import { ArrowRight } from "lucide-react"

export function ArchitectureDiagram() {
  return (
    <div className="relative overflow-x-auto">
      <div className="inline-flex items-center gap-4 min-w-max mx-auto p-8">
        {/* Gorkpedia */}
        <DiagramBox title="Gorkpedia" subtitle="Article Source" color="gorkpedia" />
        <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />

        {/* Comparison Engine */}
        <DiagramBox title="Grok AI Analysis" subtitle="Semantic Comparison" color="primary" large />
        <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />

        {/* Wikipedia */}
        <DiagramBox title="Wikipedia" subtitle="Reference Source" color="wikipedia" />
        <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />

        {/* Community Note */}
        <DiagramBox title="Community Note" subtitle="JSON-LD" color="success" />
        <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />

        {/* DKG */}
        <DiagramBox title="OriginTrail DKG" subtitle="Blockchain" color="note-icon" />
      </div>
    </div>
  )
}

function DiagramBox({
  title,
  subtitle,
  color,
  large,
}: {
  title: string
  subtitle: string
  color: string
  large?: boolean
}) {
  return (
    <div
      className={`flex-shrink-0 ${large ? "w-44" : "w-36"} ${large ? "h-32" : "h-28"} rounded-xl border-2 border-${color} bg-${color}/5 flex flex-col items-center justify-center p-4`}
    >
      <div className={`font-semibold text-${color} text-center mb-1 ${large ? "text-base" : "text-sm"}`}>{title}</div>
      <div className="text-xs text-muted-foreground text-center">{subtitle}</div>
    </div>
  )
}
