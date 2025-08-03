"use client"

import * as React from "react"
import { TrendingUp } from "lucide-react"
import { Label, Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
  { category: "Segurança", sales: 275, fill: "var(--color-security)" },
  { category: "Manutenção", sales: 200, fill: "var(--color-maintenance)" },
  { category: "Infraestrutura", sales: 187, fill: "var(--color-infra)" },
  { category: "Software", sales: 173, fill: "var(--color-software)" },
  { category: "Outros", sales: 90, fill: "var(--color-others)" },
]

const chartConfig = {
  sales: {
    label: "Vendas",
  },
  security: {
    label: "Segurança",
    color: "hsl(var(--chart-1))",
  },
  maintenance: {
    label: "Manutenção",
    color: "hsl(var(--chart-2))",
  },
  infra: {
    label: "Infraestrutura",
    color: "hsl(var(--chart-3))",
  },
  software: {
    label: "Software",
    color: "hsl(var(--chart-4))",
  },
  others: {
    label: "Outros",
    color: "hsl(var(--chart-5))",
  },
}

export function CategoryPieChart() {
  const totalVisitors = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.sales, 0)
  }, [])

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square h-[250px]"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={chartData}
          dataKey="sales"
          nameKey="category"
          innerRadius={60}
          strokeWidth={5}
        >
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className="fill-foreground text-3xl font-bold"
                    >
                      {totalVisitors.toLocaleString()}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 24}
                      className="fill-muted-foreground"
                    >
                      Vendas
                    </tspan>
                  </text>
                )
              }
            }}
          />
        </Pie>
      </PieChart>
    </ChartContainer>
  )
}
