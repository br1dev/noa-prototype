import { useEffect } from "react"
import { IconTruckDelivery } from "@tabler/icons-react"

import { PlaceholderPage } from "@/components/admin/placeholder-page"

export function AdminLogisticaPage() {
  useEffect(() => {
    document.title = "Logística · Distribuidora NOA"
  }, [])

  return (
    <PlaceholderPage
      eyebrow="Logística"
      title="Gestión de logística"
      description="Rutas de reparto, seguimiento de entregas, choferes y vehículos."
      icon={<IconTruckDelivery className="size-4" />}
    />
  )
}
