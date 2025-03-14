"use client"

import { CardFooter } from "@/components/ui/card"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"
import type { ReactNode } from "react"

interface FeaturedMarketProps {
  id?: string
  title: string
  description: string
  icon: ReactNode
  probability: number
  volume: string | number
}

export function FeaturedMarket({ id, title, description, icon, probability, volume }: FeaturedMarketProps) {
  const router = useRouter()

  const handleCardClick = () => {
    if (id) {
      router.push(`/market/${id}`)
    }
  }

  const handleYesClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (id) {
      router.push(`/market/${id}?position=yes`)
    }
  }

  const handleNoClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (id) {
      router.push(`/market/${id}?position=no`)
    }
  }

  // Format volume if it's a number
  const formattedVolume = typeof volume === "number" ? `Rp ${Math.floor(volume / 1000000)} Juta` : volume

  return (
    <Card
      className={`overflow-hidden ${id ? "cursor-pointer transition-all hover:shadow-md" : ""}`}
      onClick={id ? handleCardClick : undefined}
    >
      <CardHeader className="bg-muted/50 flex flex-row items-center gap-4">
        <div className="bg-primary/10 p-2 rounded-md">{icon}</div>
        <div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Probabilitas "Ya"</span>
            <span className="text-lg font-bold">{probability}%</span>
          </div>
          <Progress value={probability} className="h-2" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
          <div className="flex justify-between items-center pt-2">
            <Badge variant="outline" className="px-3 py-1">
              Volume: {formattedVolume}
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              Aktif
            </Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/30 p-4 flex gap-2">
        <Button
          className="w-full h-10 font-medium"
          variant={probability > 50 ? "default" : "outline"}
          onClick={handleYesClick}
          style={{
            backgroundColor: probability > 50 ? "var(--primary-600)" : "",
            color: probability > 50 ? "white" : "",
          }}
        >
          Ya ({probability}%)
        </Button>
        <Button
          className="w-full h-10 font-medium"
          variant={probability <= 50 ? "default" : "outline"}
          onClick={handleNoClick}
          style={{
            backgroundColor: probability <= 50 ? "var(--primary-600)" : "",
            color: probability <= 50 ? "white" : "",
          }}
        >
          Tidak ({100 - probability}%)
        </Button>
      </CardFooter>
    </Card>
  )
}

