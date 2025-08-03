
'use client';

import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Wrench } from "lucide-react";

export const dynamic = 'force-dynamic';

export default function ExecutiveDashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard Executivo"
        description="Visão geral consolidada da operação da agência."
      />
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-48">
            <Wrench className="h-12 w-12 mb-4" />
            <p className="text-lg font-medium">Página em Construção</p>
            <p className="text-sm">O Dashboard Executivo está sendo reestruturado para melhor performance e estará de volta em breve.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
