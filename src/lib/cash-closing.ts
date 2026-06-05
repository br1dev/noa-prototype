import { getDeliveryPaymentMethod } from "@/lib/delivery-payment-methods"
import { MOCK_USERS } from "@/lib/mock-users"
import type { Delivery } from "@/store/deliveries"
import type { Order } from "@/store/orders"

export const CASH_BASE_BALANCE = 50_000

export const CIERRE_HORA_DESDE = 20
export const CIERRE_HORA_HASTA = 24

export const ARGENTINA_TIMEZONE = "America/Argentina/Buenos_Aires"

export const CASH_CLOSING_METHODS: ReadonlyArray<
  ReturnType<typeof getDeliveryPaymentMethod>
> = [
  getDeliveryPaymentMethod("efectivo"),
  getDeliveryPaymentMethod("transferencia"),
  getDeliveryPaymentMethod("imputacion-cta-cte"),
]

export type CashClosingMethod =
  | "efectivo"
  | "transferencia"
  | "imputacion-cta-cte"

export type CashClosingMethodSummary = {
  count: number
  amount: number
}

export const REJECTION_SAMPLES_LIMIT = 5

export type ClosingOperation = {
  id: string
  time: string
  clientName: string
  description: string
  methodLabel: string
  amount: number
  status: "entregado" | "rechazado"
  statusLabel: string
}

export type CashClosing = {
  id: string
  date: string
  generatedAt: string
  baseBalance: number
  totalCollected: number
  paymentMethods: Record<CashClosingMethod, CashClosingMethodSummary>
  deliveredCount: number
  rejectedCount: number
  rejectionSamples: string[]
  balanceAfter: number
  deliveryCount: number
  orderCount: number
  operations: ClosingOperation[]
}

const pad2 = (value: number): string => value.toString().padStart(2, "0")

export const toLocalDateKey = (date: Date): string =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`

export const fromLocalDateKey = (key: string): Date => {
  const [year, month, day] = key.split("-").map(Number)
  return new Date(year, (month ?? 1) - 1, day ?? 1)
}

export const startOfDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)

export const endOfDay = (date: Date): Date =>
  new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999
  )

export const shiftDate = (date: Date, days: number): Date => {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

export const isSameLocalDay = (a: Date, b: Date): boolean =>
  toLocalDateKey(a) === toLocalDateKey(b)

const argParts = (date: Date): Map<string, string> => {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: ARGENTINA_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
  const map = new Map<string, string>()
  for (const part of formatter.formatToParts(date)) {
    if (part.type !== "literal") {
      map.set(part.type, part.value)
    }
  }
  return map
}

export const nowInArgentina = (date: Date = new Date()): Date => {
  const parts = argParts(date)
  const rawHour = parts.get("hour") ?? "00"
  const hour = rawHour === "24" ? "00" : rawHour
  return new Date(
    Number(parts.get("year")),
    Number(parts.get("month")) - 1,
    Number(parts.get("day")),
    Number(hour),
    Number(parts.get("minute") ?? "0"),
    Number(parts.get("second") ?? "0")
  )
}

export const todayInArgentina = (now: Date = new Date()): Date => {
  const argNow = nowInArgentina(now)
  return new Date(argNow.getFullYear(), argNow.getMonth(), argNow.getDate())
}

export const yesterdayInArgentina = (now: Date = new Date()): Date =>
  shiftDate(todayInArgentina(now), -1)

export const isWithinClosingWindow = (
  selectedDate: Date,
  now: Date
): boolean => {
  const argNow = nowInArgentina(now)
  const argToday = new Date(
    argNow.getFullYear(),
    argNow.getMonth(),
    argNow.getDate()
  )
  if (!isSameLocalDay(selectedDate, argToday)) return false
  return argNow.getHours() >= CIERRE_HORA_DESDE && argNow.getHours() < CIERRE_HORA_HASTA
}

export const formatClosingWindow = (): string =>
  `${pad2(CIERRE_HORA_DESDE)}:00 – ${pad2(0)}:00 hs (ART)`

const emptyMethodSummary = (): Record<
  CashClosingMethod,
  CashClosingMethodSummary
> => ({
  efectivo: { count: 0, amount: 0 },
  transferencia: { count: 0, amount: 0 },
  "imputacion-cta-cte": { count: 0, amount: 0 },
})

const userNameById = (): Map<string, string> => {
  const map = new Map<string, string>()
  for (const user of MOCK_USERS) {
    map.set(user.id, user.name)
  }
  return map
}

const timeFormatter = new Intl.DateTimeFormat("es-AR", {
  hour: "2-digit",
  minute: "2-digit",
})

const isDeliveryInRange = (
  delivery: Delivery,
  dateKey: string
): boolean => {
  if (delivery.cancellationReason) return false
  return toLocalDateKey(new Date(delivery.deliveredAt)) === dateKey
}

const isOrderUpdatedInRange = (order: Order, dateKey: string): boolean => {
  if (order.status !== "cancelado") return false
  if (!order.updatedAt) return false
  return toLocalDateKey(new Date(order.updatedAt)) === dateKey
}

export type ClosingComputation = Omit<
  CashClosing,
  "id" | "generatedAt" | "date"
>

export const computeClosingForDate = (
  date: Date,
  deliveries: ReadonlyArray<Delivery>,
  orders: ReadonlyArray<Order>,
  now: Date = new Date()
): ClosingComputation => {
  const dateKey = toLocalDateKey(date)
  const names = userNameById()

  const successfulDeliveries = deliveries.filter((d) =>
    isDeliveryInRange(d, dateKey)
  )
  const cancelledOrders = orders.filter((o) => isOrderUpdatedInRange(o, dateKey))

  const paymentMethods = emptyMethodSummary()
  for (const delivery of successfulDeliveries) {
    const method = paymentMethods[delivery.paymentMethod]
    method.count += 1
    method.amount += delivery.receivedAmount
  }

  const seen = new Set<string>()
  const rejectionSamples: string[] = []
  for (const order of cancelledOrders) {
    const reason = order.cancelReason?.trim()
    if (!reason) continue
    if (seen.has(reason)) continue
    seen.add(reason)
    rejectionSamples.push(reason)
    if (rejectionSamples.length >= REJECTION_SAMPLES_LIMIT) break
  }

  const totalCollected = successfulDeliveries.reduce(
    (acc, d) => acc + d.receivedAmount,
    0
  )

  const argNow = nowInArgentina(now)
  const cutoff = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999
  )
  void argNow

  const historicalEfectivo = deliveries
    .filter((d) => {
      if (d.cancellationReason) return false
      if (d.paymentMethod !== "efectivo") return false
      const deliveryDate = new Date(d.deliveredAt)
      return deliveryDate.getTime() <= cutoff.getTime()
    })
    .reduce((acc, d) => acc + d.receivedAmount, 0)

  const balanceAfter = CASH_BASE_BALANCE + historicalEfectivo

  const operations: ClosingOperation[] = []

  for (const delivery of successfulDeliveries) {
    const method = getDeliveryPaymentMethod(delivery.paymentMethod)
    operations.push({
      id: `d-${delivery.id}`,
      time: timeFormatter.format(new Date(delivery.deliveredAt)),
      clientName: names.get(delivery.userId) ?? "Cliente",
      description: `Entrega #${delivery.id.slice(0, 6).toUpperCase()}`,
      methodLabel: method.label,
      amount: delivery.receivedAmount,
      status: "entregado",
      statusLabel: "Entregado",
    })
  }

  for (const order of cancelledOrders) {
    operations.push({
      id: `o-${order.id}`,
      time: timeFormatter.format(new Date(order.updatedAt ?? order.createdAt)),
      clientName: names.get(order.userId) ?? "Cliente",
      description: `Pedido #${order.id.slice(0, 6).toUpperCase()}`,
      methodLabel: "—",
      amount: 0,
      status: "rechazado",
      statusLabel: order.cancelReason?.trim() || "Cancelado",
    })
  }

  operations.sort((a, b) => a.time.localeCompare(b.time))

  return {
    baseBalance: CASH_BASE_BALANCE,
    totalCollected,
    paymentMethods,
    deliveredCount: successfulDeliveries.length,
    rejectedCount: cancelledOrders.length,
    rejectionSamples,
    balanceAfter,
    deliveryCount: successfulDeliveries.length,
    orderCount: cancelledOrders.length,
    operations,
  }
}
