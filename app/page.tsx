import type React from "react"
import { DemoWidget } from "@/components/demo-widget"
import { ArchitectureDiagram } from "@/components/architecture-diagram"
import { Scale, AlertTriangle, BookOpen, Sparkles, FileCheck, Database, Shield } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-50 backdrop-blur-sm bg-card/95">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Scale className="h-5 w-5 text-primary" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-foreground">compareDKG</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
              How it works
            </Link>
            <Link href="/community-notes" className="text-muted-foreground hover:text-foreground transition-colors">
              Community Notes
            </Link>
            <Link href="/activity" className="text-muted-foreground hover:text-foreground transition-colors">
              Activity
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-4xl px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
          <Sparkles className="h-3.5 w-3.5" />
          Decentralized Knowledge Verification
        </div>

        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground leading-tight text-balance">
          Compare Grokipedia with Wikipedia
          <span className="block text-primary mt-2">Publish to OriginTrail DKG</span>
        </h1>

        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed text-pretty">
          A production-ready tool that analyzes Grokipedia articles against Wikipedia, detects hallucinations and bias,
          assigns trust scores, and publishes verifiable Community Notes to the decentralized knowledge graph.
        </p>

        {/* Demo Widget */}
        <div className="mt-12">
          <DemoWidget />
        </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto max-w-5xl px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <FeatureCard
            icon={<AlertTriangle className="h-5 w-5" />}
            iconBg="bg-critical/10"
            iconColor="text-critical"
            title="Hallucination Detection"
            description="Per-segment analysis identifies claims with no factual backing and highlights improbable facts."
          />
          <FeatureCard
            icon={<Scale className="h-5 w-5" />}
            iconBg="bg-primary/10"
            iconColor="text-primary"
            title="Trust Scores"
            description="Algorithmic trust scoring (0-100) with explainability showing weights and classifiers used."
          />
          <FeatureCard
            icon={<BookOpen className="h-5 w-5" />}
            iconBg="bg-success/10"
            iconColor="text-success"
            title="Segment Comparison"
            description="Side-by-side views with aligned/missing/conflict labels and semantic similarity scores."
          />
          <FeatureCard
            icon={<FileCheck className="h-5 w-5" />}
            iconBg="bg-note-icon/10"
            iconColor="text-note-icon"
            title="Community Notes"
            description="Publish JSON-LD Community Notes with evidence references and source offsets to DKG."
          />
          <FeatureCard
            icon={<Database className="h-5 w-5" />}
            iconBg="bg-chart-2/10"
            iconColor="text-chart-2"
            title="Verifiable UALs"
            description="Each published note gets a Universal Asset Locator for blockchain verification."
          />
          <FeatureCard
            icon={<Shield className="h-5 w-5" />}
            iconBg="bg-chart-3/10"
            iconColor="text-chart-3"
            title="OriginTrail DKG"
            description="Decentralized publishing to OriginTrail testnet with immutable audit trails."
          />
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-16 border-t border-border">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-3">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Our system combines AI-powered analysis with decentralized verification to ensure knowledge integrity.
          </p>
        </div>

        <ArchitectureDiagram />

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ProcessStep
            number="1"
            title="Fetch Content"
            description="Scrape the Grokipedia article from the provided URL and fetch the matching Wikipedia article via their free API."
          />
          <ProcessStep
            number="2"
            title="Analyze & Compare"
            description="Use Google AI to run semantic similarity, hallucination detection, and segment-level classification with explainability."
          />
          <ProcessStep
            number="3"
            title="Generate Note"
            description="Create a structured JSON-LD Community Note with trust score, evidence, and segment claims."
          />
          <ProcessStep
            number="4"
            title="Publish to DKG"
            description="Publish to OriginTrail testnet and receive a verifiable UAL for blockchain exploration."
          />
        </div>
      </section>

      {/* Tech Stack */}
      <section className="mx-auto max-w-5xl px-6 py-16 border-t border-border">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-foreground mb-3">Tech Stack</h2>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <TechBadge>Next.js 16</TechBadge>
          <TechBadge>Google GenAI (Analysis)</TechBadge>
          <TechBadge>OriginTrail DKG</TechBadge>
          <TechBadge>TypeScript</TechBadge>
          <TechBadge>Tailwind CSS</TechBadge>
          <TechBadge>SWR</TechBadge>
          <TechBadge>Google GenAI API</TechBadge>
          <TechBadge>Wikipedia API</TechBadge>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-16">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Scale className="h-5 w-5 text-primary" />
                <span className="font-semibold text-foreground">compareDKG</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A production-ready fact-checking tool with decentralized verification powered by OriginTrail DKG.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://github.com/crushrrr007/dkg-web"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    GitHub Repository
                  </a>
                </li>
                <li>
                  <a
                    href="https://origintrail.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    OriginTrail DKG
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Navigation</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/community-notes"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Community Notes
                  </Link>
                </li>
                <li>
                  <Link href="/activity" className="text-muted-foreground hover:text-foreground transition-colors">
                    Activity
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            Built with Next.js, Google AI, and OriginTrail • Open Source
          </div>
        </div>
      </footer>
    </main>
  )
}

function FeatureCard({
  icon,
  iconBg,
  iconColor,
  title,
  description,
}: {
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  title: string
  description: string
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-md">
      <div className={`inline-flex p-2.5 rounded-lg ${iconBg} ${iconColor} mb-4`}>{icon}</div>
      <h3 className="font-semibold text-card-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}

function ProcessStep({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="relative">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
          {number}
        </div>
        <div>
          <h3 className="font-semibold text-foreground mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  )
}

function TechBadge({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 py-2 rounded-lg border border-border bg-card text-sm font-medium text-foreground">
      {children}
    </div>
  )
}
