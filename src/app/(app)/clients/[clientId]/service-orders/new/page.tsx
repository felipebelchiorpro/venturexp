
"use client";

import { PageHeader } from "@/components/PageHeader";
import { CreateServiceOrderForm } from "@/components/service-orders/CreateServiceOrderForm";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Client } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const dynamic = 'force-dynamic';

export default function NewServiceOrderPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.clientId as string;
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you would fetch the client from an API
    // const foundClient = MOCK_CLIENTS.find(c => c.id === clientId);
    // For now, we simulate a loading state and show a generic name/phone.
    // Replace this logic with your actual data fetching.
     setTimeout(() => { // Simulating API call
      // setClient(foundClient || null);
      setClient({ id: clientId, name: `Cliente ${clientId.substring(0,4)}`, phone: '(XX) XXXXX-XXXX' } as Client);
      setLoading(false);
    }, 500);
  }, [clientId]);

  if (loading) {
     return (
       <div className="space-y-6">
        <PageHeader title="Carregando Cliente..." description="Aguarde enquanto carregamos os dados do cliente." />
      </div>
    )
  }

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
