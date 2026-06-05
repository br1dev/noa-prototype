import { IconChartBar, IconLock, IconReportMoney } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DateNav } from "@/components/admin/reports/date-nav"
import { formatClosingWindow } from "@/lib/cash-closing"
import { formatDate, formatDateTime } from "@/lib/format"
import { cn } from "@/lib/utils"

type ReportHeaderProps = {
  date: Date
  canGoPrev: boolean
  canGoNext: boolean
  onPrev: () => void
  onNext: () => void
  isClosingGenerated: boolean
  generatedAt: string | null
  canGenerate: boolean
  onGenerate: () => void
}

export function ReportHeader({
  date,
  canGoPrev,
  canGoNext,
  onPrev,
  onNext,
  isClosingGenerated,
  generatedAt,
  canGenerate,
  onGenerate,
}: ReportHeaderProps) {
  return (
    <header className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-muted-foreground">
          <IconChartBar className="size-4" aria-hidden />
          <span className="text-xs tracking-wider uppercase">Reportes</span>
        </div>
        <h1 className="font-heading text-[1.65rem] font-semibold tracking-tight">
          Resumen operativo financiero
        </h1>
        <p className="text-sm text-muted-foreground">
          Cierre de caja del {formatDate(date.toISOString())}
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <DateNav
          date={date}
          canGoPrev={canGoPrev}
          canGoNext={canGoNext}
          onPrev={onPrev}
          onNext={onNext}
        />

        <div className="flex items-center gap-2">
          {isClosingGenerated ? (
            <Badge variant="secondary" className="gap-1.5 font-normal">
              <IconLock className="size-3" aria-hidden />
              Cierre generado el{" "}
              {generatedAt ? formatDateTime(generatedAt) : ""}
            </Badge>
          ) : canGenerate ? (
            <Button type="button" onClick={onGenerate}>
              <IconReportMoney data-icon="inline-start" />
              Generar cierre de caja
            </Button>
          ) : (
            <Badge
              variant="outline"
              className={cn(
                "gap-1.5 border-dashed font-normal text-muted-foreground"
              )}
            >
              Generación disponible de {formatClosingWindow()}
            </Badge>
          )}
        </div>
      </div>
    </header>
  )
}
