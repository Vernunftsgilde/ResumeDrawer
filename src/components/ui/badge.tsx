import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[12px] font-medium leading-5',
  {
    variants: {
      variant: {
        neutral: 'border-ink-200 bg-white text-ink-600',
        brand: 'border-brand-200 bg-brand-50 text-brand-700',
        solid: 'border-transparent bg-brand-600 text-white',
        warn: 'border-amber-200 bg-amber-50 text-amber-700',
        danger: 'border-red-200 bg-red-50 text-red-600',
        ok: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      },
    },
    defaultVariants: { variant: 'neutral' },
  },
)

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
