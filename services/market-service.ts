import { createClient } from "@/lib/supabase/client"

export interface Market {
  id: string
  title: string
  description: string
  category: string
  type: string
  probability: number
  volume: number
  liquidity: number
  closing_date: string
  resolution_date: string
  resolution_source: string
  created_by: string
  status: string
  created_at: string
}

export interface CreateMarketData {
  title: string
  description: string
  category: string
  type: string
  closing_date: string
  resolution_date: string
  resolution_source: string
  liquidity: number
  fee: number
  is_private: boolean
  allow_comments: boolean
  options?: string[]
  min_value?: number
  max_value?: number
}

export const marketService = {
  async getMarkets(category?: string, page = 1, limit = 12, search?: string, featured?: boolean) {
    const supabase = createClient()

    try {
      let query = supabase.from("markets").select("*", { count: "exact" })

      if (category && category !== "semua") {
        query = query.eq("category", category)
      }

      if (search) {
        query = query.ilike("title", `%${search}%`)
      }

      if (featured) {
        query = query.eq("featured", true)
      }

      // Calculate pagination
      const from = (page - 1) * limit
      const to = from + limit - 1

      const { data, error, count } = await query.order("created_at", { ascending: false }).range(from, to)

      if (error) {
        console.error("Database error:", error)
        // Return empty data if there's an error
        return {
          data: [],
          count: 0,
          totalPages: 0,
        }
      }

      return {
        data: data as Market[],
        count: count || 0,
        totalPages: count ? Math.ceil(count / limit) : 0,
      }
    } catch (error) {
      console.error("Error fetching markets:", error)
      // Return empty data if there's an error
      return {
        data: [],
        count: 0,
        totalPages: 0,
      }
    }
  },

  async getMarketById(id: string) {
    const supabase = createClient()

    try {
      const { data, error } = await supabase.from("markets").select("*").eq("id", id).single()

      if (error) {
        console.error("Database error:", error)
        return null
      }

      return data as Market
    } catch (error) {
      console.error("Error fetching market:", error)
      return null
    }
  },

  async createMarket(marketData: CreateMarketData) {
    const supabase = createClient()

    // Supabase auth user ID
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("User not authenticated")

    const { data, error } = await supabase
      .from("markets")
      .insert({
        ...marketData,
        created_by: user.id,
        status: "active",
        probability: marketData.type === "binary" ? 50 : 0, // Default probability for binary markets
      })
      .select()
      .single()

    if (error) throw error

    return data as Market
  },

  async updateMarket(id: string, marketData: Partial<CreateMarketData>) {
    const supabase = createClient()

    const { data, error } = await supabase.from("markets").update(marketData).eq("id", id).select().single()

    if (error) throw error

    return data as Market
  },

  async deleteMarket(id: string) {
    const supabase = createClient()

    const { error } = await supabase.from("markets").delete().eq("id", id)

    if (error) throw error

    return true
  },
  async getFeaturedMarkets(limit = 3) {
    const supabase = createClient()

    try {
      const { data, error } = await supabase
        .from("markets")
        .select("*")
        .eq("featured", true)
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) {
        console.error("Database error:", error)
        return []
      }

      return data as Market[]
    } catch (error) {
      console.error("Error fetching featured markets:", error)
      return []
    }
  },
}

