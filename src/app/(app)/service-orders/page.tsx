
"use client";

import { PageHeader } from "@/components/PageHeader";
import { ServiceOrderList } from "@/components/service-orders/ServiceOrderList";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";


export const dynamic = 'force-dynamic';

export default function ServiceOrdersPage() {
    const router = useRouter();

    const handleCreateServiceOrder = () => {
        // Since an OS is always tied to a client, we can't create one from thin air.
        // A better UX would be a dialog that asks to select a client first.
        // For now, we redirect to the clients page to start the flow there.
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
