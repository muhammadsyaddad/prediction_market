"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Header } from "@/components/header"
import { Globe, Clock, MessageSquare, Share2, Flag, ArrowLeft } from "lucide-react"
import { MarketPositionCard } from "@/components/market-position-card"
import { MarketHistoryChart } from "@/components/market-history-chart"
import { useAuth } from "@/contexts/auth-context"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { createClient } from "@supabase/supabase-js"
import { marketService } from "@/services/market-service"

export default function MarketPage({ params }: { params: { id: string } }) {
  const [market, setMarket] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [userPosition, setUserPosition] = useState<any>(null)
  const [buyAmount, setBuyAmount] = useState("")
  const [isBuying, setIsBuying] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState<"yes" | "no">("yes")
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Check if there's a position parameter in the URL
  useEffect(() => {
    const position = searchParams.get("position")
    if (position === "yes" || position === "no") {
      setSelectedPosition(position)
      setIsBuying(true)
    }

    const action = searchParams.get("action")
    if (action === "buy") {
      setIsBuying(true)
    }
  }, [searchParams])

  useEffect(() => {
    const fetchMarketData = async () => {
      setLoading(true)

      try {
        const marketData = await marketService.getMarketById(params.id)

        if (!marketData) {
          toast({
            title: "Error",
            description: "Pasar tidak ditemukan.",
            variant: "destructive",
          })
          setLoading(false)
          return
        }

        setMarket({
          ...marketData,
          volume: `Rp ${Math.floor(marketData.volume / 1000000)} Juta`,
          liquidity: `Rp ${Math.floor(marketData.liquidity / 1000000)} Juta`,
          closingDate: new Date(marketData.closing_date).toLocaleDateString("id-ID"),
          resolutionDate: new Date(marketData.resolution_date).toLocaleDateString("id-ID"),
          createdAt: new Date(marketData.created_at).toLocaleDateString("id-ID"),
        })

        // If user is logged in, fetch their position
        if (user) {
          try {
            const supabase = createClient()
            const { data: positionData, error } = await supabase
              .from("positions")
              .select(`
                *,
                market:markets(title, status)
              `)
              .eq("user_id", user.id)
              .eq("market_id", params.id)
              .single()

            if (!error && positionData) {
              setUserPosition(positionData)
            }
          } catch (posError) {
            console.error("Error fetching user position:", posError)
          }
        }
      } catch (error) {
        console.error("Error fetching market data:", error)
        toast({
          title: "Error",
          description: "Gagal memuat data pasar. Silakan coba lagi nanti.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchMarketData()
  }, [params.id, user])

  const handleBuy = async () => {
    if (!user) {
      router.push("/auth")
      return
    }

    if (!buyAmount || isNaN(Number(buyAmount)) || Number(buyAmount) <= 0) {
      toast({
        title: "Error",
        description: "Masukkan jumlah yang valid",
        variant: "destructive",
      })
      return
    }

    try {
      // Simulate transaction
      toast({
        title: "Berhasil",
        description: `Berhasil membeli ${buyAmount} saham "${selectedPosition === "yes" ? "Ya" : "Tidak"}"`,
      })

      // Simulate updating user position
      setUserPosition({
        id: "pos-" + Date.now(),
        market_id: params.id,
        marketTitle: market.title,
        position: selectedPosition,
        shares: Number(buyAmount),
        averagePrice: selectedPosition === "yes" ? market.probability / 100 : (100 - market.probability) / 100,
        current_value:
          Number(buyAmount) *
          (selectedPosition === "yes" ? market.probability / 100 : (100 - market.probability) / 100),
        profit: 0,
        profit_percentage: 0,
        market: {
          status: "active",
        },
      })

      setIsBuying(false)
      setBuyAmount("")
    } catch (error) {
      console.error("Error executing transaction:", error)
      toast({
        title: "Error",
        description: "Gagal melakukan transaksi. Silakan coba lagi nanti.",
        variant: "destructive",
      })
    }
  }

  const handleBack = () => {
    router.back()
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-12 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-64 bg-muted rounded w-full"></div>
          </div>
        </main>
      </div>
    )
  }

  if (!market) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Pasar tidak ditemukan</h1>
            <p className="text-muted-foreground mb-4">
              Pasar yang Anda cari mungkin telah dihapus atau tidak pernah ada.
            </p>
            <Button onClick={handleBack}>Kembali</Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-8">
          <Button variant="ghost" onClick={handleBack} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Globe className="h-4 w-4 mr-2" />
                  {market.category}
                </Button>
                <Badge variant="outline" className="ml-auto">
                  <Clock className="h-3 w-3 mr-1" />
                  Tutup: {market.closingDate}
                </Badge>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-4">{market.title}</h1>
                <p className="text-muted-foreground">{market.description}</p>
              </div>

              {isBuying ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Beli Saham</CardTitle>
                    <CardDescription>Pilih posisi dan jumlah saham yang ingin dibeli</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        variant={selectedPosition === "yes" ? "default" : "outline"}
                        onClick={() => setSelectedPosition("yes")}
                        className="h-16"
                      >
                        Ya ({market.probability}%)
                      </Button>
                      <Button
                        variant={selectedPosition === "no" ? "default" : "outline"}
                        onClick={() => setSelectedPosition("no")}
                        className="h-16"
                      >
                        Tidak ({100 - market.probability}%)
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amount">Jumlah Saham</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="Masukkan jumlah saham"
                        value={buyAmount}
                        onChange={(e) => setBuyAmount(e.target.value)}
                      />
                    </div>

                    <div className="p-4 bg-muted/50 rounded-md">
                      <div className="flex justify-between mb-2">
                        <span>Harga per saham:</span>
                        <span className="font-medium">
                          {selectedPosition === "yes" ? `${market.probability}%` : `${100 - market.probability}%`}
                        </span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span>Jumlah saham:</span>
                        <span className="font-medium">{buyAmount || "0"}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span>Total:</span>
                        <span className="font-bold">
                          {buyAmount
                            ? `${(
                                Number(buyAmount) *
                                  (selectedPosition === "yes"
                                    ? market.probability / 100
                                    : (100 - market.probability) / 100)
                              ).toFixed(2)} USDC`
                            : "0 USDC"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => setIsBuying(false)}>
                      Batal
                    </Button>
                    <Button onClick={handleBuy}>Beli Saham</Button>
                  </CardFooter>
                </Card>
              ) : (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Probabilitas Saat Ini</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Probabilitas "Ya"</span>
                        <span className="text-2xl font-bold">{market.probability}%</span>
                      </div>
                      <Progress value={market.probability} className="h-3" />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button
                      className="w-full"
                      variant={market.probability > 50 ? "default" : "outline"}
                      onClick={() => {
                        setSelectedPosition("yes")
                        setIsBuying(true)
                      }}
                    >
                      Ya ({market.probability}%)
                    </Button>
                    <Button
                      className="w-full"
                      variant={market.probability <= 50 ? "default" : "outline"}
                      onClick={() => {
                        setSelectedPosition("no")
                        setIsBuying(true)
                      }}
                    >
                      Tidak ({100 - market.probability}%)
                    </Button>
                  </CardFooter>
                </Card>
              )}

              <Tabs defaultValue="chart">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="chart">Grafik Harga</TabsTrigger>
                  <TabsTrigger value="activity">Aktivitas</TabsTrigger>
                  <TabsTrigger value="discussion">Diskusi</TabsTrigger>
                </TabsList>
                <TabsContent value="chart" className="pt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Riwayat Harga</CardTitle>
                      <CardDescription>Perubahan probabilitas selama 30 hari terakhir</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <MarketHistoryChart />
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="activity" className="pt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Aktivitas Terbaru</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-4">
                        <p className="text-muted-foreground">Belum ada aktivitas untuk pasar ini.</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="discussion" className="pt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Diskusi</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-4">
                        <p className="text-muted-foreground">Belum ada diskusi untuk pasar ini.</p>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Tambahkan Komentar
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Informasi Pasar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">Volume</div>
                    <div className="font-medium text-right">{market.volume}</div>

                    <div className="text-muted-foreground">Likuiditas</div>
                    <div className="font-medium text-right">{market.liquidity}</div>

                    <div className="text-muted-foreground">Tanggal Penutupan</div>
                    <div className="font-medium text-right">{market.closingDate}</div>

                    <div className="text-muted-foreground">Tanggal Resolusi</div>
                    <div className="font-medium text-right">{market.resolutionDate}</div>

                    <div className="text-muted-foreground">Dibuat oleh</div>
                    <div className="font-medium text-right">{market.created_by}</div>

                    <div className="text-muted-foreground">Dibuat pada</div>
                    <div className="font-medium text-right">{market.createdAt}</div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Bagikan
                  </Button>
                  <Button variant="outline" size="sm">
                    <Flag className="h-4 w-4 mr-2" />
                    Laporkan
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Posisi Anda</CardTitle>
                </CardHeader>
                <CardContent>
                  <MarketPositionCard position={userPosition} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Pasar Terkait</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">Belum ada pasar terkait.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Toaster />
    </div>
  )
}

