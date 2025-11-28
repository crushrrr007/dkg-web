"use client"

import { Check, Loader2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export type PipelineStep = {
  id: string
  label: string
  status: "pending" | "loading" | "complete" | "error"
}

interface PipelineStepperProps {
  steps: PipelineStep[]
}

export function PipelineStepper({ steps }: PipelineStepperProps) {
  return (
    <div className="w-full py-8">
      <div className="flex items-center justify-between relative">
        {/* Progress bar background */}
        <div className="absolute left-0 right-0 top-5 h-0.5 bg-border" style={{ zIndex: 0 }} />

        {/* Active progress bar */}
        <div
          className="absolute left-0 top-5 h-0.5 bg-primary transition-all duration-500"
          style={{
            width: `${(steps.filter((s) => s.status === "complete").length / (steps.length - 1)) * 100}%`,
            zIndex: 1,
          }}
        />

        {/* Steps */}
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center relative" style={{ zIndex: 2 }}>
            {/* Step circle */}
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2",
                step.status === "complete" &&
                  "bg-primary border-primary text-primary-foreground shadow-md shadow-primary/20",
                step.status === "loading" && "bg-primary/10 border-primary text-primary animate-pulse",
                step.status === "error" && "bg-critical/10 border-critical text-critical",
                step.status === "pending" && "bg-card border-border text-muted-foreground",
              )}
            >
              {step.status === "complete" && <Check className="h-5 w-5" />}
              {step.status === "loading" && <Loader2 className="h-5 w-5 animate-spin" />}
              {step.status === "error" && <AlertCircle className="h-5 w-5" />}
              {step.status === "pending" && <span className="text-sm font-medium">{index + 1}</span>}
            </div>

            {/* Step label */}
            <span
              className={cn(
                "mt-2 text-xs font-medium text-center max-w-24 transition-colors",
                step.status === "complete" && "text-foreground",
                step.status === "loading" && "text-primary",
                step.status === "error" && "text-critical",
                step.status === "pending" && "text-muted-foreground",
              )}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
