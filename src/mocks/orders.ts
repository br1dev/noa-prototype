import type { PaymentMethod } from "@/lib/payment-methods"
import type { OrderStatusId } from "@/lib/order-status"
import { INITIAL_ACCOUNT_LIMITS } from "@/mocks/accounts"
import { nowInArgentina } from "@/lib/cash-closing"
import { MOCK_USERS } from "@/lib/mock-users"
import { PRODUCTS } from "@/lib/products"
import type { Order } from "@/store/orders"

type OrderSeed = {
  id: string
  userId: string
  status: OrderStatusId
  paymentMethod: PaymentMethod
  daysAgo: number
  hour: number
  minute: number
  updatedHour?: number
  updatedMinute?: number
  items: { productId: string; quantity: number }[]
  cancelReason?: string
}

const CLIENT_USER_IDS = MOCK_USERS.filter(
  (u) => u.role === "cliente"
).map((u) => u.id)

const userNameById = (id: string): string =>
  MOCK_USERS.find((u) => u.id === id)?.name ?? "Cliente"

const accountAddress = (id: string): string | undefined =>
  INITIAL_ACCOUNT_LIMITS[id]?.defaultAddress

const buildDate = (
  argNow: Date,
  daysAgo: number,
  hour: number,
  minute: number
): Date => {
  const d = new Date(argNow)
  d.setDate(d.getDate() - daysAgo)
  d.setHours(hour, minute, 0, 0)
  return d
}

const computeItems = (
  spec: { productId: string; quantity: number }[]
): Order["items"] =>
  spec.map((item) => {
    const product = PRODUCTS.find((p) => p.id === item.productId)
    if (!product) {
      throw new Error(`Product ${item.productId} not found in seed`)
    }
    return {
      productId: product.id,
      name: product.name,
      price: product.price,
      unit: product.unit,
      quantity: item.quantity,
    }
  })

const SEED_SPECS: OrderSeed[] = [
  {
    id: "ord-001",
    userId: "u-cliente",
    status: "en-analisis",
    paymentMethod: "cuenta-corriente",
    daysAgo: 0,
    hour: 9,
    minute: 12,
    items: [
      { productId: "f-001", quantity: 2 },
      { productId: "l-001", quantity: 6 },
    ],
  },
  {
    id: "ord-002",
    userId: "u-cliente-2",
    status: "en-analisis",
    paymentMethod: "contado",
    daysAgo: 0,
    hour: 9,
    minute: 34,
    items: [
      { productId: "s-001", quantity: 4 },
      { productId: "b-001", quantity: 12 },
    ],
  },
  {
    id: "ord-003",
    userId: "u-cliente-3",
    status: "en-analisis",
    paymentMethod: "cuenta-corriente",
    daysAgo: 0,
    hour: 10,
    minute: 5,
    items: [
      { productId: "f-002", quantity: 1 },
      { productId: "f-005", quantity: 2 },
    ],
  },
  {
    id: "ord-004",
    userId: "u-cliente-4",
    status: "en-analisis",
    paymentMethod: "contado",
    daysAgo: 0,
    hour: 10,
    minute: 22,
    items: [
      { productId: "l-002", quantity: 8 },
      { productId: "s-003", quantity: 3 },
    ],
  },
  {
    id: "ord-005",
    userId: "u-cliente-5",
    status: "en-analisis",
    paymentMethod: "cuenta-corriente",
    daysAgo: 0,
    hour: 10,
    minute: 48,
    items: [
      { productId: "f-003", quantity: 1 },
      { productId: "b-002", quantity: 24 },
    ],
  },
  {
    id: "ord-006",
    userId: "u-cliente-6",
    status: "en-analisis",
    paymentMethod: "cuenta-corriente",
    daysAgo: 0,
    hour: 11,
    minute: 14,
    items: [
      { productId: "s-005", quantity: 5 },
      { productId: "l-004", quantity: 4 },
    ],
  },
  {
    id: "ord-007",
    userId: "u-cliente-7",
    status: "en-analisis",
    paymentMethod: "contado",
    daysAgo: 0,
    hour: 11,
    minute: 38,
    items: [
      { productId: "f-004", quantity: 3 },
      { productId: "b-003", quantity: 10 },
    ],
  },
  {
    id: "ord-008",
    userId: "u-cliente-8",
    status: "en-analisis",
    paymentMethod: "contado",
    daysAgo: 0,
    hour: 12,
    minute: 6,
    items: [
      { productId: "l-005", quantity: 6 },
      { productId: "l-006", quantity: 3 },
    ],
  },
  {
    id: "ord-009",
    userId: "u-cliente",
    status: "en-analisis",
    paymentMethod: "contado",
    daysAgo: 0,
    hour: 12,
    minute: 32,
    items: [
      { productId: "s-002", quantity: 2 },
      { productId: "s-004", quantity: 4 },
    ],
  },
  {
    id: "ord-010",
    userId: "u-cliente-2",
    status: "en-analisis",
    paymentMethod: "cuenta-corriente",
    daysAgo: 0,
    hour: 13,
    minute: 18,
    items: [
      { productId: "f-006", quantity: 2 },
      { productId: "b-005", quantity: 6 },
    ],
  },
  {
    id: "ord-011",
    userId: "u-cliente-3",
    status: "en-analisis",
    paymentMethod: "contado",
    daysAgo: 0,
    hour: 14,
    minute: 4,
    items: [
      { productId: "f-001", quantity: 1 },
      { productId: "s-006", quantity: 2 },
    ],
  },
  {
    id: "ord-012",
    userId: "u-cliente-4",
    status: "en-proceso",
    paymentMethod: "contado",
    daysAgo: 0,
    hour: 8,
    minute: 30,
    updatedHour: 9,
    updatedMinute: 12,
    items: [
      { productId: "l-001", quantity: 12 },
      { productId: "b-004", quantity: 8 },
    ],
  },
  {
    id: "ord-013",
    userId: "u-cliente-5",
    status: "en-proceso",
    paymentMethod: "cuenta-corriente",
    daysAgo: 0,
    hour: 8,
    minute: 52,
    updatedHour: 9,
    updatedMinute: 35,
    items: [
      { productId: "f-002", quantity: 2 },
      { productId: "f-005", quantity: 1 },
    ],
  },
  {
    id: "ord-014",
    userId: "u-cliente-6",
    status: "en-proceso",
    paymentMethod: "contado",
    daysAgo: 0,
    hour: 9,
    minute: 18,
    updatedHour: 10,
    updatedMinute: 2,
    items: [
      { productId: "s-001", quantity: 6 },
      { productId: "l-003", quantity: 4 },
    ],
  },
  {
    id: "ord-015",
    userId: "u-cliente-7",
    status: "en-proceso",
    paymentMethod: "cuenta-corriente",
    daysAgo: 0,
    hour: 9,
    minute: 44,
    updatedHour: 10,
    updatedMinute: 28,
    items: [
      { productId: "f-003", quantity: 2 },
      { productId: "b-002", quantity: 18 },
    ],
  },
  {
    id: "ord-016",
    userId: "u-cliente-8",
    status: "en-proceso",
    paymentMethod: "contado",
    daysAgo: 1,
    hour: 15,
    minute: 12,
    updatedHour: 15,
    updatedMinute: 48,
    items: [
      { productId: "l-002", quantity: 6 },
      { productId: "l-004", quantity: 4 },
    ],
  },
  {
    id: "ord-017",
    userId: "u-cliente-2",
    status: "en-proceso",
    paymentMethod: "cuenta-corriente",
    daysAgo: 1,
    hour: 16,
    minute: 8,
    updatedHour: 16,
    updatedMinute: 42,
    items: [
      { productId: "f-004", quantity: 1 },
      { productId: "s-002", quantity: 3 },
    ],
  },
  {
    id: "ord-018",
    userId: "u-cliente-3",
    status: "en-proceso",
    paymentMethod: "contado",
    daysAgo: 1,
    hour: 16,
    minute: 36,
    updatedHour: 17,
    updatedMinute: 15,
    items: [
      { productId: "b-003", quantity: 12 },
      { productId: "b-005", quantity: 6 },
    ],
  },
  {
    id: "ord-019",
    userId: "u-cliente",
    status: "en-proceso",
    paymentMethod: "cuenta-corriente",
    daysAgo: 1,
    hour: 17,
    minute: 4,
    updatedHour: 17,
    updatedMinute: 38,
    items: [
      { productId: "f-006", quantity: 2 },
      { productId: "s-005", quantity: 3 },
    ],
  },
  {
    id: "ord-020",
    userId: "u-cliente-4",
    status: "en-proceso",
    paymentMethod: "contado",
    daysAgo: 1,
    hour: 17,
    minute: 28,
    updatedHour: 18,
    updatedMinute: 5,
    items: [
      { productId: "l-005", quantity: 4 },
      { productId: "l-006", quantity: 2 },
    ],
  },
  {
    id: "ord-021",
    userId: "u-cliente-5",
    status: "entregado",
    paymentMethod: "cuenta-corriente",
    daysAgo: 1,
    hour: 8,
    minute: 42,
    updatedHour: 11,
    updatedMinute: 30,
    items: [
      { productId: "f-001", quantity: 3 },
      { productId: "l-001", quantity: 6 },
    ],
  },
  {
    id: "ord-022",
    userId: "u-cliente-6",
    status: "entregado",
    paymentMethod: "contado",
    daysAgo: 1,
    hour: 9,
    minute: 18,
    updatedHour: 12,
    updatedMinute: 4,
    items: [
      { productId: "s-001", quantity: 4 },
      { productId: "b-001", quantity: 10 },
    ],
  },
  {
    id: "ord-023",
    userId: "u-cliente-7",
    status: "entregado",
    paymentMethod: "cuenta-corriente",
    daysAgo: 1,
    hour: 10,
    minute: 12,
    updatedHour: 13,
    updatedMinute: 18,
    items: [
      { productId: "f-002", quantity: 1 },
      { productId: "f-005", quantity: 2 },
    ],
  },
  {
    id: "ord-024",
    userId: "u-cliente-8",
    status: "entregado",
    paymentMethod: "contado",
    daysAgo: 1,
    hour: 11,
    minute: 8,
    updatedHour: 14,
    updatedMinute: 22,
    items: [
      { productId: "l-002", quantity: 8 },
      { productId: "s-003", quantity: 3 },
    ],
  },
  {
    id: "ord-025",
    userId: "u-cliente-2",
    status: "entregado",
    paymentMethod: "cuenta-corriente",
    daysAgo: 1,
    hour: 12,
    minute: 36,
    updatedHour: 15,
    updatedMinute: 48,
    items: [
      { productId: "b-002", quantity: 24 },
      { productId: "b-004", quantity: 6 },
    ],
  },
  {
    id: "ord-026",
    userId: "u-cliente-3",
    status: "entregado",
    paymentMethod: "contado",
    daysAgo: 2,
    hour: 8,
    minute: 24,
    updatedHour: 11,
    updatedMinute: 6,
    items: [
      { productId: "f-003", quantity: 2 },
      { productId: "l-004", quantity: 4 },
    ],
  },
  {
    id: "ord-027",
    userId: "u-cliente-4",
    status: "entregado",
    paymentMethod: "cuenta-corriente",
    daysAgo: 2,
    hour: 9,
    minute: 36,
    updatedHour: 12,
    updatedMinute: 22,
    items: [
      { productId: "s-004", quantity: 4 },
      { productId: "s-005", quantity: 2 },
    ],
  },
  {
    id: "ord-028",
    userId: "u-cliente-5",
    status: "entregado",
    paymentMethod: "contado",
    daysAgo: 2,
    hour: 10,
    minute: 48,
    updatedHour: 13,
    updatedMinute: 38,
    items: [
      { productId: "f-006", quantity: 2 },
      { productId: "l-005", quantity: 3 },
    ],
  },
  {
    id: "ord-029",
    userId: "u-cliente-6",
    status: "entregado",
    paymentMethod: "cuenta-corriente",
    daysAgo: 2,
    hour: 12,
    minute: 4,
    updatedHour: 14,
    updatedMinute: 42,
    items: [
      { productId: "l-006", quantity: 4 },
      { productId: "b-005", quantity: 8 },
    ],
  },
  {
    id: "ord-030",
    userId: "u-cliente-7",
    status: "entregado",
    paymentMethod: "contado",
    daysAgo: 3,
    hour: 9,
    minute: 12,
    updatedHour: 12,
    updatedMinute: 18,
    items: [
      { productId: "f-001", quantity: 2 },
      { productId: "s-002", quantity: 4 },
    ],
  },
  {
    id: "ord-031",
    userId: "u-cliente-8",
    status: "entregado",
    paymentMethod: "cuenta-corriente",
    daysAgo: 3,
    hour: 10,
    minute: 28,
    updatedHour: 13,
    updatedMinute: 36,
    items: [
      { productId: "l-001", quantity: 12 },
      { productId: "b-003", quantity: 6 },
    ],
  },
  {
    id: "ord-032",
    userId: "u-cliente-2",
    status: "entregado",
    paymentMethod: "contado",
    daysAgo: 3,
    hour: 14,
    minute: 18,
    updatedHour: 16,
    updatedMinute: 42,
    items: [
      { productId: "f-002", quantity: 1 },
      { productId: "f-004", quantity: 2 },
    ],
  },
  {
    id: "ord-033",
    userId: "u-cliente-3",
    status: "entregado",
    paymentMethod: "cuenta-corriente",
    daysAgo: 4,
    hour: 9,
    minute: 42,
    updatedHour: 12,
    updatedMinute: 30,
    items: [
      { productId: "s-003", quantity: 6 },
      { productId: "b-001", quantity: 12 },
    ],
  },
  {
    id: "ord-034",
    userId: "u-cliente-4",
    status: "entregado",
    paymentMethod: "contado",
    daysAgo: 4,
    hour: 11,
    minute: 16,
    updatedHour: 14,
    updatedMinute: 8,
    items: [
      { productId: "f-005", quantity: 2 },
      { productId: "l-002", quantity: 8 },
    ],
  },
  {
    id: "ord-035",
    userId: "u-cliente-2",
    status: "cancelado",
    paymentMethod: "cuenta-corriente",
    daysAgo: 1,
    hour: 14,
    minute: 32,
    updatedHour: 17,
    updatedMinute: 12,
    items: [
      { productId: "f-001", quantity: 1 },
      { productId: "b-001", quantity: 6 },
    ],
    cancelReason: "Cliente rechazó el pedido",
  },
  {
    id: "ord-036",
    userId: "u-cliente-3",
    status: "cancelado",
    paymentMethod: "contado",
    daysAgo: 2,
    hour: 10,
    minute: 22,
    updatedHour: 11,
    updatedMinute: 48,
    items: [
      { productId: "f-003", quantity: 1 },
      { productId: "l-004", quantity: 2 },
    ],
    cancelReason: "Cliente ausente",
  },
  {
    id: "ord-037",
    userId: "u-cliente-6",
    status: "cancelado",
    paymentMethod: "cuenta-corriente",
    daysAgo: 0,
    hour: 8,
    minute: 14,
    updatedHour: 9,
    updatedMinute: 32,
    items: [
      { productId: "s-005", quantity: 2 },
      { productId: "s-006", quantity: 1 },
    ],
    cancelReason: "Dirección incorrecta",
  },
  {
    id: "ord-038",
    userId: "u-cliente-7",
    status: "cancelado",
    paymentMethod: "contado",
    daysAgo: 3,
    hour: 11,
    minute: 38,
    updatedHour: 14,
    updatedMinute: 6,
    items: [
      { productId: "f-006", quantity: 1 },
      { productId: "b-002", quantity: 6 },
    ],
    cancelReason: "Pedido duplicado",
  },
]

export const buildSeedOrders = (): Order[] => {
  const argNow = nowInArgentina()
  return SEED_SPECS.map((spec) => {
    const createdAt = buildDate(argNow, spec.daysAgo, spec.hour, spec.minute)
    const items = computeItems(spec.items)
    const subtotal = items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    )
    const order: Order = {
      id: spec.id,
      createdAt: createdAt.toISOString(),
      userId: spec.userId,
      userName: userNameById(spec.userId),
      items,
      subtotal,
      paymentMethod: spec.paymentMethod,
      status: spec.status,
      deliveryAddress: accountAddress(spec.userId),
    }
    if (spec.updatedHour !== undefined && spec.updatedMinute !== undefined) {
      order.updatedAt = buildDate(
        argNow,
        spec.daysAgo,
        spec.updatedHour,
        spec.updatedMinute
      ).toISOString()
    }
    if (spec.cancelReason) {
      order.cancelReason = spec.cancelReason
    }
    return order
  })
}

export const seedClientUserIds = CLIENT_USER_IDS
