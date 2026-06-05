import type { ReactNode } from "react"
import { Link, useNavigate } from "react-router"
import { IconBuildingWarehouse, IconLogout } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useAuthStore } from "@/store/auth"

type AppShellProps = {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login", { replace: true })
  }

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <header className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
        <Link
          to="/"
          className="flex items-center gap-2 text-sm font-medium tracking-tight"
        >
          <IconBuildingWarehouse className="size-5 text-primary" aria-hidden />
          Distribuidora NOA
          <span className="ml-2 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
            {user?.role === "admin" ? "Admin" : "Cliente"}
          </span>
        </Link>
        <div className="flex items-center gap-3">
          {user ? (
            <span className="text-sm text-muted-foreground">{user.name}</span>
          ) : null}
          <Separator orientation="vertical" className="h-5" />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            aria-label="Cerrar sesión"
          >
            <IconLogout data-icon="inline-start" />
            Salir
          </Button>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center p-6">
        {children}
      </main>
    </div>
  )
}
