import { formatCurrency } from "@/lib/format"

export type Account = {
  creditLimit: number
  currentDebt: number
  availableBalance: number
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

const ACCOUNTS: Readonly<Record<string, Account>> = {
  "u-cliente": {
    creditLimit: 50000,
    currentDebt: 18500,
    availableBalance: 31500,
  },
}

export const getAccountForUser = (userId: string): Account | undefined =>
  ACCOUNTS[userId]

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
