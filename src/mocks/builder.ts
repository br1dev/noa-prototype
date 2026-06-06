import { buildSeedClosings } from "@/mocks/cash-closings"
import {
  computeAccountsFromOrders,
  INITIAL_ACCOUNT_LIMITS,
} from "@/mocks/accounts"
import { buildSeedDeliveries } from "@/mocks/deliveries"
import { buildSeedOrders } from "@/mocks/orders"
import { PRODUCTS } from "@/lib/products"
import { MOCK_USERS } from "@/lib/mock-users"
import type { Account } from "@/lib/accounts"
import type { CashClosing } from "@/lib/cash-closing"
import type { Delivery } from "@/store/deliveries"
import type { Order } from "@/store/orders"

export type DemoData = {
  users: typeof MOCK_USERS
  products: typeof PRODUCTS
  accounts: Record<string, Account>
  orders: Order[]
  deliveries: Delivery[]
  closings: CashClosing[]
}

let cached: DemoData | null = null

export const buildAllDemoData = (): DemoData => {
  if (cached) return cached
  const orders = buildSeedOrders()
  const deliveries = buildSeedDeliveries(orders)
  const accounts = computeAccountsFromOrders(
    INITIAL_ACCOUNT_LIMITS,
    orders,
    deliveries
  )
  const closings = buildSeedClosings(deliveries, orders)
  cached = {
    users: MOCK_USERS,
    products: PRODUCTS,
    accounts,
    orders,
    deliveries,
    closings,
  }
  return cached
}
