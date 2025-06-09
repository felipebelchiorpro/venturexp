
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { PIPELINE_STAGES } from "@/lib/constants";
import type { Lead, KanbanItem } from "@/types";
import { PlusCircle, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const initialLeads: Lead[] = [
  { id: 'lead-1', name: 'Alpha Corp', email: 'contact@alpha.co', status: 'Novo Lead', lastContacted: new Date().toISOString(), createdAt: new Date().toISOString() },
  { id: 'lead-2', name: 'Beta LLC', email: 'info@beta.llc', status: 'Contactado', lastContacted: new Date().toISOString(), createdAt: new Date().toISOString() },
  { id: 'lead-3', name: 'Gamma Inc', email: 'sales@gamma.inc', status: 'Qualificado', lastContacted: new Date().toISOString(), createdAt: new Date().toISOString() },
  { id: 'lead-4', name: 'Delta Solutions', email: 'support@delta.com', status: 'Novo Lead', lastContacted: new Date().toISOString(), createdAt: new Date().toISOString() },
  { id: 'lead-5', name: 'Epsilon Group', email: 'partners@epsilon.org', status: 'Proposta Enviada', lastContacted: new Date().toISOString(), createdAt: new Date().toISOString() },
];


interface KanbanCardProps {
  item: KanbanItem;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, itemId: string) => void;
  onClick: (itemName: string) => void;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ item, onDragStart, onClick }) => {
  return (
    <Card 
      draggable 
      onDragStart={(e) => onDragStart(e, item.id)}
      onClick={() => onClick(item.content)}
      className="mb-3 cursor-grab active:cursor-grabbing bg-card hover:shadow-md transition-shadow p-3 rounded-lg"
    >
      <CardContent className="p-0">
        <div className="flex items-start justify-between">
          <p className="text-sm font-medium text-card-foreground">{item.content}</p>
          <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
        </div>
        {item.leadId && <p className="text-xs text-muted-foreground">ID: {item.leadId}</p>}
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
  onCardClick: (itemName: string) => void;
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
        <span className="text-sm text-muted-foreground">{items.length}</span>
      </div>
      <Button variant="outline" size="sm" className="w-full mb-3" onClick={() => onAddLeadToStage(title)}>
        <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Lead
      </Button>
      <ScrollArea className="h-[calc(100vh-20rem)]">
        {items.map(item => <KanbanCard key={item.id} item={item} onDragStart={onDragStartCard} onClick={onCardClick} />)}
      </ScrollArea>
    </div>
  );
};

export function KanbanBoard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setLeads(initialLeads);
  }, []);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, itemId: string) => {
    setDraggedItemId(itemId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetStage: string) => {
    e.preventDefault();
    if (!draggedItemId) return;

    const leadBeingMoved = leads.find(lead => lead.id === draggedItemId);

    setLeads(prevLeads =>
      prevLeads.map(lead =>
        lead.id === draggedItemId ? { ...lead, status: targetStage } : lead
      )
    );
    
    if (leadBeingMoved) {
        toast({
            title: "Lead Movido",
            description: `Lead "${leadBeingMoved.name}" movido para "${targetStage}".`,
        });
    }
    setDraggedItemId(null);
  };

  const getItemsForStage = (stage: string): KanbanItem[] => {
    return leads
      .filter(lead => lead.status === stage)
      .map(lead => ({ id: lead.id, content: lead.name, leadId: lead.id }));
  };

  const handleCardClick = (itemName: string) => {
    toast({
        title: "Visualizar Lead",
        description: `Visualizando detalhes do lead "${itemName}". (Simulação - abriria modal ou página de detalhes)`,
    });
  };

  const handleAddLeadToStage = (stageTitle: string) => {
    toast({
        title: "Adicionar Lead",
        description: `Adicionando novo lead à etapa "${stageTitle}". (Simulação - abriria formulário)`,
    });
  };


  return (
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
            onAddLeadToStage={handleAddLeadToStage}
          />
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
