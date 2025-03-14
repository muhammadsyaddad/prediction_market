"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { CheckCircle2, AlertCircle } from "lucide-react"

export default function TestGeminiPage() {
  const [loading, setLoading] = useState(false)
  const [difficulty, setDifficulty] = useState("easy")
  const [question, setQuestion] = useState<string | null>(null)
  const [answer, setAnswer] = useState<string | null>(null)
  const [userAnswer, setUserAnswer] = useState("")
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null)
  const [error, setError] = useState<string | null>(null)

  const generateQuestion = async () => {
    setLoading(true)
    setQuestion(null)
    setAnswer(null)
    setUserAnswer("")
    setResult(null)
    setError(null)

    try {
      const response = await fetch(`/api/math-question?difficulty=${difficulty}`)

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setQuestion(data.question)
      setAnswer(data.answer)
    } catch (error: any) {
      console.error("Error generating question:", error)
      setError(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const checkAnswer = () => {
    if (!answer || !userAnswer) return

    // Normalize answers for comparison (remove spaces, convert to lowercase)
    const normalizedCorrectAnswer = answer.toString().trim().toLowerCase()
    const normalizedUserAnswer = userAnswer.trim().toLowerCase()

    setResult(normalizedUserAnswer === normalizedCorrectAnswer ? "correct" : "incorrect")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-6">Test Gemini Math Question API</h1>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Generate Math Question</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Difficulty</label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={generateQuestion} disabled={loading} className="w-full">
              {loading ? "Generating..." : "Generate Question"}
            </Button>

            {question && (
              <div className="mt-6 space-y-4">
                <div className="p-4 bg-muted rounded-md">
                  <h3 className="font-medium mb-2">Question:</h3>
                  <p>{question}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Answer</label>
                  <div className="flex gap-2">
                    <Input
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && checkAnswer()}
                    />
                    <Button onClick={checkAnswer}>Check</Button>
                  </div>
                </div>

                {result && (
                  <Alert
                    variant={result === "correct" ? "default" : "destructive"}
                    className={result === "correct" ? "border-green-500" : ""}
                  >
                    {result === "correct" ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <AlertTitle className="text-green-500">Correct!</AlertTitle>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Incorrect</AlertTitle>
                        <AlertDescription>The correct answer is: {answer}</AlertDescription>
                      </>
                    )}
                  </Alert>
                )}

                <div className="text-xs text-muted-foreground mt-4">
                  <p>Debug Info:</p>
                  <pre className="mt-1 p-2 bg-muted rounded overflow-x-auto">
                    {JSON.stringify({ question, answer }, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

