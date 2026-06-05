import { useEffect, useMemo } from "react"
import { Link } from "react-router"
import { IconReceipt, IconShoppingBag } from "@tabler/icons-react"

import { AccountCard } from "@/components/account/account-card"
import { ClientShell } from "@/components/layout/client-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Separator } from "@/components/ui/separator"
import { useAuthStore } from "@/store/auth"
import { selectOrdersForUser, useOrdersStore } from "@/store/orders"
import { getAccountForUser } from "@/lib/accounts"
import { formatCurrency, formatDateTime } from "@/lib/format"
import { getOrderStatus } from "@/lib/order-status"
import { PAYMENT_METHODS } from "@/lib/payment-methods"

export function OrdersPage() {
  useEffect(() => {
    document.title = "Pedidos · Distribuidora NOA"
  }, [])

  const user = useAuthStore((s) => s.user)
  const orders = useOrdersStore((s) => s.orders)
  const account = useMemo(
    () => (user ? getAccountForUser(user.id) : undefined),
    [user]
  )
  const userOrders = useMemo(
    () => (user ? selectOrdersForUser(orders, user.id) : []),
    [orders, user]
  )

  return (
    <ClientShell>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6">
        <header className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-muted-foreground">
            <IconReceipt className="size-4" aria-hidden />
            <span className="text-xs tracking-wider uppercase">Pedidos</span>
          </div>
          <h1 className="text-2xl font-medium tracking-tight">
            Historial de pedidos
          </h1>
          <p className="text-sm text-muted-foreground">
            Acá podés ver el estado de tus pedidos confirmados.
          </p>
        </header>

        <Separator />

        {account ? <AccountCard account={account} /> : null}

        {userOrders.length === 0 ? (
          <EmptyOrdersState />
        ) : (
          <ul className="flex flex-col gap-3">
            {userOrders.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </ul>
        )}
      </div>
    </ClientShell>
  )
}

type OrderRowProps = {
  order: ReturnType<typeof useOrdersStore.getState>["orders"][number]
}

function OrderRow({ order }: OrderRowProps) {
  const status = getOrderStatus(order.status)
  const paymentLabel =
    PAYMENT_METHODS.find((m) => m.id === order.paymentMethod)?.label ??
    order.paymentMethod
  const itemCount = order.items.reduce((acc, i) => acc + i.quantity, 0)
  const shortId = order.id.slice(0, 8).toUpperCase()

  return (
    <li>
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-base">Pedido #{shortId}</CardTitle>
              <CardDescription className="text-xs">
                {formatDateTime(order.createdAt)}
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={status.tone}>{status.label}</Badge>
              <Badge variant="outline">{paymentLabel}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-col gap-0.5 text-sm text-muted-foreground">
              <span>
                {itemCount} {itemCount === 1 ? "unidad" : "unidades"}
              </span>
              <span className="font-medium text-foreground tabular-nums">
                {formatCurrency(order.subtotal)}
              </span>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to="/catalogo">Hacer otro pedido</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </li>
  )
}

function EmptyOrdersState() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconShoppingBag />
        </EmptyMedia>
        <EmptyTitle>Todavía no tenés pedidos</EmptyTitle>
        <EmptyDescription>
          Cuando confirmes un pedido desde el catálogo va a aparecer acá.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild>
          <Link to="/catalogo">Ir al catálogo</Link>
        </Button>
      </EmptyContent>
    </Empty>
  )
}
