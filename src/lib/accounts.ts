import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

import { formatCurrency } from "@/lib/format"

export type Account = {
  creditLimit: number
  currentDebt: number
  availableBalance: number
  defaultAddress: string
}

export type AccountBlockReason = "excede-limite" | "saldo-insuficiente"

export type AccountCheckResult =
  | { ok: true }
  | { ok: false; reason: AccountBlockReason; shortfall: number }

type BlockContext = {
  subtotal: number
  account: Account
  shortfall: number
}

export const BLOCK_REASON_TITLES: Readonly<Record<AccountBlockReason, string>> =
  {
    "excede-limite": "Excedés tu límite de crédito",
    "saldo-insuficiente": "Saldo insuficiente",
  }

export const BLOCK_REASON_DESCRIPTIONS: Readonly<
  Record<AccountBlockReason, (ctx: BlockContext) => string>
> = {
  "excede-limite": ({ subtotal, account, shortfall }) =>
    `Tu pedido de ${formatCurrency(subtotal)} excede tu límite de crédito de ${formatCurrency(account.creditLimit)} por ${formatCurrency(shortfall)}. No podemos procesarlo: contactá a tu vendedor para revisar el límite.`,
  "saldo-insuficiente": ({ subtotal, account, shortfall }) =>
    `Tu pedido de ${formatCurrency(subtotal)} supera tu saldo disponible de ${formatCurrency(account.availableBalance)} por ${formatCurrency(shortfall)}. Registrás una deuda de ${formatCurrency(account.currentDebt)}: pagá las facturas pendientes o reduci el pedido.`,
}

export const getBlockReasonMessage = (
  reason: AccountBlockReason,
  ctx: BlockContext
): string => BLOCK_REASON_DESCRIPTIONS[reason](ctx)

const INITIAL_ACCOUNTS: Readonly<Record<string, Account>> = {
  "u-cliente": {
    creditLimit: 50000,
    currentDebt: 0,
    availableBalance: 50000,
    defaultAddress: "Av. Paraguay 2150, Salta Capital",
  },
  "u-cliente-2": {
    creditLimit: 80000,
    currentDebt: 32500,
    availableBalance: 47500,
    defaultAddress: "Av. San Martín 350, Salta Capital",
  },
  "u-cliente-3": {
    creditLimit: 120000,
    currentDebt: 0,
    availableBalance: 120000,
    defaultAddress: "Calle Belgrano 825, San Salvador de Jujuy",
  },
  "u-cliente-4": {
    creditLimit: 25000,
    currentDebt: 24800,
    availableBalance: 200,
    defaultAddress: "Av. Las Heras 412, Salta Capital",
  },
  "u-cliente-5": {
    creditLimit: 200000,
    currentDebt: 0,
    availableBalance: 200000,
    defaultAddress: "Calle Mitre 1180, San Miguel de Tucumán",
  },
}

type AccountsState = {
  accounts: Record<string, Account>
  addDeliveryToDebt: (userId: string, amount: number) => void
  addDebt: (userId: string, amount: number) => void
  registerPayment: (userId: string, amount: number) => void
  setCreditLimit: (userId: string, newLimit: number) => void
}

export const useAccountsStore = create<AccountsState>()(
  persist(
    (set) => ({
      accounts: { ...INITIAL_ACCOUNTS },
      addDeliveryToDebt: (userId, amount) =>
        set((state) => {
          const acc = state.accounts[userId]
          if (!acc) return state
          return {
            accounts: {
              ...state.accounts,
              [userId]: {
                ...acc,
                currentDebt: acc.currentDebt + amount,
                availableBalance: acc.availableBalance - amount,
              },
            },
          }
        }),
      addDebt: (userId, amount) =>
        set((state) => {
          const acc = state.accounts[userId]
          if (!acc) return state
          return {
            accounts: {
              ...state.accounts,
              [userId]: {
                ...acc,
                currentDebt: acc.currentDebt + amount,
                availableBalance: acc.availableBalance - amount,
              },
            },
          }
        }),
      registerPayment: (userId, amount) =>
        set((state) => {
          const acc = state.accounts[userId]
          if (!acc) return state
          const newDebt = Math.max(0, acc.currentDebt - amount)
          const debtDelta = acc.currentDebt - newDebt
          return {
            accounts: {
              ...state.accounts,
              [userId]: {
                ...acc,
                currentDebt: newDebt,
                availableBalance: Math.min(
                  acc.creditLimit,
                  acc.availableBalance + debtDelta
                ),
              },
            },
          }
        }),
      setCreditLimit: (userId, newLimit) =>
        set((state) => {
          const acc = state.accounts[userId]
          if (!acc) return state
          return {
            accounts: {
              ...state.accounts,
              [userId]: {
                ...acc,
                creditLimit: newLimit,
                availableBalance: newLimit - acc.currentDebt,
              },
            },
          }
        }),
    }),
    {
      name: "noa-accounts",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ accounts: state.accounts }),
    }
  )
)

export const getAccountForUser = (userId: string): Account | undefined =>
  useAccountsStore.getState().accounts[userId]

export const checkOrderAgainstAccount = (
  subtotal: number,
  account: Account
): AccountCheckResult => {
  if (subtotal > account.creditLimit) {
    return {
      ok: false,
      reason: "excede-limite",
      shortfall: subtotal - account.creditLimit,
    }
  }
  if (subtotal > account.availableBalance) {
    return {
      ok: false,
      reason: "saldo-insuficiente",
      shortfall: subtotal - account.availableBalance,
    }
  }
  return { ok: true }
}
