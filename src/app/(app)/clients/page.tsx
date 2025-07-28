
import { PageHeader } from "@/components/PageHeader";
import { ClientList } from "@/components/clients/ClientList";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";


export default function ClientsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        description="Gerencie seus clientes ativos e seus respectivos detalhes."
        actions={
          <Button asChild>
            <Link href="/clients/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Novo Cliente
            </Link>
          </Button>
        }
      />
      <ClientList />
    </div>
  );
}
