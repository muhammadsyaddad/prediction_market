"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/date-picker"
import { Switch } from "@/components/ui/switch"
import { Header } from "@/components/header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { marketService } from "@/services/market-service"
import { coinService } from "@/services/coin-service"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function CreateMarketPage() {
  const [marketType, setMarketType] = useState("binary")
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [coinBalance, setCoinBalance] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserCoins = async () => {
      if (!user) {
        router.push("/auth")
        return
      }

      setLoading(true)
      try {
        const userProfile = await coinService.getUserProfile(user.id)
        if (userProfile) {
          setCoinBalance(userProfile.coin_balance)
        } else {
          const newProfile = await coinService.createUserProfile(user.id)
          setCoinBalance(0)
        }
      } catch (error) {
        console.error("Error fetching user coins:", error)
        toast({
          title: "Error",
          description: "Gagal memuat data pengguna. Silakan coba lagi nanti.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUserCoins()
  }, [user, router])

  const handleCreateMarket = async () => {
    if (!user) {
      router.push("/auth")
      return
    }

    // Check if user has enough coins (100 coins required)
    if (coinBalance < 100) {
      toast({
        title: "Koin Tidak Cukup",
        description: "Anda membutuhkan minimal 100 koin untuk membuat pasar. Dapatkan koin dengan berburu koin.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Gather form data
      const marketData = {
        title: document.getElementById("question")?.value as string,
        description: document.getElementById("description")?.value as string,
        category: document.getElementById("category")?.value as string,
        type: marketType,
        closing_date: document.getElementById("closing-date")?.getAttribute("data-value") as string,
        resolution_date: document.getElementById("resolution-date")?.getAttribute("data-value") as string,
        resolution_source: document.getElementById("resolution-source")?.value as string,
        liquidity: Number.parseFloat(document.getElementById("liquidity")?.value as string) || 100,
        fee: Number.parseFloat(document.getElementById("fee")?.value as string) || 2,
        is_private: (document.getElementById("private-market") as HTMLInputElement)?.checked || false,
        allow_comments: (document.getElementById("allow-comments") as HTMLInputElement)?.checked || true,
      }

      // Add type-specific fields
      if (marketType === "multiple") {
        // Get all option inputs
        const optionInputs = document.querySelectorAll('[id^="option-"]')
        const options = Array.from(optionInputs).map((input) => (input as HTMLInputElement).value)
        marketData.options = options.filter((option) => option.trim().length > 0)
      } else if (marketType === "numeric") {
        marketData.min_value = Number.parseFloat(document.getElementById("min-value")?.value as string) || 0
        marketData.max_value = Number.parseFloat(document.getElementById("max-value")?.value as string) || 100
      }

      // Create the market
      await marketService.createMarket(marketData)

      // Deduct coins
      await coinService.updateCoinBalance(user.id, -100)

      toast({
        title: "Pasar berhasil dibuat",
        description: "Pasar prediksi Anda telah berhasil dibuat dan 100 koin telah digunakan.",
      })

      router.push("/")
    } catch (error) {
      console.error("Error creating market:", error)
      toast({
        title: "Gagal membuat pasar",
        description: "Terjadi kesalahan saat membuat pasar prediksi.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Memuat data...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Buat Pasar Prediksi Baru</h1>

          {coinBalance < 100 ? (
            <Alert className="mb-6" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Koin Tidak Cukup</AlertTitle>
              <AlertDescription>
                Anda membutuhkan minimal 100 koin untuk membuat pasar. Saat ini Anda memiliki {coinBalance} koin.
                <div className="mt-4">
                  <Button onClick={() => router.push("/hunting-coin")} className="bg-primary-600 hover:bg-primary-700">
                    Berburu Koin
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="mb-6">
              <Info className="h-4 w-4" />
              <AlertTitle>Informasi Penting</AlertTitle>
              <AlertDescription>
                Membuat pasar prediksi memerlukan 100 koin sebagai jaminan. Saat ini Anda memiliki {coinBalance} koin.
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Informasi Dasar</TabsTrigger>
              <TabsTrigger value="advanced">Pengaturan Lanjutan</TabsTrigger>
            </TabsList>
            <TabsContent value="basic">
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Pasar</CardTitle>
                  <CardDescription>Masukkan detail dasar untuk pasar prediksi Anda.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="question">Pertanyaan Pasar</Label>
                    <Input
                      id="question"
                      placeholder="Contoh: Apakah harga Bitcoin akan mencapai $100,000 pada tahun 2025?"
                    />
                    <p className="text-sm text-muted-foreground">
                      Pertanyaan harus memiliki jawaban yang jelas dan dapat diverifikasi.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Deskripsi</Label>
                    <Textarea id="description" placeholder="Berikan detail tambahan tentang pasar ini..." rows={4} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Kategori</Label>
                      <Select defaultValue="economics">
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="politics">Politik</SelectItem>
                          <SelectItem value="economics">Ekonomi</SelectItem>
                          <SelectItem value="weather">Cuaca</SelectItem>
                          <SelectItem value="awards">Penghargaan</SelectItem>
                          <SelectItem value="sports">Olahraga</SelectItem>
                          <SelectItem value="other">Lainnya</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="market-type">Tipe Pasar</Label>
                      <Select value={marketType} onValueChange={setMarketType}>
                        <SelectTrigger id="market-type">
                          <SelectValue placeholder="Pilih tipe pasar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="binary">Biner (Ya/Tidak)</SelectItem>
                          <SelectItem value="multiple">Pilihan Ganda</SelectItem>
                          <SelectItem value="numeric">Numerik</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {marketType === "multiple" && (
                    <div className="space-y-2">
                      <Label>Opsi Pilihan Ganda</Label>
                      <div className="space-y-2">
                        <Input id="option-1" placeholder="Opsi 1" />
                        <Input id="option-2" placeholder="Opsi 2" />
                        <Input id="option-3" placeholder="Opsi 3" />
                        <Button variant="outline" size="sm" className="w-full">
                          + Tambah Opsi
                        </Button>
                      </div>
                    </div>
                  )}

                  {marketType === "numeric" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="min-value">Nilai Minimum</Label>
                        <Input id="min-value" type="number" placeholder="0" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="max-value">Nilai Maksimum</Label>
                        <Input id="max-value" type="number" placeholder="100" />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="closing-date">Tanggal Penutupan</Label>
                      <DatePicker id="closing-date" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="resolution-date">Tanggal Resolusi</Label>
                      <DatePicker id="resolution-date" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Simpan Draft</Button>
                  <Button onClick={() => document.getElementById("advanced-tab")?.click()}>Lanjutkan</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="advanced" id="advanced-tab">
              <Card>
                <CardHeader>
                  <CardTitle>Pengaturan Lanjutan</CardTitle>
                  <CardDescription>Konfigurasi parameter tambahan untuk pasar prediksi Anda.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="resolution-source">Sumber Resolusi</Label>
                    <Textarea
                      id="resolution-source"
                      placeholder="Jelaskan bagaimana pasar ini akan diselesaikan..."
                      rows={3}
                    />
                    <p className="text-sm text-muted-foreground">
                      Tentukan sumber data yang akan digunakan untuk menyelesaikan pasar ini.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="liquidity">Likuiditas Awal (USDC)</Label>
                    <Input id="liquidity" type="number" placeholder="100" />
                    <p className="text-sm text-muted-foreground">
                      Jumlah USDC yang ingin Anda sediakan sebagai likuiditas awal.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fee">Biaya Pasar (%)</Label>
                    <Input id="fee" type="number" placeholder="2" min="0" max="5" />
                    <p className="text-sm text-muted-foreground">
                      Persentase biaya yang akan diambil dari volume perdagangan pasar.
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="private-market">Pasar Privat</Label>
                      <p className="text-sm text-muted-foreground">Batasi pasar hanya untuk pengguna yang diundang.</p>
                    </div>
                    <Switch id="private-market" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="allow-comments">Izinkan Komentar</Label>
                      <p className="text-sm text-muted-foreground">
                        Pengguna dapat mengomentari dan mendiskusikan pasar ini.
                      </p>
                    </div>
                    <Switch id="allow-comments" defaultChecked />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => document.getElementById("basic-tab")?.click()}>
                    Kembali
                  </Button>
                  <Button
                    onClick={handleCreateMarket}
                    disabled={isSubmitting || coinBalance < 100}
                    className="bg-primary-600 hover:bg-primary-700"
                  >
                    {isSubmitting ? "Membuat..." : "Buat Pasar"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
          <Toaster />
        </div>
      </main>
    </div>
  )
}

