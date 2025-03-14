import { createClient } from "@/lib/supabase/client"

export interface UserProfile {
  id?: string
  user_id: string
  coin_balance: number
  daily_hunting_attempts: number
  last_hunting_date: string
}

export const coinService = {
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const supabase = createClient()

    try {
      console.log("Fetching user profile for:", userId)

      // Gunakan .maybeSingle() sebagai pengganti .single()
      // .maybeSingle() mengembalikan null jika tidak ada baris yang ditemukan
      // dan error jika ada lebih dari satu baris
      const { data, error } = await supabase.from("user_profiles").select("*").eq("user_id", userId).maybeSingle()

      if (error) {
        // Safely log the error
        console.error("Error fetching user profile:", error.message || "Unknown error")

        // Jika ada multiple rows, kita perlu membersihkan data
        if (error.message && error.message.includes("multiple")) {
          console.log("Multiple profiles found, cleaning up...")

          // Ambil semua profil dengan user_id ini
          const { data: profiles } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: true })

          if (profiles && profiles.length > 1) {
            // Simpan profil pertama (yang paling lama)
            const firstProfile = profiles[0]

            // Hapus profil lainnya
            for (let i = 1; i < profiles.length; i++) {
              await supabase.from("user_profiles").delete().eq("id", profiles[i].id)
            }

            console.log("Cleanup complete, returning first profile")
            return firstProfile as UserProfile
          }
        }

        throw new Error(error.message || "Error fetching user profile")
      }

      if (!data) {
        console.log("No user profile found")
        return null
      }

      console.log("User profile found:", data)
      return data as UserProfile
    } catch (error: any) {
      // Safely log any other errors
      console.error("Error in getUserProfile:", error?.message || "Unknown error")
      return null
    }
  },

  async createUserProfile(userId: string): Promise<UserProfile> {
    const supabase = createClient()

    try {
      console.log("Creating user profile for:", userId)
      const today = new Date().toISOString().split("T")[0]

      // Create new profile
      const { data, error } = await supabase
        .from("user_profiles")
        .insert({
          user_id: userId,
          coin_balance: 100, // Start with 100 coins for better testing
          daily_hunting_attempts: 0,
          last_hunting_date: today,
        })
        .select()
        .single()

      if (error) {
        console.error("Error creating user profile:", error.message || "Unknown error")
        throw new Error(error.message || "Error creating user profile")
      }

      console.log("User profile created:", data)
      return data as UserProfile
    } catch (error: any) {
      console.error("Error in createUserProfile:", error?.message || "Unknown error")
      throw new Error(error?.message || "Failed to create user profile")
    }
  },

  async updateCoinBalance(userId: string, amount: number): Promise<UserProfile> {
    const supabase = createClient()

    try {
      console.log(`Updating coin balance for ${userId} by ${amount}`)

      // Get current profile
      let profile = await this.getUserProfile(userId)

      // If profile doesn't exist, create one
      if (!profile) {
        profile = await this.createUserProfile(userId)
      }

      // Calculate new balance
      const newBalance = profile.coin_balance + amount
      console.log(`New balance will be: ${newBalance}`)

      // Update the balance
      const { data, error } = await supabase
        .from("user_profiles")
        .update({ coin_balance: newBalance })
        .eq("user_id", userId)
        .select()
        .single()

      if (error) {
        console.error("Error updating coin balance:", error.message || "Unknown error")
        throw new Error(error.message || "Error updating coin balance")
      }

      console.log("Coin balance updated:", data)
      return data as UserProfile
    } catch (error: any) {
      console.error("Error in updateCoinBalance:", error?.message || "Unknown error")
      throw new Error(error?.message || "Failed to update coin balance")
    }
  },

  async updateHuntingAttempts(userId: string, attemptNumber: number): Promise<UserProfile> {
    const supabase = createClient()

    try {
      console.log(`Updating hunting attempts for ${userId} to ${attemptNumber}`)

      // Get current profile
      let profile = await this.getUserProfile(userId)

      // If profile doesn't exist, create one
      if (!profile) {
        profile = await this.createUserProfile(userId)
      }

      // Update attempts
      const { data, error } = await supabase
        .from("user_profiles")
        .update({ daily_hunting_attempts: attemptNumber })
        .eq("user_id", userId)
        .select()
        .single()

      if (error) {
        console.error("Error updating hunting attempts:", error.message || "Unknown error")
        throw new Error(error.message || "Error updating hunting attempts")
      }

      console.log("Hunting attempts updated:", data)
      return data as UserProfile
    } catch (error: any) {
      console.error("Error in updateHuntingAttempts:", error?.message || "Unknown error")
      throw new Error(error?.message || "Failed to update hunting attempts")
    }
  },

  async resetDailyAttempts(userId: string): Promise<UserProfile> {
    const supabase = createClient()

    try {
      console.log(`Resetting daily attempts for ${userId}`)
      const today = new Date().toISOString().split("T")[0]

      const { data, error } = await supabase
        .from("user_profiles")
        .update({
          daily_hunting_attempts: 0,
          last_hunting_date: today,
        })
        .eq("user_id", userId)
        .select()
        .single()

      if (error) {
        console.error("Error resetting daily attempts:", error.message || "Unknown error")
        throw new Error(error.message || "Error resetting daily attempts")
      }

      console.log("Daily attempts reset:", data)
      return data as UserProfile
    } catch (error: any) {
      console.error("Error in resetDailyAttempts:", error?.message || "Unknown error")
      throw new Error(error?.message || "Failed to reset daily attempts")
    }
  },

  async checkAndResetDailyAttempts(userId: string): Promise<UserProfile> {
    try {
      console.log(`Checking and possibly resetting daily attempts for ${userId}`)

      // Get current profile
      let profile = await this.getUserProfile(userId)

      // If profile doesn't exist, create one
      if (!profile) {
        profile = await this.createUserProfile(userId)
        return profile
      }

      const today = new Date().toISOString().split("T")[0]

      // Check if it's a new day
      if (profile.last_hunting_date !== today) {
        console.log("New day detected, resetting attempts")
        return await this.resetDailyAttempts(userId)
      }

      return profile
    } catch (error: any) {
      console.error("Error in checkAndResetDailyAttempts:", error?.message || "Unknown error")
      throw new Error(error?.message || "Failed to check/reset daily attempts")
    }
  },
}

