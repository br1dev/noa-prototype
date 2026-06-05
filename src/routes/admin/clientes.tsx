import { useEffect } from "react"
import { IconUsers } from "@tabler/icons-react"

import { PlaceholderPage } from "@/components/admin/placeholder-page"

export function AdminClientesPage() {
  useEffect(() => {
    document.title = "Clientes · Distribuidora NOA"
  }, [])

  return (
    <PlaceholderPage
      eyebrow="Clientes"
      title="Gestión de clientes"
      description="Listado de clientes, cuentas corrientes, límites de crédito y saldos disponibles."
      icon={<IconUsers className="size-4" />}
    />
  )
}
