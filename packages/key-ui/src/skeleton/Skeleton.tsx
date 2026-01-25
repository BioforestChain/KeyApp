'use client'
import { cn } from '@biochain/key-utils'

export interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('bg-muted/50 animate-pulse rounded-md', className)} />
}

export interface SkeletonTextProps {
  lines?: number
  className?: string
}

export function SkeletonText({ lines = 3, className }: SkeletonTextProps) {
  const lineKeys = Array.from({ length: lines }, (_, i) => `line-${i + 1}`)
  return (
    <div className={cn('space-y-2', className)}>
      {lineKeys.map((key, i) => (
        <Skeleton key={key} className={cn('h-4', i === lines - 1 ? 'w-3/4' : 'w-full')} />
      ))}
    </div>
  )
}

export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={cn('border-border space-y-3 rounded-xl border p-4', className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="aspect-square w-10 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <Skeleton className="h-6 w-20" />
    </div>
  )
}

export function SkeletonList({ count = 3, className }: { count?: number; className?: string }) {
  const itemKeys = Array.from({ length: count }, (_, i) => `item-${i + 1}`)
  return (
    <div className={cn('space-y-3', className)}>
      {itemKeys.map((key) => (
        <div key={key} className="flex items-center gap-3 p-3">
          <Skeleton className="aspect-square w-10 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  )
}

export namespace Skeleton {
  export type Props = SkeletonProps
}

export namespace SkeletonText {
  export type Props = SkeletonTextProps
}
