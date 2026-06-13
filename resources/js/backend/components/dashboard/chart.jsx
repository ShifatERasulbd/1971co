"use client"

import { Bar, BarChart } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { ChartContainer } from "@/components/ui/chart"

const chartData = [
  { month: "Jan", inStock: 186, lowStock: 80 },
  { month: "Feb", inStock: 305, lowStock: 200 },
  { month: "Mar", inStock: 237, lowStock: 120 },
  { month: "Apr", inStock: 173, lowStock: 90 },
  { month: "May", inStock: 209, lowStock: 130 },
  { month: "Jun", inStock: 214, lowStock: 140 },
]

const chartConfig = {
  inStock: {
    label: "In Stock",
    color: "#2563eb",
  },
  lowStock: {
    label: "Low Stock",
    color: "#60a5fa",
  },
}

export function StockOverviewChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[260px] w-full">
          <BarChart accessibilityLayer data={chartData}>
            <Bar dataKey="inStock" fill="var(--color-inStock)" radius={4} />
            <Bar dataKey="lowStock" fill="var(--color-lowStock)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
