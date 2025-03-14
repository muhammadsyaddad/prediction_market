import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold mb-4">Halaman Tidak Ditemukan</h2>
        <p className="mb-6 text-muted-foreground">Maaf, halaman yang Anda cari tidak ditemukan.</p>
        <Link href="/">
          <Button>Kembali ke Beranda</Button>
        </Link>
      </div>
    </div>
  )
}

