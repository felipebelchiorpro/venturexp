
import { PageHeader } from "@/components/PageHeader";
import { ClientList } from "@/components/clients/ClientList";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

export default function ClientsPage() {
  // Adicionar Novo Cliente levará para uma página de formulário no futuro
  // Por agora, pode ser um log ou um toast.
  const handleAddNewClient = () => {
    // router.push('/clients/new'); // Exemplo de como seria com navegação
    alert("Funcionalidade 'Adicionar Novo Cliente' a ser implementada.");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        description="Gerencie seus clientes ativos e seus respectivos detalhes."
        actions={
          <Button onClick={handleAddNewClient}>
            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Novo Cliente
          </Button>
        }
      />
      <ClientList />
    </div>
  );
}
