
'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from "@/components/PageHeader";
import { KpiCard, IconName } from "@/components/dashboard/KpiCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3, DollarSign, FileText, Users, CreditCard, Award, TrendingUp, Activity, AlertTriangle, GanttChartSquare, ListChecks, Loader2 } from 'lucide-react';
import { ExecutivePlaceholderContent } from '@/components/dashboard/ExecutivePlaceholderContent';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export const dynamic = 'force-dynamic';

interface KpiData {
  title: string;
  value: string;
  iconName: IconName;
  change?: string;
  trend?: "up" | "down" | "neutral";
  description?: string;
}

const kpiPlaceholders: { key: string; title: string }[] = [
    { key: 'billingMonthly', title: 'Faturamento Mensal (Simulado)' },
    { key: 'proposalsSent', title: 'Total de Propostas Enviadas' },
    { key: 'totalLeads', title: 'Total de Leads no Funil' },
    { key: 'totalClients', title: 'Total de Clientes' },
];

export default function ExecutiveDashboardPage() {
  const [kpiData, setKpiData] = useState<Record<string, KpiData>>({});
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const { toast } = useToast();
  
  useEffect(() => {
    async function fetchExecutiveData() {
      setLoading(true);
      try {
        const { count: proposalsSent } = await supabase.from('proposals').select('*', { count: 'exact', head: true });
        const { count: totalLeads } = await supabase.from('leads').select('*', { count: 'exact', head: true });
        const { count: totalClients } = await supabase.from('clients').select('*', { count: 'exact', head: true });

        // Placeholder for billing data, as it requires more complex logic
        const monthlyBilling = 0;
        
        const fetchedKpis: Record<string, KpiData> = {
          proposalsSent: { title: "Total de Propostas Enviadas", value: String(proposalsSent ?? 0), iconName: "FileText", trend: "neutral" },
          billingMonthly: { title: "Faturamento Mensal (Simulado)", value: `R$${monthlyBilling.toFixed(2)}`, iconName: "DollarSign", change: "+0% vs mês anterior", trend: "neutral" },
          totalLeads: { title: "Total de Leads no Funil", value: String(totalLeads ?? 0), iconName: "Users", trend: "neutral" },
          totalClients: { title: "Total de Clientes", value: String(totalClients ?? 0), iconName: "Award", description: "Clientes na base de dados" },
        };
        setKpiData(fetchedKpis);

      } catch (error) {
        console.error("Error fetching executive data:", error);
        toast({
          title: "Erro ao carregar dados executivos",
          description: "Não foi possível buscar os dados para o dashboard.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    fetchExecutiveData();
  }, [supabase, toast]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard Executivo"
        description="Visão geral consolidada da operação da agência."
      />

      <section>
        <h2 className="text-xl font-semibold text-foreground mb-4">Visão Geral da Operação</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            kpiPlaceholders.map(({ key, title }) => (
              <Card className="shadow-lg" key={key}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                  <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-1/2 mb-1" />
                  <Skeleton className="h-4 w-1/4" />
                </CardContent>
              </Card>
            ))
          ) : (
            Object.values(kpiData).map((data) => (
              data ? <KpiCard key={data.title} {...data} /> : null
            ))
          )}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground mb-4">Análise Financeira</h2>
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
           <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-muted-foreground" />
                Faturamento por Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ExecutivePlaceholderContent message="Gráfico/Tabela de faturamento por cliente será exibido aqui." icon={<BarChart3 size={32}/>} />
            </CardContent>
          </Card>
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-muted-foreground" />
                Status de Pagamentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ExecutivePlaceholderContent message="Resumo de pagamentos em dia, atrasados e a vencer." icon={<ListChecks size={32}/>} />
            </CardContent>
          </Card>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground mb-4">Análise de Vendas</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <GanttChartSquare className="h-5 w-5 mr-2 text-muted-foreground" />
                Leads por Etapa do Funil
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ExecutivePlaceholderContent message="Gráfico de leads em cada etapa do funil será exibido aqui." icon={<BarChart3 size={32}/>} />
            </CardContent>
          </Card>
           <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-muted-foreground" />
                Taxa de Conversão
              </Title>
               <CardDescription>Análise da conversão de leads para clientes.</CardDescription>
            </CardHeader>
            <CardContent>
               <ExecutivePlaceholderContent message="Detalhes da taxa de conversão por etapa do funil." icon={<TrendingUp size={32}/>} />
            </CardContent>
          </Card>
        </div>
      </section>
      
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-4">Performance e Produtividade da Equipe</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <KpiCard title="Equipe Destaque (Entregas)" value="N/A" iconName="Award" description="Baseado em projetos concluídos" />
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <Activity className="h-5 w-5 mr-2 text-muted-foreground" />
                Resumo de Produtividade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ExecutivePlaceholderContent message="Resumo geral da produtividade da equipe será exibido aqui." icon={<Users size={32}/>} />
            </CardContent>
          </Card>
           <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-muted-foreground" />
                Pontos de Atenção
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ExecutivePlaceholderContent message="Projetos com atraso, gargalos ou clientes com baixa satisfação." icon={<AlertTriangle size={32}/>} />
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
