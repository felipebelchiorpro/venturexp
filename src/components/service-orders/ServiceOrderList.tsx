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
import type { ServiceOrderStatusType, ServiceOrderPriorityType } from "@/types";
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
import { APP_LOGO_URL } from '@/lib/constants';

interface jsPDFWithAutoTable extends jsPDF {
    autoTable: (options: UserOptions) => jsPDF;
}

type ServiceOrderWithClient = Tables<'service_orders'> & {
  clients: Pick<Tables<'clients'>, 'name' | 'email' | 'phone' | 'document' | 'address'> | null;
};

const getStatusBadgeVariant = (status: ServiceOrderStatusType) => {
    switch (status) {
      case 'Concluída': return 'default';
      case 'Em andamento': return 'secondary';
      case 'Aguardando': return 'outline';
      case 'Aguardando Peças': return 'secondary';
      case 'Aguardando Aprovação': return 'secondary';
      case 'Cancelada': return 'destructive';
      default: return 'outline';
    }
};

const getPriorityBadgeVariant = (priority: ServiceOrderPriorityType) => {
    switch (priority) {
      case 'Urgente': return 'destructive';
      case 'Alta': return 'secondary';
      case 'Média': return 'default';
      case 'Baixa': return 'outline';
      default: return 'outline';
    }
}

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
  
  const handleEdit = (orderId: string) => {
    router.push(`/service-orders/${orderId}/edit`);
  };

  const handleViewDetails = (clientId: string) => {
      router.push(`/clients/${clientId}`);
  }
  
  const generatePDF = (order: ServiceOrderWithClient) => {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    const client = order.clients;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;
    let y = 20;

    // Função para adicionar a logo
    const addLogo = () => {
        try {
            // A logo de placeholder pode não funcionar com o `addImage` do jsPDF.
            // Para um teste real, substitua APP_LOGO_URL por uma URL de imagem acessível publicamente com CORS habilitado.
            // doc.addImage(APP_LOGO_URL, 'PNG', margin, y, 40, 10);
            // y += 20;
            // Usando texto como substituto temporário para a logo:
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text("Venture XP (Sua Logo Aqui)", margin, y);
            y += 15;
        } catch (e) {
            console.error("Erro ao adicionar a logo no PDF:", e);
            // Continua sem a logo se houver erro
        }
    };
    
    addLogo();

    // Cabeçalho do Contrato
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(`Contrato de Prestação de Serviços - O.S. Nº ${order.order_number}`, pageWidth / 2, y, { align: 'center' });
    y += 15;

    const addSectionTitle = (title: string) => {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(title, margin, y);
        y += 7;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
    };

    const addParagraph = (text: string | string[]) => {
        const lines = Array.isArray(text) ? text : doc.splitTextToSize(text, pageWidth - margin * 2);
        doc.text(lines, margin, y);
        y += (lines.length * 5) + 5; // Ajusta o espaçamento
    };

    // 1. DAS PARTES
    addSectionTitle("1. DAS PARTES");
    addParagraph([
      `CONTRATANTE: ${client?.name || 'Não informado'}, CPF/CNPJ: ${client?.document || 'Não informado'}, com endereço em ${client?.address || 'Não informado'}.`,
      `CONTRATADA: Venture XP, CNPJ 00.000.000/0001-00, com endereço em Rua Exemplo, 123, Cidade, Estado.`
    ]);

    // 2. DO OBJETO
    addSectionTitle("2. DO OBJETO DO CONTRATO");
    addParagraph(`O presente contrato tem como objeto a prestação de serviço de "${order.service_type || 'Serviço não especificado'}", conforme detalhado na Ordem de Serviço (O.S.) de número ${order.order_number}. O serviço inclui as seguintes atividades: ${order.solution_applied || order.defect_reported || 'Conforme descrito na O.S.'}.`);

    // 3. DO VALOR E DA FORMA DE PAGAMENTO
    addSectionTitle("3. DO VALOR E DA FORMA DE PAGAMENTO");
    addParagraph(`Pelos serviços prestados, a CONTRATANTE pagará à CONTRATADA o valor total de ${formatCurrency(order.total_value)}, a ser pago via ${order.payment_method || 'a combinar'}.`);

    // 4. DOS PRAZOS
    addSectionTitle("4. DOS PRAZOS");
    addParagraph(`A CONTRATADA se compromete a executar os serviços a partir de ${format(parseISO(order.created_at), "PPP", { locale: ptBR })}. A previsão de conclusão é ${order.execution_deadline ? `até ${format(parseISO(order.execution_deadline), "PPP", { locale: ptBR })}` : 'a ser definida'}. Este prazo pode ser alterado mediante acordo entre as partes.`);

    // 5. DAS DISPOSIÇÕES GERAIS
    addSectionTitle("5. DAS DISPOSIÇÕES GERAIS");
    addParagraph("As partes elegem o foro da comarca de Caconde/SP para dirimir quaisquer litígios oriundos do presente contrato, com renúncia expressa a qualquer outro, por mais privilegiado que seja.");
    
    // Data e Assinaturas
    y += 20; // Espaço antes das assinaturas
    doc.text(`Gerado em: ${format(new Date(), "PPP", { locale: ptBR })}`, margin, y);
    y += 25;
    
    const signatureLineY = y;
    const signatureTextY = y + 5;
    
    doc.line(margin, signatureLineY, margin + 70, signatureLineY);
    doc.text(`${client?.name || 'Contratante'}`, margin, signatureTextY);

    doc.line(pageWidth - margin - 70, signatureLineY, pageWidth - margin, signatureLineY);
    doc.text("Venture XP (Contratada)", pageWidth - margin - 70, signatureTextY);

    doc.save(`Contrato-OS-${order.order_number}-${client?.name || 'cliente'}.pdf`);
    toast({ title: "Contrato em PDF Gerado!", description: "O download do arquivo deve iniciar em breve." });
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
              <TableHead>Prioridade</TableHead>
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
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredServiceOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
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
                    className={order.status === 'Concluída' ? 'bg-green-500 text-white hover:bg-green-600' : ''}
                  >
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={getPriorityBadgeVariant(order.priority as ServiceOrderPriorityType)}
                    className={order.priority === 'Urgente' ? 'bg-red-600 text-white hover:bg-red-700' : ''}
                   >
                     {order.priority}
                  </Badge>
                </TableCell>
                <TableCell>{format(parseISO(order.created_at), "PPP", { locale: ptBR })}</TableCell>
                <TableCell>{formatCurrency(order.total_value)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                       <DropdownMenuItem onClick={() => handleViewDetails(order.client_id)}>
                        <Eye className="mr-2 h-4 w-4" /> Ver Detalhes do Cliente
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(order.id)}>
                        <Edit className="mr-2 h-4 w-4" /> Editar O.S.
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => generatePDF(order)}>
                        <FileDown className="mr-2 h-4 w-4" /> Gerar Contrato
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
