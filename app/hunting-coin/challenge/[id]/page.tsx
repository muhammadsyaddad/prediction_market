"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Header } from "@/components/header"
import { coinService } from "@/services/coin-service"
import { useAuth } from "@/contexts/auth-context"

interface MathQuestion {
  question: string
  answer: string
}

export default function ChallengePage() {
  const router = useRouter()
  const params = useParams()
  const challengeId = params.id as string
  const [question, setQuestion] = useState<MathQuestion | null>(null)
  const [answer, setAnswer] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  // Perbaikan pada fungsi fetchMathQuestion untuk menangani error dengan lebih baik

  const fetchMathQuestion = async () => {
    setLoading(true)
    try {
      if (Number.parseInt(challengeId) <= 2) {
        // For challenge 1 and 2, generate math questions
        // Fallback to local generation to avoid API issues
        let question: MathQuestion

        if (challengeId === "1") {
          // Simple addition or subtraction
          const num1 = Math.floor(Math.random() * 20) + 1
          const num2 = Math.floor(Math.random() * 20) + 1
          const operation = Math.random() > 0.5 ? "+" : "-"

          if (operation === "+") {
            question = {
              question: `Berapakah hasil dari ${num1} + ${num2}?`,
              answer: (num1 + num2).toString(),
            }
          } else {
            // Ensure the result is positive
            const a = Math.max(num1, num2)
            const b = Math.min(num1, num2)
            question = {
              question: `Berapakah hasil dari ${a} - ${b}?`,
              answer: (a - b).toString(),
            }
          }
        } else {
          // More complex math for challenge 2
          const operations = [
            () => {
              // Multiplication
              const a = Math.floor(Math.random() * 12) + 1
              const b = Math.floor(Math.random() * 12) + 1
              return {
                question: `Berapakah hasil dari ${a} × ${b}?`,
                answer: (a * b).toString(),
              }
            },
            () => {
              // Division with whole number result
              const b = Math.floor(Math.random() * 10) + 1
              const a = b * (Math.floor(Math.random() * 10) + 1)
              return {
                question: `Berapakah hasil dari ${a} ÷ ${b}?`,
                answer: (a / b).toString(),
              }
            },
            () => {
              // Two-step operation
              const a = Math.floor(Math.random() * 10) + 1
              const b = Math.floor(Math.random() * 10) + 1
              const c = Math.floor(Math.random() * 10) + 1
              return {
                question: `Berapakah hasil dari (${a} + ${b}) × ${c}?`,
                answer: ((a + b) * c).toString(),
              }
            },
          ]

          const randomOperation = Math.floor(Math.random() * operations.length)
          question = operations[randomOperation]()
        }

        setQuestion(question)
      } else if (challengeId === "3") {
        // For challenge 3, it's a video challenge
        setQuestion({
          question: "Tonton video berikut untuk mendapatkan koin",
          answer: "completed",
        })
      } else {
        // Handle invalid challenge ID
        throw new Error("Challenge ID tidak valid")
      }
    } catch (error) {
      console.error("Error generating question:", error)
      toast({
        title: "Error",
        description: "Gagal memuat tantangan. Silakan coba lagi.",
        variant: "destructive",
      })
      router.push("/hunting-coin") // Redirect back to hunting coin page on error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) {
      router.push("/auth")
      return
    }

    if (challengeId) {
      fetchMathQuestion()
    }
  }, [challengeId, user, router])

  // Tambahkan console.log untuk debugging
  const handleSubmit = async () => {
    if (!user) {
      router.push("/auth")
      return
    }

    setSubmitting(true)
    try {
      console.log("Submitting answer for challenge:", challengeId)

      // For challenge 3 (video), any submission is correct
      const isCorrect = challengeId === "3" || (question && answer === question.answer)
      console.log("Answer is correct:", isCorrect)

      if (isCorrect) {
        console.log("Updating user coins and attempts")
        // Update user's coin balance and hunting attempts
        await coinService.updateCoinBalance(user.id, 10) // Award 10 coins
        await coinService.updateHuntingAttempts(user.id, Number.parseInt(challengeId))

        toast({
          title: "Selamat!",
          description: "Anda mendapatkan 10 koin!",
        })

        // Navigate back to hunting page
        router.push("/hunting-coin")
      } else {
        toast({
          title: "Jawaban Salah",
          description: "Coba lagi!",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error submitting answer:", error)
      toast({
        title: "Error",
        description: "Terjadi kesalahan. Silakan coba lagi.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // For challenge 3 (video), auto-complete after 10 seconds
  useEffect(() => {
    if (challengeId === "3" && !loading) {
      const timer = setTimeout(() => {
        handleSubmit()
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [challengeId, loading])

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Memuat tantangan...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Tantangan {challengeId}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {question && (
                <div className="text-center py-4">
                  <h2 className="text-xl font-bold mb-6">{question.question}</h2>

                  {challengeId === "3" ? (
                    <div className="space-y-4">
                      <div className="bg-muted aspect-video rounded-md flex items-center justify-center">
                        <p className="text-muted-foreground">Video sedang diputar...</p>
                      </div>
                      <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                        <div className="bg-primary h-full animate-progress"></div>
                      </div>
                      <p className="text-sm text-muted-foreground">Tunggu sebentar untuk mendapatkan koin...</p>
                    </div>
                  ) : (
                    <Input
                      type="text"
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="Masukkan jawaban Anda"
                      className="text-center text-lg"
                    />
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter>
              {challengeId !== "3" && (
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || !answer}
                  className="w-full bg-primary-600 hover:bg-primary-700"
                >
                  {submitting ? "Memeriksa..." : "Kirim Jawaban"}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  )
}

