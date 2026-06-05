import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import {
  IconAlertCircle,
  IconArrowRight,
  IconCheck,
  IconUsers,
  IconWallet,
} from "@tabler/icons-react"

import { SearchInput } from "@/components/catalog/search-input"
import { ClientDetailDialog } from "@/components/admin/clients/client-detail-dialog"
import { EditCreditLimitDialog } from "@/components/admin/clients/edit-credit-limit-dialog"
import {
  RecordMovementDialog,
  type MovementType,
} from "@/components/admin/clients/record-movement-dialog"
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
import { useAccountsStore, type Account } from "@/lib/accounts"
import { formatCurrency } from "@/lib/format"
import { getInitials } from "@/lib/initials"
import { MOCK_USERS, type MockUser } from "@/lib/mock-users"

const PAGE_SIZE = 10

type StatusFilter = "all" | "al-dia" | "con-deuda"

const STATUS_FILTERS: ReadonlyArray<{ id: StatusFilter; label: string }> = [
  { id: "all", label: "Todos" },
  { id: "al-dia", label: "Al día" },
  { id: "con-deuda", label: "Con deuda" },
]

type FiltersState = {
  query: string
  status: StatusFilter
  page: number
}

const INITIAL_FILTERS: FiltersState = {
  query: "",
  status: "all",
  page: 1,
}

type ClientRow = {
  user: MockUser
  account: Account
}

export function AdminClientesPage() {
  useEffect(() => {
    document.title = "Clientes · Distribuidora NOA"
  }, [])

  const accountsMap = useAccountsStore((s) => s.accounts)
  const setCreditLimit = useAccountsStore((s) => s.setCreditLimit)
  const addDebt = useAccountsStore((s) => s.addDebt)
  const registerPayment = useAccountsStore((s) => s.registerPayment)

  const [filters, setFilters] = useState<FiltersState>(INITIAL_FILTERS)
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [editingCreditLimitUserId, setEditingCreditLimitUserId] = useState<
    string | null
  >(null)
  const [recordingMovementUserId, setRecordingMovementUserId] = useState<
    string | null
  >(null)

  const setQuery = (query: string) =>
    setFilters((prev) => ({ ...prev, query, page: 1 }))
  const setStatus = (status: StatusFilter) =>
    setFilters((prev) => ({ ...prev, status, page: 1 }))
  const setPage = (page: number) => setFilters((prev) => ({ ...prev, page }))

  const allClients = useMemo<ClientRow[]>(
    () =>
      MOCK_USERS.filter((user) => user.role === "cliente")
        .map((user) => {
          const account = accountsMap[user.id]
          return account ? { user, account } : null
        })
        .filter((row): row is ClientRow => row !== null)
        .toSorted((a, b) => a.user.name.localeCompare(b.user.name, "es-AR")),
    [accountsMap]
  )

  const filtered = useMemo(() => {
    const normalized = filters.query.trim().toLowerCase()
    return allClients.filter(({ user, account }) => {
      if (filters.status === "al-dia" && account.currentDebt > 0) return false
      if (filters.status === "con-deuda" && account.currentDebt === 0)
        return false
      if (!normalized) return true
      return (
        user.name.toLowerCase().includes(normalized) ||
        user.email.toLowerCase().includes(normalized)
      )
    })
  }, [allClients, filters.query, filters.status])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(filters.page, pageCount)
  const pagedClients = useMemo(
    () => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filtered, safePage]
  )

  const stats = useMemo(() => {
    const total = allClients.length
    const conDeuda = allClients.filter(
      ({ account }) => account.currentDebt > 0
    ).length
    const alDia = total - conDeuda
    const deudaTotal = allClients.reduce(
      (acc, { account }) => acc + account.currentDebt,
      0
    )
    return { total, alDia, conDeuda, deudaTotal }
  }, [allClients])

  const selectedClient = useMemo<ClientRow | null>(
    () => allClients.find(({ user }) => user.id === selectedClientId) ?? null,
    [allClients, selectedClientId]
  )
  const editingCreditLimitClient = useMemo<ClientRow | null>(
    () =>
      allClients.find(({ user }) => user.id === editingCreditLimitUserId) ??
      null,
    [allClients, editingCreditLimitUserId]
  )
  const recordingMovementClient = useMemo<ClientRow | null>(
    () =>
      allClients.find(({ user }) => user.id === recordingMovementUserId) ??
      null,
    [allClients, recordingMovementUserId]
  )

  const handleClearFilters = () => setFilters(INITIAL_FILTERS)

  const handleSetCreditLimit = (userId: string, newLimit: number) => {
    const client = allClients.find(({ user }) => user.id === userId)
    setCreditLimit(userId, newLimit)
    setEditingCreditLimitUserId(null)
    toast.success("Límite de crédito actualizado", {
      description: client
        ? `«${client.user.name}»: nuevo límite ${formatCurrency(newLimit)}.`
        : undefined,
    })
  }

  const handleRecordMovement = (
    userId: string,
    input: { type: MovementType; amount: number }
  ) => {
    const client = allClients.find(({ user }) => user.id === userId)
    if (input.type === "nueva-deuda") {
      addDebt(userId, input.amount)
    } else {
      registerPayment(userId, input.amount)
    }
    setRecordingMovementUserId(null)
    toast.success(
      input.type === "nueva-deuda" ? "Deuda registrada" : "Pago registrado",
      {
        description: client
          ? `«${client.user.name}»: ${formatCurrency(input.amount)}.`
          : undefined,
      }
    )
  }

  const hasEmptyState = filtered.length === 0
  const hasSearchQuery =
    filters.query.trim().length > 0 || filters.status !== "all"
  const showPagination = !hasEmptyState && pageCount > 1

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6">
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-muted-foreground">
          <IconUsers className="size-4" aria-hidden />
          <span className="text-xs tracking-wider uppercase">Clientes</span>
        </div>
        <h1 className="text-2xl font-medium tracking-tight">
          Gestión de clientes
        </h1>
        <p className="text-sm text-muted-foreground">
          Listado de clientes registrados con su cuenta corriente, saldos
          disponibles y límites de crédito.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<IconUsers className="size-4" aria-hidden />}
          label="Total de clientes"
          value={stats.total.toString()}
        />
        <StatCard
          icon={<IconCheck className="size-4" aria-hidden />}
          label="Al día"
          value={stats.alDia.toString()}
        />
        <StatCard
          icon={<IconAlertCircle className="size-4" aria-hidden />}
          label="Con deuda"
          value={stats.conDeuda.toString()}
        />
        <StatCard
          icon={<IconWallet className="size-4" aria-hidden />}
          label="Deuda total"
          value={formatCurrency(stats.deudaTotal)}
        />
      </section>

      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center">
        <SearchInput
          value={filters.query}
          onChange={setQuery}
          placeholder="Buscar por nombre o email…"
          ariaLabel="Buscar clientes"
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
          aria-label="Filtrar por estado de cuenta"
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
          hasFilters={hasSearchQuery}
        />
      ) : (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead className="text-right">Límite</TableHead>
                <TableHead className="text-right">Deuda</TableHead>
                <TableHead className="text-right">Saldo disponible</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedClients.map(({ user, account }) => (
                <ClientRow
                  key={user.id}
                  user={user}
                  account={account}
                  onOpen={() => setSelectedClientId(user.id)}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {showPagination ? (
        <ClientsPagination
          page={safePage}
          pageCount={pageCount}
          onPageChange={setPage}
        />
      ) : null}

      <ClientDetailDialog
        key={selectedClientId ? `detail-${selectedClientId}` : "detail-none"}
        open={selectedClientId !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedClientId(null)
        }}
        clientName={selectedClient?.user.name ?? ""}
        clientEmail={selectedClient?.user.email ?? ""}
        account={
          selectedClient?.account ?? {
            creditLimit: 0,
            currentDebt: 0,
            availableBalance: 0,
            defaultAddress: "",
          }
        }
        onEditCreditLimit={() => {
          if (selectedClient) {
            setEditingCreditLimitUserId(selectedClient.user.id)
          }
        }}
        onRecordMovement={() => {
          if (selectedClient) {
            setRecordingMovementUserId(selectedClient.user.id)
          }
        }}
      />

      <EditCreditLimitDialog
        key={
          editingCreditLimitUserId
            ? `credit-${editingCreditLimitUserId}`
            : "credit-none"
        }
        open={editingCreditLimitUserId !== null}
        onOpenChange={(open) => {
          if (!open) setEditingCreditLimitUserId(null)
        }}
        clientName={editingCreditLimitClient?.user.name ?? ""}
        account={
          editingCreditLimitClient?.account ?? {
            creditLimit: 0,
            currentDebt: 0,
            availableBalance: 0,
            defaultAddress: "",
          }
        }
        onConfirm={(newLimit) => {
          if (editingCreditLimitClient) {
            handleSetCreditLimit(editingCreditLimitClient.user.id, newLimit)
          }
        }}
      />

      <RecordMovementDialog
        key={
          recordingMovementUserId
            ? `movement-${recordingMovementUserId}`
            : "movement-none"
        }
        open={recordingMovementUserId !== null}
        onOpenChange={(open) => {
          if (!open) setRecordingMovementUserId(null)
        }}
        clientName={recordingMovementClient?.user.name ?? ""}
        account={
          recordingMovementClient?.account ?? {
            creditLimit: 0,
            currentDebt: 0,
            availableBalance: 0,
            defaultAddress: "",
          }
        }
        onConfirm={(input) => {
          if (recordingMovementClient) {
            handleRecordMovement(recordingMovementClient.user.id, input)
          }
        }}
      />
    </div>
  )
}

type StatCardProps = {
  icon: React.ReactNode
  label: string
  value: string
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
      <div
        className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground"
        aria-hidden
      >
        {icon}
      </div>
      <div className="flex min-w-0 flex-col">
        <span className="text-xs tracking-wider text-muted-foreground uppercase">
          {label}
        </span>
        <span className="truncate text-lg font-semibold tabular-nums">
          {value}
        </span>
      </div>
    </div>
  )
}

type ClientRowProps = {
  user: MockUser
  account: Account
  onOpen: () => void
}

function ClientRow({ user, account, onOpen }: ClientRowProps) {
  const hasDebt = account.currentDebt > 0
  const initials = getInitials(user.name)

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
      aria-label={`Ver detalles de ${user.name}`}
    >
      <TableCell>
        <div className="flex items-center gap-3">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary"
            aria-hidden
          >
            {initials}
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-medium">{user.name}</span>
            <span className="truncate text-xs text-muted-foreground">
              {user.email}
            </span>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-right font-medium tabular-nums">
        {formatCurrency(account.creditLimit)}
      </TableCell>
      <TableCell className="text-right tabular-nums">
        <span
          className={hasDebt ? "text-destructive" : "text-muted-foreground"}
        >
          {formatCurrency(account.currentDebt)}
        </span>
      </TableCell>
      <TableCell className="text-right font-medium tabular-nums">
        {formatCurrency(account.availableBalance)}
      </TableCell>
      <TableCell className="text-right">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation()
            onOpen()
          }}
        >
          Ver
          <IconArrowRight data-icon="inline-end" />
        </Button>
      </TableCell>
    </TableRow>
  )
}

type ClientsPaginationProps = {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
}

function ClientsPagination({
  page,
  pageCount,
  onPageChange,
}: ClientsPaginationProps) {
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
  hasFilters: boolean
}

function NoFilterResultsEmptyState({
  onClear,
  hasFilters,
}: NoFilterResultsEmptyStateProps) {
  const description = hasFilters
    ? "No hay clientes que coincidan con tu búsqueda o filtro. Probá limpiar los filtros."
    : "No hay clientes registrados en el sistema."

  return (
    <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border bg-card/30 px-6 py-16">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconUsers />
          </EmptyMedia>
          <EmptyTitle>No hay clientes para mostrar</EmptyTitle>
          <EmptyDescription>{description}</EmptyDescription>
        </EmptyHeader>
        {hasFilters ? (
          <EmptyContent>
            <Button type="button" variant="outline" onClick={onClear}>
              Limpiar filtros
            </Button>
          </EmptyContent>
        ) : null}
      </Empty>
    </div>
  )
}
