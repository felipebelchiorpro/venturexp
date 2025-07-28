
"use client";

import { useState, useEffect, useMemo } from 'react';
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, PlusCircle, ListFilter, FileDown, UserPlus, CheckCircle } from "lucide-react";
import type { Lead } from "@/types";
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PIPELINE_STAGES } from '@/types';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export function LeadList() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | 'all'>('all');
  const { toast } = useToast();
  
  const [columnVisibility, setColumnVisibility] = useState({
    company: true,
    email: true,
    phone: false,
    source: true,
    assignedTo: true,
    lastContacted: true,
    createdAt: false,
  });

  useEffect(() => {
    // In a real app, this would be fetched from an API.
    setLeads([]); 
  }, []);

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (lead.company && lead.company.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [leads, searchTerm, statusFilter]);

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o lead "${name}"?`)) {
      setLeads(prev => prev.filter(l => l.id !== id));
      toast({
        title: "Lead Excluído",
        description: `Lead "${name}" excluído com sucesso. (Simulação)`,
        variant: "destructive"
      });
    }
  };

  const handleExportCSV = () => {
    if (filteredLeads.length === 0) {
      toast({
        title: "Nenhum Lead para Exportar",
        description: "Não há leads correspondentes aos filtros atuais para exportar.",
        variant: "default" 
      });
      return;
    }
    toast({
        title: "Exportar CSV",
        description: "Gerando arquivo CSV dos leads filtrados... (Simulação)",
    });
    const headers = ["ID", "Nome", "Empresa", "Email", "Telefone", "Status", "Fonte", "Atribuído a", "Último Contato", "Criado em", "Notas"];
    const rows = filteredLeads.map(lead => [
      lead.id, lead.name, lead.company, lead.email, lead.phone, lead.status, lead.source, lead.assignedTo, 
      lead.lastContacted ? format(parseISO(lead.lastContacted), "PPP p", { locale: ptBR }) : '-', 
      lead.createdAt ? format(parseISO(lead.createdAt), "PPP", { locale: ptBR }) : '-',
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
        description: `${action} para o lead ${leadName}. (Simulação)`,
    });
  };


  return (
    <div className="space-y-4">
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
            <FileDown className="mr-2 h-4 w-4" /> Exportar CSV
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
            {filteredLeads.length === 0 && (
              <TableRow>
                <TableCell colSpan={Object.values(columnVisibility).filter(Boolean).length + 3} className="h-24 text-center text-muted-foreground">
                  Nenhum lead encontrado.
                </TableCell>
              </TableRow>
            )}
            {filteredLeads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell className="font-medium">{lead.name}</TableCell>
                {columnVisibility.company && <TableCell>{lead.company || '-'}</TableCell>}
                {columnVisibility.email && <TableCell>{lead.email}</TableCell>}
                <TableCell><Badge variant="secondary">{lead.status}</Badge></TableCell>
                {columnVisibility.source && <TableCell>{lead.source || '-'}</TableCell>}
                {columnVisibility.assignedTo && <TableCell>{lead.assignedTo || 'Não atribuído'}</TableCell>}
                {columnVisibility.lastContacted && <TableCell>{lead.lastContacted ? format(parseISO(lead.lastContacted), "PPP p", { locale: ptBR }) : '-'}</TableCell>}
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleAction('Visualizar/Editar lead', lead.name)}>
                        <Edit className="mr-2 h-4 w-4" /> Editar Lead
                      </DropdownMenuItem>
                       <DropdownMenuItem onClick={() => handleAction('Registrar interação', lead.name)}>
                        <CheckCircle className="mr-2 h-4 w-4" /> Registrar Interação
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction('Atribuir tarefa', lead.name)}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Atribuir Tarefa
                      </DropdownMenuItem>
                       <DropdownMenuItem onClick={() => handleAction('Atribuir lead para usuário', lead.name)}>
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
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
