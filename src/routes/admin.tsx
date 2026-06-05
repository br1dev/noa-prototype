import { useEffect } from "react"
import { IconLayoutDashboard } from "@tabler/icons-react"

import { AppShell } from "@/components/layout/app-shell"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function AdminPage() {
  useEffect(() => {
    document.title = "Panel de control · Distribuidora NOA"
  }, [])

  return (
    <AppShell>
      <Card className="w-full max-w-xl">
        <CardHeader>
          <div className="flex items-center gap-2 text-muted-foreground">
            <IconLayoutDashboard className="size-4" aria-hidden />
            <span className="text-xs tracking-wider uppercase">
              Panel de control
            </span>
          </div>
          <CardTitle className="text-2xl">
            Bienvenido al panel de administración
          </CardTitle>
          <CardDescription>
            Desde acá vas a gestionar clientes, pedidos, precios y el resto de
            las operaciones de la distribuidora.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Contenido disponible próximamente. Estamos armando el dashboard con
            métricas, listado de clientes y gestión de pedidos.
          </p>
        </CardContent>
      </Card>
    </AppShell>
  )
}
