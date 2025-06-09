
'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale'; // Import ptBR locale
import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { KPI_DATA, MOCK_USER } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { PlusCircle, BarChartHorizontalBig, LineChart, TrendingUp, Activity, CalendarClock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExecutivePlaceholderContent } from '@/components/dashboard/ExecutivePlaceholderContent';

export default function DashboardPage() {
  const [currentDateTime, setCurrentDateTime] = useState<string | null>(null);

  useEffect(() => {
    setCurrentDateTime(format(new Date(), "PPP, p", { locale: ptBR })); // Format example: 29 de out. de 2023, 16:30
  }, []);

  return (
    <div className="space-y-6">
      {currentDateTime && (
        <p className="text-xl text-muted-foreground mb-2">
          Bem-vindo(a) de volta, {MOCK_USER.name}!
        </p>
      )}
      <PageHeader 
        title="Painel Principal" 
        description={currentDateTime ? `Hoje é ${currentDateTime}. Veja o desempenho da sua agência.` : "Carregando data... Veja o desempenho da sua agência."}
        actions={
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Widget
          </Button>
        }
      />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {KPI_DATA.map((kpi) => (
          <KpiCard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            change={kpi.change}
            trend={kpi.trend as "up" | "down" | "neutral"}
            iconName={kpi.iconName as any}
          />
        ))}
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
