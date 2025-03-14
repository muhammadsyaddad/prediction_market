"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { TrendingUp, TrendingDown, Filter, ArrowUpDown, Download } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PortfolioChart } from "@/components/portfolio-chart"
import { portfolioService } from "@/services/portfolio-service"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import type { Position as MarketPosition, Transaction } from "@/services/portfolio-service"

export default function PortfolioPage() {
  const [positions, setPositions] = useState<MarketPosition[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [portfolioValue, setPortfolioValue] = useState(0)
  const [totalProfit, setTotalProfit] = useState(0)
  const [profitPercentage, setProfitPercentage] = useState(0)
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    const fetchPortfolioData = async () => {
      setLoading(true)

      try {
        if (!user) {
          router.push("/auth")
          return
        }

        // Get real positions and transactions from Supabase
        const userPositions = await portfolioService.getUserPositions()
        const userTransactions = await portfolioService.getUserTransactions()

        // Calculate portfolio stats
        const totalValue = userPositions.reduce((sum, position) => {
          if (position.market?.status === "active") {
            return sum + position.current_value
          }
          return sum
        }, 0)

        const totalProfitValue = userPositions.reduce((sum, position) => {
          if (position.market?.status === "active") {
            return sum + position.profit
          }
          return sum
        }, 0)

        const avgProfitPercentage =
          userPositions.length > 0
            ? userPositions
                .filter((p) => p.market?.status === "active")
                .reduce((sum, p) => sum + p.profit_percentage, 0) /
              userPositions.filter((p) => p.market?.status === "active").length
            : 0

        setPositions(userPositions)
        setTransactions(userTransactions)
        setPortfolioValue(totalValue)
        setTotalProfit(totalProfitValue)
        setProfitPercentage(avgProfitPercentage)
      } catch (error) {
        console.error("Error fetching portfolio data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPortfolioData()
  }, [user, router]) // Added user and router to dependencies

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value * 15000) // Asumsi 1 USDC = Rp 15.000
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)

    if (diffHours < 24) {
      return `${Math.floor(diffHours)} jam yang lalu`
    } else {
      return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">Portfolio</h1>
                <p className="text-muted-foreground mt-1">Kelola posisi dan pantau kinerja investasi Anda</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Ekspor Data
                </Button>
                <Button size="sm">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Jelajahi Pasar
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Nilai Portfolio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(portfolioValue)}</div>
                  <p className="text-xs text-muted-foreground mt-1">{portfolioValue.toFixed(2)} USDC</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Profit/Loss Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${totalProfit >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {totalProfit >= 0 ? "+" : ""}
                    {formatCurrency(totalProfit)}
                  </div>
                  <div className="flex items-center text-xs mt-1">
                    <span className={`${totalProfit >= 0 ? "text-green-500" : "text-red-500"} font-medium`}>
                      {totalProfit >= 0 ? "+" : ""}
                      {profitPercentage.toFixed(2)}%
                    </span>
                    <span className="text-muted-foreground ml-1">sejak pembelian</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Posisi Aktif</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {positions.filter((p) => p.market?.status === "active").length}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">dari {positions.length} total posisi</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Kinerja Portfolio</CardTitle>
                <CardDescription>Nilai portfolio Anda selama 30 hari terakhir</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <PortfolioChart />
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="positions">
              <TabsList>
                <TabsTrigger value="positions">Posisi Saat Ini</TabsTrigger>
                <TabsTrigger value="history">Riwayat Transaksi</TabsTrigger>
              </TabsList>

              <TabsContent value="positions" className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Posisi Pasar Anda</h3>
                  <div className="flex gap-2">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Filter Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Status</SelectItem>
                        <SelectItem value="active">Aktif</SelectItem>
                        <SelectItem value="resolved">Terselesaikan</SelectItem>
                        <SelectItem value="cancelled">Dibatalkan</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      <ArrowUpDown className="h-4 w-4 mr-2" />
                      Urutkan
                    </Button>
                  </div>
                </div>

                <div className="rounded-md border">
                  <div className="grid grid-cols-7 gap-4 p-4 text-sm font-medium text-muted-foreground border-b">
                    <div className="col-span-2">Pasar</div>
                    <div>Posisi</div>
                    <div>Saham</div>
                    <div>Harga Rata-rata</div>
                    <div>Nilai Saat Ini</div>
                    <div>Profit/Loss</div>
                  </div>

                  {loading ? (
                    <div className="p-4">
                      <div className="space-y-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="grid grid-cols-7 gap-4 animate-pulse">
                            <div className="col-span-2 h-4 bg-muted rounded"></div>
                            <div className="h-4 bg-muted rounded"></div>
                            <div className="h-4 bg-muted rounded"></div>
                            <div className="h-4 bg-muted rounded"></div>
                            <div className="h-4 bg-muted rounded"></div>
                            <div className="h-4 bg-muted rounded"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : positions.length > 0 ? (
                    <div>
                      {positions.map((position) => (
                        <div
                          key={position.id}
                          className="grid grid-cols-7 gap-4 p-4 text-sm border-b last:border-0 items-center"
                        >
                          <div className="col-span-2">
                            <div className="font-medium">{position.marketTitle}</div>
                            <div className="flex items-center mt-1">
                              <Badge
                                variant={
                                  position.market?.status === "active"
                                    ? "outline"
                                    : position.market?.status === "resolved"
                                      ? "secondary"
                                      : "destructive"
                                }
                                className="text-xs"
                              >
                                {position.market?.status === "active"
                                  ? "Aktif"
                                  : position.market?.status === "resolved"
                                    ? "Terselesaikan"
                                    : "Dibatalkan"}
                              </Badge>
                            </div>
                          </div>
                          <div>
                            <Badge variant={position.position === "yes" ? "default" : "outline"}>
                              {position.position === "yes" ? "Ya" : "Tidak"}
                            </Badge>
                          </div>
                          <div>{position.shares}</div>
                          <div>{(position.averagePrice * 100).toFixed(2)}%</div>
                          <div>{formatCurrency(position.current_value)}</div>
                          <div
                            className={`flex items-center ${position.profit >= 0 ? "text-green-500" : "text-red-500"}`}
                          >
                            {position.profit >= 0 ? (
                              <TrendingUp className="h-4 w-4 mr-1" />
                            ) : (
                              <TrendingDown className="h-4 w-4 mr-1" />
                            )}
                            <span>
                              {position.profit >= 0 ? "+" : ""}
                              {position.profit_percentage.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <p className="text-muted-foreground">Anda belum memiliki posisi pasar.</p>
                      <Button className="mt-4">Jelajahi Pasar</Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="history" className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Riwayat Transaksi</h3>
                  <div className="flex gap-2">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Filter Tipe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Tipe</SelectItem>
                        <SelectItem value="buy">Pembelian</SelectItem>
                        <SelectItem value="sell">Penjualan</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </div>

                <div className="rounded-md border">
                  <div className="grid grid-cols-6 gap-4 p-4 text-sm font-medium text-muted-foreground border-b">
                    <div className="col-span-2">Pasar</div>
                    <div>Tipe</div>
                    <div>Jumlah</div>
                    <div>Total</div>
                    <div>Waktu</div>
                  </div>

                  {loading ? (
                    <div className="p-4">
                      <div className="space-y-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="grid grid-cols-6 gap-4 animate-pulse">
                            <div className="col-span-2 h-4 bg-muted rounded"></div>
                            <div className="h-4 bg-muted rounded"></div>
                            <div className="h-4 bg-muted rounded"></div>
                            <div className="h-4 bg-muted rounded"></div>
                            <div className="h-4 bg-muted rounded"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : transactions.length > 0 ? (
                    <div>
                      {transactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="grid grid-cols-6 gap-4 p-4 text-sm border-b last:border-0 items-center"
                        >
                          <div className="col-span-2">
                            <div className="font-medium">{transaction.marketTitle}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Posisi: {transaction.position === "yes" ? "Ya" : "Tidak"}
                            </div>
                          </div>
                          <div>
                            <Badge variant={transaction.type === "buy" ? "default" : "secondary"}>
                              {transaction.type === "buy" ? "Beli" : "Jual"}
                            </Badge>
                          </div>
                          <div>
                            {transaction.shares} @ {(transaction.price * 100).toFixed(2)}%
                          </div>
                          <div>{formatCurrency(transaction.total)}</div>
                          <div className="text-muted-foreground">{formatDate(transaction.timestamp)}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <p className="text-muted-foreground">Anda belum memiliki riwayat transaksi.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}

