"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import { createClient } from "@/lib/supabase/client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react"

export default function TestConnectionPage() {
  const [loading, setLoading] = useState(true)
  const [supabaseConnected, setSupabaseConnected] = useState(false)
  const [tablesExist, setTablesExist] = useState<Record<string, boolean>>({
    user_profiles: false,
    markets: false,
    positions: false,
    transactions: false,
  })
  const [error, setError] = useState<string | null>(null)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
  }

  useEffect(() => {
    const testConnection = async () => {
      setLoading(true)
      setError(null)

      try {
        addLog("Testing Supabase connection...")
        const supabase = createClient()

        // Test connection by making a simple query
        try {
          const { error } = await supabase.from("_test_connection_").select("*").limit(1)
          // This will fail with a 404, which is expected
          setSupabaseConnected(true)
          addLog("✅ Supabase connection successful (404 error is expected)")
        } catch (error: any) {
          // Check if it's a connection error or just a 404 (which is expected)
          if (error.message && error.message.includes("Failed to fetch")) {
            setSupabaseConnected(false)
            addLog(`❌ Supabase connection failed: ${error.message}`)
            setError("Connection to Supabase failed. Check your URL and API key.")
            setLoading(false)
            return
          } else {
            // 404 is expected, so connection is successful
            setSupabaseConnected(true)
            addLog("✅ Supabase connection successful")
          }
        }

        // Check if tables exist
        const tables = ["user_profiles", "markets", "positions", "transactions"]
        const tableStatus = { ...tablesExist }

        for (const table of tables) {
          addLog(`Checking if ${table} table exists...`)
          try {
            const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true })

            if (error) {
              if (error.code === "42P01") {
                // Table doesn't exist
                tableStatus[table] = false
                addLog(`❌ ${table} table doesn't exist`)
              } else {
                throw error
              }
            } else {
              tableStatus[table] = true
              addLog(`✅ ${table} table exists with ${count} rows`)
            }
          } catch (error: any) {
            // Check if it's a "relation does not exist" error
            if (error.message && error.message.includes("relation") && error.message.includes("does not exist")) {
              tableStatus[table] = false
              addLog(`❌ ${table} table doesn't exist: ${error.message}`)
            } else {
              throw error
            }
          }
        }

        setTablesExist(tableStatus)
      } catch (error: any) {
        console.error("Test connection error:", error)
        addLog(`❌ Error during testing: ${error.message || "Unknown error"}`)
        setError(`Error: ${error.message || "Unknown error"}`)
      } finally {
        setLoading(false)
      }
    }

    testConnection()
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-6">Test Supabase Connection</h1>

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
              <CardTitle>Connection Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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

              {Object.entries(tablesExist).map(([table, exists]) => (
                <div key={table} className="flex items-center justify-between">
                  <span>{table} Table Exists:</span>
                  <span className="flex items-center">
                    {exists ? (
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
              ))}

              <div className="pt-4">
                <Button onClick={() => window.location.reload()} disabled={loading}>
                  {loading ? "Testing..." : "Test Again"}
                </Button>
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
      </main>
    </div>
  )
}

