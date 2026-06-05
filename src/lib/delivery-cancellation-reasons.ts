export type DeliveryCancelReason =
  | "cliente-ausente"
  | "direccion-incorrecta"
  | "producto-danado"
  | "rechazado"
  | "duplicado"
  | "otro"

export type DeliveryCancelReasonConfig = {
  id: DeliveryCancelReason
  label: string
  description: string
}

export const DELIVERY_CANCEL_REASONS: ReadonlyArray<DeliveryCancelReasonConfig> =
  [
    {
      id: "cliente-ausente",
      label: "Cliente ausente",
      description: "Nadie recibió el pedido en la dirección.",
    },
    {
      id: "direccion-incorrecta",
      label: "Dirección incorrecta",
      description: "La dirección no existe o no se pudo encontrar.",
    },
    {
      id: "producto-danado",
      label: "Producto en mal estado",
      description: "La mercadería llegó dañada al momento de la entrega.",
    },
    {
      id: "rechazado",
      label: "Cliente rechazó el pedido",
      description: "El cliente no quiso recibir la mercadería.",
    },
    {
      id: "duplicado",
      label: "Pedido duplicado",
      description: "Se detectó un duplicado del mismo pedido.",
    },
    {
      id: "otro",
      label: "Otro motivo",
      description: "Especificá el motivo en las observaciones.",
    },
  ]

export const getDeliveryCancelReason = (
  id: DeliveryCancelReason
): DeliveryCancelReasonConfig => {
  const found = DELIVERY_CANCEL_REASONS.find((r) => r.id === id)
  if (!found) {
    throw new Error(`Unknown delivery cancel reason: ${id}`)
  }
  return found
}
