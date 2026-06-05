import { useEffect } from "react"
import { IconShoppingCart } from "@tabler/icons-react"

import { AppShell } from "@/components/layout/app-shell"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function CatalogPage() {
  useEffect(() => {
    document.title = "Catálogo · Distribuidora NOA"
  }, [])

  return (
    <AppShell>
      <Card className="w-full max-w-xl">
        <CardHeader>
          <div className="flex items-center gap-2 text-muted-foreground">
            <IconShoppingCart className="size-4" aria-hidden />
            <span className="text-xs tracking-wider uppercase">Catálogo</span>
          </div>
          <CardTitle className="text-2xl">Bienvenido al catálogo</CardTitle>
          <CardDescription>
            Acá vas a poder explorar el catálogo mayorista, armar tu pedido y
            gestionar tu cuenta corriente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Contenido disponible próximamente. Estamos preparando el catálogo
            completo con precios, stock y condiciones comerciales.
          </p>
        </CardContent>
      </Card>
    </AppShell>
  )
}
