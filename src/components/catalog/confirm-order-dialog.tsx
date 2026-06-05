import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldLabel } from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Spinner } from "@/components/ui/spinner"
import { Separator } from "@/components/ui/separator"
import {
  checkOrderAgainstAccount,
  type Account,
  type AccountBlockReason,
} from "@/lib/accounts"
import { formatCurrency } from "@/lib/format"
import { PAYMENT_METHODS, type PaymentMethod } from "@/lib/payment-methods"
import { cn } from "@/lib/utils"

type ConfirmOrderDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  subtotal: number
  account: Account | undefined
  onConfirm: (paymentMethod: PaymentMethod) => void
  onBlocked: (result: { reason: AccountBlockReason; shortfall: number }) => void
}

export function ConfirmOrderDialog({
  open,
  onOpenChange,
  subtotal,
  account,
  onConfirm,
  onBlocked,
}: ConfirmOrderDialogProps) {
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("cuenta-corriente")
  const [submitting, setSubmitting] = useState(false)

  const handleConfirm = async () => {
    if (submitting) return
    if (account) {
      const result = checkOrderAgainstAccount(subtotal, account)
      if (!result.ok) {
        onBlocked({ reason: result.reason, shortfall: result.shortfall })
        return
      }
    }
    setSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 250))
    setSubmitting(false)
    onConfirm(paymentMethod)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar pedido</DialogTitle>
          <DialogDescription>
            Revisá el total y elegí cómo querés pagar.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-1 px-1">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-2xl font-semibold tabular-nums">
              {formatCurrency(subtotal)}
            </span>
          </div>
        </div>

        <Separator />

        <Field>
          <FieldLabel>Medio de pago</FieldLabel>
          <RadioGroup
            value={paymentMethod}
            onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
            className="gap-2"
          >
            {PAYMENT_METHODS.map((method) => {
              const id = `pay-${method.id}`
              return (
                <label
                  key={method.id}
                  htmlFor={id}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 transition-colors",
                    paymentMethod === method.id
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/40"
                  )}
                >
                  <RadioGroupItem id={id} value={method.id} />
                  <div className="flex flex-1 flex-col gap-0.5">
                    <span className="text-sm font-medium">{method.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {method.description}
                    </span>
                  </div>
                </label>
              )
            })}
          </RadioGroup>
        </Field>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={submitting}>
            {submitting ? (
              <>
                <Spinner data-icon="inline-start" />
                Confirmando…
              </>
            ) : (
              "Confirmar pedido"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
