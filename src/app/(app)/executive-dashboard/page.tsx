
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from "@/components/PageHeader";
import { KpiCard, IconName } from "@/components/dashboard/KpiCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3, DollarSign, FileText, Users, CreditCard, Award, TrendingUp, Activity, AlertTriangle, GanttChartSquare, ListChecks } from 'lucide-react';
import { ExecutivePlaceholderContent } from '@/components/dashboard/ExecutivePlaceholderContent';

// Mock data for the executive dashboard - zeroed out
const executiveKpiData = {
  proposals: {
    sent: { title: "Propostas Enviadas", value: "0", iconName: "FileText" as IconName, change: "+0 este mês" , trend: "neutral" as const },
    approved: { title: "Propostas Aprovadas", value: "0", iconName: "CheckCircle" as IconName, change: "+0 este mês", trend: "neutral" as const },
    rejected: { title: "Propostas Rejeitadas", value: "0", iconName: "XCircle" as IconName, change: "-0 este mês", trend: "neutral" as const },
  },
  billing: {
    monthly: { title: "Faturamento Mensal", value: "R$0", iconName: "DollarSign" as IconName, change: "+0% vs mês anterior", trend: "neutral" as const },
    annual: { title: "Faturamento Anual (YTD)", value: "R$0", iconName: "DollarSign" as IconName, description: "Meta Anual: N/A" },
  },
  leads: {
    totalInFunnel: { title: "Total de Leads no Funil", value: "0", iconName: "Users" as IconName, change: "+0 esta semana", trend: "neutral" as const },
  },
  payments: {
    onTime: { title: "Pagamentos em Dia", value: "0%", iconName: "CalendarCheck2" as IconName, description: "Últimos 30 dias" },
    late: { title: "Pagamentos Atrasados", value: "R$0", iconName: "CalendarX2" as IconName, description: ">15 dias de atraso" },
    due: { title: "Pagamentos a Vencer", value: "R$0", iconName: "CalendarClock" as IconName, description: "Próximos 7 dias" },
  },
  teamPerformance: {
    topPerformer: { title: "Equipe Destaque (Entregas)", value: "N/A", iconName: "Award" as IconName, description: "Baseado em projetos concluídos" },
  },
};

export default function ExecutiveDashboardPage() {
  const router = useRouter();

  // The role-based redirect logic is removed to keep the page accessible without mock data.
  // In a real application, this would be handled by a proper authentication context.

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard Executivo"
        description="Visão geral consolidada da operação da agência."
      />

      {/* Section: Proposals Overview */}
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-4">Visão Geral de Propostas</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <KpiCard {...executiveKpiData.proposals.sent} />
          <KpiCard {...executiveKpiData.proposals.approved} />
          <KpiCard {...executiveKpiData.proposals.rejected} />
        </div>
      </section>

      {/* Section: Billing Overview */}
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-4">Faturamento</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <KpiCard {...executiveKpiData.billing.monthly} />
          <KpiCard {...executiveKpiData.billing.annual} />
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 md:col-span-2 lg:col-span-1">
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
        </div>
      </section>

      {/* Section: Leads Funnel */}
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-4">Funil de Vendas</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <KpiCard {...executiveKpiData.leads.totalInFunnel} />
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
        </div>
      </section>
      
      {/* Section: Payment Status */}
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-4">Status de Pagamentos</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <KpiCard {...executiveKpiData.payments.onTime} />
          <KpiCard {...executiveKpiData.payments.late} />
          <KpiCard {...executiveKpiData.payments.due} />
        </div>
      </section>

      {/* Section: Team Performance & Productivity */}
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-4">Performance e Produtividade da Equipe</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <KpiCard {...executiveKpiData.teamPerformance.topPerformer} />
           <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-muted-foreground" />
                Taxa de Conversão por Etapa
              </CardTitle>
            </CardHeader>
            <CardContent>
               <ExecutivePlaceholderContent message="Detalhes da taxa de conversão por etapa do funil." icon={<ListChecks size={32}/>} />
            </CardContent>
          </Card>
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
        </div>
      </section>
    </div>
  );
}
