
"use client";

import { useState } from 'react';
import { PageHeader } from "@/components/PageHeader";
import { KanbanBoard } from "@/components/sales-funnel/KanbanBoard";
import { Button } from "@/components/ui/button";
import { PlusCircle, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { LeadForm } from '@/components/leads/LeadForm';

export const dynamic = 'force-dynamic';

export default function SalesFunnelPage() {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleCustomizeStages = () => {
    toast({
      title: "Personalizar Etapas",
      description: "Funcionalidade para personalizar as etapas do funil será implementada futuramente.",
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.20))]">
      <PageHeader
        title="Funil de Vendas"
        description="Arraste os leads entre as etapas para atualizar o status."
        actions={
          <>
            <Button variant="outline" onClick={handleCustomizeStages}>
              <Settings className="mr-2 h-4 w-4" /> Personalizar Etapas
            </Button>
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
          </>
        }
      />
      <div className="flex-grow overflow-hidden pt-4">
        <KanbanBoard />
      </div>
    </div>
  );
}
