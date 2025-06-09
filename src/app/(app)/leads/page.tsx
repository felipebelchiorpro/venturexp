import { PageHeader } from "@/components/PageHeader";
import { LeadList } from "@/components/leads/LeadList";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function LeadsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Lead Prospecting"
        description="Track, manage, and segment your leads effectively."
        actions={
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Lead
          </Button>
        }
      />
      <LeadList />
    </div>
  );
}
