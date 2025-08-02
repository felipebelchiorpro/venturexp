
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { PIPELINE_STAGES } from "@/types";
import type { Lead, KanbanItem } from "@/types";
import { PlusCircle, GripVertical, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { LeadForm } from '@/components/leads/LeadForm';

interface KanbanCardProps {
  item: KanbanItem;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, itemId: string) => void;
  onClick: (leadId: string) => void;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ item, onDragStart, onClick }) => {
  return (
    <Card 
      draggable 
      onDragStart={(e) => onDragStart(e, item.id)}
      onClick={() => onClick(item.id)}
      className="mb-3 cursor-grab active:cursor-grabbing bg-card hover:shadow-md transition-shadow p-3 rounded-lg border-l-4 border-primary"
    >
      <CardContent className="p-0">
        <div className="flex items-start justify-between">
          <p className="text-sm font-medium text-card-foreground">{item.content}</p>
          <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
        </div>
        {item.company && <p className="text-xs text-muted-foreground mt-1">{item.company}</p>}
      </CardContent>
    </Card>
  );
};

interface KanbanColumnProps {
  title: string;
  items: KanbanItem[];
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, stage: string) => void;
  onDragStartCard: (e: React.DragEvent<HTMLDivElement>, itemId: string) => void;
  onCardClick: (leadId: string) => void;
  onAddLeadToStage: (stageTitle: string) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ title, items, onDragOver, onDrop, onDragStartCard, onCardClick, onAddLeadToStage }) => {
  return (
    <div
      className="flex-shrink-0 w-72 bg-muted/50 p-4 rounded-lg shadow-inner"
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, title)}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <span className="text-sm font-semibold text-primary">{items.length}</span>
      </div>
       <Button variant="outline" size="sm" className="w-full mb-3" onClick={() => onAddLeadToStage(title)}>
        <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Lead
      </Button>
      <ScrollArea className="h-[calc(100vh-22rem)]">
        {items.length === 0 ? (
          <div className="flex items-center justify-center h-24">
             <p className="text-xs text-muted-foreground text-center py-4">Arraste os leads para esta etapa.</p>
          </div>
        ) : (
          items.map(item => <KanbanCard key={item.id} item={item} onDragStart={onDragStartCard} onClick={onCardClick} />)
        )}
      </ScrollArea>
    </div>
  );
};

export function KanbanBoard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [initialStage, setInitialStage] = useState<string | undefined>(undefined);
  
  const { toast } = useToast();
  const supabase = createClient();

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    if (error) {
      toast({ title: "Erro ao carregar leads", description: error.message, variant: "destructive" });
      setLeads([]);
    } else {
      setLeads(data || []);
    }
    setLoading(false);
  }, [supabase, toast]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, itemId: string) => {
    setDraggedItemId(itemId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, targetStage: string) => {
    e.preventDefault();
    if (!draggedItemId) return;

    const leadBeingMoved = leads.find(lead => lead.id === draggedItemId);
    if (leadBeingMoved && leadBeingMoved.status !== targetStage) {
      // Optimistic UI update
      const originalLeads = [...leads];
      const updatedLeads = leads.map(lead =>
        lead.id === draggedItemId ? { ...lead, status: targetStage, last_contacted_at: new Date().toISOString() } : lead
      );
      setLeads(updatedLeads);

      const { error } = await supabase
        .from('leads')
        .update({ status: targetStage, last_contacted_at: new Date().toISOString() })
        .eq('id', draggedItemId);
      
      if (error) {
        // Revert on error
        setLeads(originalLeads);
        toast({
            title: "Erro ao Mover Lead",
            description: `Não foi possível atualizar o lead. ${error.message}`,
            variant: "destructive"
        });
      } else {
        toast({
            title: "Lead Movido!",
            description: `Lead "${leadBeingMoved.name}" movido para "${targetStage}".`,
        });
      }
    }
    setDraggedItemId(null);
  };

  const getItemsForStage = (stage: string): KanbanItem[] => {
    return leads
      .filter(lead => lead.status === stage)
      .map(lead => ({ id: lead.id, content: lead.name, company: lead.company }));
  };

  const handleCardClick = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if(lead) {
        setSelectedLead(lead);
        setIsFormOpen(true);
    }
  };

  const handleAddLeadClick = (stage?: string) => {
    setSelectedLead(null);
    setInitialStage(stage);
    setIsFormOpen(true);
  };
  
  const handleFormSuccess = () => {
    setIsFormOpen(false);
    fetchLeads(); // Re-fetch leads to show the new one
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-15rem)]">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
        <p className="ml-2">Carregando o funil de vendas...</p>
      </div>
    )
  }

  return (
    <>
      <ScrollArea className="w-full whitespace-nowrap rounded-lg border shadow-sm">
        <div className="flex gap-4 p-4">
          {PIPELINE_STAGES.map(stage => (
            <KanbanColumn
              key={stage}
              title={stage}
              items={getItemsForStage(stage)}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragStartCard={handleDragStart}
              onCardClick={handleCardClick}
              onAddLeadToStage={handleAddLeadClick}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedLead ? 'Editar Lead' : 'Adicionar Novo Lead'}</DialogTitle>
            <DialogDescription>
              {selectedLead ? `Atualize as informações do lead ${selectedLead.name}.` : 'Preencha os detalhes abaixo para criar um novo lead.'}
            </DialogDescription>
          </DialogHeader>
          <LeadForm 
            lead={selectedLead} 
            onSuccess={handleFormSuccess}
            initialStage={initialStage}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

