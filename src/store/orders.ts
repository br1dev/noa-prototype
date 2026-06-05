import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

import type { CartItem } from "@/store/cart"
import type { OrderStatusId } from "@/lib/order-status"
import type { PaymentMethod } from "@/lib/payment-methods"

export type Order = {
  id: string
  createdAt: string
  userId: string
  userName: string
  items: CartItem[]
  subtotal: number
  paymentMethod: PaymentMethod
  status: OrderStatusId
}

type CreateOrderInput = {
  userId: string
  userName: string
  items: CartItem[]
  subtotal: number
  paymentMethod: PaymentMethod
}

type OrdersState = {
  orders: Order[]
  createOrder: (input: CreateOrderInput) => Order
}

const generateId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `ord-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set) => ({
      orders: [],
      createOrder: (input) => {
        const order: Order = {
          id: generateId(),
          createdAt: new Date().toISOString(),
          userId: input.userId,
          userName: input.userName,
          items: input.items,
          subtotal: input.subtotal,
          paymentMethod: input.paymentMethod,
          status: "en-analisis",
        }
        set((state) => ({ orders: [order, ...state.orders] }))
        return order
      },
    }),
    {
      name: "noa-orders",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ orders: state.orders }),
    }
  )
)

export const selectOrdersForUser = (orders: Order[], userId: string): Order[] =>
  orders
    .filter((order) => order.userId === userId)
    .toSorted(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
