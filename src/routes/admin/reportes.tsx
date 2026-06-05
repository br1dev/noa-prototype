import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

import { CashClosingDetail } from "@/components/admin/reports/cash-closing-detail"
import { GenerateClosingDialog } from "@/components/admin/reports/generate-closing-dialog"
import { NoClosingEmptyState } from "@/components/admin/reports/no-closing-empty-state"
import { ReportHeader } from "@/components/admin/reports/report-header"
import { Badge } from "@/components/ui/badge"
import {
  computeClosingForDate,
  isSameLocalDay,
  isWithinClosingWindow,
  shiftDate,
  toLocalDateKey,
  yesterdayInArgentina,
} from "@/lib/cash-closing"
import {
  useCashClosingsStore,
  selectClosingByDate,
} from "@/store/cash-closings"
import { useDeliveriesStore } from "@/store/deliveries"
import { useOrdersStore } from "@/store/orders"

const RECENT_CLOSINGS_LIMIT = 6

export function AdminReportesPage() {
  useEffect(() => {
    document.title = "Reportes · Distribuidora NOA"
  }, [])

  const deliveries = useDeliveriesStore((s) => s.deliveries)
  const orders = useOrdersStore((s) => s.orders)
  const closings = useCashClosingsStore((s) => s.closings)
  const createClosing = useCashClosingsStore((s) => s.createClosing)

  const [selectedDate, setSelectedDate] = useState<Date>(() =>
    yesterdayInArgentina()
  )
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [now, setNow] = useState<Date>(() => new Date())

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(interval)
  }, [])

  const maxDate = useMemo(() => yesterdayInArgentina(now), [now])
  const canGoNext = !isSameLocalDay(selectedDate, maxDate)
  const canGoPrev = true

  const currentClosing = useMemo(
    () => selectClosingByDate(closings, selectedDate),
    [closings, selectedDate]
  )

  const canGenerateNow = isWithinClosingWindow(selectedDate, now)

  const preview = useMemo(
    () => computeClosingForDate(selectedDate, deliveries, orders, now),
    [selectedDate, deliveries, orders, now]
  )

  const handlePrev = () => {
    setSelectedDate((prev) => shiftDate(prev, -1))
  }

  const handleNext = () => {
    if (canGoNext) {
      setSelectedDate((prev) => shiftDate(prev, 1))
    }
  }

  const handleGenerate = () => {
    if (currentClosing || !canGenerateNow) return
    setIsDialogOpen(true)
  }

  const handleConfirm = () => {
    if (currentClosing || !canGenerateNow) {
      setIsDialogOpen(false)
      return
    }
    const dateKey = toLocalDateKey(selectedDate)
    createClosing({
      date: dateKey,
      ...preview,
    })
    setIsDialogOpen(false)
    toast.success("Cierre de caja generado", {
      description: `Se registró el cierre del ${dateKey.split("-").reverse().join("/")}.`,
    })
  }

  const recentClosings = useMemo(
    () =>
      closings
        .toSorted((a, b) => b.date.localeCompare(a.date))
        .slice(0, RECENT_CLOSINGS_LIMIT),
    [closings]
  )

  const isClosingGenerated = Boolean(currentClosing)
  const showGenerateCta = !isClosingGenerated && canGenerateNow

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6">
      <ReportHeader
        date={selectedDate}
        canGoPrev={canGoPrev}
        canGoNext={canGoNext}
        onPrev={handlePrev}
        onNext={handleNext}
        isClosingGenerated={isClosingGenerated}
        generatedAt={currentClosing?.generatedAt ?? null}
        canGenerate={showGenerateCta}
        onGenerate={handleGenerate}
      />

      {currentClosing ? (
        <CashClosingDetail closing={currentClosing} />
      ) : (
        <NoClosingEmptyState
          date={selectedDate}
          canGenerate={canGenerateNow}
          onGenerate={handleGenerate}
        />
      )}

      {recentClosings.length > 0 ? (
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium tracking-tight">
              Cierres recientes
            </h2>
            <span className="text-xs text-muted-foreground">
              Mostrando los últimos{" "}
              {Math.min(recentClosings.length, RECENT_CLOSINGS_LIMIT)}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {recentClosings.map((closing) => {
              const isActive = closing.id === currentClosing?.id
              return (
                <button
                  key={closing.id}
                  type="button"
                  onClick={() => setSelectedDate(new Date(closing.date))}
                  className={
                    isActive
                      ? "inline-flex items-center gap-2 rounded-full border border-primary bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                      : "inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                  }
                >
                  <Badge
                    variant={isActive ? "default" : "secondary"}
                    className="border-transparent"
                  >
                    {closing.date.split("-").reverse().join("/")}
                  </Badge>
                  <span>
                    {closing.deliveredCount} entr. · {closing.rejectedCount}{" "}
                    rech.
                  </span>
                </button>
              )
            })}
          </div>
        </section>
      ) : null}

      <GenerateClosingDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        date={selectedDate}
        preview={preview}
        onConfirm={handleConfirm}
      />
    </div>
  )
}
