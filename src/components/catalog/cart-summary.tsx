import { useMemo, useState } from "react"
import { IconShoppingCart, IconTrash } from "@tabler/icons-react"
import { toast } from "sonner"

import { OrderBlockedDialog } from "@/components/account/order-blocked-dialog"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Separator } from "@/components/ui/separator"

import { CartItemRow } from "@/components/catalog/cart-item-row"
import { ConfirmOrderDialog } from "@/components/catalog/confirm-order-dialog"
import { useAuthStore } from "@/store/auth"
import { selectCartSubtotal, useCartStore } from "@/store/cart"
import { useOrdersStore } from "@/store/orders"
import { getAccountForUser, type AccountBlockReason } from "@/lib/accounts"
import { formatCurrency } from "@/lib/format"

export function CartSummary() {
  const items = useCartStore((s) => s.items)
  const clear = useCartStore((s) => s.clear)
  const createOrder = useOrdersStore((s) => s.createOrder)
  const user = useAuthStore((s) => s.user)
  const account = useMemo(
    () => (user ? getAccountForUser(user.id) : undefined),
    [user]
  )
  const subtotal = useMemo(() => selectCartSubtotal(items), [items])
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [blocked, setBlocked] = useState<{
    reason: AccountBlockReason
    shortfall: number
  } | null>(null)

  const handleClear = () => {
    if (items.length === 0) return
    clear()
    toast.info("Pedido vaciado")
  }

  const handleConfirm = (paymentMethod: "cuenta-corriente" | "contado") => {
    if (!user) return
    const order = createOrder({
      userId: user.id,
      userName: user.name,
      items,
      subtotal,
      paymentMethod,
    })
    clear()
    setConfirmOpen(false)
    toast.success("Pedido confirmado", {
      description: `#${order.id.slice(0, 8)} · ${formatCurrency(subtotal)}`,
    })
  }

  const handleBlocked = (result: {
    reason: AccountBlockReason
    shortfall: number
  }) => {
    setBlocked(result)
    setConfirmOpen(false)
  }

  return (
    <aside className="flex h-full w-full max-w-sm flex-col border-t border-border bg-card lg:border-t-0 lg:border-l">
      <header className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <IconShoppingCart
            className="size-4 text-muted-foreground"
            aria-hidden
          />
          <h2 className="text-sm font-medium">Tu pedido</h2>
          {items.length > 0 ? (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground tabular-nums">
              {items.reduce((acc, i) => acc + i.quantity, 0)}
            </span>
          ) : null}
        </div>
        {items.length > 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={handleClear}
            className="text-muted-foreground"
          >
            <IconTrash data-icon="inline-start" />
            Vaciar
          </Button>
        ) : null}
      </header>

      {items.length === 0 ? (
        <div className="flex flex-1 items-center justify-center p-5">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <IconShoppingCart />
              </EmptyMedia>
              <EmptyTitle>Tu pedido está vacío</EmptyTitle>
              <EmptyDescription>
                Sumá productos del catálogo para empezar a armar tu pedido.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      ) : (
        <ul className="flex min-h-0 flex-1 flex-col divide-y divide-border overflow-hidden px-5">
          {items.map((item) => (
            <CartItemRow key={item.productId} item={item} />
          ))}
        </ul>
      )}

      <Separator />
      <footer className="flex flex-col gap-3 px-5 py-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Subtotal</span>
          <span className="text-lg font-semibold tabular-nums">
            {formatCurrency(subtotal)}
          </span>
        </div>
        <Button
          type="button"
          size="lg"
          disabled={items.length === 0}
          onClick={() => setConfirmOpen(true)}
          className="w-full"
        >
          Confirmar pedido
        </Button>
      </footer>

      <ConfirmOrderDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        subtotal={subtotal}
        account={account}
        onConfirm={handleConfirm}
        onBlocked={handleBlocked}
      />

      {blocked && account ? (
        <OrderBlockedDialog
          open
          onOpenChange={(open) => {
            if (!open) setBlocked(null)
          }}
          reason={blocked.reason}
          account={account}
          subtotal={subtotal}
          shortfall={blocked.shortfall}
        />
      ) : null}
    </aside>
  )
}
