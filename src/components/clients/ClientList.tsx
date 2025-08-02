
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
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import type { Client } from "@/types";
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { createClient } from "@/lib/supabase/client";
import { Skeleton } from '../ui/skeleton';
import { useRouter } from 'next/navigation';

const getStatusBadgeVariant = (status: Client['status']): "default" | "secondary" | "destructive" | "outline" => {
  if (!status) return 'outline';
  switch (status) {
    case 'Ativo': return 'default';
    case 'Inativo': return 'destructive';
    case 'Potencial': return 'secondary';
    default: return 'outline';
  }
};

export function ClientList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function fetchClients() {
      setLoading(true);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching clients:", error);
        toast({
          title: "Erro ao carregar clientes",
          description: "Não foi possível buscar os clientes do banco de dados.",
          variant: "destructive",
        });
        setClients([]);
      } else if (data) {
        setClients(data);
      }
      setLoading(false);
    }

    fetchClients();
  }, [toast, supabase]);

  const filteredClients = clients.filter(client =>
    (client.name && client.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.company && client.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o cliente "${name}"? Esta ação não pode ser desfeita.`)) {
      const { error } = await supabase.from('clients').delete().eq('id', id);

      if (error) {
        toast({
          title: "Erro ao excluir cliente",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setClients(prev => prev.filter(c => c.id !== id));
        toast({
          title: "Cliente Excluído",
          description: `O cliente "${name}" foi excluído com sucesso.`,
          variant: "default",
        });
      }
    }
  };
  
  const handleEditClient = (clientId: string) => {
    router.push(`/clients/${clientId}/edit`);
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
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-8 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-52" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredClients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Nenhum cliente encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={client.avatar_url || `https://placehold.co/100x100.png?text=${client.name.charAt(0)}`} alt={client.name} data-ai-hint="person company" />
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
                  <TableCell>{format(parseISO(client.created_at), "PPP", { locale: ptBR })}</TableCell>
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
                        <DropdownMenuItem onClick={() => handleEditClient(client.id)}>
                          <Edit className="mr-2 h-4 w-4" /> Editar Cliente
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(client.id, client.name)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                          <Trash2 className="mr-2 h-4 w-4" /> Excluir Cliente
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

    