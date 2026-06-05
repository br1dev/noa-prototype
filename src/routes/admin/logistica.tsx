import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import {
  IconCheck,
  IconClipboardCheck,
  IconTruckDelivery,
  IconX,
} from "@tabler/icons-react"

import { SearchInput } from "@/components/catalog/search-input"
import { CancelDeliveryDialog } from "@/components/admin/orders/cancel-delivery-dialog"
import { RegisterDeliveryDialog } from "@/components/admin/orders/register-delivery-dialog"
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
import { useAccountsStore } from "@/lib/accounts"
import type { DeliveryPaymentMethod } from "@/lib/delivery-payment-methods"
import type { DeliveryCancelReason } from "@/lib/delivery-cancellation-reasons"
import { formatCurrency } from "@/lib/format"
import type { OrderStatusId } from "@/lib/order-status"
import { useOrdersStore, type Order } from "@/store/orders"
import { useDeliveriesStore } from "@/store/deliveries"

const PAGE_SIZE = 10

type StatusFilter = "en-proceso" | "cancelado" | "entregado"

const STATUS_FILTERS: ReadonlyArray<{ id: StatusFilter; label: string }> = [
  { id: "en-proceso", label: "En proceso" },
  { id: "cancelado", label: "Cancelados" },
  { id: "entregado", label: "Entregados" },
]

type FiltersState = {
  query: string
  status: StatusFilter
  page: number
}

const INITIAL_FILTERS: FiltersState = {
  query: "",
  status: "en-proceso",
  page: 1,
}

type EmptyFilterCopy = {
  title: string
  description: string
  icon: React.ReactNode
}

const FILTER_EMPTY_COPY: Readonly<Record<StatusFilter, EmptyFilterCopy>> = {
  "en-proceso": {
    title: "No hay entregas en proceso",
    description:
      "Cuando se apruebe un pedido desde Pedidos va a aparecer acá para gestionar la entrega.",
    icon: <IconTruckDelivery />,
  },
  cancelado: {
    title: "No hay entregas canceladas",
    description:
      "Las entregas que se cancelen desde Logística van a aparecer acá.",
    icon: <IconX />,
  },
  entregado: {
    title: "No hay entregas registradas",
    description: "Las entregas que se finalicen van a aparecer acá.",
    icon: <IconClipboardCheck />,
  },
}

export function AdminLogisticaPage() {
  useEffect(() => {
    document.title = "Logística · Distribuidora NOA"
  }, [])

  const orders = useOrdersStore((s) => s.orders)
  const updateOrder = useOrdersStore((s) => s.updateOrder)
  const createDelivery = useDeliveriesStore((s) => s.createDelivery)
  const createDeliveryCancellation = useDeliveriesStore(
    (s) => s.createDeliveryCancellation
  )
  const addDeliveryToDebt = useAccountsStore((s) => s.addDeliveryToDebt)

  const [filters, setFilters] = useState<FiltersState>(INITIAL_FILTERS)
  const [selectedCancelOrderId, setSelectedCancelOrderId] = useState<
    string | null
  >(null)
  const [selectedRegisterOrderId, setSelectedRegisterOrderId] = useState<
    string | null
  >(null)

  const setQuery = (query: string) =>
    setFilters((prev) => ({ ...prev, query, page: 1 }))
  const setStatus = (status: StatusFilter) =>
    setFilters((prev) => ({ ...prev, status, page: 1 }))
  const setPage = (page: number) => setFilters((prev) => ({ ...prev, page }))

  const scopedOrders = useMemo(
    () => orders.filter((o) => o.status === filters.status),
    [orders, filters.status]
  )

  const filtered = useMemo(() => {
    const normalized = filters.query.trim().toLowerCase()
    if (!normalized) return scopedOrders
    return scopedOrders.filter(
      (order) =>
        order.id.toLowerCase().includes(normalized) ||
        order.userName.toLowerCase().includes(normalized)
    )
  }, [scopedOrders, filters.query])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(filters.page, pageCount)
  const pagedOrders = useMemo(
    () => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filtered, safePage]
  )

  const selectedCancelOrder = useMemo<Order | null>(
    () => orders.find((o) => o.id === selectedCancelOrderId) ?? null,
    [orders, selectedCancelOrderId]
  )
  const selectedRegisterOrder = useMemo<Order | null>(
    () => orders.find((o) => o.id === selectedRegisterOrderId) ?? null,
    [orders, selectedRegisterOrderId]
  )

  const selectedRegisterAccountAvailableBalance = useMemo(() => {
    if (!selectedRegisterOrder) return 0
    const accounts = useAccountsStore.getState().accounts
    return accounts[selectedRegisterOrder.userId]?.availableBalance ?? 0
  }, [selectedRegisterOrder])

  const handleClearFilters = () => setFilters(INITIAL_FILTERS)

  const handleRegisterDelivery = (input: {
    paymentMethod: DeliveryPaymentMethod
    receivedAmount: number
    debtAmount: number
    observations?: string
  }) => {
    if (!selectedRegisterOrder) return
    const order = selectedRegisterOrder

    const updated = updateOrder(order.id, { status: "entregado" })
    if (!updated) {
      toast.error("No se pudo registrar la entrega", {
        description: "Es posible que el pedido ya no esté en proceso.",
      })
      return
    }

    createDelivery({
      orderId: order.id,
      userId: order.userId,
      paymentMethod: input.paymentMethod,
      receivedAmount: input.receivedAmount,
      debtAmount: input.debtAmount,
      observations: input.observations,
    })

    if (input.debtAmount > 0) {
      addDeliveryToDebt(order.userId, input.debtAmount)
    }

    setSelectedRegisterOrderId(null)
    toast.success("Entrega registrada")
  }

  const handleCancelDelivery = (input: {
    reason: DeliveryCancelReason
    observations: string
  }) => {
    if (!selectedCancelOrder) return
    const order = selectedCancelOrder
    const reasonLabel = DELIVERY_CANCEL_REASON_LABELS[input.reason]
    const fullReason = input.observations
      ? `${reasonLabel} — ${input.observations}`
      : reasonLabel

    const updated = updateOrder(order.id, {
      status: "cancelado",
      cancelReason: fullReason,
    })
    if (!updated) {
      toast.error("No se pudo cancelar la entrega", {
        description: "Es posible que el pedido ya no esté en proceso.",
      })
      return
    }

    createDeliveryCancellation({
      orderId: order.id,
      userId: order.userId,
      reason: input.reason,
      observations: input.observations || undefined,
    })

    setSelectedCancelOrderId(null)
    toast.success("Entrega cancelada", {
      description: "Se guardó el motivo.",
    })
  }

  const hasEmptyState = filtered.length === 0
  const hasSearchQuery = filters.query.trim().length > 0
  const showPagination = !hasEmptyState && pageCount > 1

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6">
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-muted-foreground">
          <IconTruckDelivery className="size-4" aria-hidden />
          <span className="text-xs tracking-wider uppercase">Logística</span>
        </div>
        <h1 className="font-heading text-[1.65rem] font-semibold tracking-tight">
          Gestión de entregas
        </h1>
        <p className="text-sm text-muted-foreground">
          Registrá entregas o cancelaciones de los pedidos en proceso.
        </p>
      </header>

      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center">
        <SearchInput
          value={filters.query}
          onChange={setQuery}
          placeholder="Buscar por ID o cliente…"
          ariaLabel="Buscar entregas"
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
          {STATUS_FILTERS.map((opt) => (
            <ToggleGroupItem key={opt.id} value={opt.id} aria-label={opt.label}>
              {opt.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {hasEmptyState ? (
        <NoFilterResultsEmptyState
          onClear={handleClearFilters}
          status={filters.status}
          hasSearchQuery={hasSearchQuery}
        />
      ) : (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Dirección</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedOrders.map((order) => (
                <LogisticsOrderRow
                  key={order.id}
                  order={order}
                  onCancelar={() => setSelectedCancelOrderId(order.id)}
                  onRegistrarEntrega={() =>
                    setSelectedRegisterOrderId(order.id)
                  }
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {showPagination ? (
        <LogisticsPagination
          page={safePage}
          pageCount={pageCount}
          onPageChange={setPage}
        />
      ) : null}

      {selectedCancelOrder ? (
        <CancelDeliveryDialog
          open={selectedCancelOrderId !== null}
          onOpenChange={(open) => {
            if (!open) setSelectedCancelOrderId(null)
          }}
          shortId={selectedCancelOrder.id.slice(0, 8).toUpperCase()}
          clientName={selectedCancelOrder.userName}
          onConfirm={handleCancelDelivery}
        />
      ) : null}

      {selectedRegisterOrder ? (
        <RegisterDeliveryDialog
          open={selectedRegisterOrderId !== null}
          onOpenChange={(open) => {
            if (!open) setSelectedRegisterOrderId(null)
          }}
          shortId={selectedRegisterOrder.id.slice(0, 8).toUpperCase()}
          clientName={selectedRegisterOrder.userName}
          deliveryAddress={selectedRegisterOrder.deliveryAddress}
          subtotal={selectedRegisterOrder.subtotal}
          availableBalance={selectedRegisterAccountAvailableBalance}
          orderIsCtaCte={
            selectedRegisterOrder.paymentMethod === "cuenta-corriente"
          }
          onConfirm={handleRegisterDelivery}
        />
      ) : null}
    </div>
  )
}

const DELIVERY_CANCEL_REASON_LABELS: Readonly<
  Record<DeliveryCancelReason, string>
> = {
  "cliente-ausente": "Cliente ausente",
  "direccion-incorrecta": "Dirección incorrecta",
  "producto-danado": "Producto en mal estado",
  rechazado: "Cliente rechazó el pedido",
  duplicado: "Pedido duplicado",
  otro: "Otro motivo",
}

type LogisticsOrderRowProps = {
  order: Order
  onCancelar: () => void
  onRegistrarEntrega: () => void
}

function LogisticsOrderRow({
  order,
  onCancelar,
  onRegistrarEntrega,
}: LogisticsOrderRowProps) {
  const shortId = order.id.slice(0, 8).toUpperCase()
  const status = getStatusBadge(order.status)
  const inProcess = order.status === "en-proceso"

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
      <TableCell>
        <span
          className="block max-w-[260px] truncate text-sm text-muted-foreground"
          title={order.deliveryAddress ?? undefined}
        >
          {order.deliveryAddress ?? "—"}
        </span>
      </TableCell>
      <TableCell className="text-right font-medium tabular-nums">
        {formatCurrency(order.subtotal)}
      </TableCell>
      <TableCell>
        <Badge variant={status.variant}>{status.label}</Badge>
      </TableCell>
      <TableCell className="text-right">
        {inProcess ? (
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={onCancelar}
              className="text-destructive hover:text-destructive"
            >
              Cancelar
            </Button>
            <Button type="button" size="sm" onClick={onRegistrarEntrega}>
              <IconCheck data-icon="inline-end" />
              Registrar entrega
            </Button>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        )}
      </TableCell>
    </TableRow>
  )
}

function getStatusBadge(status: OrderStatusId): {
  label: string
  variant: "default" | "secondary" | "destructive" | "outline"
} {
  switch (status) {
    case "en-proceso":
      return { label: "En proceso", variant: "default" }
    case "entregado":
      return { label: "Entregado", variant: "outline" }
    case "cancelado":
      return { label: "Cancelado", variant: "destructive" }
    case "en-analisis":
      return { label: "En análisis", variant: "secondary" }
  }
}

type LogisticsPaginationProps = {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
}

function LogisticsPagination({
  page,
  pageCount,
  onPageChange,
}: LogisticsPaginationProps) {
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

type NoFilterResultsEmptyStateProps = {
  onClear: () => void
  status: StatusFilter
  hasSearchQuery: boolean
}

function NoFilterResultsEmptyState({
  onClear,
  status,
  hasSearchQuery,
}: NoFilterResultsEmptyStateProps) {
  const copy = FILTER_EMPTY_COPY[status]
  const description = hasSearchQuery
    ? "No hay entregas que coincidan con tu búsqueda. Probá limpiar los filtros."
    : copy.description

  return (
    <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border bg-card/30 px-6 py-12">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">{copy.icon}</EmptyMedia>
          <EmptyTitle>{copy.title}</EmptyTitle>
          <EmptyDescription>{description}</EmptyDescription>
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
