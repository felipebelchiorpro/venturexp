
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

    // Logo da empresa em Base64
    const logoBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAoAAAAFeAQMAAADIAttUAAAABlBMVEUAAAAzMzPI8eYgAAAAAXRSTlMAQObYZgAAAIpJREFUeNrtwTEBAAAAwqD1T20ND6AAAAAAAAAAAAA4MgoAAAAAAAAAAAAAAAAAAAAAAAAAAOCPCgAAAAAAAAAAAAAAAI4qAAAAAAAAAAAAAgAAAAAAAAAAgA4KAAAAAAAAAAAAAAAAAAAAoJMKAAAAAAAAAAAAgAoAAAAAAAAAAAAAAACgkwIAAAAAAAAAAJwVAAAAAAAAAAAAAABgqAICAAAAAAAAAAAAAICAFAAAAAAAAAAAAACgVQUAAAAAAAAAAADgnAIAAAAAAAAAADhTQAEA03oC5gI0AMhpdgAAAABJRU5ErkJggg==';

    doc.addImage(logoBase64, 'PNG', margin, 5, 50, 15);
    y += 15;


    const addSectionTitle = (title: string) => {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(title, margin, y);
        y += 7;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
    };

    const addParagraph = (text: string | string[], options: { isList?: boolean } = {}) => {
        const lines = Array.isArray(text) ? text : doc.splitTextToSize(text, pageWidth - margin * 2);
        lines.forEach((line: string) => {
            if (y > pageHeight - 20) { // Check for page break
                doc.addPage();
                y = 20;
            }
            doc.text((options.isList ? `   •  ${line}` : line), margin, y);
            y += 5;
        });
        y += 5; // Extra space after paragraph
    };
    
    // Contratante
    addSectionTitle("1. PARTES");
    addParagraph([
        "1.1 CONTRATANTE:",
        `Nome: ${client?.name || 'Não informado'}`,
        `CPF/CNPJ: ${client?.document || 'Não informado'}`,
        `Telefone: ${client?.phone || 'Não informado'}`,
    ]);

    // Contratado
    addParagraph([
        "1.2 CONTRATADO:",
        "Nome: Grupo Belchior",
        "CNPJ: 46.105.907/0001-16",
        "Telefone: (19) 97154-4146",
        "E-mail: atendimento@grupobelchior.com",
    ]);

    // Objetivo
    addSectionTitle("2. OBJETIVO");
    addParagraph("O presente contrato tem por objeto a prestação de serviços pelo Grupo Belchior em favor do Contratante, conforme as condições estabelecidas neste instrumento.");

    // Descrição dos Serviços
    addSectionTitle("3. DESCRIÇÃO DOS SERVIÇOS");
    addParagraph(`Os serviços a serem prestados pelo Grupo Belchior (Agencia Venture) compreendem "${order.service_type || 'Serviço não especificado'}" conforme especificado no Anexo A, que faz parte integrante deste contrato".`);
    
    // Condições Financeiras
    addSectionTitle("4. CONDIÇÕES FINANCEIRAS");
    doc.setFont('helvetica', 'bold');
    doc.text("4.1 VALOR E FORMA DE PAGAMENTO:", margin, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    addParagraph(`O valor total dos serviços contratados é de ${formatCurrency(order.total_value)}. O pagamento será efetuado da seguinte forma 100% após a finalização do projeto.`);
    
    doc.setFont('helvetica', 'bold');
    doc.text("4.2 DESPESAS ADICIONAIS", margin, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    addParagraph("Despesas adicionais, tais como deslocamento, hospedagem e alimentação (se aplicável), serão de responsabilidade do Contratante e serão detalhadas no orçamento.");

    // Prazo e Entrega
    addSectionTitle("5. PRAZO E ENTREGA");
    addParagraph("O prazo de entrega dos arquivo será de 1 após a realização do serviço. Qualquer alteração no prazo será comunicada e acordada entre as partes.");

    // Direitos Autorais
    addSectionTitle("6. DIREITOS AUTORAIS");
    addParagraph("Os direitos autorais dos arquivos são exclusivos da Contratada. O Contratante terá direito ao uso das imagens para fins pessoais, sociais e comerciais, após o envio.");

    // Cancelamento e Alterações
    addSectionTitle("7. CANCELAMENTO E ALTERAÇÕES");
    addParagraph("Em caso de cancelamento ou alteração da data do evento por parte do Contratante, será aplicada uma taxa de [percentual] sobre o valor total, a título de ressarcimento pelos serviços e compromissos assumidos.(se aplicável)");
    
    // Responsabilidades
    addSectionTitle("8. RESPONSABILIDADES DAS PARTES");
    doc.setFont('helvetica', 'bold');
    doc.text("8.1 DO CONTRATANTE:", margin, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    addParagraph("O Contratante compromete-se a colaborar com a Contratada, fornecendo informações e condições necessárias para a adequada prestação dos serviços.");
    
    doc.setFont('helvetica', 'bold');
    doc.text("8.2 DA CONTRATADA:", margin, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    addParagraph("O Grupo Belchior compromete-se a realizar os serviços de forma profissional e diligente, utilizando equipamentos adequados e técnicas apropriadas.");

    // Disposições Gerais
    addSectionTitle("9. DISPOSIÇÕES GERAIS");
    doc.setFont('helvetica', 'bold');
    doc.text("9.1 PUBLICIDADE:", margin, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    addParagraph("A Contratada poderá utilizar as imagens produzidas para fins de divulgação em seus canais de comunicação, salvo acordo em contrário.");

    // Data e Assinaturas
    y += 10;
    doc.text(`Caconde-SP, ${format(new Date(), "dd/MM/yyyy")}`, margin, y);
    y += 20;
    
    const centerOfPage = pageWidth / 2;
    const signatureLineY = y;
    const signatureLineLength = 80;
    
    doc.line(centerOfPage - signatureLineLength / 2, signatureLineY, centerOfPage + signatureLineLength / 2, signatureLineY);
    doc.text(`${client?.name || ' '}`, centerOfPage, signatureLineY + 5, { align: 'center'});
    doc.text(`${client?.document || ' '}`, centerOfPage, signatureLineY + 10, { align: 'center'});
    doc.text("Titular Responsável", centerOfPage, signatureLineY + 15, { align: 'center'});

    y += 25;
    
    doc.line(centerOfPage - signatureLineLength / 2, y, centerOfPage + signatureLineLength / 2, y);
    doc.text("Felipe Augusto Belchior", centerOfPage, y + 5, { align: 'center'});
    doc.text("CEO Grupo Belchior", centerOfPage, y + 10, { align: 'center'});

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
