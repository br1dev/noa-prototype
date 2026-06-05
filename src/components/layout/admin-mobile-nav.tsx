import { useNavigate } from "react-router"
import {
  IconBox,
  IconChartBar,
  IconLogout,
  IconReceipt,
  IconRotate,
  IconTruckDelivery,
  IconUsers,
  type Icon,
} from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ResetDemoDataDialog } from "@/components/layout/reset-demo-data-dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useAuthStore } from "@/store/auth"
import { useCartStore } from "@/store/cart"
import { getInitials } from "@/lib/initials"
import { cn } from "@/lib/utils"
import { useState } from "react"

type NavItem = {
  to: string
  label: string
  icon: Icon
}

const NAV_ITEMS: ReadonlyArray<NavItem> = [
  { to: "/admin/pedidos", label: "Pedidos", icon: IconReceipt },
  { to: "/admin/inventario", label: "Inventario", icon: IconBox },
  { to: "/admin/clientes", label: "Clientes", icon: IconUsers },
  { to: "/admin/logistica", label: "Logística", icon: IconTruckDelivery },
  { to: "/admin/reportes", label: "Reportes", icon: IconChartBar },
]

type AdminMobileNavProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AdminMobileNav({ open, onOpenChange }: AdminMobileNavProps) {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const clearCart = useCartStore((s) => s.clear)
  const navigate = useNavigate()
  const [resetOpen, setResetOpen] = useState(false)

  const handleNavigate = (to: string) => {
    onOpenChange(false)
    navigate(to)
  }

  const handleLogout = () => {
    clearCart()
    logout()
    onOpenChange(false)
    navigate("/login", { replace: true })
  }

  const initials = user ? getInitials(user.name) : "?"

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="flex w-72 max-w-[85vw] flex-col gap-0 p-0"
        showCloseButton={false}
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Menú de administración</SheetTitle>
          <SheetDescription>
            Navegación del panel de control de Distribuidora NOA
          </SheetDescription>
        </SheetHeader>
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-sm font-medium tracking-tight">
              Distribuidora NOA
            </span>
            <span className="truncate text-xs text-muted-foreground">
              Panel de control
            </span>
          </span>
        </div>

        <nav
          aria-label="Administración"
          className="flex-1 overflow-y-auto p-3"
        >
          <ul className="flex flex-col gap-0.5">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <button
                  type="button"
                  onClick={() => handleNavigate(item.to)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors",
                    "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )}
                >
                  <item.icon
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                  <span className="truncate">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto flex flex-col gap-2 border-t border-border p-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setResetOpen(true)}
            aria-label="Resetear datos de demo"
            className="w-full justify-start gap-2 border-dashed text-muted-foreground hover:text-foreground"
          >
            <IconRotate data-icon="inline-start" className="size-3.5" />
            <span className="flex-1 text-left">Resetear datos de demo</span>
            <Badge variant="secondary" className="text-[10px]">
              Demo
            </Badge>
          </Button>
          <div className="flex items-center gap-3 rounded-md px-2 py-2">
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary"
              aria-hidden
            >
              {initials}
            </div>
            <span className="flex min-w-0 flex-1 flex-col leading-tight">
              <span className="truncate text-sm font-medium">
                {user?.name ?? "Sin sesión"}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {user?.email ?? ""}
              </span>
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleLogout}
            aria-label="Cerrar sesión"
            className="w-full"
          >
            <IconLogout data-icon="inline-start" />
            Salir
          </Button>
        </div>

        <ResetDemoDataDialog open={resetOpen} onOpenChange={setResetOpen} />
      </SheetContent>
    </Sheet>
  )
}
