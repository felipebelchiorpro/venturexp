
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { UserCircle, Phone, MapPin, Wrench, Package, CalendarDays, DollarSign, FileText, ListChecks, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from 'date-fns/locale';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { SERVICE_ORDER_STATUSES, type ServiceOrderStatusType, type ServiceOrder } from "@/types";

const formSchema = z.object({
  contactPhone: z.string().optional(),
  serviceAddress: z.string().optional(),
  serviceType: z.string().min(1, "O tipo de serviço é obrigatório."),
  productsUsed: z.string().optional(),
  osCreationDate: z.date({
    required_error: "A data de abertura da OS é obrigatória.",
  }),
  executionDeadline: z.date().optional(),
  serviceValue: z.string().optional().transform(val => val ? parseFloat(val.replace(',', '.')) : undefined).refine(val => val === undefined || val > 0, {message: "O valor deve ser positivo."} ),
  additionalNotes: z.string().optional(),
  initialStatus: z.enum(SERVICE_ORDER_STATUSES, {
    required_error: "O status inicial é obrigatório.",
  }),
});

type CreateServiceOrderFormValues = z.infer<typeof formSchema>;

interface CreateServiceOrderFormProps {
  clientName: string;
  clientId: string;
  clientPhone?: string;
}

export function CreateServiceOrderForm({ clientName, clientId, clientPhone }: CreateServiceOrderFormProps) {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<CreateServiceOrderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contactPhone: clientPhone || "",
      serviceAddress: "",
      serviceType: "",
      productsUsed: "",
      osCreationDate: new Date(),
      executionDeadline: undefined,
      serviceValue: "",
      additionalNotes: "",
      initialStatus: "Aberta",
    },
  });

  function onSubmit(values: CreateServiceOrderFormValues) {
    console.log("Dados da Nova Ordem de Serviço:", values);
    
    const newServiceOrderData: ServiceOrder = {
      id: `os-${Date.now()}`,
      clientId: clientId,
      orderNumber: `OS-${Math.floor(Math.random() * 10000)}`,
      clientName: clientName,
      contactPhone: values.contactPhone,
      serviceAddress: values.serviceAddress,
      serviceType: values.serviceType,
      productsUsed: values.productsUsed,
      creationDate: values.osCreationDate.toISOString(),
      executionDeadline: values.executionDeadline?.toISOString(),
      serviceValue: values.serviceValue,
      currency: values.serviceValue ? "BRL" : undefined,
      additionalNotes: values.additionalNotes,
      status: values.initialStatus as ServiceOrderStatusType,
    };
    console.log("Simulando criação de OS com dados completos: ", newServiceOrderData);

    toast({
      title: "Ordem de Serviço Criada!",
      description: `A Ordem de Serviço para ${clientName} (${values.initialStatus}) foi gerada com sucesso. (Simulação)`,
    });
    form.reset();
    router.push(`/clients/${clientId}`);
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
                    <Textarea
                      placeholder="Local onde o serviço será realizado (ou endereço de entrega/retirada)"
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <FormField
              control={form.control}
              name="productsUsed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <Package className="mr-2 h-5 w-5 text-primary" /> Produtos/Peças Utilizadas
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Liste os produtos ou peças incluídas, com quantidades (ex: Cabo HDMI x2, Fonte 12V x1)"
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
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
                            className={cn(
                              "w-full justify-start text-left font-normal mt-1",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarDays className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, "PPP", { locale: ptBR })
                            ) : (
                              <span>Escolha uma data</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription className="mt-1">Data em que a OS está sendo criada.</FormDescription>
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
                      <CalendarDays className="mr-2 h-5 w-5 text-primary" /> Prazo de Execução ou Entrega
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal mt-1",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarDays className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, "PPP", { locale: ptBR })
                            ) : (
                              <span>Escolha uma data (opcional)</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                          initialFocus
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription className="mt-1">Prazo previsto para conclusão.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="serviceValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <DollarSign className="mr-2 h-5 w-5 text-primary" /> Valor (R$)
                  </FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="Ex: 150,00 (ou deixe em branco)" {...field} />
                  </FormControl>
                   <FormDescription>Informe o valor total do serviço (ou deixe em aberto).</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="additionalNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <FileText className="mr-2 h-5 w-5 text-primary" /> Observações Adicionais
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ex: cliente solicitou urgência, equipamento já aberto, etc."
                      {...field}
                      rows={4}
                    />
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
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status inicial" />
                      </SelectTrigger>
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
            <Button type="submit" className="ml-auto">
              <Save className="mr-2 h-4 w-4" /> Gerar Ordem de Serviço
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
