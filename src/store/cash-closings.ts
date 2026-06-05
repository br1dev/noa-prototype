import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

import {
  type CashClosing,
  type ClosingOperation,
  CASH_BASE_BALANCE,
  toLocalDateKey,
  yesterdayInArgentina,
} from "@/lib/cash-closing"

export type CreateClosingInput = Omit<CashClosing, "id" | "generatedAt">

type CashClosingsState = {
  closings: CashClosing[]
  createClosing: (input: CreateClosingInput) => CashClosing
}

const generateId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `cl-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

const buildSeedClosings = (): CashClosing[] => {
  const today = yesterdayInArgentina()
  const dayBefore = new Date(today)
  dayBefore.setDate(dayBefore.getDate() - 1)

  const yesterdayKey = toLocalDateKey(today)
  const dayBeforeKey = toLocalDateKey(dayBefore)

  return [
    buildYesterdaySeed(yesterdayKey, today),
    buildDayBeforeSeed(dayBeforeKey, dayBefore),
  ]
}

const buildYesterdaySeed = (
  date: string,
  refDate: Date
): CashClosing => {
  const baseId = "seed-yer"
  const generatedAt = new Date(
    refDate.getFullYear(),
    refDate.getMonth(),
    refDate.getDate(),
    22,
    18,
    0
  ).toISOString()

  const paymentMethods = {
    efectivo: { count: 4, amount: 92_500 },
    transferencia: { count: 3, amount: 68_400 },
    "imputacion-cta-cte": { count: 2, amount: 45_200 },
  }
  const totalCollected =
    paymentMethods.efectivo.amount +
    paymentMethods.transferencia.amount +
    paymentMethods["imputacion-cta-cte"].amount

  const operations: ClosingOperation[] = [
    {
      id: `${baseId}-d1`,
      time: "08:42",
      clientName: "Distribuidora del Norte",
      description: "Entrega #A8B12C",
      methodLabel: "Efectivo",
      amount: 22_400,
      status: "entregado",
      statusLabel: "Entregado",
    },
    {
      id: `${baseId}-d2`,
      time: "09:15",
      clientName: "Kiosco La Esquina",
      description: "Entrega #A8B12F",
      methodLabel: "Transferencia",
      amount: 18_900,
      status: "entregado",
      statusLabel: "Entregado",
    },
    {
      id: `${baseId}-o1`,
      time: "10:02",
      clientName: "Almacén Don Pepe",
      description: "Pedido #A8B1A4",
      methodLabel: "—",
      amount: 0,
      status: "rechazado",
      statusLabel: "Cliente rechazó el pedido",
    },
    {
      id: `${baseId}-d3`,
      time: "10:48",
      clientName: "Maxikiosco 24",
      description: "Entrega #A8B131",
      methodLabel: "Efectivo",
      amount: 15_700,
      status: "entregado",
      statusLabel: "Entregado",
    },
    {
      id: `${baseId}-d4`,
      time: "11:30",
      clientName: "Comercial San Martín",
      description: "Entrega #A8B138",
      methodLabel: "Imputación a cuenta corriente",
      amount: 28_300,
      status: "entregado",
      statusLabel: "Entregado",
    },
    {
      id: `${baseId}-d5`,
      time: "13:12",
      clientName: "Almacén El Faro",
      description: "Entrega #A8B142",
      methodLabel: "Efectivo",
      amount: 31_200,
      status: "entregado",
      statusLabel: "Entregado",
    },
    {
      id: `${baseId}-d6`,
      time: "14:55",
      clientName: "Dietética Vida Sana",
      description: "Entrega #A8B149",
      methodLabel: "Transferencia",
      amount: 24_600,
      status: "entregado",
      statusLabel: "Entregado",
    },
    {
      id: `${baseId}-d7`,
      time: "16:20",
      clientName: "Autoservicio El Sol",
      description: "Entrega #A8B155",
      methodLabel: "Efectivo",
      amount: 23_200,
      status: "entregado",
      statusLabel: "Entregado",
    },
    {
      id: `${baseId}-o2`,
      time: "17:48",
      clientName: "Kiosco Avenida",
      description: "Pedido #A8B1A9",
      methodLabel: "—",
      amount: 0,
      status: "rechazado",
      statusLabel: "Cliente ausente",
    },
    {
      id: `${baseId}-d8`,
      time: "18:30",
      clientName: "MiniMarket Centro",
      description: "Entrega #A8B161",
      methodLabel: "Transferencia",
      amount: 24_900,
      status: "entregado",
      statusLabel: "Entregado",
    },
    {
      id: `${baseId}-d9`,
      time: "19:10",
      clientName: "Almacén La Familia",
      description: "Entrega #A8B164",
      methodLabel: "Imputación a cuenta corriente",
      amount: 16_900,
      status: "entregado",
      statusLabel: "Entregado",
    },
  ]

  return {
    id: `${baseId}-${date}`,
    date,
    generatedAt,
    baseBalance: CASH_BASE_BALANCE,
    totalCollected,
    paymentMethods,
    deliveredCount: 9,
    rejectedCount: 2,
    rejectionSamples: [
      "Cliente rechazó el pedido",
      "Cliente ausente",
    ],
    balanceAfter: CASH_BASE_BALANCE + 142_500,
    deliveryCount: 9,
    orderCount: 2,
    operations,
  }
}

const buildDayBeforeSeed = (
  date: string,
  refDate: Date
): CashClosing => {
  const baseId = "seed-day"
  const generatedAt = new Date(
    refDate.getFullYear(),
    refDate.getMonth(),
    refDate.getDate(),
    22,
    5,
    0
  ).toISOString()

  const paymentMethods = {
    efectivo: { count: 3, amount: 50_000 },
    transferencia: { count: 2, amount: 34_500 },
    "imputacion-cta-cte": { count: 1, amount: 22_000 },
  }
  const totalCollected =
    paymentMethods.efectivo.amount +
    paymentMethods.transferencia.amount +
    paymentMethods["imputacion-cta-cte"].amount

  const operations: ClosingOperation[] = [
    {
      id: `${baseId}-d1`,
      time: "09:20",
      clientName: "Distribuidora del Norte",
      description: "Entrega #A7F031",
      methodLabel: "Efectivo",
      amount: 18_700,
      status: "entregado",
      statusLabel: "Entregado",
    },
    {
      id: `${baseId}-d2`,
      time: "10:05",
      clientName: "Kiosco La Esquina",
      description: "Entrega #A7F035",
      methodLabel: "Transferencia",
      amount: 16_400,
      status: "entregado",
      statusLabel: "Entregado",
    },
    {
      id: `${baseId}-d3`,
      time: "11:42",
      clientName: "Maxikiosco 24",
      description: "Entrega #A7F042",
      methodLabel: "Efectivo",
      amount: 14_800,
      status: "entregado",
      statusLabel: "Entregado",
    },
    {
      id: `${baseId}-d4`,
      time: "14:18",
      clientName: "Comercial San Martín",
      description: "Entrega #A7F049",
      methodLabel: "Imputación a cuenta corriente",
      amount: 22_000,
      status: "entregado",
      statusLabel: "Entregado",
    },
    {
      id: `${baseId}-d5`,
      time: "16:35",
      clientName: "Almacén Don Pepe",
      description: "Entrega #A7F055",
      methodLabel: "Efectivo",
      amount: 16_500,
      status: "entregado",
      statusLabel: "Entregado",
    },
    {
      id: `${baseId}-d6`,
      time: "19:05",
      clientName: "Dietética Vida Sana",
      description: "Entrega #A7F062",
      methodLabel: "Transferencia",
      amount: 18_100,
      status: "entregado",
      statusLabel: "Entregado",
    },
  ]

  return {
    id: `${baseId}-${date}`,
    date,
    generatedAt,
    baseBalance: CASH_BASE_BALANCE,
    totalCollected,
    paymentMethods,
    deliveredCount: 6,
    rejectedCount: 0,
    rejectionSamples: [],
    balanceAfter: CASH_BASE_BALANCE + 50_000,
    deliveryCount: 6,
    orderCount: 0,
    operations,
  }
}

export const useCashClosingsStore = create<CashClosingsState>()(
  persist(
    (set) => ({
      closings: buildSeedClosings(),
      createClosing: (input) => {
        const closing: CashClosing = {
          ...input,
          id: generateId(),
          generatedAt: new Date().toISOString(),
        }
        set((state) => ({
          closings: [closing, ...state.closings],
        }))
        return closing
      },
    }),
    {
      name: "noa-cash-closings",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ closings: state.closings }),
    }
  )
)

export const selectClosingByDate = (
  closings: ReadonlyArray<CashClosing>,
  date: Date
): CashClosing | undefined =>
  closings.find((c) => c.date === toLocalDateKey(date))
