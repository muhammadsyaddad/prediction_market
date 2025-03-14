import { createClient } from "@/lib/supabase/client"

export interface Position {
  id: string
  user_id: string
  market_id: string
  position: "yes" | "no"
  shares: number
  average_price: number
  current_value: number
  profit: number
  profit_percentage: number
  market?: {
    title: string
    category: string
    status: string
    probability: number
    closing_date: string
  }
}

export interface Transaction {
  id: string
  user_id: string
  market_id: string
  type: "buy" | "sell"
  position: "yes" | "no"
  shares: number
  price: number
  total: number
  created_at: string
  market?: {
    title: string
  }
}

export const portfolioService = {
  async getUserPositions() {
    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      const { data, error } = await supabase
        .from("positions")
        .select(`
          *,
          market:markets(title, category, status, probability, closing_date)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Database error:", error)
        return []
      }

      return data as Position[]
    } catch (error) {
      console.error("Error fetching user positions:", error)
      return []
    }
  },

  async getUserTransactions() {
    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      const { data, error } = await supabase
        .from("transactions")
        .select(`
          *,
          market:markets(title)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Database error:", error)
        return []
      }

      return data as Transaction[]
    } catch (error) {
      console.error("Error fetching user transactions:", error)
      return []
    }
  },

  async executeTransaction(
    marketId: string,
    position: "yes" | "no",
    type: "buy" | "sell",
    shares: number,
    price: number,
  ) {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("User not authenticated")

    // Create transaction
    const total = shares * price
    const { data: transactionData, error: transactionError } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        market_id: marketId,
        type,
        position,
        shares,
        price,
        total,
      })
      .select()
      .single()

    if (transactionError) throw transactionError

    // Update user position or create new one
    const { data: existingPosition, error: positionQueryError } = await supabase
      .from("positions")
      .select("*")
      .eq("user_id", user.id)
      .eq("market_id", marketId)
      .eq("position", position)
      .single()

    if (positionQueryError && positionQueryError.code !== "PGRST116") {
      // PGRST116 is "Results contain 0 rows" - which is fine
      throw positionQueryError
    }

    if (existingPosition) {
      // Update existing position
      const newShares = type === "buy" ? existingPosition.shares + shares : existingPosition.shares - shares

      // If selling all shares, delete the position
      if (newShares <= 0) {
        const { error: deleteError } = await supabase.from("positions").delete().eq("id", existingPosition.id)

        if (deleteError) throw deleteError
      } else {
        // Calculate new average price (only for buys)
        let newAveragePrice = existingPosition.average_price
        if (type === "buy") {
          const totalValue = existingPosition.shares * existingPosition.average_price + shares * price
          newAveragePrice = totalValue / newShares
        }

        const { error: updateError } = await supabase
          .from("positions")
          .update({
            shares: newShares,
            average_price: newAveragePrice,
          })
          .eq("id", existingPosition.id)

        if (updateError) throw updateError
      }
    } else if (type === "buy") {
      // Create new position
      const { error: createError } = await supabase.from("positions").insert({
        user_id: user.id,
        market_id: marketId,
        position,
        shares,
        average_price: price,
        current_value: price * shares,
        profit: 0,
        profit_percentage: 0,
      })

      if (createError) throw createError
    }

    return transactionData as Transaction
  },

  async getPortfolioHistory(days = 30) {
    // In a real app, this would fetch actual portfolio history from the database
    // For now, we'll return empty data
    return []
  },

  async getMarketHistory(marketId: string, days = 30) {
    // In a real app, this would fetch actual market history from the database
    // For now, we'll return empty data
    return []
  },
}

