import { Navigate, Route, Routes } from "react-router"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { LoginPage } from "@/routes/login"
import { CatalogPage } from "@/routes/catalog"
import { AdminPage } from "@/routes/admin"
import { useAuthStore } from "@/store/auth"
import { useAuthHydration } from "@/store/use-auth-hydration"
import { homePathForRole } from "@/lib/mock-users"

function RootRedirect() {
  const hydrated = useAuthHydration()
  const user = useAuthStore((s) => s.user)

  if (!hydrated) {
    return null
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Navigate to={homePathForRole(user.role)} replace />
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/catalogo"
        element={
          <ProtectedRoute requiredRole="cliente">
            <CatalogPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
