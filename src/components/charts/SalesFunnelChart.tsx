"use client"

import { Funnel, FunnelChart, LabelList, Tooltip } from "recharts"
import { ChartContainer } from "@/components/ui/chart"
import { useMemo } from "react"
import { PIPELINE_STAGES } from "@/types"
import type { Tables } from "@/types/database.types"

type Lead = Tables<'leads'>;

interface SalesFunnelChartProps {
  data: Lead[];
}

const chartConfig = {
  leads: { label: "Leads" },
}

const STAGE_COLORS: { [key: string]: string } = {
  'Novo Lead': "hsl(var(--chart-1))",
  'Contato Inicial': "hsl(var(--chart-2))",
  'Qualificação': "hsl(var(--chart-3))",
  'Apresentação': "hsl(var(--chart-4))",
  'Negociação': "hsl(var(--chart-5))",
  'Fechamento Ganho': "hsl(var(--chart-1))",
  'Fechamento Perdido': "hsl(var(--destructive))",
}

export function SalesFunnelChart({ data }: SalesFunnelChartProps) {
  const chartData = useMemo(() => {
    if (!data) return [];
    
    const stageCounts = data.reduce((acc, lead) => {
        acc[lead.status] = (acc[lead.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Order by PIPELINE_STAGES, but only include stages with data
    return PIPELINE_STAGES
        .filter(stage => stageCounts[stage] > 0)
        .map(stage => ({
            value: stageCounts[stage],
            name: stage,
            fill: STAGE_COLORS[stage] || "hsl(var(--muted))"
        }));

  }, [data]);

  if (chartData.length === 0) {
    return <div className="flex items-center justify-center h-[250px] text-muted-foreground">Sem dados de leads para exibir.</div>
  }

  return (
      <ChartContainer config={chartConfig} className="min-h-[200px] w-full max-w-lg aspect-auto">
        <FunnelChart layout="vertical" width={500} height={250}>
           <Tooltip />
          <Funnel dataKey="value" data={chartData} isAnimationActive>
             <LabelList
                position="right"
                fill="hsl(var(--foreground))"
                stroke="none"
                dataKey="name"
                className="font-medium"
            />
          </Funnel>
        </FunnelChart>
      </ChartContainer>
  )
}
