import { useMemo, useState } from "react"
import { IconShoppingCart, IconTrash } from "@tabler/icons-react"
import { toast } from "sonner"

import { OrderBlockedDialog } from "@/components/account/order-blocked-dialog"
import { ConfirmOrderDialog } from "@/components/catalog/confirm-order-dialog"
import { CartItemRow } from "@/components/catalog/cart-item-row"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Separator } from "@/components/ui/separator"
import { useAuthStore } from "@/store/auth"
import { selectCartSubtotal, useCartStore } from "@/store/cart"
import { useOrdersStore } from "@/store/orders"
import {
  getAccountForUser,
  useAccountsStore,
  type AccountBlockReason,
} from "@/lib/accounts"
import { formatCurrency } from "@/lib/format"

type CartBodyProps = {
  onClose?: () => void
}

export function CartBody({ onClose }: CartBodyProps) {
  const items = useCartStore((s) => s.items)
  const clear = useCartStore((s) => s.clear)
  const createOrder = useOrdersStore((s) => s.createOrder)
  const reserveOrder = useAccountsStore((s) => s.reserveOrder)
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

  const totalQuantity = items.reduce((acc, i) => acc + i.quantity, 0)

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
      deliveryAddress: account?.defaultAddress,
    })
    if (paymentMethod === "cuenta-corriente") {
      reserveOrder(user.id, order.id, subtotal)
    }
    clear()
    setConfirmOpen(false)
    onClose?.()
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
    <>
      <header className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <IconShoppingCart
            className="size-4 text-muted-foreground"
            aria-hidden
          />
          <h2 className="text-sm font-medium">Tu pedido</h2>
          {totalQuantity > 0 ? (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground tabular-nums">
              {totalQuantity}
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
        <ul className="flex min-h-0 flex-1 flex-col divide-y divide-border overflow-y-auto px-5">
          {items.map((item) => (
            <CartItemRow key={item.productId} item={item} />
          ))}
        </ul>
      )}

      <Separator />
      <footer className="flex shrink-0 flex-col gap-3 px-5 py-4">
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
    </>
  )
}
