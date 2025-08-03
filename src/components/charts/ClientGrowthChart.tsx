"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

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
  { month: "Jan", clients: 186 },
  { month: "Fev", clients: 205 },
  { month: "Mar", clients: 237 },
  { month: "Abr", clients: 203 },
  { month: "Mai", clients: 259 },
  { month: "Jun", clients: 280 },
]

const chartConfig = {
  clients: {
    label: "Clientes",
    color: "hsl(var(--chart-2))",
  },
}

export function ClientGrowthChart() {
  return (
      <ChartContainer config={chartConfig} className="h-[250px] w-full">
        <AreaChart
          accessibilityLayer
          data={chartData}
          margin={{
            left: 12,
            right: 12,
          }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => value.slice(0, 3)}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            domain={[150, 300]}
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <defs>
            <linearGradient id="fillClients" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-clients)"
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor="var(--color-clients)"
                stopOpacity={0.1}
              />
            </linearGradient>
          </defs>
          <Area
            dataKey="clients"
            type="natural"
            fill="url(#fillClients)"
            stroke="var(--color-clients)"
            stackId="a"
          />
        </AreaChart>
      </ChartContainer>
  )
}
