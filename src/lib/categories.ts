import {
  IconBottle,
  IconBox,
  IconMeat,
  IconMilk,
  type Icon,
} from "@tabler/icons-react"

export type CategoryId = "fiambres" | "lacteos" | "secos" | "bebidas"

export type Category = {
  id: CategoryId
  label: string
  icon: Icon
}

export const CATEGORIES: ReadonlyArray<Category> = [
  { id: "fiambres", label: "Fiambres", icon: IconMeat },
  { id: "lacteos", label: "Lácteos", icon: IconMilk },
  { id: "secos", label: "Secos", icon: IconBox },
  { id: "bebidas", label: "Bebidas", icon: IconBottle },
]

export const getCategory = (id: CategoryId): Category => {
  const found = CATEGORIES.find((c) => c.id === id)
  if (!found) {
    throw new Error(`Unknown category: ${id}`)
  }
  return found
}
