
"use client";

import { PageHeader } from "@/components/PageHeader";
import { ClientForm } from "@/components/clients/ClientForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Client } from "@/types";

export const dynamic = 'force-dynamic';

export default function EditClientPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.clientId as string;
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchClient() {
      if (!clientId) {
        setError("ID do cliente não fornecido.");
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();

      if (error) {
        console.error("Erro ao buscar cliente:", error);
        setError("Não foi possível encontrar o cliente.");
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
      <div className="flex justify-center items-center h-full">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
        <p className="ml-2">Carregando cliente para edição...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 text-center">
        <PageHeader
          title="Erro ao Carregar Cliente"
          description={error}
        />
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
        title="Editar Cliente"
        description="Atualize as informações do cliente abaixo."
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        }
      />
      <ClientForm client={client} />
    </div>
  );
}

    