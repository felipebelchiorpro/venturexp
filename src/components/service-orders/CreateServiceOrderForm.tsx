
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
import { UserCircle, Phone, MapPin, Wrench, Package, CalendarDays, DollarSign, FileText, ListChecks, Save, PlusCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from 'date-fns/locale';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { SERVICE_ORDER_STATUSES } from "@/types";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Tables, TablesInsert } from '@/types/database.types';

type Product = Tables<'products'>;
type ServiceOrderInsert = TablesInsert<'service_orders'>;

const productItemSchema = z.object({
    productId: z.string().min(1, "Selecione um produto."),
    quantity: z.coerce.number().min(1, "A quantidade deve ser pelo menos 1."),
    unitPrice: z.coerce.number(), // Preço virá do produto selecionado
    name: z.string() // Nome virá do produto selecionado
});

const formSchema = z.object({
  contactPhone: z.string().optional(),
  serviceAddress: z.string().optional(),
  serviceType: z.string().min(1, "O tipo de serviço é obrigatório."),
  productsUsed: z.array(productItemSchema).optional(),
  osCreationDate: z.date({
    required_error: "A data de abertura da OS é obrigatória.",
  }),
  executionDeadline: z.date().optional(),
  serviceValue: z.string().optional().transform(val => val ? parseFloat(val.replace(',', '.')) : undefined).refine(val => val === undefined || val >= 0, {message: "O valor não pode ser negativo."} ),
  additionalNotes: z.string().optional(),
  initialStatus: z.enum(SERVICE_ORDER_STATUSES, {
    required_error: "O status inicial é obrigatório.",
  }),
});

type CreateServiceOrderFormValues = z.infer<typeof formSchema>;

interface CreateServiceOrderFormProps {
  clientName: string;
  clientId: string;
  clientPhone?: string | null;
}

export function CreateServiceOrderForm({ clientName, clientId, clientPhone }: CreateServiceOrderFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClient();
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [totalValue, setTotalValue] = useState(0);

  const form = useForm<CreateServiceOrderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contactPhone: clientPhone || "",
      serviceAddress: "",
      serviceType: "",
      productsUsed: [],
      osCreationDate: new Date(),
      executionDeadline: undefined,
      serviceValue: undefined,
      additionalNotes: "",
      initialStatus: "Aberta",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "productsUsed"
  });

  const productsWatch = form.watch("productsUsed");
  const manualServiceValue = form.watch("serviceValue");

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
        setTotalValue(productsTotal);
    };
    calculateTotal();
  }, [productsWatch]);

  const handleProductSelection = (index: number, productId: string) => {
    const selectedProduct = availableProducts.find(p => p.id === productId);
    if(selectedProduct) {
        form.setValue(`productsUsed.${index}.unitPrice`, selectedProduct.price);
        form.setValue(`productsUsed.${index}.name`, selectedProduct.name);
    }
  };


  async function onSubmit(values: CreateServiceOrderFormValues) {
    const finalValue = manualServiceValue !== undefined ? manualServiceValue : totalValue;
    const productsString = values.productsUsed?.map(p => `${p.quantity}x ${p.name}`).join(', ');

    const newServiceOrderData: ServiceOrderInsert = {
      client_id: clientId,
      order_number: `OS-${Math.floor(1000 + Math.random() * 9000)}`,
      service_type: values.serviceType,
      products_used: productsString,
      created_at: values.osCreationDate.toISOString(),
      execution_deadline: values.executionDeadline?.toISOString(),
      service_value: finalValue,
      status: values.initialStatus,
      // 'additionalNotes' and other fields from the form are not in the 'service_orders' table schema.
      // Need to add them to the table if they are required. For now, they are omitted.
    };

    const { error } = await supabase.from('service_orders').insert(newServiceOrderData);

    if (error) {
        toast({ title: "Erro ao Criar Ordem de Serviço", description: error.message, variant: 'destructive' });
        return;
    }

    toast({
      title: "Ordem de Serviço Criada!",
      description: `A Ordem de Serviço para ${clientName} (${values.initialStatus}) foi gerada com sucesso.`,
    });
    form.reset();
    router.push(`/clients/${clientId}`);
    router.refresh(); // To update client details page
  }

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-xl rounded-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Gerar Nova Ordem de Serviço</CardTitle>
        <CardDescription>Por favor, preencha os dados abaixo para gerar a OS:</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <CardContent className="space-y-6 pt-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="flex items-center">
                        <Phone className="mr-2 h-5 w-5 text-primary" /> Contato
                    </FormLabel>
                    <FormControl>
                        <Input placeholder="Telefone ou WhatsApp" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                    control={form.control}
                    name="serviceAddress"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="flex items-center">
                            <MapPin className="mr-2 h-5 w-5 text-primary" /> Endereço
                        </FormLabel>
                        <FormControl>
                            <Input
                            placeholder="Local onde o serviço será realizado"
                            {...field}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <FormField
              control={form.control}
              name="serviceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <Wrench className="mr-2 h-5 w-5 text-primary" /> Tipo de Serviço
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva o serviço solicitado (ex: manutenção, instalação, troca de peça)"
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-4 rounded-md border p-4">
                <FormLabel className="flex items-center text-base"><Package className="mr-2 h-5 w-5 text-primary" /> Produtos/Peças Utilizadas</FormLabel>
                {fields.map((field, index) => (
                    <div key={field.id} className="flex items-end gap-2 p-2 rounded-md bg-muted/50">
                        <FormField
                            control={form.control}
                            name={`productsUsed.${index}.productId`}
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                <FormLabel className="text-xs">Produto</FormLabel>
                                <Select onValueChange={(value) => { field.onChange(value); handleProductSelection(index, value); }} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Selecione um item" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {availableProducts.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={`productsUsed.${index}.quantity`}
                            render={({ field }) => (
                                <FormItem className="w-24">
                                <FormLabel className="text-xs">Qtd.</FormLabel>
                                <FormControl><Input type="number" {...field} /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
                 <Button type="button" variant="outline" size="sm" onClick={() => append({ productId: "", quantity: 1, unitPrice: 0, name: '' })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Item
                </Button>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="osCreationDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="flex items-center">
                      <CalendarDays className="mr-2 h-5 w-5 text-primary" /> Data de Abertura da OS
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("w-full justify-start text-left font-normal mt-1", !field.value && "text-muted-foreground" )}
                          >
                            <CalendarDays className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus locale={ptBR} />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="executionDeadline"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="flex items-center">
                      <CalendarDays className="mr-2 h-5 w-5 text-primary" /> Prazo de Execução
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("w-full justify-start text-left font-normal mt-1", !field.value && "text-muted-foreground")}
                          >
                            <CalendarDays className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Escolha uma data (opcional)</span>}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} initialFocus locale={ptBR}/>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                <FormField
                    control={form.control}
                    name="serviceValue"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="flex items-center">
                            <DollarSign className="mr-2 h-5 w-5 text-primary" /> Valor do Serviço (Manual)
                        </FormLabel>
                        <FormControl>
                            <Input type="text" placeholder="Deixe em branco para calcular" {...field} />
                        </FormControl>
                        <FormDescription>Preencha para substituir o cálculo automático.</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <div className="p-2 rounded-md bg-muted text-muted-foreground">
                    <span className="text-sm">Valor Total Calculado:</span>
                    <p className="text-lg font-bold text-foreground">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue)}</p>
                </div>
            </div>

            <FormField
              control={form.control}
              name="additionalNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <FileText className="mr-2 h-5 w-5 text-primary" /> Observações Adicionais
                  </FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ex: cliente solicitou urgência, equipamento já aberto, etc." {...field} rows={4}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="initialStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <ListChecks className="mr-2 h-5 w-5 text-primary" /> Status Inicial
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Selecione o status inicial" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SERVICE_ORDER_STATUSES.map(status => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <div className="flex w-full items-center">
                <UserCircle className="mr-2 h-5 w-5 text-primary" /> 
                <span className="text-sm font-medium">Cliente: {clientName}</span>
            </div>
            <Button type="submit" className="ml-auto" disabled={form.formState.isSubmitting}>
              <Save className="mr-2 h-4 w-4" /> {form.formState.isSubmitting ? 'Salvando...' : 'Gerar Ordem de Serviço'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
