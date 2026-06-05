import { CartBody } from "@/components/catalog/cart-body"

export function CartSummary() {
  return (
    <aside className="hidden h-full w-full max-w-sm flex-col border-l border-border bg-card lg:flex">
      <CartBody />
    </aside>
  )
}
