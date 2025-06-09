
"use client";

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, FileText, Eye } from "lucide-react";
import type { Proposal } from "@/types";
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PROPOSAL_STATUSES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// Mock data - initialized empty
const mockProposals: Proposal[] = [];

const getStatusBadgeVariant = (status: Proposal['status']): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case 'Aceita': return 'default'; 
    case 'Enviada': return 'secondary';
    case 'Rascunho': return 'outline';
    case 'Recusada': return 'destructive';
    case 'Arquivada': return 'outline'; 
    default: return 'outline';
  }
};


export function ProposalList() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // No futuro, isso viria de uma API
    // Para o estado "zerado", iniciamos com uma lista vazia.
    // A lógica do localStorage foi removida para garantir um início limpo.
    const existingProposals: Proposal[] = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("proposals") || "[]") : [];
    if (existingProposals.length > 0) {
        // Se ainda houver algo no localStorage de execuções anteriores, limpamos para o estado "zerado".
        if (typeof window !== "undefined") {
            localStorage.removeItem("proposals");
        }
        setProposals([]);
    } else {
        setProposals([]); // Inicia vazio
    }
  }, []);

  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta proposta?")) {
      const updatedProposals = proposals.filter(p => p.id !== id);
      setProposals(updatedProposals);
      // Se for reintroduzir o localStorage para propostas criadas na sessão:
      // if (typeof window !== "undefined") {
      //   localStorage.setItem("proposals", JSON.stringify(updatedProposals));
      // }
      toast({
        title: "Proposta Excluída",
        description: "A proposta foi excluída com sucesso. (Simulação)",
        variant: "destructive"
      });
    }
  };

  const handleViewProposal = (proposalId: string, clientName: string) => {
    toast({
        title: "Visualizar Proposta",
        description: `Visualizando detalhes da proposta para ${clientName}. (Simulação)`,
    });
    // No futuro: router.push(`/proposals/${proposalId}`);
  };

  const handleEditProposal = (proposalId: string, clientName: string) => {
    toast({
        title: "Editar Proposta",
        description: `Editando proposta para ${clientName}. (Simulação)`,
    });
     // No futuro: router.push(`/proposals/${proposalId}/edit`); Ou abrir modal.
  };
  
  const handleDownloadPdf = (proposalId: string, clientName: string) => {
    toast({
        title: "Baixar PDF",
        description: `Gerando PDF da proposta para ${clientName}. (Simulação)`,
    });
    // Aqui iria a lógica de geração e download do PDF.
  };


  return (
    <div className="rounded-lg border shadow-sm bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Prazo</TableHead>
            <TableHead>Criada em</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {proposals.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                Nenhuma proposta encontrada. Crie uma na aba 'Criar Nova'.
              </TableCell>
            </TableRow>
          )}
          {proposals.map((proposal) => (
            <TableRow key={proposal.id}>
              <TableCell className="font-medium">{proposal.clientName}</TableCell>
              <TableCell>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: proposal.currency }).format(proposal.amount)}</TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(proposal.status)} className={cn(proposal.status === 'Aceita' && 'bg-green-500 text-white hover:bg-green-600')}>
                  {proposal.status}
                </Badge>
              </TableCell>
              <TableCell>{format(parseISO(proposal.deadline), "PPP", { locale: ptBR })}</TableCell>
              <TableCell>{format(parseISO(proposal.createdAt), "PPP", { locale: ptBR })}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Abrir menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleViewProposal(proposal.id, proposal.clientName)}>
                      <Eye className="mr-2 h-4 w-4" /> Visualizar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEditProposal(proposal.id, proposal.clientName)}>
                      <Edit className="mr-2 h-4 w-4" /> Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDownloadPdf(proposal.id, proposal.clientName)}>
                      <FileText className="mr-2 h-4 w-4" /> Baixar PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(proposal.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                      <Trash2 className="mr-2 h-4 w-4" /> Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
