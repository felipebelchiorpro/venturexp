import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { ProposalList } from "@/components/proposals/ProposalList";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProposalForm } from "@/components/proposals/ProposalForm";

export default function ProposalsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Proposals"
        description="Manage your client proposals from creation to acceptance."
        actions={
          <Button asChild>
            <Link href="/proposals?tab=create">
              <PlusCircle className="mr-2 h-4 w-4" /> Create New Proposal
            </Link>
          </Button>
        }
      />

      <Tabs defaultValue="all-proposals">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="all-proposals">All Proposals</TabsTrigger>
          <TabsTrigger value="create-proposal">Create New</TabsTrigger>
        </TabsList>
        <TabsContent value="all-proposals" className="mt-6">
          <ProposalList />
        </TabsContent>
        <TabsContent value="create-proposal" className="mt-6">
          <ProposalForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
