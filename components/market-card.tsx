"use client"

import type React from "react"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"

interface MarketCardProps {
  id: string
  title: string
  category: string
  probability: number
  volume: string | number
  deadline: string | Date
}

export function MarketCard({ id, title, category, probability, volume, deadline }: MarketCardProps) {
  const router = useRouter()

  const handleCardClick = () => {
    router.push(`/market/${id}`)
  }

  const handleDetailClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click from triggering
    router.push(`/market/${id}`)
  }

  const handleBuyClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click from triggering
    router.push(`/market/${id}?action=buy`)
  }

  // Format volume if it's a number
  const formattedVolume = typeof volume === "number" ? `Rp ${Math.floor(volume / 1000000)} Juta` : volume

  // Format deadline if it's a Date object
  const formattedDeadline =
    deadline instanceof Date
      ? deadline.toLocaleDateString("id-ID")
      : typeof deadline === "string" && deadline.includes("-")
        ? new Date(deadline).toLocaleDateString("id-ID")
        : deadline

  return (
    <Card
      className="overflow-hidden h-full flex flex-col cursor-pointer transition-all hover:shadow-md active:bg-muted/20"
      onClick={handleCardClick}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="font-medium text-base">{title}</h3>
            <Badge variant="outline" className="text-xs">
              {category}
            </Badge>
          </div>
          <Badge variant="secondary" className="text-xs">
            {formattedDeadline}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2 flex-grow">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm">Probabilitas</span>
            <span className="text-sm font-medium">{probability}%</span>
          </div>
          <Progress value={probability} className="h-1.5" />
          <div className="text-xs text-muted-foreground">Volume: {formattedVolume}</div>
        </div>
      </CardContent>
      <CardFooter className="p-3 bg-muted/30 flex gap-2">
        <Button size="sm" variant="outline" className="w-full text-xs h-9 font-medium" onClick={handleDetailClick}>
          Detail
        </Button>
        <Button
          size="sm"
          className="w-full text-xs h-9 bg-primary-600 hover:bg-primary-700 text-white font-medium"
          onClick={handleBuyClick}
        >
          Beli
        </Button>
      </CardFooter>
    </Card>
  )
}

