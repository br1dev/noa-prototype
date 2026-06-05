import { INITIAL_ACCOUNTS } from "@/mocks/accounts"
import { buildSeedClosings } from "@/mocks/cash-closings"
import { buildSeedDeliveries } from "@/mocks/deliveries"
import { buildSeedOrders } from "@/mocks/orders"
import { PRODUCTS } from "@/lib/products"
import { MOCK_USERS } from "@/lib/mock-users"
import type { CashClosing } from "@/lib/cash-closing"
import type { Delivery } from "@/store/deliveries"
import type { Order } from "@/store/orders"

export type DemoData = {
  users: typeof MOCK_USERS
  products: typeof PRODUCTS
  accounts: typeof INITIAL_ACCOUNTS
  orders: Order[]
  deliveries: Delivery[]
  closings: CashClosing[]
}

let cached: DemoData | null = null

export const buildAllDemoData = (): DemoData => {
  if (cached) return cached
  const orders = buildSeedOrders()
  const deliveries = buildSeedDeliveries(orders)
  const closings = buildSeedClosings(deliveries, orders)
  cached = {
    users: MOCK_USERS,
    products: PRODUCTS,
    accounts: INITIAL_ACCOUNTS,
    orders,
    deliveries,
    closings,
  }
  return cached
}
