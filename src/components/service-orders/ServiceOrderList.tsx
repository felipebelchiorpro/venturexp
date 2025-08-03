
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Eye, FileDown } from "lucide-react";
import type { ServiceOrderStatusType } from "@/types";
import { SERVICE_ORDER_STATUSES } from '@/types';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { createClient } from "@/lib/supabase/client";
import { Skeleton } from '../ui/skeleton';
import { useRouter } from 'next/navigation';
import type { Tables } from '@/types/database.types';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { UserOptions } from 'jspdf-autotable';

interface jsPDFWithAutoTable extends jsPDF {
    autoTable: (options: UserOptions) => jsPDF;
}

type ServiceOrderWithClient = Tables<'service_orders'> & {
  clients: Pick<Tables<'clients'>, 'name' | 'email' | 'phone' | 'document' | 'address'> | null;
};

const getStatusBadgeVariant = (status: ServiceOrderStatusType) => {
    switch (status) {
      case 'Finalizada': return 'default'; 
      case 'Em Andamento': return 'secondary'; 
      case 'Aberta': return 'outline'; 
      case 'Aguardando Peças': return 'secondary';
      case 'Aguardando Aprovação': return 'secondary';
      case 'Cancelada': return 'destructive'; 
      default: return 'outline';
    }
};

export function ServiceOrderList() {
  const [serviceOrders, setServiceOrders] = useState<ServiceOrderWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | 'all'>('all');
  const { toast } = useToast();
  const supabase = createClient();
  const router = useRouter();

  const fetchServiceOrders = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('service_orders')
      .select(`
        *,
        clients (
          name,
          email,
          phone,
          document,
          address
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: "Erro ao carregar Ordens de Serviço", description: error.message, variant: "destructive" });
      setServiceOrders([]);
    } else {
      setServiceOrders(data || []);
    }
    setLoading(false);
  }, [supabase, toast]);

  useEffect(() => {
    fetchServiceOrders();
  }, [fetchServiceOrders]);

  const filteredServiceOrders = useMemo(() => {
    return serviceOrders.filter(order => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        order.order_number.toLowerCase().includes(searchLower) ||
        (order.clients?.name && order.clients.name.toLowerCase().includes(searchLower)) ||
        order.service_type.toLowerCase().includes(searchLower);
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [serviceOrders, searchTerm, statusFilter]);
  
  const formatCurrency = (value: number | null) => {
    if (value === null || isNaN(value)) {
        return 'N/A';
    }
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  const handleDelete = async (id: string, orderNumber: string) => {
    if (window.confirm(`Tem certeza que deseja excluir a O.S. "${orderNumber}"?`)) {
      const { error } = await supabase.from('service_orders').delete().eq('id', id);
      if (error) {
        toast({ title: "Erro ao excluir O.S.", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Ordem de Serviço Excluída", description: `A O.S. "${orderNumber}" foi excluída.` });
        fetchServiceOrders();
      }
    }
  };
  
  const handleAction = (action: string, orderNumber: string) => {
    toast({
        title: action,
        description: `Ação em O.S. ${orderNumber}. (Funcionalidade futura)`,
    });
  };
  
  const generatePDF = (order: ServiceOrderWithClient) => {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    const client = order.clients;

    // Cabeçalho
    doc.setFontSize(20);
    doc.text("Ordem de Serviço", 14, 22);
    doc.setFontSize(12);
    doc.text(`Número: ${order.order_number}`, 14, 30);
    
    doc.setFontSize(10);
    doc.text("VentureSys - Soluções em Tecnologia", 195, 22, { align: 'right'});
    doc.text("Rua das Inovações, 123 - Techville", 195, 28, { align: 'right'});
    doc.text("contato@venturesys.pro", 195, 34, { align: 'right'});
    

    // Dados do Cliente
    doc.setFontSize(14);
    doc.text("Dados do Cliente", 14, 45);
    doc.setFontSize(10);
    doc.text(`Nome: ${client?.name || 'Não informado'}`, 14, 52);
    doc.text(`Email: ${client?.email || 'Não informado'}`, 14, 58);
    doc.text(`Telefone: ${client?.phone || 'Não informado'}`, 14, 64);
    doc.text(`CPF/CNPJ: ${client?.document || 'Não informado'}`, 100, 64);
    doc.text(`Endereço: ${client?.address || 'Não informado'}`, 14, 70);

    // Detalhes da Ordem de Serviço
    doc.setFontSize(14);
    doc.text("Detalhes do Serviço", 14, 85);
    doc.autoTable({
        startY: 90,
        head: [['Data de Criação', 'Prazo de Execução', 'Status', 'Valor Total']],
        body: [[
            format(parseISO(order.created_at), "dd/MM/yyyy", { locale: ptBR }),
            order.execution_deadline ? format(parseISO(order.execution_deadline), "dd/MM/yyyy", { locale: ptBR }) : 'N/A',
            order.status,
            formatCurrency(order.service_value)
        ]],
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185] }
    });

    let finalY = doc.autoTable.previous.finalY;

    // Descrição do serviço
    doc.setFontSize(12);
    doc.text("Descrição do Serviço Solicitado:", 14, finalY + 10);
    doc.setFontSize(10);
    const serviceDescriptionLines = doc.splitTextToSize(order.service_type, 180);
    doc.text(serviceDescriptionLines, 14, finalY + 16);
    finalY += 16 + (serviceDescriptionLines.length * 5);

    // Produtos/Peças
    if (order.products_used) {
        doc.setFontSize(12);
        doc.text("Produtos/Peças Utilizadas:", 14, finalY + 10);
        doc.setFontSize(10);
        const productsLines = doc.splitTextToSize(order.products_used, 180);
        doc.text(productsLines, 14, finalY + 16);
        finalY += 16 + (productsLines.length * 5);
    }

    // Cláusulas
    doc.setFontSize(12);
    doc.text("Termos e Condições", 14, finalY + 15);
    doc.setFontSize(8);
    const clauses = [
        "1. A garantia para os serviços prestados é de 90 dias a contar da data de finalização desta O.S.",
        "2. Peças e componentes trocados possuem garantia de acordo com o fabricante.",
        "3. O pagamento deverá ser efetuado na conclusão do serviço, conforme condições acordadas.",
        "4. A não retirada do equipamento após 90 dias da comunicação de finalização implicará em cobrança de taxa de armazenagem.",
        "5. O cliente autoriza a execução dos serviços descritos acima e está ciente dos valores e condições."
    ];
    doc.text(clauses, 14, finalY + 21, { charSpace: 0.1 });
    
    // Assinatura
    const signatureY = doc.internal.pageSize.height - 40;
    doc.line(40, signatureY, 170, signatureY);
    doc.setFontSize(10);
    doc.text("Assinatura do Cliente", 105, signatureY + 5, { align: 'center'});
    doc.text(`( ${client?.name || ''} )`, 105, signatureY + 10, { align: 'center'});

    doc.save(`OS-${order.order_number}-${client?.name || 'cliente'}.pdf`);
    toast({ title: "PDF Gerado!", description: "O download do arquivo deve iniciar em breve." });
  };


  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-2 justify-between items-center">
        <Input
          placeholder="Buscar O.S. (Nº, cliente, serviço)..."
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
              {SERVICE_ORDER_STATUSES.map(stage => (
                <SelectItem key={stage} value={stage}>{stage}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-lg border shadow-sm bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número O.S.</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Serviço</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data de Criação</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
               Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredServiceOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  Nenhuma ordem de serviço encontrada.
                </TableCell>
              </TableRow>
            ) : (
              filteredServiceOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.order_number}</TableCell>
                <TableCell>{order.clients?.name || 'Cliente não encontrado'}</TableCell>
                <TableCell>{order.service_type}</TableCell>
                <TableCell>
                  <Badge 
                    variant={getStatusBadgeVariant(order.status as ServiceOrderStatusType)}
                    className={order.status === 'Finalizada' ? 'bg-green-500 text-white hover:bg-green-600' : ''}
                  >
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>{format(parseISO(order.created_at), "PPP", { locale: ptBR })}</TableCell>
                <TableCell>{formatCurrency(order.service_value)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                       <DropdownMenuItem onClick={() => handleAction('Ver Detalhes', order.order_number)}>
                        <Eye className="mr-2 h-4 w-4" /> Ver Detalhes
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction('Editar O.S.', order.order_number)}>
                        <Edit className="mr-2 h-4 w-4" /> Editar O.S.
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => generatePDF(order)}>
                        <FileDown className="mr-2 h-4 w-4" /> Gerar PDF
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDelete(order.id, order.order_number)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                        <Trash2 className="mr-2 h-4 w-4" /> Excluir O.S.
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

