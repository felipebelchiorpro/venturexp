
"use client";

import { PageHeader } from "@/components/PageHeader";
import { CreateServiceOrderForm } from "@/components/service-orders/CreateServiceOrderForm";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Tables } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Client = Tables<'clients'>;

export const dynamic = 'force-dynamic';

export default function NewServiceOrderPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.clientId as string;
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchClient() {
      if (!clientId) {
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('clients')
        .select('*') // Seleciona todos os campos do cliente
        .eq('id', clientId)
        .single();
      
      if (error) {
        console.error("Error fetching client for OS:", error);
        setClient(null);
      } else {
        setClient(data);
      }
      setLoading(false);
    }

    fetchClient();
  }, [clientId, supabase]);

  if (loading) {
     return (
       <div className="space-y-6">
        <PageHeader title="Carregando Cliente..." description="Aguarde enquanto carregamos os dados do cliente." />
         <div className="flex justify-center items-center h-32">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="space-y-6">
        <PageHeader title="Cliente Não Encontrado" description="Não foi possível carregar o formulário de ordem de serviço." />
         <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
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
      <CreateServiceOrderForm client={client} />
    </div>
  );
}

    