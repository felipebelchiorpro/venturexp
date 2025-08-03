"use client"

import * as React from "react"
import { Label, Pie, PieChart, Sector } from "recharts"
import { PieSectorDataItem } from "recharts/types/polar/Pie"
import { Card, CardContent } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { Tables } from "@/types/database.types"
import type { ProductPiece } from "@/types"

type ServiceOrder = Tables<'service_orders'>;

interface CategoryPieChartProps {
  data: ServiceOrder[];
}

const chartConfig = {
  sales: { label: "Vendas" },
  Manutenção: { label: "Manutenção", color: "hsl(var(--chart-1))" },
  Segurança: { label: "Segurança", color: "hsl(var(--chart-2))" },
  Infraestrutura: { label: "Infraestrutura", color: "hsl(var(--chart-3))" },
  Software: { label: "Software", color: "hsl(var(--chart-4))" },
  Outros: { label: "Outros", color: "hsl(var(--chart-5))" },
}

const ActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="text-lg font-bold">
        {payload.category}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="hsl(var(--foreground))" dy={-10}>{`R$ ${value.toFixed(2)}`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={10} textAnchor={textAnchor} fill="hsl(var(--muted-foreground))">
        {`(${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};


export function CategoryPieChart({ data }: CategoryPieChartProps) {
  const [activeIndex, setActiveIndex] = React.useState(0);

  const onPieEnter = React.useCallback(
    (_: any, index: number) => {
      setActiveIndex(index);
    },
    [setActiveIndex]
  );
  
  const processedData = React.useMemo(() => {
    if (!data) return [];
    
    const categorySales: { [key: string]: number } = {};

    data.forEach(order => {
        // Here we assume service_type maps to a category, which is a simplification.
        // A more robust solution might involve looking at products_used if they have categories.
        const category = order.service_type || "Outros";
        const value = order.total_value || 0;

        if (!categorySales[category]) {
            categorySales[category] = 0;
        }
        categorySales[category] += value;
    });

    // A more realistic scenario for "Vendas por Categoria" would be to look at the products
    // but service_orders.products_used is a JSON and products have categories.
    // Let's use service_type as a proxy for category for now.
    // Example: group by service_type
    const groupedByServiceType = data.reduce((acc, order) => {
        const category = order.service_type || 'Outros';
        acc[category] = (acc[category] || 0) + (order.total_value || 0);
        return acc;
    }, {} as Record<string, number>);


    const chartData = Object.keys(groupedByServiceType).map(category => ({
      category,
      sales: groupedByServiceType[category],
      fill: chartConfig[category as keyof typeof chartConfig]?.color || chartConfig['Outros'].color,
    })).sort((a,b) => b.sales - a.sales);

    return chartData;

  }, [data])


  const totalSales = React.useMemo(() => {
    return processedData.reduce((acc, curr) => acc + curr.sales, 0)
  }, [processedData])

  if (processedData.length === 0) {
    return <div className="flex items-center justify-center h-[250px] text-muted-foreground">Sem dados de vendas por categoria.</div>
  }

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square h-[300px]"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          activeIndex={activeIndex}
          activeShape={ActiveShape}
          onMouseEnter={onPieEnter}
          data={processedData}
          dataKey="sales"
          nameKey="category"
          innerRadius={60}
          outerRadius={80}
          strokeWidth={2}
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
                      className="fill-foreground text-2xl font-bold"
                    >
                      {totalSales.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 20}
                      className="fill-muted-foreground"
                    >
                      Total Vendas
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
