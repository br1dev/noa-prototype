export type OrderStatusId =
  | "en-analisis"
  | "en-proceso"
  | "entregado"
  | "cancelado"

export type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "ghost"
  | "link"

export type OrderStatus = {
  id: OrderStatusId
  label: string
  tone: BadgeVariant
}

export const ORDER_STATUSES: ReadonlyArray<OrderStatus> = [
  { id: "en-analisis", label: "En análisis", tone: "secondary" },
  { id: "en-proceso", label: "En proceso", tone: "default" },
  { id: "entregado", label: "Entregado/Recibido", tone: "outline" },
  { id: "cancelado", label: "Cancelado", tone: "destructive" },
]

export const getOrderStatus = (id: OrderStatusId): OrderStatus => {
  const found = ORDER_STATUSES.find((s) => s.id === id)
  if (!found) {
    throw new Error(`Unknown order status: ${id}`)
  }
  return found
}
