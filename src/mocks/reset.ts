const PERSISTED_STORE_KEYS: ReadonlyArray<string> = [
  "noa-orders",
  "noa-deliveries",
  "noa-cash-closings",
  "noa-accounts",
  "noa-cart",
  "noa-products",
]

export const resetDemoData = (): void => {
  if (typeof window === "undefined") return
  for (const key of PERSISTED_STORE_KEYS) {
    window.localStorage.removeItem(key)
  }
  window.location.reload()
}
