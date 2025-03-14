"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle } from "lucide-react"

export default function SqlDebugPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const createUserProfilesTable = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    setResult(null)

    try {
      const supabase = createClient()

      // SQL to create user_profiles table
      const sql = `
      -- Create user_profiles table
      CREATE TABLE IF NOT EXISTS user_profiles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        coin_balance INTEGER NOT NULL DEFAULT 0,
        daily_hunting_attempts INTEGER NOT NULL DEFAULT 0,
        last_hunting_date DATE NOT NULL DEFAULT CURRENT_DATE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create index on user_id
      CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

      -- Enable Row Level Security
      ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

      -- Policy for users to read their own profile
      CREATE POLICY IF NOT EXISTS user_profiles_select_policy ON user_profiles
        FOR SELECT USING (auth.uid() = user_id);

      -- Policy for users to update their own profile
      CREATE POLICY IF NOT EXISTS user_profiles_update_policy ON user_profiles
        FOR UPDATE USING (auth.uid() = user_id);

      -- Policy for system to insert new profiles
      CREATE POLICY IF NOT EXISTS user_profiles_insert_policy ON user_profiles
        FOR INSERT WITH CHECK (auth.uid() = user_id);

      -- Function to update updated_at timestamp
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      -- Trigger to update updated_at on update
      DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
      CREATE TRIGGER update_user_profiles_updated_at
      BEFORE UPDATE ON user_profiles
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
      `

      // Execute SQL
      const { error } = await supabase.rpc("pgclient", { query: sql })

      if (error) throw error

      setSuccess("Tabel user_profiles berhasil dibuat!")

      // Check if table exists
      const { data, error: checkError } = await supabase
        .from("user_profiles")
        .select("count(*)", { count: "exact", head: true })

      if (checkError) throw checkError

      setResult({ tableCreated: true, count: data })
    } catch (error: any) {
      console.error("SQL error:", error)
      setError(`Error: ${error.message}`)

      // Special handling for common errors
      if (error.message.includes("permission denied")) {
        setError(
          "Error: Permission denied. Anda tidak memiliki izin untuk menjalankan SQL ini. Gunakan Supabase Dashboard untuk menjalankan SQL.",
        )
      } else if (error.message.includes("function pgclient() does not exist")) {
        setError("Error: Function pgclient() tidak ada. Anda perlu menjalankan SQL ini melalui Supabase Dashboard.")
      }
    } finally {
      setLoading(false)
    }
  }

  const runCustomSql = async (sql: string) => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    setResult(null)

    try {
      const supabase = createClient()

      // Execute SQL
      const { data, error } = await supabase.rpc("pgclient", { query: sql })

      if (error) throw error

      setSuccess("SQL berhasil dijalankan!")
      setResult(data)
    } catch (error: any) {
      console.error("SQL error:", error)
      setError(`Error: ${error.message}`)

      // Special handling for common errors
      if (error.message.includes("permission denied")) {
        setError(
          "Error: Permission denied. Anda tidak memiliki izin untuk menjalankan SQL ini. Gunakan Supabase Dashboard untuk menjalankan SQL.",
        )
      } else if (error.message.includes("function pgclient() does not exist")) {
        setError("Error: Function pgclient() tidak ada. Anda perlu menjalankan SQL ini melalui Supabase Dashboard.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-6">SQL Debugging</h1>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-500">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertTitle className="text-green-500">Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Buat Tabel user_profiles</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-muted-foreground">
                Klik tombol di bawah untuk membuat tabel user_profiles. Jika tabel sudah ada, ini tidak akan menimpa
                data yang sudah ada.
              </p>

              <Button onClick={createUserProfilesTable} disabled={loading}>
                {loading ? "Creating..." : "Create Table"}
              </Button>

              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Catatan: Jika tombol di atas tidak berfungsi, Anda perlu menjalankan SQL berikut di Supabase
                  Dashboard:
                </p>

                <div className="bg-muted p-4 rounded-md overflow-x-auto">
                  <pre className="text-xs">
                    {`-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coin_balance INTEGER NOT NULL DEFAULT 0,
  daily_hunting_attempts INTEGER NOT NULL DEFAULT 0,
  last_hunting_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own profile
CREATE POLICY IF NOT EXISTS user_profiles_select_policy ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for users to update their own profile
CREATE POLICY IF NOT EXISTS user_profiles_update_policy ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy for system to insert new profiles
CREATE POLICY IF NOT EXISTS user_profiles_insert_policy ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Custom SQL</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-muted-foreground">
                Jalankan SQL kustom untuk debugging. Catatan: Ini mungkin tidak berfungsi karena keterbatasan izin.
              </p>

              <Textarea
                id="custom-sql"
                placeholder="SELECT * FROM user_profiles LIMIT 10;"
                rows={5}
                className="mb-4 font-mono"
              />

              <Button
                onClick={() => {
                  const sql = (document.getElementById("custom-sql") as HTMLTextAreaElement).value
                  runCustomSql(sql)
                }}
                disabled={loading}
              >
                {loading ? "Running..." : "Run SQL"}
              </Button>

              {result && (
                <div className="mt-4 p-4 bg-muted rounded-md">
                  <h3 className="font-medium mb-2">Result:</h3>
                  <pre className="text-xs overflow-auto">{JSON.stringify(result, null, 2)}</pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

