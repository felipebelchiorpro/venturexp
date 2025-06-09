
"use client";

import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MOCK_CLIENTS, SERVICE_ORDER_STATUSES_PT } from "@/lib/constants"; 
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Phone, Building, Info, DollarSign, Briefcase, PlusCircle, FileText, History, Eye, Edit, Users, CalendarClock } from "lucide-react";
import { useParams, useRouter } from "next/navigation"; 
import { useEffect, useState } from "react";
import type { Client, Invoice, ServiceOrder, InvoiceStatusType, PaymentMethodType, ServiceOrderStatusType } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from "@/components/ui/badge";

// Mock data for invoices and service orders
const mockInvoices: Invoice[] = [
    { id: 'inv-001', clientId: 'client-001', invoiceNumber: '2024-001', amount: 1500, currency: 'BRL', issueDate: new Date(2024, 4, 1).toISOString(), dueDate: new Date(2024, 4, 15).toISOString(), status: 'Paga', items: [{id: 'item-1', description: 'Consultoria SEO', quantity:1, unitPrice: 1500, total: 1500}], paymentMethod: 'PIX' },
    { id: 'inv-002', clientId: 'client-001', invoiceNumber: '2024-002', amount: 2500, currency: 'BRL', issueDate: new Date(2024, 5, 1).toISOString(), dueDate: new Date(2024, 5, 15).toISOString(), status: 'Pendente', items: [{id: 'item-2', description: 'Desenvolvimento Web - Fase 1', quantity:1, unitPrice: 2500, total: 2500}], paymentMethod: 'Cartão de Crédito', paymentCondition: 'Parcelado', installments: '2x' },
    { id: 'inv-003', clientId: 'client-002', invoiceNumber: '2024-003', amount: 800, currency: 'USD', issueDate: new Date(2024, 5, 5).toISOString(), dueDate: new Date(2024, 5, 20).toISOString(), status: 'Atrasada', items: [{id: 'item-3', description: 'Campanha de Ads', quantity:1, unitPrice: 800, total: 800}], paymentMethod: 'Dinheiro' },
];

const mockServiceOrders: ServiceOrder[] = [
    { id: 'os-001', clientId: 'client-001', orderNumber: 'OS-2024-010', serviceType: 'Manutenção Website', creationDate: new Date(2024, 4, 20).toISOString(), status: 'Em Andamento', assignedTo: 'Equipe Web' },
    { id: 'os-002', clientId: 'client-002', orderNumber: 'OS-2024-011', serviceType: 'Criação de Conteúdo Blog', creationDate: new Date(2024, 5, 10).toISOString(), status: 'Aberta' },
];


export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter(); 
  const clientId = params.clientId as string;
  const [client, setClient] = useState<Client | null>(null);
  const [clientInvoices, setClientInvoices] = useState<Invoice[]>([]);
  const [clientServiceOrders, setClientServiceOrders] = useState<ServiceOrder[]>([]);

  const { toast } = useToast();

  useEffect(() => {
    const foundClient = MOCK_CLIENTS.find(c => c.id === clientId);
    setClient(foundClient || null);
    if (foundClient) {
        setClientInvoices(mockInvoices.filter(inv => inv.clientId === clientId));
        setClientServiceOrders(mockServiceOrders.filter(os => os.clientId === clientId));
    }
  }, [clientId]);

  if (!client) {
    return (
      <div className="space-y-6">
        <PageHeader title="Cliente Não Encontrado" description="O cliente que você está procurando não foi encontrado." />
      </div>
    );
  }
  
  const handleAddInvoice = () => {
    if (client) {
      router.push(`/clients/${client.id}/invoices/new`);
    }
  }

  const handleAddServiceOrder = () => {
     if (client) {
      router.push(`/clients/${client.id}/service-orders/new`);
    }
  }

  const handleViewInvoice = (invoiceNumber: string) => {
    toast({ title: "Visualizar Fatura", description: `Visualizando fatura nº ${invoiceNumber}. (Simulação)`});
  }

  const handleViewServiceOrder = (orderNumber: string) => {
    toast({ title: "Visualizar Ordem de Serviço", description: `Visualizando OS nº ${orderNumber}. (Simulação)`});
  }
  
  const handleEditClient = () => {
     toast({ title: "Editar Cliente", description: `Editando informações de ${client.name}. (Simulação)`});
  }
  
  const getInvoiceStatusBadgeVariant = (status: InvoiceStatusType) => {
    switch (status) {
      case 'Paga': return 'default'; 
      case 'Pendente': return 'secondary'; 
      case 'Atrasada': return 'destructive'; 
      case 'Cancelada': return 'outline'; 
      default: return 'outline';
    }
  };

  const getServiceOrderStatusBadgeVariant = (status: ServiceOrderStatusType) => {
    switch (status) {
      case 'Finalizada': return 'default'; // Green
      case 'Em Andamento': return 'secondary'; // Yellow or neutral
      case 'Aberta': return 'outline'; // Blue or primary
      case 'Aguardando Peças': return 'secondary';
      case 'Aguardando Aprovação': return 'secondary';
      case 'Cancelada': return 'destructive'; // Red
      default: return 'outline';
    }
  };


  return (
    <div className="space-y-8">
      <PageHeader title={client.name} description={`Detalhes e histórico do cliente ${client.company || client.name}.`} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 shadow-lg rounded-lg">
          <CardHeader>
            <div className="flex items-center space-x-4 mb-4">
                <Avatar className="h-20 w-20 border">
                    <AvatarImage src={client.avatarUrl || `https://placehold.co/100x100.png?text=${client.name.charAt(0)}`} alt={client.name} data-ai-hint="company logo"/>
                    <AvatarFallback>{client.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle className="text-2xl">{client.name}</CardTitle>
                    <CardDescription className="text-sm">{client.company || "Pessoa Física"}</CardDescription>
                </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center">
              <Mail className="mr-3 h-4 w-4 text-muted-foreground" />
              <span>{client.email}</span>
            </div>
            {client.phone && (
              <div className="flex items-center">
                <Phone className="mr-3 h-4 w-4 text-muted-foreground" />
                <span>{client.phone}</span>
              </div>
            )}
            {client.segment && (
              <div className="flex items-center">
                <Briefcase className="mr-3 h-4 w-4 text-muted-foreground" />
                <span>Segmento: {client.segment}</span>
              </div>
            )}
             <div className="flex items-center">
                <Info className="mr-3 h-4 w-4 text-muted-foreground" />
                <span>Status: <Badge variant={client.status === 'Ativo' ? 'default' : 'secondary'} className={client.status === 'Ativo' ? 'bg-green-500 text-white hover:bg-green-600' : ''}>{client.status}</Badge></span>
            </div>
            {client.responsable && (
              <div className="flex items-center">
                <Users className="mr-3 h-4 w-4 text-muted-foreground" />
                <span>Responsável: {client.responsable}</span>
              </div>
            )}
             <div className="flex items-center">
                <CalendarClock className="mr-3 h-4 w-4 text-muted-foreground" />
                <span>Cliente desde: {format(parseISO(client.createdAt), "PPP", { locale: ptBR })}</span>
            </div>
          </CardContent>
           <CardFooter className="pt-4">
             <Button variant="outline" className="w-full" onClick={handleEditClient}>
                <Edit className="mr-2 h-4 w-4" /> Editar Cliente
            </Button>
           </CardFooter>
        </Card>

        <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-md hover:shadow-lg transition-shadow rounded-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div className="flex items-center">
                    <DollarSign className="mr-2 h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Faturas</CardTitle>
                </div>
                <Button size="sm" onClick={handleAddInvoice}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Nova Fatura
                </Button>
            </CardHeader>
            <CardContent>
                {clientInvoices.length === 0 ? (
                     <p className="text-sm text-muted-foreground py-4 text-center">Nenhuma fatura encontrada para este cliente.</p>
                ) : (
                <ul className="space-y-3">
                    {clientInvoices.map(invoice => (
                    <li key={invoice.id} className="flex justify-between items-center p-3 border rounded-md hover:bg-muted/50 transition-colors">
                        <div>
                            <span className="font-medium text-base">Fatura {invoice.invoiceNumber}</span>
                            <p className="text-sm text-muted-foreground">{invoice.currency} {invoice.amount.toFixed(2)} - Venc. {format(parseISO(invoice.dueDate), "dd/MM/yy", { locale: ptBR })}</p>
                            {invoice.paymentMethod && <p className="text-xs text-muted-foreground">Método: {invoice.paymentMethod} {invoice.paymentCondition ? `(${invoice.paymentCondition}${invoice.installments ? ` - ${invoice.installments}`: ''})` : ''}</p>}
                        </div>
                        <div className="flex items-center space-x-2">
                            <Badge 
                                variant={getInvoiceStatusBadgeVariant(invoice.status)}
                                className={`text-xs ${invoice.status === 'Paga' ? 'bg-green-500 text-white hover:bg-green-600' : ''}`}>
                                {invoice.status}
                            </Badge>
                            <Button variant="ghost" size="sm" onClick={() => handleViewInvoice(invoice.invoiceNumber)} aria-label="Visualizar Fatura">
                                <Eye className="h-4 w-4"/>
                            </Button>
                        </div>
                    </li>
                    ))}
                </ul>
                )}
            </CardContent>
            </Card>

            <Card className="shadow-md hover:shadow-lg transition-shadow rounded-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                 <div className="flex items-center">
                    <Briefcase className="mr-2 h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Ordens de Serviço</CardTitle>
                </div>
                <Button size="sm" onClick={handleAddServiceOrder}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Nova O.S.
                </Button>
            </CardHeader>
            <CardContent>
                {clientServiceOrders.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">Nenhuma ordem de serviço encontrada.</p>
                ) : (
                <ul className="space-y-3">
                    {clientServiceOrders.map(os => (
                    <li key={os.id} className="flex justify-between items-center p-3 border rounded-md hover:bg-muted/50 transition-colors">
                        <div>
                            <span className="font-medium text-base">OS {os.orderNumber}</span>
                            <p className="text-sm text-muted-foreground">{os.serviceType}</p> {/* Changed from serviceDescription */}
                        </div>
                         <div className="flex items-center space-x-2">
                            <Badge variant={getServiceOrderStatusBadgeVariant(os.status)} 
                                   className={`text-xs ${os.status === 'Finalizada' ? 'bg-green-500 text-white hover:bg-green-600' : ''}`}>
                                {os.status}
                            </Badge>
                            <Button variant="ghost" size="sm" onClick={() => handleViewServiceOrder(os.orderNumber)} aria-label="Visualizar Ordem de Serviço">
                                <Eye className="h-4 w-4"/>
                            </Button>
                        </div>
                    </li>
                    ))}
                </ul>
                )}
            </CardContent>
            </Card>
        </div>
      </div>
       <Card className="shadow-md rounded-lg">
            <CardHeader className="pb-4">
                <div className="flex items-center">
                    <History className="mr-2 h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Histórico de Atividades Recentes</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground text-center py-4">
                    Um log de atividades recentes relacionadas a este cliente (ex: propostas enviadas, e-mails, pagamentos) será exibido aqui. (Placeholder)
                </p>
            </CardContent>
        </Card>
    </div>
  );
}
