export type PaymentMethod = "cuenta-corriente" | "contado"

export type PaymentMethodConfig = {
  id: PaymentMethod
  label: string
  description: string
}

export const PAYMENT_METHODS: ReadonlyArray<PaymentMethodConfig> = [
  {
    id: "cuenta-corriente",
    label: "Cuenta corriente",
    description: "Se debita de tu cuenta y se liquida a fin de mes.",
  },
  {
    id: "contado",
    label: "Contado",
    description: "Pago inmediato al confirmar el pedido.",
  },
]
