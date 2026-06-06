import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router"
import { IconPlus, IconReceipt, IconShoppingBag } from "@tabler/icons-react"

import { AccountCard } from "@/components/account/account-card"
import { ClientOrderDetailDialog } from "@/components/client/orders/client-order-detail-dialog"
import { ClientShell } from "@/components/layout/client-shell"
import { SearchInput } from "@/components/catalog/search-input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useAuthStore } from "@/store/auth"
import { selectOrdersForUser, useOrdersStore, type Order } from "@/store/orders"
import { useDeliveriesStore, type Delivery } from "@/store/deliveries"
import { useAccountsStore } from "@/lib/accounts"
import { formatCurrency, formatDateTime } from "@/lib/format"
import { ORDER_STATUSES, getOrderStatus, type OrderStatusId } from "@/lib/order-status"
import {
  PAYMENT_METHODS,
  type PaymentMethod,
} from "@/lib/payment-methods"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 10

type StatusFilter = OrderStatusId | "all"
type PaymentFilter = PaymentMethod | "all"

type FiltersState = {
  query: string
  status: StatusFilter
  paymentMethod: PaymentFilter
  page: number
}

const INITIAL_FILTERS: FiltersState = {
  query: "",
  status: "all",
  paymentMethod: "all",
  page: 1,
}

export function OrdersPage() {
  useEffect(() => {
    document.title = "Pedidos · Distribuidora NOA"
  }, [])

  const user = useAuthStore((s) => s.user)
  const orders = useOrdersStore((s) => s.orders)
  const deliveries = useDeliveriesStore((s) => s.deliveries)
  const account = useAccountsStore((s) =>
    user ? s.accounts[user.id] : undefined
  )

  const [filters, setFilters] = useState<FiltersState>(INITIAL_FILTERS)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)

  const setQuery = (query: string) =>
    setFilters((prev) => ({ ...prev, query, page: 1 }))
  const setStatus = (status: StatusFilter) =>
    setFilters((prev) => ({ ...prev, status, page: 1 }))
  const setPaymentMethod = (paymentMethod: PaymentFilter) =>
    setFilters((prev) => ({ ...prev, paymentMethod, page: 1 }))
  const setPage = (page: number) => setFilters((prev) => ({ ...prev, page }))
  const handleClearFilters = () => setFilters(INITIAL_FILTERS)

  const userOrders = useMemo(
    () => (user ? selectOrdersForUser(orders, user.id) : []),
    [orders, user]
  )

  const hasNoOrders = userOrders.length === 0

  const filtered = useMemo(() => {
    const normalized = filters.query.trim().toLowerCase()
    return userOrders.filter((order) => {
      if (filters.status !== "all" && order.status !== filters.status) {
        return false
      }
      if (
        filters.paymentMethod !== "all" &&
        order.paymentMethod !== filters.paymentMethod
      ) {
        return false
      }
      if (!normalized) return true
      return order.id.toLowerCase().includes(normalized)
    })
  }, [
    userOrders,
    filters.query,
    filters.status,
    filters.paymentMethod,
  ])

  const hasNoResults = !hasNoOrders && filtered.length === 0

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(filters.page, pageCount)
  const pagedOrders = useMemo(
    () => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filtered, safePage]
  )

  const selectedOrder = useMemo<Order | null>(
    () => orders.find((o) => o.id === selectedOrderId) ?? null,
    [orders, selectedOrderId]
  )
  const selectedDelivery = useMemo<Delivery | undefined>(
    () => deliveries.find((d) => d.orderId === selectedOrderId),
    [deliveries, selectedOrderId]
  )

  const showPagination = !hasNoOrders && !hasNoResults && pageCount > 1
  const showFilters = !hasNoOrders

  return (
    <ClientShell>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <IconReceipt className="size-4" aria-hidden />
              <span className="text-xs tracking-wider uppercase">Pedidos</span>
            </div>
            <h1 className="font-heading text-[1.65rem] font-semibold tracking-tight">
              Historial de pedidos
            </h1>
            <p className="text-sm text-muted-foreground">
              Acá podés ver el estado de tus pedidos confirmados.
            </p>
          </div>
          <Button asChild className="sm:self-start">
            <Link to="/catalogo">
              <IconPlus data-icon="inline-start" />
              Nuevo pedido
            </Link>
          </Button>
        </header>

        <Separator />

        {account ? <AccountCard account={account} /> : null}

        {showFilters ? (
          <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <SearchInput
                value={filters.query}
                onChange={setQuery}
                placeholder="Buscar por ID…"
                ariaLabel="Buscar pedidos"
                className="sm:max-w-sm"
              />
              <ToggleGroup
                type="single"
                value={filters.status}
                onValueChange={(next) => {
                  if (next) setStatus(next as StatusFilter)
                }}
                variant="outline"
                spacing={0}
                aria-label="Filtrar por estado"
                className="flex-wrap"
              >
                <ToggleGroupItem value="all" aria-label="Todos los estados">
                  Todos
                </ToggleGroupItem>
                {ORDER_STATUSES.map((opt) => (
                  <ToggleGroupItem
                    key={opt.id}
                    value={opt.id}
                    aria-label={opt.label}
                  >
                    {opt.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
            <ToggleGroup
              type="single"
              value={filters.paymentMethod}
              onValueChange={(next) => {
                if (next) setPaymentMethod(next as PaymentFilter)
              }}
              variant="outline"
              spacing={0}
              aria-label="Filtrar por medio de pago"
              className="flex-wrap"
            >
              <ToggleGroupItem
                value="all"
                aria-label="Todos los medios de pago"
              >
                Todos
              </ToggleGroupItem>
              <ToggleGroupItem
                value="cuenta-corriente"
                aria-label="Cuenta corriente"
              >
                Cta. cte.
              </ToggleGroupItem>
              <ToggleGroupItem value="contado" aria-label="Contado">
                Contado
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        ) : null}

        {hasNoOrders ? (
          <NoOrdersEmptyState />
        ) : hasNoResults ? (
          <NoResultsEmptyState onClear={handleClearFilters} />
        ) : (
          <div className="rounded-lg border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Medio de pago</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedOrders.map((order) => (
                  <ClientOrderRow
                    key={order.id}
                    order={order}
                    onOpen={() => setSelectedOrderId(order.id)}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {showPagination ? (
          <OrdersPagination
            page={safePage}
            pageCount={pageCount}
            onPageChange={setPage}
          />
        ) : null}

        {selectedOrder ? (
          <ClientOrderDetailDialog
            open={selectedOrderId !== null}
            onOpenChange={(open) => {
              if (!open) setSelectedOrderId(null)
            }}
            order={selectedOrder}
            delivery={selectedDelivery}
          />
        ) : null}
      </div>
    </ClientShell>
  )
}

type ClientOrderRowProps = {
  order: Order
  onOpen: () => void
}

function ClientOrderRow({ order, onOpen }: ClientOrderRowProps) {
  const status = getOrderStatus(order.status)
  const paymentLabel =
    PAYMENT_METHODS.find((m) => m.id === order.paymentMethod)?.label ??
    order.paymentMethod
  const shortId = order.id.slice(0, 8).toUpperCase()

  return (
    <TableRow
      onClick={onOpen}
      className="cursor-pointer"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onOpen()
        }
      }}
      aria-label={`Ver detalle del pedido #${shortId}`}
    >
      <TableCell>
        <span className="font-mono text-xs text-muted-foreground uppercase">
          #{shortId}
        </span>
      </TableCell>
      <TableCell className="text-muted-foreground tabular-nums">
        {formatDateTime(order.createdAt)}
      </TableCell>
      <TableCell className="text-right font-medium tabular-nums">
        {formatCurrency(order.subtotal)}
      </TableCell>
      <TableCell>
        <Badge variant={status.tone}>{status.label}</Badge>
      </TableCell>
      <TableCell>
        <Badge variant="outline">{paymentLabel}</Badge>
      </TableCell>
    </TableRow>
  )
}

type OrdersPaginationProps = {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
}

function OrdersPagination({
  page,
  pageCount,
  onPageChange,
}: OrdersPaginationProps) {
  const pages = getPageNumbers(page, pageCount)

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault()
              if (page > 1) onPageChange(page - 1)
            }}
            aria-disabled={page === 1}
            className={cn(page === 1 && "pointer-events-none opacity-50")}
          />
        </PaginationItem>
        {pages.map((p, i) =>
          p === "ellipsis" ? (
            <PaginationItem key={`e-${i}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={p}>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  onPageChange(p)
                }}
                isActive={p === page}
              >
                {p}
              </PaginationLink>
            </PaginationItem>
          )
        )}
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault()
              if (page < pageCount) onPageChange(page + 1)
            }}
            aria-disabled={page === pageCount}
            className={cn(
              page === pageCount && "pointer-events-none opacity-50"
            )}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

function getPageNumbers(
  page: number,
  pageCount: number
): Array<number | "ellipsis"> {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, i) => i + 1)
  }
  if (page <= 3) {
    return [1, 2, 3, 4, "ellipsis", pageCount]
  }
  if (page >= pageCount - 2) {
    return [
      1,
      "ellipsis",
      pageCount - 3,
      pageCount - 2,
      pageCount - 1,
      pageCount,
    ]
  }
  return [1, "ellipsis", page - 1, page, page + 1, "ellipsis", pageCount]
}

function NoOrdersEmptyState() {
  return (
    <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border bg-card/30 px-6 py-16">
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
    </div>
  )
}

type NoResultsEmptyStateProps = {
  onClear: () => void
}

function NoResultsEmptyState({ onClear }: NoResultsEmptyStateProps) {
  return (
    <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border bg-card/30 px-6 py-12">
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Sin resultados</EmptyTitle>
          <EmptyDescription>
            No hay pedidos que coincidan con tu búsqueda o filtro.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button type="button" variant="outline" onClick={onClear}>
            Limpiar filtros
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}
