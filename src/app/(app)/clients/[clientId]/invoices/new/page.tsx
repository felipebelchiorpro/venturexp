
"use client";

import { PageHeader } from "@/components/PageHeader";
import { CreateInvoiceForm } from "@/components/invoices/CreateInvoiceForm";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Client } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NewInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.clientId as string;
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you would fetch the client from an API
    // const foundClient = MOCK_CLIENTS.find(c => c.id === clientId);
    // For now, we simulate a loading state and show a generic name.
    // Replace this logic with your actual data fetching.
    setTimeout(() => { // Simulating API call
      // setClient(foundClient || null);
      setClient({ id: clientId, name: `Cliente ${clientId.substring(0,4)}` } as Client);
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
        <PageHeader title="Cliente Não Encontrado" description="Não foi possível carregar o formulário de fatura." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Nova Fatura para ${client.name}`}
        description="Preencha os detalhes abaixo para criar uma nova fatura."
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        }
      />
      <CreateInvoiceForm clientName={client.name} clientId={clientId} />
    </div>
  );
}
