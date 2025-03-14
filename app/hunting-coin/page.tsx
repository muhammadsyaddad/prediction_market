"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Header } from "@/components/header"
import { useAuth } from "@/contexts/auth-context"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Coins, Brain, Video, ArrowRight, Check } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { coinService } from "@/services/coin-service"

export default function HuntingCoinPage() {
  const [coinBalance, setCoinBalance] = useState(0)
  const [huntingAttempts, setHuntingAttempts] = useState(0)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const fetchUserCoins = async () => {
      if (!user) {
        router.push("/auth")
        return
      }

      setLoading(true)
      try {
        const supabase = createClient()
        console.log("Hunting coin page - fetching for user:", user.id)

        // Get user's coin balance
        let userProfile = await coinService.getUserProfile(user.id)

        if (!userProfile) {
          console.log("No profile found in hunting-coin, creating one")
          // Create profile if it doesn't exist
          userProfile = await coinService.createUserProfile(user.id)
          setCoinBalance(userProfile.coin_balance)
          setHuntingAttempts(userProfile.daily_hunting_attempts)
        } else {
          console.log("Profile found in hunting-coin:", userProfile)
          // Check if it's a new day to reset attempts
          const today = new Date().toISOString().split("T")[0]
          const lastHuntingDate = userProfile.last_hunting_date

          if (lastHuntingDate !== today) {
            console.log("New day, resetting attempts")
            // Reset daily attempts
            const { error: updateError } = await supabase
              .from("user_profiles")
              .update({
                daily_hunting_attempts: 0,
                last_hunting_date: today,
              })
              .eq("user_id", user.id)

            if (updateError) throw updateError

            setCoinBalance(userProfile.coin_balance)
            setHuntingAttempts(0)
          } else {
            setCoinBalance(userProfile.coin_balance)
            setHuntingAttempts(userProfile.daily_hunting_attempts)
          }
        }
      } catch (error) {
        console.error("Error in hunting-coin page:", error)
        // Display an error message or handle it
      } finally {
        setLoading(false)
      }
    }

    fetchUserCoins()
  }, [user, router])

  const handleStartHunting = (challengeNumber: number) => {
    router.push(`/hunting-coin/challenge/${challengeNumber}`)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Berburu Koin</h1>
            <div className="flex items-center bg-primary/10 px-4 py-2 rounded-full">
              <Coins className="h-5 w-5 mr-2 text-primary" />
              <span className="font-bold">{coinBalance} Koin</span>
            </div>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Kesempatan Harian</CardTitle>
              <CardDescription>
                Anda memiliki 3 kesempatan setiap hari untuk mendapatkan koin. Jawab pertanyaan dengan benar atau tonton
                video untuk mendapatkan koin.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Kesempatan yang tersisa</span>
                  <span className="font-medium">{3 - huntingAttempts} dari 3</span>
                </div>
                <Progress value={(huntingAttempts / 3) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className={huntingAttempts >= 1 ? "opacity-50" : ""}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Tantangan 1</CardTitle>
                <CardDescription>Jawab soal matematika</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-20 flex items-center justify-center">
                  <Brain className="h-12 w-12 text-primary/60" />
                </div>
                <div className="text-center text-sm mt-2">
                  {huntingAttempts >= 1 ? (
                    <div className="flex items-center justify-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span>Selesai</span>
                    </div>
                  ) : (
                    <span>Jawab soal matematika sederhana untuk mendapatkan koin</span>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  disabled={huntingAttempts >= 1 || loading}
                  onClick={() => handleStartHunting(1)}
                >
                  {huntingAttempts >= 1 ? "Selesai" : "Mulai"}
                  {huntingAttempts < 1 && <ArrowRight className="h-4 w-4 ml-2" />}
                </Button>
              </CardFooter>
            </Card>

            <Card className={huntingAttempts >= 2 || huntingAttempts < 1 ? "opacity-50" : ""}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Tantangan 2</CardTitle>
                <CardDescription>Jawab soal matematika lanjutan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-20 flex items-center justify-center">
                  <Brain className="h-12 w-12 text-primary/60" />
                </div>
                <div className="text-center text-sm mt-2">
                  {huntingAttempts >= 2 ? (
                    <div className="flex items-center justify-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span>Selesai</span>
                    </div>
                  ) : huntingAttempts < 1 ? (
                    <span>Selesaikan tantangan 1 terlebih dahulu</span>
                  ) : (
                    <span>Jawab soal matematika yang lebih menantang</span>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  disabled={huntingAttempts >= 2 || huntingAttempts < 1 || loading}
                  onClick={() => handleStartHunting(2)}
                >
                  {huntingAttempts >= 2 ? "Selesai" : huntingAttempts < 1 ? "Terkunci" : "Mulai"}
                  {huntingAttempts === 1 && <ArrowRight className="h-4 w-4 ml-2" />}
                </Button>
              </CardFooter>
            </Card>

            <Card className={huntingAttempts >= 3 || huntingAttempts < 2 ? "opacity-50" : ""}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Tantangan 3</CardTitle>
                <CardDescription>Tonton video singkat</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-20 flex items-center justify-center">
                  <Video className="h-12 w-12 text-primary/60" />
                </div>
                <div className="text-center text-sm mt-2">
                  {huntingAttempts >= 3 ? (
                    <div className="flex items-center justify-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span>Selesai</span>
                    </div>
                  ) : huntingAttempts < 2 ? (
                    <span>Selesaikan tantangan 2 terlebih dahulu</span>
                  ) : (
                    <span>Tonton video singkat untuk mendapatkan koin</span>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  disabled={huntingAttempts >= 3 || huntingAttempts < 2 || loading}
                  onClick={() => handleStartHunting(3)}
                >
                  {huntingAttempts >= 3 ? "Selesai" : huntingAttempts < 2 ? "Terkunci" : "Mulai"}
                  {huntingAttempts === 2 && <ArrowRight className="h-4 w-4 ml-2" />}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

