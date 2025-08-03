"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
  { day: "Segunda", revenue: 186 },
  { day: "Terça", revenue: 305 },
  { day: "Quarta", revenue: 237 },
  { day: "Quinta", revenue: 73 },
  { day: "Sexta", revenue: 209 },
  { day: "Sábado", revenue: 214 },
  { day: "Domingo", revenue: 98 },
]

const chartConfig = {
  revenue: {
    label: "Receita",
    color: "hsl(var(--chart-1))",
  },
}

export function WeeklyRevenueChart() {
  return (
      <ChartContainer config={chartConfig} className="min-h-[200px] w-full h-[300px]">
        <BarChart accessibilityLayer data={chartData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="day"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
          />
           <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => `R$${value}`}
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
          <Bar
            dataKey="revenue"
            fill="var(--color-revenue)"
            radius={8}
            />
        </BarChart>
      </ChartContainer>
  )
}
