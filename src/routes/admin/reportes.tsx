import { useEffect } from "react"
import { IconChartBar } from "@tabler/icons-react"

import { PlaceholderPage } from "@/components/admin/placeholder-page"

export function AdminReportesPage() {
  useEffect(() => {
    document.title = "Reportes · Distribuidora NOA"
  }, [])

  return (
    <PlaceholderPage
      eyebrow="Reportes"
      title="Reportes y métricas"
      description="Ventas por período, productos más pedidos, clientes con mayor movimiento y exportación de datos."
      icon={<IconChartBar className="size-4" />}
    />
  )
}
