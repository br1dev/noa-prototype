import type { ReactNode } from "react"
import { Outlet } from "react-router"

import { AdminSidebar } from "@/components/layout/admin-sidebar"

type AdminShellProps = {
  children?: ReactNode
}

export function AdminShell({ children }: AdminShellProps) {
  return (
    <div className="flex h-svh bg-background text-foreground">
      <AdminSidebar />
      <main className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        {children ?? <Outlet />}
      </main>
    </div>
  )
}
