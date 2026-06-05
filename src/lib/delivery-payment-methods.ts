export type DeliveryPaymentMethod =
  | "efectivo"
  | "transferencia"
  | "imputacion-cta-cte"

export type DeliveryPaymentMethodConfig = {
  id: DeliveryPaymentMethod
  label: string
  description: string
}

export const DELIVERY_PAYMENT_METHODS: ReadonlyArray<DeliveryPaymentMethodConfig> =
  [
    {
      id: "efectivo",
      label: "Efectivo",
      description: "Cobro en efectivo contra entrega.",
    },
    {
      id: "transferencia",
      label: "Transferencia",
      description: "El cliente transfiere el pago en el momento.",
    },
    {
      id: "imputacion-cta-cte",
      label: "Imputación a cuenta corriente",
      description:
        "Se debita de la cuenta del cliente. Podés imputar todo o solo una parte.",
    },
  ]

export const getDeliveryPaymentMethod = (
  id: DeliveryPaymentMethod
): DeliveryPaymentMethodConfig => {
  const found = DELIVERY_PAYMENT_METHODS.find((m) => m.id === id)
  if (!found) {
    throw new Error(`Unknown delivery payment method: ${id}`)
  }
  return found
}
