
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Phone, Mail, MapPin, Wrench, Package, CalendarDays, DollarSign, FileText, ListChecks, Save, PlusCircle, Trash2, Shield, Settings, Info, Tag, CreditCard, CheckCircle, Image as ImageIcon, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { ptBR } from 'date-fns/locale';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { SERVICE_ORDER_STATUSES, SERVICE_ORDER_PRIORITIES, PAYMENT_METHODS, PAYMENT_STATUSES } from "@/types";
import type { ProductPiece } from "@/types";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Tables, TablesInsert, TablesUpdate, Json } from '@/types/database.types';

type Product = Tables<'products'>;
type Client = Tables<'clients'>;
type ServiceOrder = Tables<'service_orders'>;
type ServiceOrderInsert = TablesInsert<'service_orders'>;
type ServiceOrderUpdate = TablesUpdate<'service_orders'>;

const productUsedSchema = z.object({
    productId: z.string().min(1, "Selecione um produto."),
    quantity: z.coerce.number().min(1, "A quantidade deve ser pelo menos 1."),
    unitPrice: z.coerce.number(),
    name: z.string()
});

const formSchema = z.object({
  // Informações Gerais
  status: z.enum(SERVICE_ORDER_STATUSES),
  priority: z.enum(SERVICE_ORDER_PRIORITIES),
  service_type: z.string().min(3, "O tipo de serviço é obrigatório."),
  created_at: z.date(),
  execution_deadline: z.date().optional(),
  
  // Dados Técnicos
  equipment: z.string().optional(),
  defect_reported: z.string().optional(),
  diagnostic_technical: z.string().optional(),
  solution_applied: z.string().optional(),

  // Orçamento e Pagamento
  labor_value: z.coerce.number().min(0).default(0),
  products_used: z.array(productUsedSchema).optional(),
  payment_method: z.enum(PAYMENT_METHODS).optional(),
  payment_status: z.enum(PAYMENT_STATUSES).optional(),

  // Acompanhamento
  technician_id: z.string().optional(), // Deveria ser um UUID de um usuário/técnico
  additional_notes: z.string().optional(),
});

type CreateServiceOrderFormValues = z.infer<typeof formSchema>;

interface CreateServiceOrderFormProps {
  client: Client;
  serviceOrder?: ServiceOrder | null;
  onSuccess?: () => void;
}

export function CreateServiceOrderForm({ client, serviceOrder, onSuccess }: CreateServiceOrderFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClient();
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const isEditMode = !!serviceOrder;

  const form = useForm<CreateServiceOrderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: "Aguardando",
      priority: "Média",
      service_type: "",
      created_at: new Date(),
      execution_deadline: undefined,
      equipment: "",
      defect_reported: "",
      diagnostic_technical: "",
      solution_applied: "",
      labor_value: 0,
      products_used: [],
      payment_method: undefined,
      payment_status: undefined,
      technician_id: undefined,
      additional_notes: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "products_used"
  });

  const productsWatch = form.watch("products_used");
  const laborValueWatch = form.watch("labor_value");

  useEffect(() => {
    if (isEditMode && serviceOrder) {
      form.reset({
        status: serviceOrder.status as any,
        priority: serviceOrder.priority as any,
        service_type: serviceOrder.service_type,
        created_at: parseISO(serviceOrder.created_at),
        execution_deadline: serviceOrder.execution_deadline ? parseISO(serviceOrder.execution_deadline) : undefined,
        equipment: serviceOrder.equipment ?? "",
        defect_reported: serviceOrder.defect_reported ?? "",
        diagnostic_technical: serviceOrder.diagnostic_technical ?? "",
        solution_applied: serviceOrder.solution_applied ?? "",
        labor_value: serviceOrder.labor_value ?? 0,
        products_used: (serviceOrder.products_used as ProductPiece[] | null)?.map(p => ({ ...p, productId: p.productId || '' })) || [],
        payment_method: (serviceOrder.payment_method as any) || undefined,
        payment_status: (serviceOrder.payment_status as any) || undefined,
        technician_id: serviceOrder.technician_id ?? undefined,
        additional_notes: serviceOrder.additional_notes ?? "",
      });
    }
  }, [isEditMode, serviceOrder, form]);

  useEffect(() => {
    const fetchProducts = async () => {
        const { data, error } = await supabase.from('products').select('*').order('name');
        if (error) {
            toast({ title: 'Erro ao buscar produtos', description: error.message, variant: 'destructive' });
        } else {
            setAvailableProducts(data);
        }
    };
    fetchProducts();
  }, [supabase, toast]);

  useEffect(() => {
    const calculateTotal = () => {
        const productsTotal = productsWatch?.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0) ?? 0;
        const laborTotal = laborValueWatch || 0;
        setTotalValue(productsTotal + laborTotal);
    };
    calculateTotal();
  }, [productsWatch, laborValueWatch]);

  const handleProductSelection = (index: number, productId: string) => {
    const selectedProduct = availableProducts.find(p => p.id === productId);
    if(selectedProduct) {
        form.setValue(`products_used.${index}.unitPrice`, selectedProduct.price);
        form.setValue(`products_used.${index}.name`, selectedProduct.name);
    }
  };


  async function onSubmit(values: CreateServiceOrderFormValues) {
    const finalValue = totalValue;

    const dataToSave = {
        client_id: client.id,
        created_at: values.created_at.toISOString(),
        execution_deadline: values.execution_deadline?.toISOString() || null,
        status: values.status,
        priority: values.priority,
        service_type: values.service_type,
        equipment: values.equipment || null,
        defect_reported: values.defect_reported || null,
        diagnostic_technical: values.diagnostic_technical || null,
        solution_applied: values.solution_applied || null,
        labor_value: values.labor_value,
        products_used: values.products_used as Json,
        total_value: finalValue,
        payment_method: values.payment_method || null,
        payment_status: values.payment_status || null,
        technician_id: values.technician_id || null,
        additional_notes: values.additional_notes || null,
    };
    
    if (isEditMode && serviceOrder) {
        const { error } = await supabase
            .from('service_orders')
            .update(dataToSave as ServiceOrderUpdate)
            .eq('id', serviceOrder.id);

        if (error) {
            toast({ title: "Erro ao Atualizar O.S.", description: error.message, variant: 'destructive' });
            return;
        }
        toast({ title: "Ordem de Serviço Atualizada!", description: `A O.S. para ${client.name} foi atualizada com sucesso.`});

    } else {
        const newServiceOrderData: ServiceOrderInsert = {
            ...dataToSave,
            order_number: `OS-${Math.floor(1000 + Math.random() * 9000)}`,
        };

        const { error } = await supabase.from('service_orders').insert(newServiceOrderData);
        if (error) {
            toast({ title: "Erro ao Criar Ordem de Serviço", description: error.message, variant: 'destructive' });
            return;
        }
        toast({ title: "Ordem de Serviço Criada!", description: `A O.S. para ${client.name} foi gerada com sucesso.`});
    }

    if(onSuccess) {
        onSuccess();
    } else {
        router.push(`/clients/${client.id}`);
        router.refresh();
    }
  }

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined || isNaN(value)) {
        return 'R$ 0,00';
    }
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Card de Informações Gerais */}
        <Card>
            <CardHeader><CardTitle className="flex items-center"><Info className="mr-2 h-5 w-5 text-primary" />Informações Gerais</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FormField control={form.control} name="status" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Status da OS</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Selecione o status" /></SelectTrigger></FormControl>
                                <SelectContent>{SERVICE_ORDER_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                            </Select>
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="priority" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Prioridade</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Selecione a prioridade" /></SelectTrigger></FormControl>
                                <SelectContent>{SERVICE_ORDER_PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                            </Select>
                        </FormItem>
                    )}/>
                     <FormField control={form.control} name="created_at" render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Data de Abertura</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild><FormControl>
                                    <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                    {field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>} <CalendarDays className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </FormControl></PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent>
                            </Popover>
                        </FormItem>
                    )}/>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="service_type" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tipo de Serviço</FormLabel>
                            <FormControl><Input placeholder="Ex: Manutenção Preventiva, Instalação de Software" {...field} /></FormControl>
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="execution_deadline" render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Previsão de Entrega</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild><FormControl>
                                    <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                    {field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>} <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </FormControl></PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent>
                            </Popover>
                        </FormItem>
                    )}/>
                 </div>
            </CardContent>
        </Card>
        
        {/* Card do Cliente */}
        <Card>
            <CardHeader><CardTitle className="flex items-center"><User className="mr-2 h-5 w-5 text-primary" />Dados do Cliente</CardTitle></CardHeader>
            <CardContent className="space-y-2">
                <p><strong>Nome:</strong> {client.name}</p>
                <p><strong>CPF/CNPJ:</strong> {client.document || 'Não informado'}</p>
                <p><strong>Telefone:</strong> {client.phone || 'Não informado'}</p>
                <p><strong>Email:</strong> {client.email}</p>
                <p><strong>Endereço:</strong> {client.address || 'Não informado'}</p>
            </CardContent>
        </Card>

        {/* Card de Dados Técnicos */}
        <Card>
            <CardHeader><CardTitle className="flex items-center"><Settings className="mr-2 h-5 w-5 text-primary" />Dados Técnicos</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <FormField control={form.control} name="equipment" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Equipamento / Produto (Marca/Modelo)</FormLabel>
                        <FormControl><Input placeholder="Ex: Notebook Dell Vostro, Ar Condicionado LG" {...field} /></FormControl>
                    </FormItem>
                )}/>
                 <FormField control={form.control} name="defect_reported" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Defeito Relatado</FormLabel>
                        <FormControl><Textarea placeholder="Descrição do problema informado pelo cliente." {...field} rows={3} /></FormControl>
                    </FormItem>
                )}/>
                 <FormField control={form.control} name="diagnostic_technical" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Diagnóstico Técnico</FormLabel>
                        <FormControl><Textarea placeholder="Análise técnica do problema encontrado." {...field} rows={3} /></FormControl>
                    </FormItem>
                )}/>
                 <FormField control={form.control} name="solution_applied" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Solução Aplicada</FormLabel>
                        <FormControl><Textarea placeholder="Descrição dos procedimentos realizados para resolver o problema." {...field} rows={3} /></FormControl>
                    </FormItem>
                )}/>
            </CardContent>
        </Card>

        {/* Card de Orçamento e Pagamento */}
        <Card>
            <CardHeader><CardTitle className="flex items-center"><DollarSign className="mr-2 h-5 w-5 text-primary" />Orçamento e Pagamento</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <FormLabel>Peças Utilizadas</FormLabel>
                    {fields.map((field, index) => (
                        <div key={field.id} className="flex items-end gap-2 p-2 rounded-md border bg-muted/50">
                            <FormField control={form.control} name={`products_used.${index}.productId`} render={({ field }) => (
                                <FormItem className="flex-1">
                                    <Select onValueChange={(value) => { field.onChange(value); handleProductSelection(index, value); }} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Selecione um item" /></SelectTrigger></FormControl>
                                        <SelectContent>{availableProducts.map(p => <SelectItem key={p.id} value={p.id}>{p.name} ({formatCurrency(p.price)})</SelectItem>)}</SelectContent>
                                    </Select>
                                </FormItem>
                            )}/>
                            <FormField control={form.control} name={`products_used.${index}.quantity`} render={({ field }) => (
                                <FormItem className="w-24"><FormControl><Input type="number" placeholder="Qtd." {...field} /></FormControl></FormItem>
                            )}/>
                            <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => append({ productId: "", name: "", quantity: 1, unitPrice: 0 })}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Peça/Produto
                    </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="labor_value" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Valor da Mão de Obra (R$)</FormLabel>
                            <FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} /></FormControl>
                        </FormItem>
                    )}/>
                    <div className="p-3 rounded-md bg-muted text-muted-foreground flex flex-col justify-center">
                        <span className="text-sm font-semibold">Valor Total da OS:</span>
                        <p className="text-2xl font-bold text-foreground">{formatCurrency(totalValue)}</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="payment_method" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Forma de Pagamento</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                                <SelectContent>{PAYMENT_METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                            </Select>
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="payment_status" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Situação do Pagamento</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                                <SelectContent>{PAYMENT_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                            </Select>
                        </FormItem>
                    )}/>
                </div>
            </CardContent>
        </Card>

        {/* Card de Anexos e Acompanhamento */}
        <Card>
            <CardHeader><CardTitle className="flex items-center"><ListChecks className="mr-2 h-5 w-5 text-primary" />Acompanhamento e Anexos</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <FormField control={form.control} name="additional_notes" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Observações Adicionais</FormLabel>
                        <FormControl><Textarea placeholder="Qualquer informação extra relevante para esta OS." {...field} rows={4} /></FormControl>
                    </FormItem>
                )}/>
                <div>
                    <FormLabel>Anexos</FormLabel>
                    <div className="mt-2 flex items-center justify-center w-full p-4 border-2 border-dashed rounded-md">
                        <Button type="button" variant="outline"><ImageIcon className="mr-2 h-4 w-4" /> Enviar Arquivos (Placeholder)</Button>
                    </div>
                </div>
                <div>
                     <FormLabel>Histórico de Alterações</FormLabel>
                     <p className="text-sm text-muted-foreground mt-2">O histórico de alterações de status será exibido aqui.</p>
                </div>
            </CardContent>
        </Card>
        
        <div className="flex flex-wrap gap-2 justify-end pt-4">
            <Button type="button" variant="destructive" onClick={() => router.back()}>Cancelar</Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              <Save className="mr-2 h-4 w-4" /> {form.formState.isSubmitting ? 'Salvando...' : (isEditMode ? 'Atualizar Ordem de Serviço' : 'Salvar Ordem de Serviço')}
            </Button>
        </div>
      </form>
    </Form>
  );
}
