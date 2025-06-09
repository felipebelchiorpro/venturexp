
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
import { CalendarIcon, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from 'date-fns/locale';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  productsAndQuantities: z.string().min(1, "É necessário informar os produtos e quantidades."),
  paymentMethod: z.enum(["avista", "parcelado"], {
    required_error: "Escolha uma forma de pagamento.",
  }),
  installments: z.string().optional(),
  dueDate: z.date({
    required_error: "A data de vencimento é obrigatória.",
  }),
}).refine(data => {
  if (data.paymentMethod === "parcelado" && (!data.installments || data.installments.trim() === "")) {
    return false;
  }
  return true;
}, {
  message: "Informe o número de parcelas para pagamento parcelado.",
  path: ["installments"],
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
      installments: "",
      dueDate: undefined,
    },
  });

  const paymentMethod = form.watch("paymentMethod");

  function onSubmit(values: CreateInvoiceFormValues) {
    console.log("Nova Fatura Data:", values);
    // Aqui você adicionaria a lógica para salvar a fatura, por exemplo, em um estado global, localStorage ou API.
    // Por enquanto, apenas uma simulação:
    const newInvoiceData = {
      id: `inv-${Date.now()}`,
      clientId: clientId,
      invoiceNumber: `FAT-${Math.floor(Math.random() * 10000)}`,
      amount: 0, // Placeholder, precisaria calcular baseado nos itens
      currency: "BRL",
      issueDate: new Date().toISOString(),
      dueDate: values.dueDate.toISOString(),
      status: 'Pendente' as 'Pendente' | 'Paga' | 'Atrasada' | 'Cancelada',
      items: [{id: 'item-temp', description: values.productsAndQuantities, quantity: 1, unitPrice: 0, total: 0}], // Simplificado
      notes: `Forma de pgto: ${values.paymentMethod}${values.paymentMethod === 'parcelado' ? ' em ' + values.installments : ''}`
    };
    console.log("Simulando criação de fatura: ", newInvoiceData);

    toast({
      title: "Fatura em Processamento!",
      description: `A fatura para ${clientName} com vencimento em ${format(values.dueDate, "PPP", { locale: ptBR })} está sendo gerada. (Simulação)`,
    });
    form.reset();
    router.push(`/clients/${clientId}`);
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl rounded-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Criar Nova Fatura para {clientName}</CardTitle>
        <CardDescription>Vamos criar sua nova fatura. Preencha as informações abaixo:</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardContent className="space-y-6 pt-6">
            <FormField
              control={form.control}
              name="productsAndQuantities"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <span className="mr-2 text-lg">📦</span> Produtos e Quantidades
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ex: Whey Protein x2, Creatina x1"
                      {...field}
                      rows={4}
                      className="resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="flex items-center">
                     <span className="mr-2 text-lg">💳</span> Forma de Pagamento
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-2 pt-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="avista" id="avista" />
                        </FormControl>
                        <FormLabel htmlFor="avista" className="font-normal cursor-pointer">
                          À vista
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="parcelado" id="parcelado" />
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

            {paymentMethod === "parcelado" && (
              <FormField
                control={form.control}
                name="installments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                       <span className="mr-2 text-lg">🔢</span> Parcelamento (se aplicável)
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

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="flex items-center">
                     <span className="mr-2 text-lg">📅</span> Data de Vencimento
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
