'use client';

import { useState, useEffect, Suspense } from 'react';
import { PageHeader } from "@/components/PageHeader";
import { KpiCard, IconName } from "@/components/dashboard/KpiCard";
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, BarChart3, LineChart, PieChartIcon, Filter } from 'lucide-react';
import { WeeklyRevenueChart } from '@/components/charts/WeeklyRevenueChart';
import { ClientGrowthChart } from '@/components/charts/ClientGrowthChart';
import { SalesFunnelChart } from '@/components/charts/SalesFunnelChart';
import { CategoryPieChart } from '@/components/charts/CategoryPieChart';
import type { Tables } from '@/types/database.types';

type ServiceOrder = Tables<'service_orders'>;
type Client = Tables<'clients'>;
type Lead = Tables<'leads'>;

interface KpiData {
  title: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  iconName: IconName;
  description?: string;
}

interface ChartData {
  serviceOrders: ServiceOrder[];
  clients: Client[];
  leads: Lead[];
}

const LoadingKpiCard = () => (
  <Card className="shadow-lg">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
    </CardHeader>
    <CardContent>
      <div className="h-6 w-3/4 bg-muted rounded animate-pulse mb-2" />
      <div className="h-8 w-1/2 bg-muted rounded animate-pulse" />
    </CardContent>
  </Card>
);

const ChartPlaceholder = () => (
    <div className="flex items-center justify-center h-full min-h-[250px] w-full bg-muted/50 rounded-lg">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
);

export default function ExecutiveDashboardPage() {
  const [kpiData, setKpiData] = useState<KpiData[]>([]);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      try {
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1));
        const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 6, 1);

        // Fetch all necessary data in parallel
        const [
            { data: serviceOrdersData, error: serviceOrdersError },
            { data: clientsData, error: clientsError },
            { data: leadsData, error: leadsError },
        ] = await Promise.all([
            supabase.from('service_orders').select('*').gte('created_at', sixMonthsAgo.toISOString()),
            supabase.from('clients').select('id, status, created_at').gte('created_at', sixMonthsAgo.toISOString()),
            supabase.from('leads').select('id, status, created_at')
        ]);

        if (serviceOrdersError || clientsError || leadsError) {
            throw new Error(serviceOrdersError?.message || clientsError?.message || leadsError?.message);
        }
        
        setChartData({
            serviceOrders: serviceOrdersData || [],
            clients: clientsData || [],
            leads: leadsData || [],
        });

        // KPI Calculations
        const monthlyRevenue = serviceOrdersData
            ?.filter(so => so.status === 'Concluída' && new Date(so.created_at) >= firstDayOfMonth)
            .reduce((sum, item) => sum + (item.total_value || 0), 0) || 0;

        const weeklyRevenue = serviceOrdersData
            ?.filter(so => so.status === 'Concluída' && new Date(so.created_at) >= firstDayOfWeek)
            .reduce((sum, item) => sum + (item.total_value || 0), 0) || 0;
        
        const { count: activeClientsCount } = await supabase.from('clients').select('*', { count: 'exact', head: true }).eq('status', 'Ativo');

        const newClientsCount = clientsData?.filter(c => new Date(c.created_at) >= firstDayOfMonth).length || 0;
        
        const ongoingOrdersCount = serviceOrdersData?.filter(so => so.status === 'Em andamento').length || 0;

        const wonLeadsCount = leadsData?.filter(l => l.status === 'Fechamento Ganho').length || 0;
        const lostLeadsCount = leadsData?.filter(l => l.status === 'Fechamento Perdido').length || 0;
        const totalLeadsForConversion = wonLeadsCount + lostLeadsCount;
        const conversionRate = totalLeadsForConversion > 0 ? ((wonLeadsCount / totalLeadsForConversion) * 100).toFixed(1) : "0.0";

        const fetchedKpis: KpiData[] = [
          { title: "Faturamento do Mês", value: `R$ ${monthlyRevenue.toFixed(2)}`, trend: "up", iconName: "DollarSign" },
          { title: "Faturamento da Semana", value: `R$ ${weeklyRevenue.toFixed(2)}`, trend: "neutral", iconName: "CalendarCheck2" },
          { title: "Clientes Ativos", value: String(activeClientsCount ?? 0), trend: "up", iconName: "Users" },
          { title: "Novos Clientes (Mês)", value: String(newClientsCount ?? 0), trend: "up", iconName: "TrendingUp" },
          { title: "Pedidos em Andamento", value: String(ongoingOrdersCount ?? 0), trend: "neutral", iconName: "Briefcase" },
          { title: "Taxa de Conversão", value: `${conversionRate}%`, trend: "up", iconName: "Percent" },
        ];

        setKpiData(fetchedKpis);

      } catch (error: any) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "Erro ao carregar dados",
          description: error.message || "Não foi possível buscar os dados para o dashboard.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchDashboardData();

  }, [supabase, toast]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard Executivo"
        description="Visão geral consolidada da operação da agência."
      />

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <LoadingKpiCard key={i} />)
        ) : (
          kpiData.map((kpi) => (
            <KpiCard
              key={kpi.title}
              title={kpi.title}
              value={kpi.value}
              iconName={kpi.iconName}
              trend={kpi.trend}
            />
          ))
        )}
      </div>

      {/* Main Chart Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1 lg:col-span-2 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><BarChart3 className="mr-2 h-5 w-5 text-primary"/>Faturamento por Dia (Últimas 4 semanas)</CardTitle>
            <CardDescription>Visualização da receita diária para identificar tendências.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
             <Suspense fallback={<ChartPlaceholder />}>
              {chartData ? <WeeklyRevenueChart data={chartData.serviceOrders} /> : <ChartPlaceholder />}
            </Suspense>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
           <CardHeader>
            <CardTitle className="flex items-center"><LineChart className="mr-2 h-5 w-5 text-primary"/>Evolução de Clientes Ativos</CardTitle>
             <CardDescription>Crescimento do número de clientes ativos nos últimos 6 meses.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <Suspense fallback={<ChartPlaceholder />}>
              {chartData ? <ClientGrowthChart data={chartData.clients} /> : <ChartPlaceholder />}
            </Suspense>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><PieChartIcon className="mr-2 h-5 w-5 text-primary"/>Vendas por Categoria</CardTitle>
             <CardDescription>Distribuição de vendas por categoria de produto/serviço.</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<ChartPlaceholder />}>
              {chartData ? <CategoryPieChart data={chartData.serviceOrders} /> : <ChartPlaceholder />}
            </Suspense>
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-2 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><Filter className="mr-2 h-5 w-5 text-primary"/>Funil de Vendas</CardTitle>
             <CardDescription>Visão geral das etapas do funil de vendas, de leads a vendas fechadas.</CardDescription>
          </CardHeader>
          <CardContent className="w-full flex justify-center">
            <Suspense fallback={<ChartPlaceholder />}>
              {chartData ? <SalesFunnelChart data={chartData.leads} /> : <ChartPlaceholder />}
            </Suspense>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
