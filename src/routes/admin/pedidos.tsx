import { useEffect } from "react"
import { IconReceipt } from "@tabler/icons-react"

import { PlaceholderPage } from "@/components/admin/placeholder-page"

export function AdminPedidosPage() {
  useEffect(() => {
    document.title = "Pedidos · Distribuidora NOA"
  }, [])

  return (
    <PlaceholderPage
      eyebrow="Pedidos"
      title="Gestión de pedidos"
      description="Listado completo de pedidos de todos los clientes, con estados, filtros y acciones de edición."
      icon={<IconReceipt className="size-4" />}
    />
  )
}
