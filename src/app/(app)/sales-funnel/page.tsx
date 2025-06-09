
import { PageHeader } from "@/components/PageHeader";
import { KanbanBoard } from "@/components/sales-funnel/KanbanBoard";
import { Button } from "@/components/ui/button";
import { PlusCircle, Settings } from "lucide-react";

export default function SalesFunnelPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.28))]">
      <PageHeader
        title="Funil de Vendas"
        description="Gerencie seus leads através do pipeline de vendas."
        actions={
          <>
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" /> Personalizar Etapas
            </Button>
            <Button>
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
