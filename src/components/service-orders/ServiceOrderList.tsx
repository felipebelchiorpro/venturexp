
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
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;
    let y = 20;

    // Cabeçalho
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(`CONTRATO DE PRESTAÇÃO DE SERVIÇOS - OS Nº ${order.order_number}`, pageWidth / 2, y, { align: 'center' });
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
        lines.forEach((line: string) => {
            if (y > pageHeight - 20) {
                doc.addPage();
                y = 20;
            }
            doc.text(line, margin, y);
            y += 5;
        });
        y += 5;
    };
    
    // 1. PARTES
    addSectionTitle("1. DAS PARTES");
    doc.setFont('helvetica', 'bold');
    doc.text("CONTRATANTE:", margin, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    addParagraph([
      `Nome/Razão Social: ${client?.name || 'Não informado'}`,
      `CPF/CNPJ: ${client?.document || 'Não informado'}`,
      `Endereço: ${client?.address || 'Não informado'}`,
      `E-mail: ${client?.email || 'Não informado'}`,
      `Telefone: ${client?.phone || 'Não informado'}`,
    ]);

    doc.setFont('helvetica', 'bold');
    doc.text("CONTRATADA:", margin, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    addParagraph([
        "Nome/Razão Social: Venture XP", // Substituir pelo nome da sua empresa
        "CNPJ: 00.000.000/0001-00", // Substituir pelo seu CNPJ
        "Endereço: Rua Exemplo, 123, Cidade, Estado", // Substituir pelo seu endereço
        "E-mail: contato@venturexp.pro", // Substituir pelo seu e-mail
    ]);

    // 2. OBJETO
    addSectionTitle("2. DO OBJETO");
    addParagraph(`O presente contrato tem por objeto a prestação dos seguintes serviços pela CONTRATADA em favor da CONTRATANTE: "${order.service_type || 'Serviço não especificado'}", conforme detalhado na Ordem de Serviço (O.S.) de número ${order.order_number}.`);
    
    // 3. VALOR E PAGAMENTO
    addSectionTitle("3. DO VALOR E DA FORMA DE PAGAMENTO");
    addParagraph(`Pelos serviços prestados, a CONTRATANTE pagará à CONTRATADA o valor total de ${formatCurrency(order.total_value)}. O pagamento deverá ser efetuado via ${order.payment_method || 'a combinar'}.`);

    // 4. PRAZOS
    addSectionTitle("4. DOS PRAZOS");
    addParagraph(`A CONTRATADA se compromete a iniciar a execução dos serviços na data de ${format(parseISO(order.created_at), "PPP", { locale: ptBR })}. A previsão de conclusão é ${order.execution_deadline ? `até ${format(parseISO(order.execution_deadline), "PPP", { locale: ptBR })}` : 'a ser definida'}.`);

    // 5. DISPOSIÇÕES GERAIS
    addSectionTitle("5. DISPOSIÇÕES GERAIS");
    addParagraph("Quaisquer alterações no escopo dos serviços deverão ser formalizadas por meio de um aditivo contratual ou uma nova Ordem de Serviço, com os devidos ajustes de valor e prazo. As partes elegem o foro da Comarca de Caconde/SP para dirimir quaisquer controvérsias oriundas deste contrato.");
    
    // Data e Assinaturas
    y += 20;
    doc.text(`Gerado em: ${format(new Date(), "PPP", { locale: ptBR })}`, margin, y);
    y += 25;
    
    const centerOfPage = pageWidth / 2;
    const signatureLineLength = 70;

    doc.line(margin, y, margin + signatureLineLength, y);
    doc.text("CONTRATANTE", margin, y + 5);
    doc.text(`${client?.name || '(Assinatura)'}`, margin, y + 10);
    
    doc.line(pageWidth - margin - signatureLineLength, y, pageWidth - margin, y);
    doc.text("CONTRATADA", pageWidth - margin - signatureLineLength, y + 5);
    doc.text("Venture XP", pageWidth - margin - signatureLineLength, y + 10);

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
