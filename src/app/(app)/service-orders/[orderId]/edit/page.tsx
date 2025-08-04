
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
type ServiceOrder = Tables<'service_orders'>;

interface ServiceOrderWithClient extends ServiceOrder {
    clients: Client | null;
}

export const dynamic = 'force-dynamic';

export default function EditServiceOrderPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;
  const [serviceOrder, setServiceOrder] = useState<ServiceOrder | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchServiceOrder() {
      if (!orderId) {
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('service_orders')
        .select(`
            *,
            clients (*)
        `)
        .eq('id', orderId)
        .single();
      
      if (error || !data) {
        console.error("Error fetching service order:", error);
        setServiceOrder(null);
        setClient(null);
      } else {
        const orderData = data as ServiceOrderWithClient;
        setServiceOrder(orderData);
        setClient(orderData.clients);
      }
      setLoading(false);
    }

    fetchServiceOrder();
  }, [orderId, supabase]);

  if (loading) {
     return (
       <div className="space-y-6">
        <PageHeader title="Carregando Ordem de Serviço..." description="Aguarde enquanto preparamos tudo para edição." />
         <div className="flex justify-center items-center h-32">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      </div>
    )
  }

  if (!serviceOrder || !client) {
    return (
      <div className="space-y-6">
        <PageHeader title="Ordem de Serviço não encontrada" description="Não foi possível carregar os dados para edição." />
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
        title={`Editar Ordem de Serviço #${serviceOrder.order_number}`}
        description={`Cliente: ${client.name}`}
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        }
      />
      <CreateServiceOrderForm client={client} serviceOrder={serviceOrder} />
    </div>
  );
}
