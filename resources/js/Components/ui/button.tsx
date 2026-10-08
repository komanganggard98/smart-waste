import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)] hover:bg-[color:var(--color-primary-hover)]",
        outline:
          "border-[color:var(--color-border)] bg-[color:var(--color-background)] hover:bg-[color:var(--color-muted)] hover:text-[color:var(--color-foreground)] aria-expanded:bg-[color:var(--color-muted)] aria-expanded:text-[color:var(--color-foreground)] dark:bg-white dark:hover:bg-[color:var(--color-muted)]/30",
        secondary:
          "bg-[color:var(--color-secondary)] text-[color:var(--color-secondary-foreground)] hover:bg-[color:var(--color-muted)] aria-expanded:bg-[color:var(--color-secondary)] aria-expanded:text-[color:var(--color-secondary-foreground)]",
        ghost:
          "hover:bg-[color:var(--color-muted)] hover:text-[color:var(--color-foreground)] aria-expanded:bg-[color:var(--color-muted)] aria-expanded:text-[color:var(--color-foreground)] dark:hover:bg-[color:var(--color-muted)]/50",
        destructive:
          "bg-[color-mix(in_srgb,var(--color-destructive)_05%,transparent)] text-[color:var(--color-destructive)] hover:bg-[color-mix(in_srgb,var(--color-destructive)_10%,transparent)] focus-visible:border-[color-mix(in_srgb,var(--color-destructive)_40%,transparent)] focus-visible:ring-[color-mix(in_srgb,var(--color-destructive)_20%,transparent)]",
        link: "text-[color:var(--color-primary)] underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-8 gap-1.5 px-3 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
        xs: "h-6 gap-1 px-2.5 text-xs has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 px-3 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        lg: "h-9 gap-1.5 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        icon: "size-8",
        "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef<
  React.ElementRef<typeof ButtonPrimitive>,
  React.ComponentPropsWithoutRef<typeof ButtonPrimitive> &
    VariantProps<typeof buttonVariants>
>(function Button({ className, variant = "default", size = "default", ...props }, ref) {
  return (
    <ButtonPrimitive
      ref={ref}
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
})

export { Button, buttonVariants }
