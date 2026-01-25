'use client'
import * as React from 'react'
import { cn } from '@biochain/key-utils'

export interface StepIndicatorProps {
  steps: string[]
  currentStep: number
  className?: string
}

export function StepIndicator({ steps, currentStep, className }: StepIndicatorProps) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep
        const isCurrent = index === currentStep
        const isLast = index === steps.length - 1

        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  'flex size-8 items-center justify-center rounded-full text-sm font-medium transition-colors',
                  isCompleted && 'bg-primary text-primary-foreground',
                  isCurrent && 'bg-primary text-primary-foreground ring-primary/30 ring-4',
                  !isCompleted && !isCurrent && 'bg-muted text-muted-foreground',
                )}
              >
                {isCompleted ? (
                  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={cn(
                  'text-xs font-medium',
                  (isCompleted || isCurrent) && 'text-foreground',
                  !isCompleted && !isCurrent && 'text-muted-foreground',
                )}
              >
                {step}
              </span>
            </div>
            {!isLast && (
              <div
                className={cn(
                  'h-0.5 flex-1 mx-2 -mt-6',
                  isCompleted ? 'bg-primary' : 'bg-muted',
                )}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

export interface ProgressStepsProps {
  total: number
  current: number
  className?: string
}

export function ProgressSteps({ total, current, className }: ProgressStepsProps) {
  return (
    <div className={cn('flex gap-1.5', className)}>
      {Array.from({ length: total }, (_, i) => `step-${i + 1}`).map((stepKey, i) => (
        <div
          key={stepKey}
          className={cn(
            'h-1 flex-1 rounded-full transition-colors',
            i < current ? 'bg-primary' : 'bg-muted',
          )}
        />
      ))}
    </div>
  )
}

export namespace StepIndicator {
  export type Props = StepIndicatorProps
}

export namespace ProgressSteps {
  export type Props = ProgressStepsProps
}
