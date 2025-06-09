
"use client";

import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MOCK_CLIENTS } from "@/lib/constants"; // Assuming clients might be fetched here in the future
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Phone, Building, Info, DollarSign, Briefcase, PlusCircle, FileText, History, Eye, Edit, Users, CalendarClock } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Client, Invoice, ServiceOrder } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from "@/components/ui/badge";

// Mock data for invoices and service orders
const mockInvoices: Invoice[] = [
    { id: 'inv-001', clientId: 'client-001', invoiceNumber: '2024-001', amount: 1500, currency: 'BRL', issueDate: new Date(2024, 4, 1).toISOString(), dueDate: new Date(2024, 4, 15).toISOString(), status: 'Paga', items: [{id: 'item-1', description: 'Consultoria SEO', quantity:1, unitPrice: 1500, total: 1500}] },
    { id: 'inv-002', clientId: 'client-001', invoiceNumber: '2024-002', amount: 2500, currency: 'BRL', issueDate: new Date(2024, 5, 1).toISOString(), dueDate: new Date(2024, 5, 15).toISOString(), status: 'Pendente', items: [{id: 'item-2', description: 'Desenvolvimento Web - Fase 1', quantity:1, unitPrice: 2500, total: 2500}] },
    { id: 'inv-003', clientId: 'client-002', invoiceNumber: '2024-003', amount: 800, currency: 'USD', issueDate: new Date(2024, 5, 5).toISOString(), dueDate: new Date(2024, 5, 20).toISOString(), status: 'Atrasada', items: [{id: 'item-3', description: 'Campanha de Ads', quantity:1, unitPrice: 800, total: 800}] },
];

const mockServiceOrders: ServiceOrder[] = [
    { id: 'os-001', clientId: 'client-001', orderNumber: 'OS-2024-010', serviceDescription: 'Manutenção Website', creationDate: new Date(2024, 4, 20).toISOString(), status: 'Em Progresso', assignedTo: 'Equipe Web' },
    { id: 'os-002', clientId: 'client-002', orderNumber: 'OS-2024-011', serviceDescription: 'Criação de Conteúdo Blog', creationDate: new Date(2024, 5, 10).toISOString(), status: 'Aberta' },
];


export default function ClientDetailPage() {
  const params = useParams();
  const clientId = params.clientId as string;
  const [client, setClient] = useState<Client | null>(null);
  const [clientInvoices, setClientInvoices] = useState<Invoice[]>([]);
  const [clientServiceOrders, setClientServiceOrders] = useState<ServiceOrder[]>([]);

  const { toast } = useToast();

  useEffect(() => {
    // Simulate fetching client data
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
    toast({ title: "Adicionar Nova Fatura", description: `Criando nova fatura para ${client.name}. (Simulação)`});
  }

  const handleAddServiceOrder = () => {
    toast({ title: "Nova Ordem de Serviço", description: `Criando nova ordem de serviço para ${client.name}. (Simulação)`});
  }

  const handleViewInvoice = (invoiceNumber: string) => {
    toast({ title: "Visualizar Fatura", description: `Visualizando fatura nº ${invoiceNumber}. (Simulação)`});
  }

  const handleViewServiceOrder = (orderNumber: string) => {
    toast({ title: "Visualizar Ordem de Serviço", description: `Visualizando OS nº ${orderNumber}. (Simulação)`});
  }

  return (
    <div className="space-y-8">
      <PageHeader title={client.name} description={`Detalhes e histórico do cliente ${client.company || client.name}.`} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center space-x-3 mb-4">
                <Avatar className="h-16 w-16">
                    <AvatarImage src={client.avatarUrl || `https://placehold.co/100x100.png?text=${client.name.charAt(0)}`} alt={client.name} data-ai-hint="company logo"/>
                    <AvatarFallback>{client.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle className="text-xl">{client.name}</CardTitle>
                    <CardDescription>{client.company || "Pessoa Física"}</CardDescription>
                </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center text-sm">
              <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{client.email}</span>
            </div>
            {client.phone && (
              <div className="flex items-center text-sm">
                <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{client.phone}</span>
              </div>
            )}
            {client.segment && (
              <div className="flex items-center text-sm">
                <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Segmento: {client.segment}</span>
              </div>
            )}
             <div className="flex items-center text-sm">
                <Info className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Status: <Badge variant={client.status === 'Ativo' ? 'default' : 'secondary'} className={client.status === 'Ativo' ? 'bg-green-500 text-white' : ''}>{client.status}</Badge></span>
            </div>
            {client.responsable && (
              <div className="flex items-center text-sm">
                <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Responsável: {client.responsable}</span>
              </div>
            )}
             <div className="flex items-center text-sm">
                <CalendarClock className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Cliente desde: {format(parseISO(client.createdAt), "PPP", { locale: ptBR })}</span>
            </div>
          </CardContent>
           <CardFooter>
             <Button variant="outline" className="w-full">
                <Edit className="mr-2 h-4 w-4" /> Editar Cliente
            </Button>
           </CardFooter>
        </Card>

        <div className="lg:col-span-2 space-y-6">
            <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center">
                    <DollarSign className="mr-2 h-5 w-5 text-primary" />
                    <CardTitle>Faturas</CardTitle>
                </div>
                <Button size="sm" onClick={handleAddInvoice}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Nova Fatura
                </Button>
            </CardHeader>
            <CardContent>
                {clientInvoices.length === 0 ? (
                     <p className="text-sm text-muted-foreground">Nenhuma fatura encontrada para este cliente.</p>
                ) : (
                <ul className="space-y-2">
                    {clientInvoices.map(invoice => (
                    <li key={invoice.id} className="flex justify-between items-center p-2 border rounded-md hover:bg-muted/50">
                        <div>
                            <span className="font-medium">Fatura {invoice.invoiceNumber}</span> - <span className="text-sm">{invoice.currency} {invoice.amount.toFixed(2)}</span>
                            <Badge variant={invoice.status === 'Paga' ? 'default' : invoice.status === 'Pendente' ? 'secondary' : 'destructive'} className="ml-2 text-xs">{invoice.status}</Badge>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleViewInvoice(invoice.invoiceNumber)}><Eye className="h-4 w-4"/></Button>
                    </li>
                    ))}
                </ul>
                )}
            </CardContent>
            </Card>

            <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                 <div className="flex items-center">
                    <Briefcase className="mr-2 h-5 w-5 text-primary" />
                    <CardTitle>Ordens de Serviço</CardTitle>
                </div>
                <Button size="sm" onClick={handleAddServiceOrder}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Nova O.S.
                </Button>
            </CardHeader>
            <CardContent>
                {clientServiceOrders.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhuma ordem de serviço encontrada.</p>
                ) : (
                <ul className="space-y-2">
                    {clientServiceOrders.map(os => (
                    <li key={os.id} className="flex justify-between items-center p-2 border rounded-md hover:bg-muted/50">
                        <div>
                            <span className="font-medium">OS {os.orderNumber}</span> - <span className="text-sm">{os.serviceDescription}</span>
                             <Badge variant={os.status === 'Concluída' ? 'default' : 'secondary'} className="ml-2 text-xs">{os.status}</Badge>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleViewServiceOrder(os.orderNumber)}><Eye className="h-4 w-4"/></Button>
                    </li>
                    ))}
                </ul>
                )}
            </CardContent>
            </Card>
        </div>
      </div>
       <Card>
            <CardHeader>
                <div className="flex items-center">
                    <History className="mr-2 h-5 w-5 text-primary" />
                    <CardTitle>Histórico de Atividades Recentes</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">
                    Um log de atividades recentes relacionadas a este cliente (ex: propostas enviadas, e-mails, pagamentos) será exibido aqui. (Placeholder)
                </p>
            </CardContent>
        </Card>
    </div>
  );
}

    