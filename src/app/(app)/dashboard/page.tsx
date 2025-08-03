
'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale'; 
import { PageHeader } from "@/components/PageHeader";
import { KpiCard, IconName } from "@/components/dashboard/KpiCard";
import { Button } from "@/components/ui/button";
import { PlusCircle, BarChartHorizontalBig, LineChart, TrendingUp, Activity, CalendarClock, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExecutivePlaceholderContent } from '@/components/dashboard/ExecutivePlaceholderContent';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

interface KpiData {
  title: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  iconName: IconName;
}

export default function DashboardPage() {
  const [currentDateTime, setCurrentDateTime] = useState<string | null>(null);
  const [kpiData, setKpiData] = useState<KpiData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    setCurrentDateTime(format(new Date(), "PPP, p", { locale: ptBR }));

    async function fetchDashboardData() {
      setLoading(true);
      try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Fetch new clients in the last 30 days
        const { count: newClientsCount } = await supabase
          .from('clients')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', thirtyDaysAgo.toISOString());

        // Fetch active leads (not 'Fechamento Ganho' or 'Fechamento Perdido')
        const { count: activeLeadsCount } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .not('status', 'in', '("Fechamento Ganho", "Fechamento Perdido")');

        // Fetch service orders in progress
        const { count: ongoingOsCount } = await supabase
          .from('service_orders')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'Em andamento');

        // Fetch pending proposals
        const { count: pendingProposalsCount } = await supabase
          .from('proposals')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'Enviada');

        const fetchedKpis: KpiData[] = [
          { title: "Novos Clientes (Últimos 30d)", value: String(newClientsCount ?? 0), trend: "up", iconName: "Users" },
          { title: "Leads Ativos no Funil", value: String(activeLeadsCount ?? 0), trend: "neutral", iconName: "TrendingUp" },
          { title: "O.S. em Andamento", value: String(ongoingOsCount ?? 0), trend: "neutral", iconName: "ClipboardList" },
          { title: "Propostas Pendentes", value: String(pendingProposalsCount ?? 0), trend: "neutral", iconName: "FileText" },
        ];

        setKpiData(fetchedKpis);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível buscar os dados para o dashboard.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchDashboardData();

  }, [supabase, toast]);

  const handleAddWidget = () => {
    toast({
        title: "Adicionar Widget",
        description: "Funcionalidade para adicionar novos widgets ao painel será implementada futuramente.",
    });
  };

  return (
    <div className="space-y-6">
        <p className="text-xl text-muted-foreground mb-2">
          Bem-vindo(a) de volta!
        </p>
      <PageHeader 
        title="Painel Principal" 
        description={currentDateTime ? `Hoje é ${currentDateTime}. Veja o desempenho da sua agência.` : "Carregando data... Veja o desempenho da sua agência."}
        actions={
          <Button onClick={handleAddWidget}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Widget
          </Button>
        }
      />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-1/2 bg-muted rounded animate-pulse mb-1" />
                <div className="h-4 w-1/4 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))
        ) : (
          kpiData.map((kpi) => (
            <KpiCard
              key={kpi.title}
              title={kpi.title}
              value={kpi.value}
              change={kpi.change}
              trend={kpi.trend as "up" | "down" | "neutral"}
              iconName={kpi.iconName as any}
            />
          ))
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-card-foreground flex items-center">
              <BarChartHorizontalBig className="mr-2 h-5 w-5 text-muted-foreground" />
              Visão Geral do Progresso dos Projetos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ExecutivePlaceholderContent message="Gráfico exibindo o status de conclusão dos projetos será mostrado aqui." icon={<TrendingUp size={48}/>} />
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-card-foreground flex items-center">
              <LineChart className="mr-2 h-5 w-5 text-muted-foreground" />
              Tendência de Receita Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ExecutivePlaceholderContent message="Gráfico mostrando as tendências de receita mensal será exibido aqui." icon={<LineChart size={48}/>} />
          </CardContent>
        </Card>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">Atividade Recente</h3>
          <ExecutivePlaceholderContent message="Feed de atividades será mostrado aqui. (ex: Novo lead adicionado, Proposta enviada, Tarefa concluída)" icon={<Activity size={32}/>} />
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">Prazos Próximos</h3>
          <ExecutivePlaceholderContent message="Uma lista de prazos próximos será mostrada aqui." icon={<CalendarClock size={32}/>} />
        </div>
      </div>
    </div>
  );
}

    