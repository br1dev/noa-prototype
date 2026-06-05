import { useEffect } from "react"
import { Link, Navigate, useLocation, type Location } from "react-router"
import { IconBuildingWarehouse } from "@tabler/icons-react"

import { LoginForm } from "@/components/auth/login-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useAuthStore } from "@/store/auth"
import { useAuthHydration } from "@/store/use-auth-hydration"
import { homePathForRole } from "@/lib/mock-users"
import { LOGIN_DEMO_USER_IDS, MOCK_USERS } from "@/mocks/users"

type LocationState = { from?: Location }

export function LoginPage() {
  const hydrated = useAuthHydration()
  const user = useAuthStore((s) => s.user)
  const location = useLocation()

  const from = (location.state as LocationState | null)?.from?.pathname

  useEffect(() => {
    document.title = "Ingresar · Distribuidora NOA"
  }, [])

  if (hydrated && user) {
    return <Navigate to={from ?? homePathForRole(user.role)} replace />
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2 text-sm font-medium tracking-tight text-foreground">
          <IconBuildingWarehouse className="size-5 text-primary" aria-hidden />
          Distribuidora NOA
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Acceso mayorista</CardTitle>
            <CardDescription>
              Iniciá sesión con tu cuenta habilitada para operar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>

        <div className="mt-6 rounded-lg border border-dashed border-border bg-card/50 p-3 text-xs text-muted-foreground">
          <p className="mb-2 font-medium text-foreground">
            Credenciales de prueba
          </p>
          <ul className="flex flex-col gap-1.5">
            {MOCK_USERS.filter((u) =>
              LOGIN_DEMO_USER_IDS.includes(u.id)
            ).map((u) => (
              <li
                key={u.id}
                className="flex flex-col gap-0.5 font-mono text-[11px] leading-tight"
              >
                <span>
                  <span className="text-foreground">{u.email}</span>
                  <span className="mx-1.5 text-border">·</span>
                  <span>{u.password}</span>
                </span>
                <span className="text-muted-foreground/80">
                  → {u.role === "admin" ? "Panel de control" : "Catálogo"}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <Separator className="my-6" />

        <p className="text-center text-xs text-muted-foreground">
          ¿Problemas para ingresar?{" "}
          <Link
            to="#"
            className="text-foreground underline-offset-4 hover:underline"
          >
            Contactá a tu vendedor
          </Link>
        </p>
      </div>
    </div>
  )
}
