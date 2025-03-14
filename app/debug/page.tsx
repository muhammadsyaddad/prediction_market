"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import { useAuth } from "@/contexts/auth-context"
import { createClient } from "@/lib/supabase/client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, XCircle, AlertCircle, ArrowRight } from "lucide-react"

export default function DebugPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [supabaseConnected, setSupabaseConnected] = useState(false)
  const [tableExists, setTableExists] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
  }

  useEffect(() => {
    const runTests = async () => {
      setLoading(true)
      setError(null)

      try {
        // Test 1: Check if user is authenticated
        if (!user) {
          addLog("❌ User not authenticated")
          setError("Anda belum login. Silakan login terlebih dahulu.")
          setLoading(false)
          return
        }

        addLog(`✅ User authenticated: ${user.id}`)

        // Test 2: Check Supabase connection
        const supabase = createClient()
        try {
          addLog("Testing Supabase connection...")
          const { data, error } = await supabase.from("_test_connection_").select("*").limit(1)

          // This will fail with a 404, which is expected
          // We just want to check if we can connect to Supabase
          setSupabaseConnected(true)
          addLog("✅ Supabase connection successful")
        } catch (error: any) {
          // Check if it's a connection error or just a 404 (which is expected)
          if (error.message && error.message.includes("Failed to fetch")) {
            setSupabaseConnected(false)
            addLog(`❌ Supabase connection failed: ${error.message}`)
            setError("Koneksi ke Supabase gagal. Periksa URL dan API key Anda.")
            setLoading(false)
            return
          } else {
            // 404 is expected, so connection is successful
            setSupabaseConnected(true)
            addLog("✅ Supabase connection successful (404 error is expected)")
          }
        }

        // Test 3: Check if user_profiles table exists
        addLog("Checking if user_profiles table exists...")
        try {
          const { data, error } = await supabase
            .from("user_profiles")
            .select("count(*)", { count: "exact", head: true })

          if (error) {
            if (error.code === "42P01") {
              // Table doesn't exist
              setTableExists(false)
              addLog(`❌ user_profiles table doesn't exist: ${error.message}`)
              setError("Tabel user_profiles tidak ada. Jalankan SQL migration untuk membuatnya.")
              setLoading(false)
              return
            } else {
              throw error
            }
          }

          setTableExists(true)
          addLog("✅ user_profiles table exists")
        } catch (error: any) {
          // Check if it's a "relation does not exist" error
          if (error.message && error.message.includes("relation") && error.message.includes("does not exist")) {
            setTableExists(false)
            addLog(`❌ user_profiles table doesn't exist: ${error.message}`)
            setError("Tabel user_profiles tidak ada. Jalankan SQL migration untuk membuatnya.")
            setLoading(false)
            return
          } else {
            throw error
          }
        }

        // Test 4: Check if user profile exists
        addLog(`Checking if profile exists for user ${user.id}...`)
        const { data: profile, error: profileError } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", user.id)
          .single()

        if (profileError) {
          if (profileError.code === "PGRST116") {
            // No rows returned
            addLog("❌ User profile doesn't exist")
            setUserProfile(null)
          } else {
            throw profileError
          }
        } else {
          addLog("✅ User profile exists")
          setUserProfile(profile)
        }
      } catch (error: any) {
        console.error("Debug error:", error)
        addLog(`❌ Error during debugging: ${error.message}`)
        setError(`Error: ${error.message}`)
      } finally {
        setLoading(false)
      }
    }

    runTests()
  }, [user])

  const createProfile = async () => {
    if (!user) return

    setLoading(true)
    addLog("Creating user profile...")

    try {
      const supabase = createClient()
      const today = new Date().toISOString().split("T")[0]

      const { data, error } = await supabase
        .from("user_profiles")
        .insert({
          user_id: user.id,
          coin_balance: 100,
          daily_hunting_attempts: 0,
          last_hunting_date: today,
        })
        .select()
        .single()

      if (error) throw error

      addLog("✅ User profile created successfully")
      setUserProfile(data)
    } catch (error: any) {
      console.error("Error creating profile:", error)
      addLog(`❌ Error creating profile: ${error.message}`)
      setError(`Error creating profile: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const resetProfile = async () => {
    if (!user) return

    setLoading(true)
    addLog("Resetting user profile...")

    try {
      const supabase = createClient()
      const today = new Date().toISOString().split("T")[0]

      const { data, error } = await supabase
        .from("user_profiles")
        .update({
          coin_balance: 100,
          daily_hunting_attempts: 0,
          last_hunting_date: today,
        })
        .eq("user_id", user.id)
        .select()
        .single()

      if (error) throw error

      addLog("✅ User profile reset successfully")
      setUserProfile(data)
    } catch (error: any) {
      console.error("Error resetting profile:", error)
      addLog(`❌ Error resetting profile: ${error.message}`)
      setError(`Error resetting profile: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-6">Debugging Page</h1>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>User Authenticated:</span>
                <span className="flex items-center">
                  {user ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                      Yes
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-500 mr-2" />
                      No
                    </>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span>Supabase Connected:</span>
                <span className="flex items-center">
                  {supabaseConnected ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                      Yes
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-500 mr-2" />
                      No
                    </>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span>user_profiles Table Exists:</span>
                <span className="flex items-center">
                  {tableExists ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                      Yes
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-500 mr-2" />
                      No
                    </>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span>User Profile Exists:</span>
                <span className="flex items-center">
                  {userProfile ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                      Yes
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-500 mr-2" />
                      No
                    </>
                  )}
                </span>
              </div>

              {userProfile && (
                <div className="mt-4 p-4 bg-muted rounded-md">
                  <h3 className="font-medium mb-2">User Profile Data:</h3>
                  <pre className="text-xs overflow-auto">{JSON.stringify(userProfile, null, 2)}</pre>
                </div>
              )}

              <div className="flex gap-4 mt-4">
                {!userProfile && tableExists && (
                  <Button onClick={createProfile} disabled={loading}>
                    Create Profile
                  </Button>
                )}

                {userProfile && (
                  <Button onClick={resetProfile} disabled={loading}>
                    Reset Profile (100 Coins)
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Debug Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-black text-green-400 p-4 rounded-md h-[400px] overflow-y-auto font-mono text-sm">
                {logs.length === 0 && loading ? (
                  <p>Running tests...</p>
                ) : logs.length === 0 ? (
                  <p>No logs yet</p>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className="mb-1">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-bold mb-4">Langkah-langkah Perbaikan</h2>

          <div className="space-y-4">
            {!user && (
              <div className="flex items-start gap-2">
                <ArrowRight className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Login terlebih dahulu</p>
                  <p className="text-muted-foreground">Anda perlu login untuk menggunakan fitur koin.</p>
                </div>
              </div>
            )}

            {!supabaseConnected && (
              <div className="flex items-start gap-2">
                <ArrowRight className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Periksa koneksi Supabase</p>
                  <p className="text-muted-foreground">Pastikan URL dan API key Supabase sudah benar di file .env.</p>
                </div>
              </div>
            )}

            {!tableExists && (
              <div className="flex items-start gap-2">
                <ArrowRight className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Buat tabel user_profiles</p>
                  <p className="text-muted-foreground">Jalankan SQL migration untuk membuat tabel user_profiles.</p>
                </div>
              </div>
            )}

            {!userProfile && tableExists && (
              <div className="flex items-start gap-2">
                <ArrowRight className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Buat profil pengguna</p>
                  <p className="text-muted-foreground">
                    Klik tombol "Create Profile" di atas untuk membuat profil pengguna.
                  </p>
                </div>
              </div>
            )}

            {userProfile && (
              <div className="flex items-start gap-2">
                <ArrowRight className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Semua sudah siap!</p>
                  <p className="text-muted-foreground">
                    Profil pengguna sudah ada dengan {userProfile.coin_balance} koin.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

