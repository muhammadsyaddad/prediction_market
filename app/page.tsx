"use client"

import { CardHeader } from "@/components/ui/card"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Globe, CloudRain, LineChart, Search } from "lucide-react"
import { FeaturedMarket } from "@/components/featured-market"
import { MarketCard } from "@/components/market-card"
import { Header } from "@/components/header"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
// Perbaiki import marketService
import { marketService } from "@/services/market-service"

export default function Home() {
  const [markets, setMarkets] = useState<any[]>([])
  const [featuredMarkets, setFeaturedMarkets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState("semua")

  useEffect(() => {
    const fetchMarkets = async () => {
      setLoading(true)

      try {
        // Fetch featured markets
        const featuredData = await marketService.getFeaturedMarkets(3)
        setFeaturedMarkets(featuredData)

        // Fetch regular markets based on category
        const categoryMapping: Record<string, string> = {
          politik: "Politik",
          ekonomi: "Ekonomi",
          cuaca: "Cuaca",
          olahraga: "Olahraga",
          penghargaan: "Penghargaan",
        }

        const category = activeCategory !== "semua" ? categoryMapping[activeCategory] : undefined
        const { data } = await marketService.getMarkets(category, 1, 8)
        setMarkets(data)
      } catch (error) {
        console.error("Error fetching markets:", error)
        // Set empty arrays if there's an error
        setFeaturedMarkets([])
        setMarkets([])
      } finally {
        setLoading(false)
      }
    }

    fetchMarkets()
  }, [activeCategory])

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="w-full py-6 md:py-12">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-6 text-center px-4">
              <div className="space-y-3">
                <h1 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl lg:text-5xl">
                  Pasar Prediksi Berbasis Cryptocurrency
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-600 text-sm sm:text-base md:text-lg dark:text-gray-300">
                  Buat prediksi, perdagangkan saham, dan dapatkan keuntungan dari pengetahuan Anda tentang berbagai
                  topik.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-4">
                <Link href="/auth" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium">
                    Mulai Sekarang
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="w-full">
                  Pelajari Lebih Lanjut
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-6 md:py-12 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Pasar Populer</h2>
                <div className="relative w-full max-w-sm ml-auto">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input type="search" placeholder="Cari pasar..." className="w-full bg-background pl-8" />
                </div>
              </div>

              <Tabs defaultValue="semua" className="w-full" value={activeCategory} onValueChange={setActiveCategory}>
                <TabsList className="mb-4">
                  <TabsTrigger value="semua">Semua</TabsTrigger>
                  <TabsTrigger value="politik">Politik</TabsTrigger>
                  <TabsTrigger value="ekonomi">Ekonomi</TabsTrigger>
                  <TabsTrigger value="cuaca">Cuaca</TabsTrigger>
                  <TabsTrigger value="penghargaan">Penghargaan</TabsTrigger>
                  <TabsTrigger value="olahraga">Olahraga</TabsTrigger>
                </TabsList>
                <TabsContent value="semua" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {loading
                      ? // Loading skeleton for featured markets
                        Array(3)
                          .fill(0)
                          .map((_, i) => (
                            <Card key={i} className="h-[250px] animate-pulse">
                              <CardHeader className="flex flex-row items-center gap-4">
                                <div className="h-12 w-12 bg-muted rounded"></div>
                                <div className="space-y-2">
                                  <div className="h-5 bg-muted rounded w-3/4"></div>
                                  <div className="h-4 bg-muted rounded w-full"></div>
                                </div>
                              </CardHeader>
                              <CardContent className="p-6">
                                <div className="space-y-4">
                                  <div className="flex justify-between">
                                    <div className="h-4 bg-muted rounded w-1/4"></div>
                                    <div className="h-4 bg-muted rounded w-1/4"></div>
                                  </div>
                                  <div className="h-2 bg-muted rounded w-full"></div>
                                  <div className="flex justify-between">
                                    <div className="h-6 bg-muted rounded w-1/3"></div>
                                    <div className="h-6 bg-muted rounded w-1/4"></div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                      : featuredMarkets.map((market) => (
                          <FeaturedMarket
                            key={market.id}
                            id={market.id}
                            title={market.title}
                            description={market.description}
                            icon={
                              market.category === "Ekonomi" ? (
                                <LineChart className="h-8 w-8" />
                              ) : market.category === "Politik" ? (
                                <Globe className="h-8 w-8" />
                              ) : (
                                <CloudRain className="h-8 w-8" />
                              )
                            }
                            probability={market.probability}
                            volume={`Rp ${Math.floor(market.volume / 1000000)} Juta`}
                          />
                        ))}
                  </div>

                  <h3 className="text-xl font-semibold mt-8 mb-4">Pasar Terbaru</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {loading ? (
                      // Loading skeleton
                      Array(8)
                        .fill(0)
                        .map((_, i) => (
                          <Card key={i} className="h-[200px] animate-pulse">
                            <CardContent className="p-4">
                              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                              <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
                              <div className="h-2 bg-muted rounded w-full mb-2"></div>
                              <div className="h-2 bg-muted rounded w-full mb-2"></div>
                              <div className="h-2 bg-muted rounded w-3/4"></div>
                            </CardContent>
                          </Card>
                        ))
                    ) : markets.length > 0 ? (
                      markets.map((market) => (
                        <MarketCard
                          key={market.id}
                          id={market.id}
                          title={market.title}
                          category={market.category}
                          probability={market.probability}
                          volume={`Rp ${Math.floor(market.volume / 1000000)} Juta`}
                          deadline={new Date(market.closing_date).toLocaleDateString("id-ID")}
                        />
                      ))
                    ) : (
                      <div className="col-span-full text-center py-8">
                        <p className="text-muted-foreground">Tidak ada pasar yang ditemukan.</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                {/* Other tab contents will be similar */}
              </Tabs>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

