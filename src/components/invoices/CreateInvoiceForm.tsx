
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Send, CreditCard, Package, Barcode, CircleDollarSign, HelpCircle, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from 'date-fns/locale';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { INVOICE_STATUSES, PAYMENT_METHODS, PAYMENT_CONDITIONS, type InvoiceStatusType, type PaymentMethodType, type PaymentConditionType } from "@/types";


const formSchema = z.object({
  productsAndQuantities: z.string().min(1, "É necessário informar os produtos e quantidades."),
  paymentMethod: z.enum(PAYMENT_METHODS, {
    required_error: "Escolha uma forma de pagamento.",
  }),
  paymentCondition: z.enum(PAYMENT_CONDITIONS).optional(),
  installments: z.string().optional(),
  dueDate: z.date({
    required_error: "A data de vencimento é obrigatória.",
  }),
  status: z.enum(INVOICE_STATUSES, {
    required_error: "O status da fatura é obrigatório.",
  }),
}).refine(data => {
  if (data.paymentMethod === "Cartão de Crédito" && data.paymentCondition === "Parcelado" && (!data.installments || data.installments.trim() === "")) {
    return false;
  }
  return true;
}, {
  message: "Informe o número de parcelas para pagamento parcelado com cartão.",
  path: ["installments"],
}).refine(data => {
    if (data.paymentMethod === "Cartão de Crédito" && !data.paymentCondition) {
        return false;
    }
    return true;
}, {
    message: "Escolha se o pagamento com cartão é à vista ou parcelado.",
    path: ["paymentCondition"],
});

type CreateInvoiceFormValues = z.infer<typeof formSchema>;

interface CreateInvoiceFormProps {
  clientName: string;
  clientId: string;
}

export function CreateInvoiceForm({ clientName, clientId }: CreateInvoiceFormProps) {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<CreateInvoiceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productsAndQuantities: "",
      paymentMethod: undefined,
      paymentCondition: undefined,
      installments: "",
      dueDate: undefined,
      status: "Pendente",
    },
  });

  const watchedPaymentMethod = form.watch("paymentMethod");
  const watchedPaymentCondition = form.watch("paymentCondition");

  function onSubmit(values: CreateInvoiceFormValues) {
    console.log("Dados da Nova Fatura (Logs de Transição):", values);
    
    const newInvoiceData = {
      id: `inv-${Date.now()}`,
      clientId: clientId,
      invoiceNumber: `FAT-${Math.floor(Math.random() * 10000)}`,
      amount: 0, // Placeholder, precisaria calcular baseado nos itens
      currency: "BRL",
      issueDate: new Date().toISOString(),
      dueDate: values.dueDate.toISOString(),
      status: values.status as InvoiceStatusType,
      items: [{id: 'item-temp', description: values.productsAndQuantities, quantity: 1, unitPrice: 0, total: 0}], // Simplificado
      paymentMethod: values.paymentMethod as PaymentMethodType,
      paymentCondition: values.paymentMethod === 'Cartão de Crédito' ? values.paymentCondition as PaymentConditionType : undefined,
      installments: values.paymentMethod === 'Cartão de Crédito' && values.paymentCondition === 'Parcelado' ? values.installments : undefined,
      notes: `Status: ${values.status}. Forma de pgto: ${values.paymentMethod}${values.paymentMethod === 'Cartão de Crédito' ? ` (${values.paymentCondition}${values.paymentCondition === 'Parcelado' ? ' em ' + values.installments : ''})` : ''}`
    };
    console.log("Simulando criação de fatura com dados completos: ", newInvoiceData);

    toast({
      title: "Fatura em Processamento!",
      description: `A fatura para ${clientName} (${values.status}) com vencimento em ${format(values.dueDate, "PPP", { locale: ptBR })} está sendo gerada. (Simulação)`,
    });
    form.reset();
    // Idealmente, aqui você adicionaria a fatura a uma lista de faturas do cliente,
    // por exemplo, usando MOCK_INVOICES ou um estado global/API.
    router.push(`/clients/${clientId}`);
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl rounded-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Criar Nova Fatura para {clientName}</CardTitle>
        <CardDescription>Vamos criar sua nova fatura. Preencha as informações abaixo:</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <CardContent className="space-y-8 pt-6">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <ListChecks className="mr-2 h-5 w-5 text-primary" /> Status da Fatura
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status inicial" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {INVOICE_STATUSES.map(status => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="productsAndQuantities"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <Package className="mr-2 h-5 w-5 text-primary" /> Produtos e Quantidades
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ex: Whey Protein x2, Creatina x1"
                      {...field}
                      rows={4}
                      className="resize-none"
                    />
                  </FormControl>
                   <FormDescription>Escreva os produtos e suas respectivas quantidades.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                     <CircleDollarSign className="mr-2 h-5 w-5 text-primary" /> Forma de Pagamento
                  </FormLabel>
                   <Select 
                     onValueChange={(value) => {
                        field.onChange(value);
                        if (value !== "Cartão de Crédito") {
                            form.setValue("paymentCondition", undefined);
                            form.setValue("installments", "");
                        }
                     }} 
                     defaultValue={field.value}
                   >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a forma de pagamento" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PAYMENT_METHODS.map(method => (
                        <SelectItem key={method} value={method}>{method}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>Escolha uma opção.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchedPaymentMethod === "Cartão de Crédito" && (
              <>
                <FormField
                  control={form.control}
                  name="paymentCondition"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="flex items-center">
                        <CreditCard className="mr-2 h-5 w-5 text-primary" /> Condição de Pagamento (Cartão)
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={(value) => {
                            field.onChange(value);
                            if (value === "À vista") {
                                form.setValue("installments", "");
                            }
                          }}
                          defaultValue={field.value}
                          className="flex flex-col space-y-2 pt-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="À vista" id="avista" />
                            </FormControl>
                            <FormLabel htmlFor="avista" className="font-normal cursor-pointer">
                              À vista
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Parcelado" id="parcelado" />
                            </FormControl>
                            <FormLabel htmlFor="parcelado" className="font-normal cursor-pointer">
                              Parcelado
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchedPaymentCondition === "Parcelado" && (
                  <FormField
                    control={form.control}
                    name="installments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <Barcode className="mr-2 h-5 w-5 text-primary" /> Parcelamento
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: 3x, 6x, 12x" {...field} />
                        </FormControl>
                        <FormDescription>Em quantas parcelas deseja dividir?</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </>
            )}
            

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="flex items-center">
                     <CalendarIcon className="mr-2 h-5 w-5 text-primary" /> Data de Vencimento
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
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, "PPP", { locale: ptBR })
                          ) : (
                            <span>Informe a data do primeiro vencimento</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().setDate(new Date().getDate() -1)) // Allow today
                        }
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription className="mt-1">Informe a data do primeiro vencimento da fatura (formato: DD/MM/AAAA).</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button type="submit" className="w-full md:w-auto">
              <Send className="mr-2 h-4 w-4" /> Gerar Fatura
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
