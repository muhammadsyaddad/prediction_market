"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold mb-4">Terjadi Kesalahan</h2>
        <p className="mb-6 text-muted-foreground">Maaf, terjadi kesalahan saat memuat halaman. Silakan coba lagi.</p>
        <Button onClick={reset}>Coba Lagi</Button>
      </div>
    </div>
  )
}

