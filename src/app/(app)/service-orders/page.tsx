
"use client";

import { PageHeader } from "@/components/PageHeader";
import { ServiceOrderList } from "@/components/service-orders/ServiceOrderList";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";


export const dynamic = 'force-dynamic';

export default function ServiceOrdersPage() {
    const router = useRouter();
    const { toast } = useToast();

    const handleCreateServiceOrder = () => {
        // Since an OS is always tied to a client, we must select a client first.
        // This UX guides the user to the clients list to start the flow from there.
        toast({
            title: "Selecione um Cliente",
            description: "Uma Ordem de Serviço precisa ser associada a um cliente. Escolha um cliente para continuar.",
        });
        router.push('/clients');
    }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ordens de Serviço"
        description="Gerencie todas as ordens de serviço, ativas e antigas."
        actions={
          <Button onClick={handleCreateServiceOrder}>
            <PlusCircle className="mr-2 h-4 w-4" /> Nova Ordem de Serviço
          </Button>
        }
      />
      <ServiceOrderList />
    </div>
  );
}
