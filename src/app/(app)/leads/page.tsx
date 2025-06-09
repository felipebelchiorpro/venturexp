
import { PageHeader } from "@/components/PageHeader";
import { LeadList } from "@/components/leads/LeadList";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function LeadsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Prospecção de Leads"
        description="Monitore, gerencie e segmente seus leads de forma eficaz."
        actions={
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Novo Lead
          </Button>
        }
      />
      <LeadList />
    </div>
  );
}
