import type { DeliveryPaymentMethod } from "@/lib/delivery-payment-methods"
import type { DeliveryCancelReason } from "@/lib/delivery-cancellation-reasons"
import { nowInArgentina } from "@/lib/cash-closing"
import type { Order } from "@/store/orders"
import type { Delivery } from "@/store/deliveries"

type DeliverySeed = {
  paymentMethod: DeliveryPaymentMethod
  receivedRatio: number
  observations?: string
}

const DELIVERY_MATRIX: Record<string, DeliverySeed> = {
  "ord-021": { paymentMethod: "efectivo", receivedRatio: 1 },
  "ord-022": { paymentMethod: "transferencia", receivedRatio: 1 },
  "ord-023": { paymentMethod: "imputacion-cta-cte", receivedRatio: 0 },
  "ord-024": { paymentMethod: "efectivo", receivedRatio: 1 },
  "ord-025": { paymentMethod: "transferencia", receivedRatio: 1 },
  "ord-026": { paymentMethod: "efectivo", receivedRatio: 1 },
  "ord-027": { paymentMethod: "imputacion-cta-cte", receivedRatio: 0 },
  "ord-028": { paymentMethod: "transferencia", receivedRatio: 1 },
  "ord-029": { paymentMethod: "efectivo", receivedRatio: 1 },
  "ord-030": { paymentMethod: "imputacion-cta-cte", receivedRatio: 0 },
  "ord-031": { paymentMethod: "transferencia", receivedRatio: 1 },
  "ord-032": { paymentMethod: "efectivo", receivedRatio: 1 },
  "ord-033": { paymentMethod: "efectivo", receivedRatio: 1 },
  "ord-034": { paymentMethod: "transferencia", receivedRatio: 1 },
}

const CANCEL_REASON_MAP: Record<string, DeliveryCancelReason> = {
  "ord-035": "rechazado",
  "ord-036": "cliente-ausente",
  "ord-037": "direccion-incorrecta",
  "ord-038": "duplicado",
}

export const buildSeedDeliveries = (orders: ReadonlyArray<Order>): Delivery[] => {
  const argNow = nowInArgentina()
  return orders
    .filter((order) => order.status === "entregado" || order.status === "cancelado")
    .map((order, index) => {
      const id = `dlv-${(index + 1).toString().padStart(3, "0")}`
      const cancelled = order.status === "cancelado"
      const seed = DELIVERY_MATRIX[order.id]

      if (cancelled) {
        const reason = CANCEL_REASON_MAP[order.id] ?? "otro"
        return {
          id,
          orderId: order.id,
          userId: order.userId,
          paymentMethod: "efectivo" as const,
          amount: 0,
          receivedAmount: 0,
          debtAmount: 0,
          deliveredAt: order.updatedAt ?? order.createdAt,
          cancellationReason: reason,
        }
      }

      const method = seed?.paymentMethod ?? "efectivo"
      const ratio = seed?.receivedRatio ?? 1
      const receivedAmount = Math.round(order.subtotal * ratio)
      const debtAmount = order.subtotal - receivedAmount

      const baseDate = order.updatedAt ?? order.createdAt
      const deliveredAt = shiftWithinWindow(baseDate, argNow, order.userId, index)

      return {
        id,
        orderId: order.id,
        userId: order.userId,
        paymentMethod: method,
        amount: order.subtotal,
        receivedAmount,
        debtAmount,
        deliveredAt,
      }
    })
}

const shiftWithinWindow = (
  iso: string,
  argNow: Date,
  userId: string,
  index: number
): string => {
  const base = new Date(iso)
  const minutes = (index * 7 + userId.charCodeAt(userId.length - 1)) % 45
  base.setMinutes(base.getMinutes() + minutes)
  if (base.getTime() > argNow.getTime()) {
    base.setTime(argNow.getTime() - (60 * 1000 * (index + 1)))
  }
  return base.toISOString()
}
