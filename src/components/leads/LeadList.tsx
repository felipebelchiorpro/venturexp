
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, PlusCircle, ListFilter, FileDown, UserPlus, CheckCircle, Loader2 } from "lucide-react";
import type { Lead } from "@/types";
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PIPELINE_STAGES } from '@/types';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { LeadForm } from '@/components/leads/LeadForm';
import { Skeleton } from '../ui/skeleton';

export function LeadList() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | 'all'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const { toast } = useToast();
  const supabase = createClient();
  
  const [columnVisibility, setColumnVisibility] = useState({
    company: true,
    email: true,
    phone: false,
    source: true,
    assignedTo: true,
    lastContacted: true,
    createdAt: false,
  });

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    if (error) {
      toast({ title: "Erro ao carregar leads", description: error.message, variant: "destructive" });
    } else {
      setLeads(data || []);
    }
    setLoading(false);
  }, [supabase, toast]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = lead.name.toLowerCase().includes(searchLower) ||
                            (lead.email && lead.email.toLowerCase().includes(searchLower)) ||
                            (lead.company && lead.company.toLowerCase().includes(searchLower));
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [leads, searchTerm, statusFilter]);

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o lead "${name}"?`)) {
      const { error } = await supabase.from('leads').delete().eq('id', id);
      if (error) {
        toast({ title: "Erro ao excluir lead", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Lead Excluído", description: `Lead "${name}" excluído com sucesso.` });
        fetchLeads();
      }
    }
  };

  const handleEdit = (lead: Lead) => {
    setSelectedLead(lead);
    setIsFormOpen(true);
  };
  
  const handleAddNew = () => {
    setSelectedLead(null);
    setIsFormOpen(true);
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    fetchLeads();
  };

  const handleExportCSV = () => {
    if (filteredLeads.length === 0) {
      toast({ title: "Nenhum Lead para Exportar" });
      return;
    }
    toast({ title: "Exportar CSV", description: "Gerando arquivo CSV..." });
    const headers = ["ID", "Nome", "Empresa", "Email", "Telefone", "Status", "Fonte", "Atribuído a", "Último Contato", "Criado em", "Notas"];
    const rows = filteredLeads.map(lead => [
      lead.id, lead.name, lead.company, lead.email, lead.phone, lead.status, lead.source, lead.assigned_to, 
      lead.last_contacted_at ? format(parseISO(lead.last_contacted_at), "PPP p", { locale: ptBR }) : '-', 
      lead.created_at ? format(parseISO(lead.created_at), "PPP", { locale: ptBR }) : '-',
      lead.notes
    ].map(field => `"${String(field || '').replace(/"/g, '""')}"`).join(','));
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "leads.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAction = (action: string, leadName: string) => {
    toast({
        title: action,
        description: `${action} para o lead ${leadName}. (Funcionalidade futura)`,
    });
  };

  return (
    <div className="space-y-4">
       <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedLead ? 'Editar Lead' : 'Adicionar Novo Lead'}</DialogTitle>
            <DialogDescription>
              {selectedLead ? `Atualize as informações do lead ${selectedLead.name}.` : 'Preencha os detalhes abaixo para criar um novo lead.'}
            </DialogDescription>
          </DialogHeader>
          <LeadForm lead={selectedLead} onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>

      <div className="flex flex-col md:flex-row gap-2 justify-between items-center">
        <Input
          placeholder="Buscar leads (nome, email, empresa)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-2 w-full md:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              {PIPELINE_STAGES.map(stage => (
                <SelectItem key={stage} value={stage}>{stage}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <ListFilter className="mr-2 h-4 w-4" /> Colunas
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Alternar colunas</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {Object.entries(columnVisibility).map(([key, value]) => (
                <DropdownMenuCheckboxItem
                  key={key}
                  className="capitalize"
                  checked={value}
                  onCheckedChange={(checked) => 
                    setColumnVisibility(prev => ({ ...prev, [key]: Boolean(checked) }))
                  }
                >
                  {key === 'company' ? 'Empresa' : 
                   key === 'email' ? 'Email' : 
                   key === 'phone' ? 'Telefone' :
                   key === 'source' ? 'Fonte' :
                   key === 'assignedTo' ? 'Atribuído a' :
                   key === 'lastContacted' ? 'Último Contato' :
                   key === 'createdAt' ? 'Criado em' :
                   key.replace(/([A-Z])/g, ' $1')}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={handleExportCSV} variant="outline">
            <FileDown className="mr-2 h-4 w-4" /> Exportar
          </Button>
        </div>
      </div>

      <div className="rounded-lg border shadow-sm bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              {columnVisibility.company && <TableHead>Empresa</TableHead>}
              {columnVisibility.email && <TableHead>Email</TableHead>}
              <TableHead>Status</TableHead>
              {columnVisibility.source && <TableHead>Fonte</TableHead>}
              {columnVisibility.assignedTo && <TableHead>Atribuído a</TableHead>}
              {columnVisibility.lastContacted && <TableHead>Último Contato</TableHead>}
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
               Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  {columnVisibility.company && <TableCell><Skeleton className="h-5 w-24" /></TableCell>}
                  {columnVisibility.email && <TableCell><Skeleton className="h-5 w-40" /></TableCell>}
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  {columnVisibility.source && <TableCell><Skeleton className="h-5 w-16" /></TableCell>}
                  {columnVisibility.assignedTo && <TableCell><Skeleton className="h-5 w-24" /></TableCell>}
                  {columnVisibility.lastContacted && <TableCell><Skeleton className="h-5 w-28" /></TableCell>}
                  <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={Object.values(columnVisibility).filter(Boolean).length + 3} className="h-24 text-center text-muted-foreground">
                  Nenhum lead encontrado. <Button variant="link" onClick={handleAddNew}>Crie o primeiro.</Button>
                </TableCell>
              </TableRow>
            ) : (
              filteredLeads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell className="font-medium">{lead.name}</TableCell>
                {columnVisibility.company && <TableCell>{lead.company || '-'}</TableCell>}
                {columnVisibility.email && <TableCell>{lead.email || '-'}</TableCell>}
                <TableCell><Badge variant="secondary">{lead.status}</Badge></TableCell>
                {columnVisibility.source && <TableCell>{lead.source || '-'}</TableCell>}
                {columnVisibility.assignedTo && <TableCell>{lead.assigned_to || 'Não atribuído'}</TableCell>}
                {columnVisibility.lastContacted && <TableCell>{lead.last_contacted_at ? format(parseISO(lead.last_contacted_at), "PPP", { locale: ptBR }) : '-'}</TableCell>}
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                       <DropdownMenuItem onClick={() => handleEdit(lead)}>
                        <Edit className="mr-2 h-4 w-4" /> Editar Lead
                      </DropdownMenuItem>
                       <DropdownMenuItem onClick={() => handleAction('Registrar interação', lead.name)}>
                        <CheckCircle className="mr-2 h-4 w-4" /> Registrar Interação
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction('Atribuir para usuário', lead.name)}>
                        <UserPlus className="mr-2 h-4 w-4" /> Atribuir Para...
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDelete(lead.id, lead.name)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                        <Trash2 className="mr-2 h-4 w-4" /> Excluir Lead
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
