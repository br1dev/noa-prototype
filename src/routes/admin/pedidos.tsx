import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { IconArrowRight, IconInbox, IconReceipt } from "@tabler/icons-react"

import { SearchInput } from "@/components/catalog/search-input"
import { ProcessOrderDialog } from "@/components/admin/orders/process-order-dialog"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useOrdersStore, type Order } from "@/store/orders"
import { formatCurrency, formatDateTime } from "@/lib/format"
import { PAYMENT_METHODS, type PaymentMethod } from "@/lib/payment-methods"

const PAGE_SIZE = 10

type PaymentFilter = PaymentMethod | "all"

type FiltersState = {
  query: string
  paymentMethod: PaymentFilter
  page: number
}

const INITIAL_FILTERS: FiltersState = {
  query: "",
  paymentMethod: "all",
  page: 1,
}

export function AdminPedidosPage() {
  useEffect(() => {
    document.title = "Pedidos · Distribuidora NOA"
  }, [])

  const orders = useOrdersStore((s) => s.orders)
  const updateOrder = useOrdersStore((s) => s.updateOrder)

  const [filters, setFilters] = useState<FiltersState>(INITIAL_FILTERS)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)

  const setQuery = (query: string) =>
    setFilters((prev) => ({ ...prev, query, page: 1 }))
  const setPaymentMethod = (paymentMethod: PaymentFilter) =>
    setFilters((prev) => ({ ...prev, paymentMethod, page: 1 }))
  const setPage = (page: number) => setFilters((prev) => ({ ...prev, page }))

  const enAnalisisOrders = useMemo(
    () => orders.filter((o) => o.status === "en-analisis"),
    [orders]
  )

  const filtered = useMemo(() => {
    const normalized = filters.query.trim().toLowerCase()
    return enAnalisisOrders.filter((order) => {
      if (
        filters.paymentMethod !== "all" &&
        order.paymentMethod !== filters.paymentMethod
      ) {
        return false
      }
      if (!normalized) return true
      return (
        order.id.toLowerCase().includes(normalized) ||
        order.userName.toLowerCase().includes(normalized)
      )
    })
  }, [enAnalisisOrders, filters.query, filters.paymentMethod])

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

  const handleClearFilters = () => setFilters(INITIAL_FILTERS)

  const handleApprove = (orderId: string) => {
    const updated = updateOrder(orderId, { status: "en-proceso" })
    if (!updated) {
      toast.error("No se pudo aprobar el pedido", {
        description: "Es posible que ya haya sido procesado.",
      })
      return
    }
    setSelectedOrderId(null)
    toast.success("Pedido aprobado", {
      description: "Pasó a logística para su preparación.",
    })
  }

  const handleCancel = (orderId: string, reason: string) => {
    const updated = updateOrder(orderId, {
      status: "cancelado",
      cancelReason: reason,
    })
    if (!updated) {
      toast.error("No se pudo cancelar el pedido", {
        description: "Es posible que ya haya sido procesado.",
      })
      return
    }
    setSelectedOrderId(null)
    toast.success("Pedido cancelado", {
      description: "Se guardó el motivo.",
    })
  }

  const hasNoOrders = enAnalisisOrders.length === 0
  const hasNoResults = !hasNoOrders && filtered.length === 0

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6">
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-muted-foreground">
          <IconReceipt className="size-4" aria-hidden />
          <span className="text-xs tracking-wider uppercase">Pedidos</span>
        </div>
        <h1 className="text-2xl font-medium tracking-tight">
          Gestión de pedidos
        </h1>
        <p className="text-sm text-muted-foreground">
          Aprobá o cancelá los pedidos recién hechos. Una vez procesados pasan
          al módulo de logística.
        </p>
      </header>

      {!hasNoOrders ? (
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center">
          <SearchInput
            value={filters.query}
            onChange={setQuery}
            placeholder="Buscar por ID o cliente…"
            ariaLabel="Buscar pedidos"
            className="sm:max-w-sm"
          />
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
            <ToggleGroupItem value="all" aria-label="Todos los medios de pago">
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
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Medio de pago</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedOrders.map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  onProcesar={() => setSelectedOrderId(order.id)}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {!hasNoOrders && !hasNoResults && pageCount > 1 ? (
        <OrdersPagination
          page={safePage}
          pageCount={pageCount}
          onPageChange={setPage}
        />
      ) : null}

      {selectedOrder ? (
        <ProcessOrderDialog
          open={selectedOrderId !== null}
          onOpenChange={(open) => {
            if (!open) setSelectedOrderId(null)
          }}
          order={selectedOrder}
          onApprove={() => handleApprove(selectedOrder.id)}
          onCancel={(reason) => handleCancel(selectedOrder.id, reason)}
        />
      ) : null}
    </div>
  )
}

type OrderRowProps = {
  order: Order
  onProcesar: () => void
}

function OrderRow({ order, onProcesar }: OrderRowProps) {
  const shortId = order.id.slice(0, 8).toUpperCase()
  const paymentLabel =
    PAYMENT_METHODS.find((m) => m.id === order.paymentMethod)?.label ??
    order.paymentMethod

  return (
    <TableRow>
      <TableCell>
        <span className="font-mono text-xs text-muted-foreground uppercase">
          #{shortId}
        </span>
      </TableCell>
      <TableCell>
        <span className="font-medium">{order.userName}</span>
      </TableCell>
      <TableCell className="text-muted-foreground tabular-nums">
        {formatDateTime(order.createdAt)}
      </TableCell>
      <TableCell className="text-right font-medium tabular-nums">
        {formatCurrency(order.subtotal)}
      </TableCell>
      <TableCell>
        <Badge variant="outline">{paymentLabel}</Badge>
      </TableCell>
      <TableCell className="text-right">
        <Button type="button" size="sm" variant="outline" onClick={onProcesar}>
          Procesar pedido
          <IconArrowRight data-icon="inline-end" />
        </Button>
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
            className={
              page === 1 ? "pointer-events-none opacity-50" : undefined
            }
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
            className={
              page === pageCount ? "pointer-events-none opacity-50" : undefined
            }
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
            <IconInbox />
          </EmptyMedia>
          <EmptyTitle>No hay pedidos en análisis</EmptyTitle>
          <EmptyDescription>
            Cuando un cliente confirme un pedido va a aparecer acá.
          </EmptyDescription>
        </EmptyHeader>
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
