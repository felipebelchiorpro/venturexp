"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useMemo } from "react";
import { format, subDays, startOfDay } from "date-fns";
import { ptBR } from 'date-fns/locale';
import type { Tables } from "@/types/database.types";

type ServiceOrder = Tables<'service_orders'>;

interface WeeklyRevenueChartProps {
  data: ServiceOrder[];
}

const chartConfig = {
  revenue: {
    label: "Receita",
    color: "hsl(var(--chart-1))",
  },
}

export function WeeklyRevenueChart({ data }: WeeklyRevenueChartProps) {
  
  const chartData = useMemo(() => {
    const fourWeeksAgo = startOfDay(subDays(new Date(), 27)); // 4 weeks = 28 days
    const dailyRevenue: { [key: string]: number } = {};

    // Initialize the last 28 days with 0 revenue
    for (let i = 0; i < 28; i++) {
        const date = format(subDays(new Date(), i), 'dd/MM');
        dailyRevenue[date] = 0;
    }
    
    if (data) {
        const completedOrders = data.filter(order => order.status === 'Concluída' && new Date(order.created_at) >= fourWeeksAgo);
        
        completedOrders.forEach(order => {
            const date = format(new Date(order.created_at), 'dd/MM');
            if (dailyRevenue[date] !== undefined) {
                 dailyRevenue[date] += order.total_value || 0;
            }
        });
    }

    return Object.keys(dailyRevenue).map(date => ({
        day: date,
        revenue: dailyRevenue[date]
    })).reverse(); // reverse to show oldest to newest

  }, [data]);

  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-[300px] text-muted-foreground">Sem dados de faturamento para exibir.</div>
  }

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
            tickFormatter={(value) => `R$${value/1000}k`}
          />
          <ChartTooltip 
            cursor={false} 
            content={<ChartTooltipContent 
                formatter={(value) => `R$ ${Number(value).toFixed(2)}`}
                hideLabel 
            />} 
          />
          <Bar
            dataKey="revenue"
            fill="var(--color-revenue)"
            radius={8}
            />
        </BarChart>
      </ChartContainer>
  )
}
