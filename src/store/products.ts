import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

import { PRODUCTS, type Product, type ProductForm } from "@/lib/products"
import type { CategoryId } from "@/lib/categories"

type ProductsState = {
  products: Product[]
  addProduct: (input: ProductForm) => Product
  updateProduct: (id: string, input: ProductForm) => Product | undefined
  deleteProduct: (id: string) => boolean
}

const CATEGORY_PREFIX: Readonly<Record<CategoryId, string>> = {
  fiambres: "f",
  lacteos: "l",
  secos: "s",
  bebidas: "b",
}

const generateSku = (
  products: ReadonlyArray<Product>,
  category: CategoryId
): string => {
  const prefix = CATEGORY_PREFIX[category]
  const correlativeRegex = new RegExp(`^${prefix}-(\\d+)$`)
  const max = products.reduce((acc, product) => {
    const match = product.id.match(correlativeRegex)
    if (!match) return acc
    const num = Number.parseInt(match[1], 10)
    return Number.isNaN(num) ? acc : Math.max(acc, num)
  }, 0)
  return `${prefix}-${String(max + 1).padStart(3, "0")}`
}

export const useProductsStore = create<ProductsState>()(
  persist(
    (set) => ({
      products: [...PRODUCTS],
      addProduct: (input) => {
        const product: Product = { id: "", ...input }
        let created: Product | undefined
        set((state) => {
          const id = generateSku(state.products, input.category)
          product.id = id
          created = product
          return { products: [product, ...state.products] }
        })
        return created!
      },
      updateProduct: (id, input) => {
        let updated: Product | undefined
        set((state) => ({
          products: state.products.map((product) => {
            if (product.id !== id) return product
            updated = { ...product, ...input }
            return updated
          }),
        }))
        return updated
      },
      deleteProduct: (id) => {
        let removed = false
        set((state) => {
          const next = state.products.filter((product) => product.id !== id)
          removed = next.length < state.products.length
          return { products: next }
        })
        return removed
      },
    }),
    {
      name: "noa-products",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ products: state.products }),
    }
  )
)

export const selectByCategory = (
  products: ReadonlyArray<Product>,
  category: CategoryId | "all"
): Product[] =>
  category === "all"
    ? [...products]
    : products.filter((p) => p.category === category)
