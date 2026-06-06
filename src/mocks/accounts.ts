import type { Account } from "@/lib/accounts"
import type { Delivery } from "@/store/deliveries"
import type { Order } from "@/store/orders"

export type AccountLimits = {
  creditLimit: number
  defaultAddress: string
}

export const INITIAL_ACCOUNT_LIMITS: Readonly<Record<string, AccountLimits>> = {
  "u-cliente": {
    creditLimit: 130_000,
    defaultAddress: "Av. Paraguay 2150, Salta Capital",
  },
  "u-cliente-2": {
    creditLimit: 80_000,
    defaultAddress: "Av. San Martín 350, Salta Capital",
  },
  "u-cliente-3": {
    creditLimit: 120_000,
    defaultAddress: "Calle Belgrano 825, San Salvador de Jujuy",
  },
  "u-cliente-4": {
    creditLimit: 11_000,
    defaultAddress: "Av. Las Heras 412, Salta Capital",
  },
  "u-cliente-5": {
    creditLimit: 200_000,
    defaultAddress: "Calle Mitre 1180, San Miguel de Tucumán",
  },
  "u-cliente-6": {
    creditLimit: 60_000,
    defaultAddress: "Calle Urquiza 540, Salta Capital",
  },
  "u-cliente-7": {
    creditLimit: 150_000,
    defaultAddress: "Av. Independencia 980, San Salvador de Jujuy",
  },
  "u-cliente-8": {
    creditLimit: 45_000,
    defaultAddress: "Calle 9 de Julio 1220, San Miguel de Tucumán",
  },
}

const deliveryForOrder = (
  deliveries: ReadonlyArray<Delivery>,
  orderId: string
): Delivery | undefined => deliveries.find((d) => d.orderId === orderId)

export const computeAccountsFromOrders = (
  limits: Readonly<Record<string, AccountLimits>>,
  orders: ReadonlyArray<Order>,
  deliveries: ReadonlyArray<Delivery>
): Record<string, Account> => {
  const accounts: Record<string, Account> = {}

  for (const [userId, limit] of Object.entries(limits)) {
    accounts[userId] = {
      creditLimit: limit.creditLimit,
      currentDebt: 0,
      availableBalance: limit.creditLimit,
      defaultAddress: limit.defaultAddress,
    }
  }

  for (const order of orders) {
    if (order.paymentMethod !== "cuenta-corriente") continue
    const acc = accounts[order.userId]
    if (!acc) continue

    if (order.status === "en-analisis" || order.status === "en-proceso") {
      acc.currentDebt += order.subtotal
      acc.availableBalance -= order.subtotal
      continue
    }

    if (order.status === "entregado") {
      const delivery = deliveryForOrder(deliveries, order.id)
      if (delivery && delivery.debtAmount > 0) {
        acc.currentDebt += delivery.debtAmount
        acc.availableBalance -= delivery.debtAmount
      }
    }
  }

  for (const acc of Object.values(accounts)) {
    acc.currentDebt = Math.max(0, acc.currentDebt)
    acc.availableBalance = Math.max(
      0,
      Math.min(acc.creditLimit, acc.availableBalance)
    )
  }

  return accounts
}
