
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
import { CalendarIcon, Save, User, Mail, Phone, MapPin, FileType, Tag, Package, Edit3, CheckSquare, AlertCircle, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from 'date-fns/locale';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import type { Client } from "@/types";
import { CLIENT_STATUSES, CLIENT_TYPES } from "@/types";
import { supabase } from "@/lib/supabaseClient";

const formSchema = z.object({
  name: z.string().min(2, { message: "🧾 O nome/razão social deve ter pelo menos 2 caracteres." }),
  email: z.string().email({ message: "📧 Endereço de e-mail inválido." }),
  phone: z.string().optional(),
  address: z.string().optional(),
  document: z.string().optional(),
  client_type: z.enum(CLIENT_TYPES, {
    required_error: "🏷️ Selecione o tipo de cliente.",
  }),
  frequent_services: z.string().optional(),
  internal_notes: z.string().optional(),
  registration_date: z.date({
    required_error: "📆 A data de cadastro é obrigatória.",
  }),
  status: z.enum(CLIENT_STATUSES, {
    required_error: "✅ O status é obrigatório.",
  }),
  company: z.string().optional(),
  responsable: z.string().optional(),
  segment: z.string().optional(),
});

type ClientFormValues = z.infer<typeof formSchema>;

export function ClientForm() {
  const { toast } = useToast();
  const router = useRouter();

  const defaultValues: Partial<ClientFormValues> = {
    name: "",
    email: "",
    phone: "",
    address: "",
    document: "",
    client_type: undefined,
    frequent_services: "",
    internal_notes: "",
    registration_date: new Date(),
    status: "Ativo",
    company: "",
    responsable: "",
    segment: "",
  };


  const form = useForm<ClientFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  async function onSubmit(values: ClientFormValues) {
    
    const clientData = {
      ...values,
      registration_date: values.registration_date.toISOString(),
      company: values.client_type === 'Pessoa Jurídica' ? values.name : values.company,
    };
    
    const { data, error } = await supabase
      .from('clients')
      .insert([clientData])
      .select();

    if (error) {
      toast({
        title: "Erro ao cadastrar cliente",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Cliente Cadastrado!",
      description: `O cliente "${values.name}" foi cadastrado com sucesso.`,
    });
    
    router.push("/clients");
    router.refresh();
  }

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-xl rounded-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center">
            <User className="mr-2 h-5 w-5 text-primary" />
            Cadastrar Novo Cliente
        </CardTitle>
        <CardDescription>
          Preencha os dados abaixo para cadastrar um novo cliente.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <CardContent className="space-y-6 pt-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center"><User className="mr-2 h-4 w-4 text-primary" /> 🧾 Nome Completo ou Razão Social</FormLabel>
                  <FormControl><Input placeholder="Ex: João da Silva / Loja TechMaster" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Mail className="mr-2 h-4 w-4 text-primary" /> 📧 E-mail</FormLabel>
                    <FormControl><Input type="email" placeholder="Ex: cliente@email.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Phone className="mr-2 h-4 w-4 text-primary" /> 📞 Telefone / WhatsApp</FormLabel>
                    <FormControl><Input placeholder="Ex: (11) 91234-5678" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center"><MapPin className="mr-2 h-4 w-4 text-primary" /> 📍 Endereço Completo</FormLabel>
                  <FormControl><Textarea placeholder="Rua, número, bairro, cidade, estado e CEP" {...field} rows={3} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="document"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><FileType className="mr-2 h-4 w-4 text-primary" /> 🆔 CPF ou CNPJ</FormLabel>
                    <FormControl><Input placeholder="Documento para controle fiscal" {...field} /></FormControl>
                     <FormDescription>Usado para emissão de notas ou controle fiscal.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="client_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Tag className="mr-2 h-4 w-4 text-primary" /> 🏷️ Tipo de Cliente</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex space-x-4 pt-2"
                      >
                        {CLIENT_TYPES.map(type => (
                          <FormItem key={type} className="flex items-center space-x-2 space-y-0">
                            <FormControl><RadioGroupItem value={type} id={`clientType-${type}`} /></FormControl>
                            <FormLabel htmlFor={`clientType-${type}`} className="font-normal cursor-pointer">{type}</FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="frequent_services"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center"><Package className="mr-2 h-4 w-4 text-primary" /> 📦 Produtos ou Serviços Contratados com Frequência</FormLabel>
                  <FormControl><Textarea placeholder="Ex: manutenção de ar-condicionado, compra de suplementos, etc" {...field} rows={3} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="internal_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center"><Edit3 className="mr-2 h-4 w-4 text-primary" /> 🗂️ Observações / Anotações internas</FormLabel>
                  <FormControl><Textarea placeholder="Ex: cliente prefere contato por WhatsApp, tem desconto fidelidade, etc" {...field} rows={3} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="registration_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="flex items-center"><CalendarIcon className="mr-2 h-4 w-4 text-primary" /> 📆 Data de Cadastro</FormLabel>
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
                            {field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus locale={ptBR} />
                      </PopoverContent>
                    </Popover>
                    <FormDescription className="mt-1">Data automática ou preenchida (DD/MM/AAAA).</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                        {field.value === 'Ativo' ? <UserCheck className="mr-2 h-4 w-4 text-primary" /> : 
                         field.value === 'Inativo' ? <AlertCircle className="mr-2 h-4 w-4 text-primary" /> : 
                         <CheckSquare className="mr-2 h-4 w-4 text-primary" />
                        }
                         ✅ Status
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Selecione o status" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {CLIENT_STATUSES.map(status => (
                          <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button type="submit" className="w-full md:w-auto">
              <Save className="mr-2 h-4 w-4" /> Cadastrar Cliente
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
