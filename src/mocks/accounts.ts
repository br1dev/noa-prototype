import type { Account } from "@/lib/accounts"

export const INITIAL_ACCOUNTS: Readonly<Record<string, Account>> = {
  "u-cliente": {
    creditLimit: 50_000,
    currentDebt: 12_400,
    availableBalance: 37_600,
    defaultAddress: "Av. Paraguay 2150, Salta Capital",
  },
  "u-cliente-2": {
    creditLimit: 80_000,
    currentDebt: 32_500,
    availableBalance: 47_500,
    defaultAddress: "Av. San Martín 350, Salta Capital",
  },
  "u-cliente-3": {
    creditLimit: 120_000,
    currentDebt: 0,
    availableBalance: 120_000,
    defaultAddress: "Calle Belgrano 825, San Salvador de Jujuy",
  },
  "u-cliente-4": {
    creditLimit: 25_000,
    currentDebt: 24_800,
    availableBalance: 200,
    defaultAddress: "Av. Las Heras 412, Salta Capital",
  },
  "u-cliente-5": {
    creditLimit: 200_000,
    currentDebt: 0,
    availableBalance: 200_000,
    defaultAddress: "Calle Mitre 1180, San Miguel de Tucumán",
  },
  "u-cliente-6": {
    creditLimit: 60_000,
    currentDebt: 8_200,
    availableBalance: 51_800,
    defaultAddress: "Calle Urquiza 540, Salta Capital",
  },
  "u-cliente-7": {
    creditLimit: 90_000,
    currentDebt: 71_400,
    availableBalance: 18_600,
    defaultAddress: "Av. Independencia 980, San Salvador de Jujuy",
  },
  "u-cliente-8": {
    creditLimit: 45_000,
    currentDebt: 0,
    availableBalance: 45_000,
    defaultAddress: "Calle 9 de Julio 1220, San Miguel de Tucumán",
  },
}
