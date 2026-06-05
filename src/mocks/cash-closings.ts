import {
  type CashClosing,
  type ClosingComputation,
  computeClosingForDate,
  shiftDate,
  toLocalDateKey,
  yesterdayInArgentina,
} from "@/lib/cash-closing"
import type { Delivery } from "@/store/deliveries"
import type { Order } from "@/store/orders"

const CLOSING_OFFSETS: ReadonlyArray<number> = [1, 2, 3, 4]

const buildClosingTimestamp = (
  refDate: Date,
  hour: number,
  minute: number
): string => {
  const d = new Date(refDate)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

export const buildSeedClosings = (
  deliveries: ReadonlyArray<Delivery>,
  orders: ReadonlyArray<Order>
): CashClosing[] => {
  const baseDate = yesterdayInArgentina()
  return CLOSING_OFFSETS.map((offset, index) => {
    const target = shiftDate(baseDate, -(offset - 1))
    const computation: ClosingComputation = computeClosingForDate(
      target,
      deliveries,
      orders
    )
    const id = `cl-seed-${offset.toString().padStart(2, "0")}`
    const generatedAt = buildClosingTimestamp(
      target,
      22,
      [18, 32, 24, 15][index] ?? 20
    )
    return {
      id,
      date: toLocalDateKey(target),
      generatedAt,
      ...computation,
    }
  })
}
