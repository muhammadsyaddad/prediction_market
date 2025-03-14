"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Header } from "@/components/header"
import { createClient } from "@/lib/supabase/client"
// Tambahkan import untuk logo Google dan Twitter
import { Eye, EyeOff, Mail, Lock, User, Twitter } from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"

export default function AuthPage() {
  const router = useRouter()
  const { signIn, signUp } = useAuth()
  const [activeTab, setActiveTab] = useState("signup")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Form states
  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    password: "",
  })

  const [signinForm, setSigninForm] = useState({
    email: "",
    password: "",
  })

  const supabase = createClient()

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await signUp(signupForm.email, signupForm.password, signupForm.name)
    } catch (error: any) {
      console.error("Signup error details:", error)
      setError(error.message || "Terjadi kesalahan saat mendaftar. Silakan coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await signIn(signinForm.email, signinForm.password)
    } catch (error: any) {
      setError(error.message || "Terjadi kesalahan saat masuk")
    } finally {
      setLoading(false)
    }
  }

  // Tambahkan fungsi untuk login dengan Google dan Twitter
  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError("")

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      })

      if (error) throw error
    } catch (error: any) {
      console.error("Google sign in error:", error)
      setError(error.message || "Terjadi kesalahan saat login dengan Google")
    } finally {
      setLoading(false)
    }
  }

  const handleTwitterSignIn = async () => {
    setLoading(true)
    setError("")

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "twitter",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (error: any) {
      console.error("Twitter sign in error:", error)
      setError(error.message || "Terjadi kesalahan saat login dengan Twitter")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">PredictX</CardTitle>
            <CardDescription>Platform pasar prediksi berbasis cryptocurrency</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signup" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signup">Daftar</TabsTrigger>
                <TabsTrigger value="signin">Masuk</TabsTrigger>
              </TabsList>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        placeholder="Nama Lengkap"
                        className="pl-10"
                        value={signupForm.name}
                        onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="nama@example.com"
                        className="pl-10"
                        value={signupForm.email}
                        onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10"
                        value={signupForm.password}
                        onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="sr-only">{showPassword ? "Sembunyikan password" : "Tampilkan password"}</span>
                      </Button>
                    </div>
                  </div>

                  {error && <div className="text-sm text-destructive">{error}</div>}

                  <Button
                    type="submit"
                    className="w-full h-11 bg-primary-600 hover:bg-primary-700 text-white font-medium"
                    disabled={loading}
                  >
                    {loading ? "Mendaftar..." : "Daftar"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="nama@example.com"
                        className="pl-10"
                        value={signinForm.email}
                        onChange={(e) => setSigninForm({ ...signinForm, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="signin-password">Password</Label>
                      <Link href="/auth/reset-password" className="text-sm text-primary hover:underline">
                        Lupa password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signin-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10"
                        value={signinForm.password}
                        onChange={(e) => setSigninForm({ ...signinForm, password: e.target.value })}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="sr-only">{showPassword ? "Sembunyikan password" : "Tampilkan password"}</span>
                      </Button>
                    </div>
                  </div>

                  {error && <div className="text-sm text-destructive">{error}</div>}

                  <Button
                    type="submit"
                    className="w-full h-11 bg-primary-600 hover:bg-primary-700 text-white font-medium"
                    disabled={loading}
                  >
                    {loading ? "Masuk..." : "Masuk"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Atau lanjutkan dengan</span>
              </div>
            </div>
            {/* Perbarui bagian tombol sosial di CardFooter */}
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" onClick={handleGoogleSignIn} disabled={loading}>
                <Image src="/google-logo.svg" alt="Google" width={16} height={16} className="mr-2" />
                Google
              </Button>
              <Button variant="outline" onClick={handleTwitterSignIn} disabled={loading}>
                <Twitter className="h-4 w-4 mr-2" />
                Twitter
              </Button>
            </div>
            <p className="text-xs text-center text-muted-foreground mt-4">
              Dengan mendaftar, Anda menyetujui{" "}
              <Link href="/terms" className="text-primary hover:underline">
                Syarat Layanan
              </Link>{" "}
              dan{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Kebijakan Privasi
              </Link>{" "}
              kami.
            </p>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}

