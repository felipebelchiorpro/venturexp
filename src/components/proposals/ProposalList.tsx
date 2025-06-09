
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

// Mock data
const mockProposals: Proposal[] = [
  { id: 'prop-1', clientName: 'Innovatech Ltda.', serviceDescription: 'Desenvolvimento Web', amount: 12000, currency: 'BRL', deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), status: 'Enviada', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'prop-2', clientName: 'Synergy Corp', serviceDescription: 'Campanha de Marketing', amount: 8500, currency: 'BRL', deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), status: 'Rascunho', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'prop-3', clientName: 'Quantum Solutions', serviceDescription: 'Migração para Nuvem', amount: 25000, currency: 'EUR', deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(), status: 'Aceita', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'prop-4', clientName: 'Apex Industries', serviceDescription: 'Otimização SEO', amount: 3000, currency: 'BRL', deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), status: 'Recusada', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

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

  useEffect(() => {
    setProposals(mockProposals);
  }, []);

  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta proposta?")) {
      setProposals(prev => prev.filter(p => p.id !== id));
    }
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
                Nenhuma proposta encontrada.
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
                    <DropdownMenuItem onClick={() => alert(`Visualizar proposta ${proposal.id}`)}>
                      <Eye className="mr-2 h-4 w-4" /> Visualizar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => alert(`Editar proposta ${proposal.id}`)}>
                      <Edit className="mr-2 h-4 w-4" /> Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => alert(`Baixar PDF para ${proposal.id}`)}>
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
