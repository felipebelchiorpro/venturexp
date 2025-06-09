
"use client";

import { PageHeader } from "@/components/PageHeader";
import { CreateInvoiceForm } from "@/components/invoices/CreateInvoiceForm";
import { MOCK_CLIENTS } from "@/lib/constants";
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

  useEffect(() => {
    const foundClient = MOCK_CLIENTS.find(c => c.id === clientId);
    setClient(foundClient || null);
  }, [clientId]);

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
