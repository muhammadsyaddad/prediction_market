"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Coins } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { coinService } from "@/services/coin-service"

export function HuntingCoinButton() {
  const [coinBalance, setCoinBalance] = useState(0)
  const [huntingAttempts, setHuntingAttempts] = useState(0)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    const fetchUserCoins = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        console.log("Fetching user coins for:", user.id)

        // Get user's coin balance
        let userProfile = await coinService.getUserProfile(user.id)

        if (!userProfile) {
          console.log("No profile found, creating one")
          // Create profile if it doesn't exist
          try {
            userProfile = await coinService.createUserProfile(user.id)
            setCoinBalance(userProfile.coin_balance)
            setHuntingAttempts(userProfile.daily_hunting_attempts)
          } catch (createError) {
            console.error("Error creating user profile:", createError)
            setCoinBalance(0)
            setHuntingAttempts(0)
          }
        } else {
          console.log("Profile found:", userProfile)
          // Check if it's a new day to reset attempts
          const today = new Date().toISOString().split("T")[0]
          const lastHuntingDate = userProfile.last_hunting_date

          if (lastHuntingDate !== today) {
            console.log("New day, resetting attempts")
            // Reset daily attempts
            try {
              const updatedProfile = await coinService.resetDailyAttempts(user.id)
              setCoinBalance(updatedProfile.coin_balance)
              setHuntingAttempts(0)
            } catch (resetError) {
              console.error("Error resetting daily attempts:", resetError)
              setCoinBalance(userProfile.coin_balance)
              setHuntingAttempts(userProfile.daily_hunting_attempts)
            }
          } else {
            setCoinBalance(userProfile.coin_balance)
            setHuntingAttempts(userProfile.daily_hunting_attempts)
          }
        }
      } catch (error) {
        console.error("Error fetching user coins:", error)
        // Set default values in case of error
        setCoinBalance(0)
        setHuntingAttempts(0)
      } finally {
        setLoading(false)
      }
    }

    fetchUserCoins()
  }, [user]) // Hapus router dari dependencies untuk menghindari infinite loop

  const handleHuntingClick = () => {
    if (!user) {
      router.push("/auth")
      return
    }

    router.push("/hunting-coin")
  }

  return (
    <Button variant="outline" size="sm" onClick={handleHuntingClick} disabled={loading} className="relative">
      <Coins className="h-4 w-4 mr-2" />
      {loading ? "Loading..." : `${coinBalance} Koin`}
      {!loading && huntingAttempts >= 3 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          3/3
        </span>
      )}
    </Button>
  )
}

