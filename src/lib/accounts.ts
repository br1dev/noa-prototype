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
}

type AccountsState = {
  accounts: Record<string, Account>
  addDeliveryToDebt: (userId: string, amount: number) => void
}

export const useAccountsStore = create<AccountsState>()(
  persist(
    (set) => ({
      accounts: INITIAL_ACCOUNTS,
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
