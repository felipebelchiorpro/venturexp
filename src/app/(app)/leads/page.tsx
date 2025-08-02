
"use client";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { LeadList } from "@/components/leads/LeadList";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { LeadForm } from '@/components/leads/LeadForm';


export const dynamic = 'force-dynamic';

export default function LeadsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Prospecção de Leads"
        description="Monitore, gerencie e segmente seus leads de forma eficaz."
        actions={
           <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Novo Lead
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Lead</DialogTitle>
                  <DialogDescription>
                    Preencha os detalhes abaixo para criar um novo lead.
                  </DialogDescription>
                </DialogHeader>
              <LeadForm onSuccess={() => setIsFormOpen(false)} />
            </DialogContent>
          </Dialog>
        }
      />
      <LeadList />
    </div>
  );
}
