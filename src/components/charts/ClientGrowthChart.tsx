"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useMemo } from "react"
import { format, subMonths, startOfMonth } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { Tables } from "@/types/database.types"

type Client = Tables<'clients'>;

interface ClientGrowthChartProps {
  data: Client[];
}

const chartConfig = {
  clients: {
    label: "Clientes",
    color: "hsl(var(--chart-2))",
  },
}

export function ClientGrowthChart({ data }: ClientGrowthChartProps) {
  const chartData = useMemo(() => {
    const sixMonthsAgo = startOfMonth(subMonths(new Date(), 5));
    
    const monthlyData = Array.from({ length: 6 }).map((_, i) => {
        const monthDate = startOfMonth(subMonths(new Date(), 5 - i));
        return {
            month: format(monthDate, "MMM/yy", { locale: ptBR }),
            clients: 0
        };
    });

    if (data) {
        let cumulativeClients = 0;
        const clientsBeforePeriod = data.filter(c => new Date(c.created_at) < sixMonthsAgo).length;
        cumulativeClients = clientsBeforePeriod;

        monthlyData.forEach((month, index) => {
             const monthDate = startOfMonth(subMonths(new Date(), 5 - index));
             const endOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

             const newClientsInMonth = data.filter(client => {
                const clientDate = new Date(client.created_at);
                return clientDate >= monthDate && clientDate <= endOfMonth;
             }).length;
             
             cumulativeClients += newClientsInMonth;
             month.clients = cumulativeClients;
        });
    }

    return monthlyData;
  }, [data])

  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-[250px] text-muted-foreground">Sem dados de clientes para exibir.</div>
  }

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
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            domain={['dataMin - 10', 'dataMax + 10']}
            allowDataOverflow
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
