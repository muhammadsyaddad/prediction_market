import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface MarketPositionCardProps {
  position: any
}

export function MarketPositionCard({ position }: MarketPositionCardProps) {
  const hasPosition = !!position

  if (!hasPosition) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground mb-4">Anda belum memiliki posisi di pasar ini.</p>
        <Button>Beli Saham</Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="text-muted-foreground">Saham "Ya"</div>
        <div className="font-medium text-right">{position.position === "yes" ? position.shares : 0}</div>

        <div className="text-muted-foreground">Saham "Tidak"</div>
        <div className="font-medium text-right">{position.position === "no" ? position.shares : 0}</div>

        <div className="text-muted-foreground">Harga Rata-rata</div>
        <div className="font-medium text-right">${position.average_price.toFixed(2)}</div>

        <div className="text-muted-foreground">Nilai Saat Ini</div>
        <div className="font-medium text-right">${position.current_value.toFixed(2)}</div>
      </div>

      <Separator />

      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">Profit/Loss</span>
        <span className={`text-sm font-bold ${position.profit >= 0 ? "text-green-500" : "text-red-500"}`}>
          {position.profit >= 0 ? "+" : ""}
          {position.profit.toFixed(2)} USDC ({position.profit_percentage.toFixed(2)}%)
        </span>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" className="w-full" size="sm">
          Beli Lagi
        </Button>
        <Button variant="outline" className="w-full" size="sm">
          Jual
        </Button>
      </div>
    </div>
  )
}

