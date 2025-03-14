import { NextResponse } from "next/server"

// Fungsi untuk memanggil Gemini API
async function callGeminiAPI(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY tidak ditemukan di environment variables")
  }

  // Ubah URL untuk menggunakan model gemini-1.5-flash
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Gemini API error: ${response.status} ${errorText}`)
  }

  return await response.json()
}

// Fungsi untuk mengekstrak JSON dari respons Gemini
function extractJsonFromText(text: string) {
  try {
    // Cari teks yang terlihat seperti JSON (diapit oleh kurung kurawal)
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }

    // Jika tidak ditemukan, coba parse seluruh teks
    return JSON.parse(text)
  } catch (error) {
    console.error("Error parsing JSON from Gemini response:", error)
    // Fallback: buat JSON manual dari teks
    const lines = text.split("\n")
    let question = ""
    let answer = ""

    for (const line of lines) {
      if (line.toLowerCase().includes("question") || line.toLowerCase().includes("pertanyaan")) {
        question = line.split(":")[1]?.trim() || line
      } else if (line.toLowerCase().includes("answer") || line.toLowerCase().includes("jawaban")) {
        answer = line.split(":")[1]?.trim() || line
      }
    }

    return { question, answer }
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const difficulty = searchParams.get("difficulty") || "easy"

  try {
    // Buat prompt untuk Gemini
    const prompt = `Generate a ${difficulty} math question suitable for a quick quiz. 
    The question should be simple and have a single number as the answer.
    Format your response as JSON with 'question' and 'answer' fields.
    For example: {"question": "What is 5 + 7?", "answer": "12"}
    Make sure the answer is just the number without any units or explanations.`

    // Panggil Gemini API
    const geminiResponse = await callGeminiAPI(prompt)

    // Ekstrak teks dari respons
    const responseText = geminiResponse.candidates[0].content.parts[0].text

    // Ekstrak JSON dari teks
    const questionData = extractJsonFromText(responseText)

    // Pastikan data memiliki format yang benar
    if (!questionData.question || !questionData.answer) {
      throw new Error("Respons Gemini tidak memiliki format yang diharapkan")
    }

    return NextResponse.json(questionData)
  } catch (error) {
    console.error("Error generating math question:", error)
    return NextResponse.json({ error: "Failed to generate math question" }, { status: 500 })
  }
}

