"use client"

// Perbarui komponen untuk menggunakan data dari service
import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { portfolioService } from "@/services/portfolio-service"

interface MarketHistoryChartProps {
  marketId?: string
}

export function MarketHistoryChart({ marketId }: MarketHistoryChartProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        if (marketId) {
          // Fetch real data if marketId is provided
          const historyData = await portfolioService.getMarketHistory(marketId)
          setData(historyData)
        } else {
          // Return empty data if no marketId
          setData([])
        }
      } catch (error) {
        console.error("Error fetching market history:", error)
        // Fallback to empty data
        setData([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [marketId])

  if (loading || data.length === 0) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground">Memuat data...</p>
      </div>
    )
  }

  return (
    <div className="w-full h-[300px]">
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
          <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} tick={{ fontSize: 12 }} tickMargin={10} />
          <Tooltip
            formatter={(value) => [`${value}%`, "Probabilitas"]}
            labelFormatter={(label) => `Tanggal: ${label}`}
          />
          <Line
            type="monotone"
            dataKey="probability"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

