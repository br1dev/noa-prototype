import { NavLink, useNavigate } from "react-router"
import { IconBuildingWarehouse, IconLogout } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useAuthStore } from "@/store/auth"
import { useCartStore } from "@/store/cart"
import { cn } from "@/lib/utils"

type NavItem = {
  to: string
  label: string
}

const NAV_ITEMS: ReadonlyArray<NavItem> = [
  { to: "/catalogo", label: "Catálogo" },
  { to: "/pedidos", label: "Pedidos" },
]

export function Navbar() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const clearCart = useCartStore((s) => s.clear)
  const navigate = useNavigate()

  const handleLogout = () => {
    clearCart()
    logout()
    navigate("/login", { replace: true })
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card/95 px-6 py-3 backdrop-blur">
      <div className="flex items-center gap-6">
        <NavLink
          to="/pedidos"
          className="flex items-center gap-2 text-sm font-medium tracking-tight"
        >
          <IconBuildingWarehouse className="size-5 text-primary" aria-hidden />
          Distribuidora NOA
        </NavLink>
        <nav aria-label="Principal" className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/pedidos"}
              className={({ isActive }) =>
                cn(
                  "rounded-md px-3 py-1.5 text-sm transition-colors",
                  isActive
                    ? "bg-muted font-medium text-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
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
  )
}
