"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useState, useEffect } from "react"

export function PortfolioChart() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Dalam implementasi nyata, ini akan mengambil data dari API
        // Untuk saat ini, kita kembalikan array kosong
        setData([])
      } catch (error) {
        console.error("Error fetching portfolio history:", error)
        setData([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading || data.length === 0) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground">Memuat data...</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 10,
          left: 10,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#888" opacity={0.2} />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} tickMargin={10} tickFormatter={(value) => value} />
        <YAxis
          tickFormatter={(value) => `Rp ${(value * 15000).toLocaleString("id-ID")}`}
          tick={{ fontSize: 12 }}
          tickMargin={10}
        />
        <Tooltip
          formatter={(value) => [`Rp ${(Number(value) * 15000).toLocaleString("id-ID")}`, "Nilai"]}
          labelFormatter={(label) => `Tanggal: ${label}`}
        />
        <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}

