
"use client";

import { PageHeader } from "@/components/PageHeader";
import { CreateServiceOrderForm } from "@/components/service-orders/CreateServiceOrderForm";
import { MOCK_CLIENTS } from "@/lib/constants";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Client } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NewServiceOrderPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.clientId as string;
  const [client, setClient] = useState<Client | null>(null);

  useEffect(() => {
    const foundClient = MOCK_CLIENTS.find(c => c.id === clientId);
    setClient(foundClient || null);
  }, [clientId]);

  if (!client) {
    return (
      <div className="space-y-6">
        <PageHeader title="Cliente Não Encontrado" description="Não foi possível carregar o formulário de ordem de serviço." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Nova Ordem de Serviço para ${client.name}`}
        description="Preencha os dados abaixo para gerar a OS."
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        }
      />
      <CreateServiceOrderForm clientName={client.name} clientId={clientId} clientPhone={client.phone} />
    </div>
  );
}
