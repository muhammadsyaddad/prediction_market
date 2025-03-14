"use client"

import type React from "react"
import { createContext, useState, useEffect, useContext } from "react"
import { useRouter } from "next/navigation"
import type { Session, User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
  getUserInitial: () => string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient() // Use the singleton instance

  useEffect(() => {
    const getSession = async () => {
      setIsLoading(true)

      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()
        if (error) throw error

        setSession(session)
        setUser(session?.user || null)
      } catch (error) {
        console.error("Error getting session:", error)
      } finally {
        setIsLoading(false)
      }
    }

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, []) // Remove supabase from dependencies since it's now a singleton

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      router.push("/")
    } catch (error) {
      throw error
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    try {
      // First create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      })

      if (authError) throw authError

      // If auth user created successfully, create a user profile
      if (authData.user) {
        try {
          // Check if profile already exists
          const { data: existingProfile } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("user_id", authData.user.id)
            .single()

          // Only create profile if it doesn't exist
          if (!existingProfile) {
            const { error: profileError } = await supabase.from("user_profiles").insert({
              user_id: authData.user.id,
              coin_balance: 100, // Start with 100 coins for better user experience
              daily_hunting_attempts: 0,
              last_hunting_date: new Date().toISOString().split("T")[0],
            })

            if (profileError) {
              console.error("Error creating user profile:", profileError)
              // Continue anyway since auth user was created
            }
          }
        } catch (profileError) {
          console.error("Error checking/creating user profile:", profileError)
          // Continue anyway since auth user was created
        }
      }

      router.push("/")
    } catch (error) {
      console.error("Signup error:", error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const getUserInitial = () => {
    if (!user) return ""
    // Try to get name from metadata
    const name = user.user_metadata?.name || ""
    if (name) return name.charAt(0).toUpperCase()
    // Fallback to email
    return user.email ? user.email.charAt(0).toUpperCase() : "U"
  }

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signIn, signUp, signOut, getUserInitial }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

