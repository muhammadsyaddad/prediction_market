"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { MarketCard } from "@/components/market-card"
import { Header } from "@/components/header"
import { Search, Filter } from "lucide-react"
import { marketService } from "@/services/market-service"

// Tipe data untuk pasar
interface Market {
  id: string
  title: string
  category: string
  probability: number
  volume: string
  deadline: string
}

// Fungsi untuk mendapatkan judul kategori
const getCategoryTitle = (category: string) => {
  const titles: Record<string, string> = {
    politics: "Politik",
    economics: "Ekonomi",
    weather: "Cuaca",
    sports: "Olahraga",
    awards: "Penghargaan",
  }
  return titles[category] || "Kategori"
}

// Fungsi untuk mendapatkan deskripsi kategori
const getCategoryDescription = (category: string) => {
  const descriptions: Record<string, string> = {
    politics: "Prediksi hasil pemilu dan keputusan politik",
    economics: "Prediksi indikator ekonomi dan pasar keuangan",
    weather: "Prediksi pola cuaca dan fenomena alam",
    sports: "Prediksi hasil pertandingan dan kompetisi olahraga",
    awards: "Prediksi pemenang penghargaan dan acara",
  }
  return descriptions[category] || "Jelajahi pasar prediksi dalam kategori ini"
}

export default function CategoryPage() {
  const params = useParams()
  const category = params.category as string

  const [markets, setMarkets] = useState<Market[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")

  const itemsPerPage = 12

  useEffect(() => {
    const fetchMarkets = async () => {
      setLoading(true)

      try {
        // Convert category to the format expected by the API
        const categoryMapping: Record<string, string> = {
          politics: "Politik",
          economics: "Ekonomi",
          weather: "Cuaca",
          sports: "Olahraga",
          awards: "Penghargaan",
        }

        const apiCategory = categoryMapping[category] || ""

        // Fetch markets from API
        const {
          data,
          count,
          totalPages: pages,
        } = await marketService.getMarkets(apiCategory, currentPage, itemsPerPage, searchQuery)

        if (data.length === 0) {
          setMarkets([])
          setTotalPages(0)
          setLoading(false)
          return
        }

        setMarkets(
          data.map((market) => ({
            id: market.id,
            title: market.title,
            category: getCategoryTitle(category),
            probability: market.probability,
            volume: `Rp ${Math.floor(market.volume / 1000000)} Juta`,
            deadline: market.closing_date ? new Date(market.closing_date).toLocaleDateString("id-ID") : "N/A",
          })),
        )

        setTotalPages(pages)
      } catch (error) {
        console.error("Error fetching markets:", error)
        setMarkets([])
        setTotalPages(0)
      } finally {
        setLoading(false)
      }
    }

    fetchMarkets()
  }, [category, currentPage, searchQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1) // Reset ke halaman pertama saat pencarian
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-8">
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-3xl font-bold">{getCategoryTitle(category)}</h1>
              <p className="text-muted-foreground mt-2">{getCategoryDescription(category)}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <form onSubmit={handleSearch} className="relative w-full sm:max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={`Cari pasar ${getCategoryTitle(category).toLowerCase()}...`}
                  className="w-full pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>

              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i} className="h-[200px] animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
                      <div className="h-2 bg-muted rounded w-full mb-2"></div>
                      <div className="h-2 bg-muted rounded w-full mb-2"></div>
                      <div className="h-2 bg-muted rounded w-3/4"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : markets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {markets.map((market) => (
                  <MarketCard
                    key={market.id}
                    title={market.title}
                    category={market.category}
                    probability={market.probability}
                    volume={market.volume}
                    deadline={market.deadline}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Tidak ada pasar yang ditemukan.</p>
              </div>
            )}

            {totalPages > 1 && (
              <Pagination className="mt-8">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (currentPage > 1) setCurrentPage(currentPage - 1)
                      }}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber: number

                    if (totalPages <= 5) {
                      // Jika total halaman <= 5, tampilkan semua halaman
                      pageNumber = i + 1
                    } else if (currentPage <= 3) {
                      // Jika halaman saat ini <= 3, tampilkan halaman 1-5
                      pageNumber = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      // Jika halaman saat ini >= totalPages-2, tampilkan 5 halaman terakhir
                      pageNumber = totalPages - 4 + i
                    } else {
                      // Tampilkan 2 halaman sebelum dan 2 halaman setelah halaman saat ini
                      pageNumber = currentPage - 2 + i
                    }

                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            setCurrentPage(pageNumber)
                          }}
                          isActive={currentPage === pageNumber}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  })}

                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            setCurrentPage(totalPages)
                          }}
                        >
                          {totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    </>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                      }}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

