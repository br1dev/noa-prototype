import { useState } from "react"
import {
  IconAlertTriangle,
  IconCheck,
  IconRefresh,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { resetDemoData } from "@/mocks/reset"

type ResetDemoDataDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const RESET_TARGETS: ReadonlyArray<string> = [
  "Pedidos",
  "Entregas",
  "Cierres de caja",
  "Cuentas de clientes",
  "Productos del inventario",
  "Carrito",
]

export function ResetDemoDataDialog({
  open,
  onOpenChange,
}: ResetDemoDataDialogProps) {
  const [pending, setPending] = useState(false)

  const handleOpenChange = (next: boolean) => {
    if (pending) return
    onOpenChange(next)
  }

  const handleConfirm = () => {
    if (pending) return
    setPending(true)
    resetDemoData()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div
              className="flex size-8 items-center justify-center rounded-full bg-destructive/10 text-destructive"
              aria-hidden
            >
              <IconAlertTriangle className="size-4" />
            </div>
            <DialogTitle>¿Restaurar los datos de demo?</DialogTitle>
          </div>
          <DialogDescription>
            Se van a borrar los datos del almacenamiento local y se cargarán
            nuevamente los datos de ejemplo. Tu sesión seguirá activa.
          </DialogDescription>
        </DialogHeader>

        <ul className="rounded-lg border border-dashed border-border bg-muted/30 p-3 text-sm">
          {RESET_TARGETS.map((label) => (
            <li
              key={label}
              className="flex items-center gap-2 py-1 text-muted-foreground"
            >
              <IconCheck
                className="size-3.5 text-primary"
                aria-hidden
              />
              <span>{label}</span>
            </li>
          ))}
        </ul>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => handleOpenChange(false)}
            disabled={pending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={pending}
          >
            <IconRefresh data-icon="inline-start" />
            {pending ? "Restaurando…" : "Sí, restaurar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
