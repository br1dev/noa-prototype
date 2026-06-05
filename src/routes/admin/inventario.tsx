import { useEffect } from "react"
import { IconBox } from "@tabler/icons-react"

import { PlaceholderPage } from "@/components/admin/placeholder-page"

export function AdminInventarioPage() {
  useEffect(() => {
    document.title = "Inventario · Distribuidora NOA"
  }, [])

  return (
    <PlaceholderPage
      eyebrow="Inventario"
      title="Gestión de inventario"
      description="Stock actual, alertas de reposición, ajustes y altas/bajas de productos por categoría."
      icon={<IconBox className="size-4" />}
    />
  )
}
