import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type PlaceholderPageProps = {
  eyebrow: string
  title: string
  description: string
  icon?: ReactNode
  className?: string
}

export function PlaceholderPage({
  eyebrow,
  title,
  description,
  icon,
  className,
}: PlaceholderPageProps) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-5xl flex-col gap-6 p-8",
        className
      )}
    >
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          {icon ? (
            <span className="flex items-center" aria-hidden>
              {icon}
            </span>
          ) : null}
          <span className="text-xs tracking-wider uppercase">{eyebrow}</span>
        </div>
        <h1 className="text-2xl font-medium tracking-tight">{title}</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
      </header>

      <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border bg-card/30 px-6 py-16">
        <p className="text-center text-sm text-muted-foreground">
          Contenido disponible próximamente.
        </p>
      </div>
    </div>
  )
}
