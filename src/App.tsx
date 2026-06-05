import { Navigate, Route, Routes } from "react-router"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { AdminShell } from "@/components/layout/admin-shell"
import { LoginPage } from "@/routes/login"
import { CatalogPage } from "@/routes/catalog"
import { OrdersPage } from "@/routes/orders"
import { AdminClientesPage } from "@/routes/admin/clientes"
import { AdminDashboardPage } from "@/routes/admin/index"
import { AdminInventarioPage } from "@/routes/admin/inventario"
import { AdminLogisticaPage } from "@/routes/admin/logistica"
import { AdminPedidosPage } from "@/routes/admin/pedidos"
import { AdminReportesPage } from "@/routes/admin/reportes"
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
        path="/pedidos"
        element={
          <ProtectedRoute requiredRole="cliente">
            <OrdersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="pedidos" element={<AdminPedidosPage />} />
        <Route path="inventario" element={<AdminInventarioPage />} />
        <Route path="clientes" element={<AdminClientesPage />} />
        <Route path="logistica" element={<AdminLogisticaPage />} />
        <Route path="reportes" element={<AdminReportesPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
