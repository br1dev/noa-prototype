import { useEffect } from "react"
import { IconLayoutDashboard } from "@tabler/icons-react"

import { PlaceholderPage } from "@/components/admin/placeholder-page"

export function AdminDashboardPage() {
  useEffect(() => {
    document.title = "Panel de control · Distribuidora NOA"
  }, [])

  return (
    <PlaceholderPage
      eyebrow="Panel de control"
      title="Bienvenido al panel de administración"
      description="Acá vas a poder gestionar pedidos, inventario, clientes, logística y reportes de la distribuidora."
      icon={<IconLayoutDashboard className="size-4" />}
    />
  )
}
