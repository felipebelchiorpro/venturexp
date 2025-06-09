
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, FileText, Eye, DollarSign, Briefcase } from "lucide-react";
import type { Client, ClientStatus } from "@/types";
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MOCK_CLIENTS } from '@/lib/constants';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const getStatusBadgeVariant = (status: ClientStatus): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case 'Ativo': return 'default';
    case 'Inativo': return 'destructive';
    case 'Potencial': return 'secondary';
    default: return 'outline';
  }
};

export function ClientList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    setClients(MOCK_CLIENTS);
  }, []);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.company && client.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o cliente "${name}"? Esta ação não pode ser desfeita.`)) {
      setClients(prev => prev.filter(c => c.id !== id));
      toast({
        title: "Cliente Excluído",
        description: `O cliente "${name}" foi excluído com sucesso. (Simulação)`,
        variant: "destructive"
      });
    }
  };

  const handleManageInvoices = (clientName: string) => {
    toast({
      title: "Gerenciar Faturas",
      description: `Acessando faturas para ${clientName}. (Simulação)`,
    });
    // router.push(`/clients/${clientId}/invoices`); // Exemplo de navegação futura
  };

  const handleGenerateServiceOrder = (clientName: string) => {
    toast({
      title: "Gerar Ordem de Serviço",
      description: `Criando nova ordem de serviço para ${clientName}. (Simulação)`,
    });
    // router.push(`/clients/${clientId}/service-orders/new`); // Exemplo de navegação futura
  };
  
  const handleEditClient = (clientName: string) => {
    toast({
      title: "Editar Cliente",
      description: `Editando informações de ${clientName}. (Simulação)`,
    });
    // router.push(`/clients/${clientId}/edit`); // Exemplo de navegação futura
  }


  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Buscar clientes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="rounded-lg border shadow-sm bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Nenhum cliente encontrado.
                </TableCell>
              </TableRow>
            )}
            {filteredClients.map((client) => (
              <TableRow key={client.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={client.avatarUrl || `https://placehold.co/100x100.png?text=${client.name.charAt(0)}`} alt={client.name} data-ai-hint="person company" />
                      <AvatarFallback>{client.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{client.name}</span>
                  </div>
                </TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell>{client.company || '-'}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(client.status)}
                         className={client.status === 'Ativo' ? 'bg-green-500 text-white hover:bg-green-600' : ''}>
                    {client.status}
                  </Badge>
                </TableCell>
                <TableCell>{format(parseISO(client.createdAt), "PPP", { locale: ptBR })}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Opções do Cliente</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/clients/${client.id}`}>
                          <Eye className="mr-2 h-4 w-4" /> Ver Detalhes
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleManageInvoices(client.name)}>
                        <DollarSign className="mr-2 h-4 w-4" /> Gerenciar Faturas
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleGenerateServiceOrder(client.name)}>
                        <Briefcase className="mr-2 h-4 w-4" /> Gerar Ordem de Serviço
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleEditClient(client.name)}>
                        <Edit className="mr-2 h-4 w-4" /> Editar Cliente
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(client.id, client.name)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                        <Trash2 className="mr-2 h-4 w-4" /> Excluir Cliente
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
