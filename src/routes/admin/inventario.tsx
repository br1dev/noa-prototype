import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import {
  IconBox,
  IconCategory,
  IconPencil,
  IconReceipt,
  IconArrowsSort,
  IconTrash,
} from "@tabler/icons-react"

import { CategoryFilter } from "@/components/catalog/category-filter"
import { SearchInput } from "@/components/catalog/search-input"
import { DeleteProductDialog } from "@/components/admin/inventory/delete-product-dialog"
import { ProductFormDialog } from "@/components/admin/inventory/product-form-dialog"
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
import { type CategoryId, getCategory } from "@/lib/categories"
import { formatCurrency } from "@/lib/format"
import type { Product, ProductForm } from "@/lib/products"
import { useProductsStore } from "@/store/products"

const PAGE_SIZE = 10

type CategoryFilterValue = CategoryId | "all"

type FiltersState = {
  query: string
  category: CategoryFilterValue
  page: number
}

const INITIAL_FILTERS: FiltersState = {
  query: "",
  category: "all",
  page: 1,
}

type FormDialogMode = "add" | "edit"

export function AdminInventarioPage() {
  useEffect(() => {
    document.title = "Inventario · Distribuidora NOA"
  }, [])

  const products = useProductsStore((s) => s.products)
  const addProduct = useProductsStore((s) => s.addProduct)
  const updateProduct = useProductsStore((s) => s.updateProduct)
  const deleteProduct = useProductsStore((s) => s.deleteProduct)

  const [filters, setFilters] = useState<FiltersState>(INITIAL_FILTERS)
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deleteDialogProduct, setDeleteDialogProduct] =
    useState<Product | null>(null)

  const setQuery = (query: string) =>
    setFilters((prev) => ({ ...prev, query, page: 1 }))
  const setCategory = (category: CategoryFilterValue) =>
    setFilters((prev) => ({ ...prev, category, page: 1 }))
  const setPage = (page: number) => setFilters((prev) => ({ ...prev, page }))

  const filtered = useMemo(() => {
    const normalized = filters.query.trim().toLowerCase()
    return products.filter((product) => {
      if (filters.category !== "all" && product.category !== filters.category) {
        return false
      }
      if (!normalized) return true
      return (
        product.name.toLowerCase().includes(normalized) ||
        product.id.toLowerCase().includes(normalized)
      )
    })
  }, [products, filters.query, filters.category])

  const sorted = useMemo(
    () =>
      filtered.toSorted((a, b) => {
        const categoryOrder = a.category.localeCompare(b.category)
        if (categoryOrder !== 0) return categoryOrder
        return a.id.localeCompare(b.id)
      }),
    [filtered]
  )

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const safePage = Math.min(filters.page, pageCount)
  const pagedProducts = useMemo(
    () => sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [sorted, safePage]
  )

  const stats = useMemo(() => {
    const total = products.length
    const activeCategories = new Set(products.map((p) => p.category)).size
    if (total === 0) {
      return { total, activeCategories, avgPrice: 0, priceRange: null }
    }
    const prices = products.map((p) => p.price)
    const sum = prices.reduce((acc, price) => acc + price, 0)
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    return {
      total,
      activeCategories,
      avgPrice: Math.round(sum / total),
      priceRange: { min, max },
    }
  }, [products])

  const handleClearFilters = () => setFilters(INITIAL_FILTERS)

  const handleAddProduct = (input: ProductForm) => {
    const created = addProduct(input)
    setFormDialogOpen(false)
    setEditingProduct(null)
    toast.success("Producto agregado", {
      description: `Se creó con SKU #${created.id.toUpperCase()}.`,
    })
  }

  const handleEditProduct = (input: ProductForm) => {
    if (!editingProduct) return
    const id = editingProduct.id
    const updated = updateProduct(id, input)
    setFormDialogOpen(false)
    setEditingProduct(null)
    if (!updated) {
      toast.error("No se pudo editar el producto")
      return
    }
    toast.success("Producto actualizado", {
      description: `Se guardaron los cambios de «${updated.name}».`,
    })
  }

  const handleDeleteProduct = () => {
    if (!deleteDialogProduct) return
    const product = deleteDialogProduct
    const removed = deleteProduct(product.id)
    setDeleteDialogProduct(null)
    if (!removed) {
      toast.error("No se pudo eliminar el producto")
      return
    }
    toast.success("Producto eliminado", {
      description: `«${product.name}» se quitó del catálogo.`,
    })
  }

  const hasEmptyState = sorted.length === 0
  const hasSearchQuery =
    filters.query.trim().length > 0 || filters.category !== "all"
  const showPagination = !hasEmptyState && pageCount > 1

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-muted-foreground">
            <IconBox className="size-4" aria-hidden />
            <span className="text-xs tracking-wider uppercase">Inventario</span>
          </div>
          <h1 className="text-2xl font-medium tracking-tight">
            Catálogo de productos
          </h1>
          <p className="text-sm text-muted-foreground">
            Gestioná los productos que se muestran en el catálogo y que pueden
            pedir los clientes.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => {
            setEditingProduct(null)
            setFormDialogOpen(true)
          }}
        >
          <IconBox data-icon="inline-start" />
          Agregar producto
        </Button>
      </header>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<IconBox className="size-4" aria-hidden />}
          label="Total de productos"
          value={stats.total.toString()}
        />
        <StatCard
          icon={<IconCategory className="size-4" aria-hidden />}
          label="Categorías activas"
          value={stats.activeCategories.toString()}
        />
        <StatCard
          icon={<IconReceipt className="size-4" aria-hidden />}
          label="Precio promedio"
          value={formatCurrency(stats.avgPrice)}
        />
        <StatCard
          icon={<IconArrowsSort className="size-4" aria-hidden />}
          label="Rango de precios"
          value={
            stats.priceRange
              ? `${formatCurrency(stats.priceRange.min)} – ${formatCurrency(stats.priceRange.max)}`
              : "—"
          }
        />
      </section>

      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center">
        <SearchInput
          value={filters.query}
          onChange={setQuery}
          placeholder="Buscar por SKU o nombre…"
          ariaLabel="Buscar productos"
          className="sm:max-w-sm"
        />
        <CategoryFilter value={filters.category} onChange={setCategory} />
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
                <TableHead>SKU</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedProducts.map((product) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  onEdit={() => {
                    setEditingProduct(product)
                    setFormDialogOpen(true)
                  }}
                  onDelete={() => setDeleteDialogProduct(product)}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {showPagination ? (
        <ProductsPagination
          page={safePage}
          pageCount={pageCount}
          onPageChange={setPage}
        />
      ) : null}

      <ProductFormDialog
        key={editingProduct?.id ?? "new"}
        open={formDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setFormDialogOpen(false)
            setEditingProduct(null)
          }
        }}
        mode={editingProduct ? "edit" : ("add" as FormDialogMode)}
        product={editingProduct ?? undefined}
        onConfirm={editingProduct ? handleEditProduct : handleAddProduct}
      />

      <DeleteProductDialog
        open={deleteDialogProduct !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteDialogProduct(null)
        }}
        productName={deleteDialogProduct?.name ?? ""}
        productSku={deleteDialogProduct?.id.toUpperCase() ?? ""}
        onConfirm={handleDeleteProduct}
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

type ProductRowProps = {
  product: Product
  onEdit: () => void
  onDelete: () => void
}

function ProductRow({ product, onEdit, onDelete }: ProductRowProps) {
  const category = getCategory(product.category)
  const Icon = category.icon
  const shortId = product.id.toUpperCase()

  return (
    <TableRow>
      <TableCell>
        <span className="font-mono text-xs text-muted-foreground uppercase">
          #{shortId}
        </span>
      </TableCell>
      <TableCell>
        <div className="flex min-w-0 flex-col">
          <span className="font-medium">{product.name}</span>
          <span className="text-xs text-muted-foreground tabular-nums">
            {formatCurrency(product.price)} {product.unit}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="gap-1.5 font-normal">
          <Icon className="size-3.5" aria-hidden />
          {category.label}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            onClick={onEdit}
            aria-label={`Editar ${product.name}`}
          >
            <IconPencil />
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            onClick={onDelete}
            aria-label={`Eliminar ${product.name}`}
            className="text-destructive hover:text-destructive"
          >
            <IconTrash />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}

type ProductsPaginationProps = {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
}

function ProductsPagination({
  page,
  pageCount,
  onPageChange,
}: ProductsPaginationProps) {
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
    ? "No hay productos que coincidan con tu búsqueda o filtro. Probá limpiar los filtros."
    : "Hacé clic en «Agregar producto» para empezar a cargar el catálogo."

  return (
    <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border bg-card/30 px-6 py-16">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconBox />
          </EmptyMedia>
          <EmptyTitle>No hay productos en el catálogo</EmptyTitle>
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
