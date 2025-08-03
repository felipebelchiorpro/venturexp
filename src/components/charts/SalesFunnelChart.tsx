"use client"

import { Funnel, FunnelChart, LabelList, Tooltip } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer
} from "@/components/ui/chart"

const chartData = [
  { value: 100, name: "Novo Lead", fill: "hsl(var(--chart-1))" },
  { value: 80, name: "Contato Inicial", fill: "hsl(var(--chart-2))" },
  { value: 50, name: "Qualificação", fill: "hsl(var(--chart-3))" },
  { value: 40, name: "Negociação", fill: "hsl(var(--chart-4))" },
  { value: 26, name: "Fechamento Ganho", fill: "hsl(var(--chart-5))" },
]

const chartConfig = {
  leads: {
    label: "Leads",
    color: "hsl(var(--chart-1))",
  },
}

export function SalesFunnelChart() {
  return (
      <ChartContainer config={chartConfig} className="min-h-[200px] w-full max-w-lg aspect-auto">
        <FunnelChart layout="vertical" width={500} height={250}>
           <Tooltip />
          <Funnel dataKey="value" data={chartData} isAnimationActive>
             <LabelList
                position="right"
                fill="#fff"
                stroke="none"
                dataKey="name"
                className="font-medium"
            />
          </Funnel>
        </FunnelChart>
      </ChartContainer>
  )
}
