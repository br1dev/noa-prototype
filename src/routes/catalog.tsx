import { useEffect, useMemo, useState } from "react"

import { ClientShell } from "@/components/layout/client-shell"
import { CartSummary } from "@/components/catalog/cart-summary"
import { CategoryFilter } from "@/components/catalog/category-filter"
import { ProductCard } from "@/components/catalog/product-card"
import { SearchInput } from "@/components/catalog/search-input"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { IconSearch } from "@tabler/icons-react"
import { useProductsStore } from "@/store/products"
import type { CategoryId } from "@/lib/categories"

export function CatalogPage() {
  useEffect(() => {
    document.title = "Catálogo · Distribuidora NOA"
  }, [])

  const products = useProductsStore((s) => s.products)
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<CategoryId | "all">("all")

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return products.filter((product) => {
      const matchesCategory =
        category === "all" ? true : product.category === category
      if (!matchesCategory) return false
      if (!normalized) return true
      return product.name.toLowerCase().includes(normalized)
    })
  }, [products, query, category])

  return (
    <ClientShell>
      <div className="grid h-full min-h-0 grid-cols-1 lg:grid-cols-[1fr_22rem]">
        <section className="flex min-h-0 flex-col gap-5 overflow-y-auto p-6">
          <header className="flex flex-col gap-3">
            <h1 className="text-2xl font-medium tracking-tight">Catálogo</h1>
            <p className="text-sm text-muted-foreground">
              Sumá productos a tu pedido. Aplican condiciones mayoristas.
            </p>
          </header>

          <div className="flex flex-col gap-3">
            <SearchInput value={query} onChange={setQuery} />
            <CategoryFilter value={category} onChange={setCategory} />
          </div>

          {filtered.length === 0 ? (
            <NoResults
              hasQuery={query.trim().length > 0}
              onReset={() => {
                setQuery("")
                setCategory("all")
              }}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        <CartSummary />
      </div>
    </ClientShell>
  )
}

type NoResultsProps = {
  hasQuery: boolean
  onReset: () => void
}

function NoResults({ hasQuery, onReset }: NoResultsProps) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconSearch />
        </EmptyMedia>
        <EmptyTitle>No encontramos productos</EmptyTitle>
        <EmptyDescription>
          {hasQuery
            ? "Probá con otro término o cambiá la categoría."
            : "No hay productos en esta categoría."}
        </EmptyDescription>
      </EmptyHeader>
      <button
        type="button"
        onClick={onReset}
        className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
      >
        Limpiar filtros
      </button>
    </Empty>
  )
}
