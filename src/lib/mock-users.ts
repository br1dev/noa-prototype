export type Role = "admin" | "cliente"

export type MockUser = {
  id: string
  name: string
  email: string
  password: string
  role: Role
}

export const MOCK_USERS: ReadonlyArray<MockUser> = [
  {
    id: "u-admin",
    name: "Admin NOA",
    email: "admin@noa.com",
    password: "admin123",
    role: "admin",
  },
  {
    id: "u-cliente",
    name: "Cliente Demo",
    email: "cliente@noa.com",
    password: "cliente123",
    role: "cliente",
  },
]

export const findMockUser = (
  email: string,
  password: string
): MockUser | undefined =>
  MOCK_USERS.find(
    (u) =>
      u.email.toLowerCase() === email.trim().toLowerCase() &&
      u.password === password
  )

export const homePathForRole = (role: Role): string =>
  role === "admin" ? "/admin" : "/catalogo"
