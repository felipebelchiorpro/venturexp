import { PageHeader } from "@/components/PageHeader";
import { KanbanBoard } from "@/components/sales-funnel/KanbanBoard";
import { Button } from "@/components/ui/button";
import { PlusCircle, Settings } from "lucide-react";

export default function SalesFunnelPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.28))]">
      <PageHeader
        title="Sales Funnel"
        description="Manage your leads through the sales pipeline."
        actions={
          <>
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" /> Customize Stages
            </Button>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Lead
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
