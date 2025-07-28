
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Send } from "lucide-react";
import { PAYMENT_TEMPLATE_TYPES } from "@/types";
import { useToast } from "@/hooks/use-toast";

// Mock client data - now initialized empty
const mockClients: { id: string; name: string }[] = [];

const formSchema = z.object({
  templateType: z.string().min(1, { message: "O tipo de modelo é obrigatório." }),
  clientId: z.string().min(1, { message: "O cliente é obrigatório." }),
  subject: z.string().min(5, { message: "O assunto deve ter pelo menos 5 caracteres." }),
  body: z.string().min(20, { message: "O corpo deve ter pelo menos 20 caracteres." }),
});

type ReminderFormValues = z.infer<typeof formSchema>;

export function ReminderForm() {
  const { toast } = useToast();
  const form = useForm<ReminderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      templateType: "",
      clientId: "",
      subject: "",
      body: "",
    },
  });

  const handleTemplateChange = (templateType: string) => {
    if (templateType === "Primeiro Lembrete") {
      form.setValue("subject", "Lembrete Amigável: Fatura Próxima ao Vencimento");
      form.setValue("body", "Olá [Nome do Cliente],\n\nEste é um lembrete amigável de que sua fatura [Número da Fatura] no valor de [Valor] vence em [Data de Vencimento].\n\nPor favor, nos avise se tiver alguma dúvida.\n\nObrigado(a),\n[Seu Nome/Empresa]");
    } else if (templateType === "Segundo Lembrete") {
      form.setValue("subject", "Ação Necessária: Fatura Vencida");
      form.setValue("body", "Olá [Nome do Cliente],\n\nNossos registros mostram que a fatura [Número da Fatura] no valor de [Valor] está vencida. A data de vencimento original era [Data de Vencimento].\n\nPor favor, providencie o pagamento assim que possível.\n\nObrigado(a),\n[Seu Nome/Empresa]");
    } else if (templateType === "Aviso Final") {
       form.setValue("subject", "URGENTE: Aviso Final - Fatura Vencida");
       form.setValue("body", "Olá [Nome do Cliente],\n\nEste é um aviso final referente à fatura vencida [Número da Fatura] no valor de [Valor], originalmente com vencimento em [Data de Vencimento].\n\nA falta de pagamento até [Novo Prazo] pode resultar em [Consequências].\n\nPor favor, entre em contato conosco imediatamente para resolver este assunto.\n\nAtenciosamente,\n[Seu Nome/Empresa]");
    } else {
      form.setValue("subject", "");
      form.setValue("body", "");
    }
  };


  function onSubmit(values: ReminderFormValues) {
    const clientName = mockClients.find(c => c.id === values.clientId)?.name || "Cliente";
    console.log("Enviando lembrete:", values);
    toast({
      title: "Lembrete de Pagamento Enviado!",
      description: `Lembrete enviado para ${clientName} com o assunto: "${values.subject}". (Envio simulado)`,
    });
    form.reset();
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-headline">Enviar Lembrete de Pagamento</CardTitle>
        <CardDescription>Crie e envie lembretes de pagamento automatizados para os clientes.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="templateType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Modelo</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleTemplateChange(value);
                      }} 
                      defaultValue={field.value}
                    >
                      <FormControl><SelectTrigger><SelectValue placeholder="Selecione o modelo" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {PAYMENT_TEMPLATE_TYPES.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder={mockClients.length === 0 ? "Nenhum cliente cadastrado" : "Selecione o cliente"} /></SelectTrigger></FormControl>
                      <SelectContent>
                        {mockClients.length === 0 && <p className="p-2 text-sm text-muted-foreground">Primeiro cadastre clientes.</p>}
                        {mockClients.map(client => (
                          <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assunto</FormLabel>
                  <FormControl><Input placeholder="Lembrete: Fatura nº 123 Vencida" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Corpo do Email</FormLabel>
                  <FormControl><Textarea placeholder="Prezado(a) Cliente..." {...field} rows={10} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <CardFooter className="p-0 pt-6">
              <Button type="submit" className="w-full md:w-auto" disabled={mockClients.length === 0}>
                <Send className="mr-2 h-4 w-4" /> Enviar Lembrete
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
