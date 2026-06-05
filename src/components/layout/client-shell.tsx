import type { ReactNode } from "react"

import { Navbar } from "@/components/layout/navbar"

type ClientShellProps = {
  children: ReactNode
}

export function ClientShell({ children }: ClientShellProps) {
  return (
    <div className="flex h-svh flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex min-h-0 flex-1 flex-col">{children}</main>
    </div>
  )
}
