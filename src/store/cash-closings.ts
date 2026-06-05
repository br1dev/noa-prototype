import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

import {
  type CashClosing,
  toLocalDateKey,
} from "@/lib/cash-closing"
import { buildAllDemoData } from "@/mocks/builder"

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

export const useCashClosingsStore = create<CashClosingsState>()(
  persist(
    (set) => ({
      closings: buildAllDemoData().closings,
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
