import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

import { findMockUser, type Role, type MockUser } from "@/lib/mock-users"

type AuthUser = Pick<MockUser, "id" | "name" | "email" | "role">

type LoginResult = { ok: true; role: Role } | { ok: false; error: string }

type AuthState = {
  user: AuthUser | null
  _hasHydrated: boolean
  login: (email: string, password: string) => Promise<LoginResult>
  logout: () => void
  setHasHydrated: (value: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      _hasHydrated: false,
      login: async (email, password) => {
        await new Promise((resolve) => setTimeout(resolve, 350))

        const found = findMockUser(email, password)
        if (!found) {
          return { ok: false, error: "Email o contraseña incorrectos." }
        }

        const { id, name, email: userEmail, role } = found
        set({ user: { id, name, email: userEmail, role } })
        return { ok: true, role }
      },
      logout: () => set({ user: null }),
      setHasHydrated: (value) => set({ _hasHydrated: value }),
    }),
    {
      name: "noa-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
