import type { CategoryId } from "@/lib/categories"

export type Product = {
  id: string
  name: string
  category: CategoryId
  price: number
  unit: string
}

export const PRODUCTS: ReadonlyArray<Product> = [
  // Fiambres
  {
    id: "f-001",
    name: "Jamón cocido paleta",
    category: "fiambres",
    price: 12500,
    unit: "x kg",
  },
  {
    id: "f-002",
    name: "Jamón crudo estacionado",
    category: "fiambres",
    price: 24800,
    unit: "x kg",
  },
  {
    id: "f-003",
    name: "Salame Milano",
    category: "fiambres",
    price: 18200,
    unit: "x kg",
  },
  {
    id: "f-004",
    name: "Mortadela con pistacho",
    category: "fiambres",
    price: 9800,
    unit: "x kg",
  },
  {
    id: "f-005",
    name: "Panceta ahumada",
    category: "fiambres",
    price: 15600,
    unit: "x kg",
  },
  {
    id: "f-006",
    name: "Queso tybo en barra",
    category: "fiambres",
    price: 11200,
    unit: "x kg",
  },

  // Lácteos
  {
    id: "l-001",
    name: "Leche entera UAT",
    category: "lacteos",
    price: 1450,
    unit: "x 1L",
  },
  {
    id: "l-002",
    name: "Leche descremada UAT",
    category: "lacteos",
    price: 1380,
    unit: "x 1L",
  },
  {
    id: "l-003",
    name: "Yogurt bebible natural",
    category: "lacteos",
    price: 2100,
    unit: "x 1L",
  },
  {
    id: "l-004",
    name: "Queso crema untable",
    category: "lacteos",
    price: 5400,
    unit: "x kg",
  },
  {
    id: "l-005",
    name: "Manteca primera calidad",
    category: "lacteos",
    price: 9800,
    unit: "x kg",
  },
  {
    id: "l-006",
    name: "Dulce de leche repostero",
    category: "lacteos",
    price: 7200,
    unit: "x kg",
  },

  // Secos
  {
    id: "s-001",
    name: "Arroz largo fino",
    category: "secos",
    price: 2100,
    unit: "x 1kg",
  },
  {
    id: "s-002",
    name: "Fideos guiseros",
    category: "secos",
    price: 1800,
    unit: "x 500g",
  },
  {
    id: "s-003",
    name: "Aceite de girasol",
    category: "secos",
    price: 4500,
    unit: "x 1.5L",
  },
  {
    id: "s-004",
    name: "Azúcar común tipo A",
    category: "secos",
    price: 1900,
    unit: "x 1kg",
  },
  {
    id: "s-005",
    name: "Harina 0000",
    category: "secos",
    price: 1600,
    unit: "x 1kg",
  },
  {
    id: "s-006",
    name: "Lentejas secas",
    category: "secos",
    price: 3400,
    unit: "x 500g",
  },

  // Bebidas
  {
    id: "b-001",
    name: "Agua mineral sin gas",
    category: "bebidas",
    price: 1200,
    unit: "x 1.5L",
  },
  {
    id: "b-002",
    name: "Gaseosa cola",
    category: "bebidas",
    price: 2800,
    unit: "x 1.5L",
  },
  {
    id: "b-003",
    name: "Cerveza rubia lata",
    category: "bebidas",
    price: 1900,
    unit: "x 473ml",
  },
  {
    id: "b-004",
    name: "Vino tinto malbec",
    category: "bebidas",
    price: 6800,
    unit: "x 750ml",
  },
  {
    id: "b-005",
    name: "Jugo de naranja exprimido",
    category: "bebidas",
    price: 3200,
    unit: "x 1L",
  },
  {
    id: "b-006",
    name: "Energética citrus",
    category: "bebidas",
    price: 2400,
    unit: "x 500ml",
  },
]

export const findProduct = (id: string): Product | undefined =>
  PRODUCTS.find((p) => p.id === id)

export type ProductForm = Omit<Product, "id">
