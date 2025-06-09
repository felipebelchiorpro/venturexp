
"use client"; // Adicionado para usar hooks

import { PageHeader } from "@/components/PageHeader";
import { KanbanBoard } from "@/components/sales-funnel/KanbanBoard";
import { Button } from "@/components/ui/button";
import { PlusCircle, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SalesFunnelPage() {
  const { toast } = useToast();

  const handleCustomizeStages = () => {
    toast({
      title: "Personalizar Etapas",
      description: "Funcionalidade para personalizar as etapas do funil será implementada.",
    });
  };

  const handleAddLeadToFunnel = () => {
    toast({
      title: "Adicionar Novo Lead ao Funil",
      description: "Funcionalidade para adicionar um novo lead diretamente ao funil será implementada.",
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.28))]">
      <PageHeader
        title="Funil de Vendas"
        description="Gerencie seus leads através do pipeline de vendas."
        actions={
          <>
            <Button variant="outline" onClick={handleCustomizeStages}>
              <Settings className="mr-2 h-4 w-4" /> Personalizar Etapas
            </Button>
            <Button onClick={handleAddLeadToFunnel}>
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Novo Lead
            </Button>
          </>
        }
      />
      <div className="flex-grow overflow-hidden">
        <KanbanBoard />
      </div>
    </div>
  );
}
