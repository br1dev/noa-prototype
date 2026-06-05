import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

import type { DeliveryPaymentMethod } from "@/lib/delivery-payment-methods"
import type { DeliveryCancelReason } from "@/lib/delivery-cancellation-reasons"

export type Delivery = {
  id: string
  orderId: string
  userId: string
  paymentMethod: DeliveryPaymentMethod
  amount: number
  receivedAmount: number
  debtAmount: number
  observations?: string
  deliveredAt: string
  cancellationReason?: DeliveryCancelReason
  cancellationObservations?: string
}

type CreateDeliveryInput = {
  orderId: string
  userId: string
  paymentMethod: DeliveryPaymentMethod
  receivedAmount: number
  debtAmount: number
  observations?: string
}

type CreateDeliveryCancellationInput = {
  orderId: string
  userId: string
  reason: DeliveryCancelReason
  observations?: string
}

type DeliveriesState = {
  deliveries: Delivery[]
  createDelivery: (input: CreateDeliveryInput) => Delivery
  createDeliveryCancellation: (
    input: CreateDeliveryCancellationInput
  ) => Delivery
}

const generateId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `dlv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export const useDeliveriesStore = create<DeliveriesState>()(
  persist(
    (set) => ({
      deliveries: [],
      createDelivery: (input) => {
        const delivery: Delivery = {
          id: generateId(),
          orderId: input.orderId,
          userId: input.userId,
          paymentMethod: input.paymentMethod,
          amount: input.receivedAmount + input.debtAmount,
          receivedAmount: input.receivedAmount,
          debtAmount: input.debtAmount,
          observations: input.observations,
          deliveredAt: new Date().toISOString(),
        }
        set((state) => ({ deliveries: [delivery, ...state.deliveries] }))
        return delivery
      },
      createDeliveryCancellation: (input) => {
        const delivery: Delivery = {
          id: generateId(),
          orderId: input.orderId,
          userId: input.userId,
          paymentMethod: "efectivo",
          amount: 0,
          receivedAmount: 0,
          debtAmount: 0,
          deliveredAt: new Date().toISOString(),
          cancellationReason: input.reason,
          cancellationObservations: input.observations,
        }
        set((state) => ({ deliveries: [delivery, ...state.deliveries] }))
        return delivery
      },
    }),
    {
      name: "noa-deliveries",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ deliveries: state.deliveries }),
    }
  )
)
