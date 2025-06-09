
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Sparkles, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from 'date-fns/locale';
import { PROPOSAL_STATUSES } from "@/lib/constants";
import { generateAIProposalAction, type CreateProposalFormData } from "@/actions/proposalActions";
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";

const formSchema = z.object({
  clientName: z.string().min(2, { message: "O nome do cliente deve ter pelo menos 2 caracteres." }),
  clientDetails: z.string().min(10, { message: "Os detalhes do cliente devem ter pelo menos 10 caracteres." }),
  serviceDescription: z.string().min(10, { message: "A descrição do serviço deve ter pelo menos 10 caracteres." }),
  amount: z.coerce.number().positive({ message: "O valor deve ser um número positivo." }),
  currency: z.string().default("BRL"),
  deadline: z.date({ required_error: "O prazo é obrigatório." }),
  status: z.enum(PROPOSAL_STATUSES as [string, ...string[]], { required_error: "O status é obrigatório." }),
  aiGeneratedDraft: z.string().optional(),
});

type ProposalFormValues = z.infer<typeof formSchema>;

export function ProposalForm() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  
  const form = useForm<ProposalFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: "",
      clientDetails: "",
      serviceDescription: "",
      amount: 0,
      currency: "BRL",
      status: "Rascunho",
      aiGeneratedDraft: "",
    },
  });

  const handleGenerateDraft = async () => {
    const values = form.getValues();
    const aiFormData: CreateProposalFormData = {
      clientName: values.clientName,
      clientDetails: values.clientDetails,
      serviceDescription: values.serviceDescription,
      amount: `${values.currency} ${values.amount}`,
      deadline: values.deadline ? format(values.deadline, "PPP", { locale: ptBR }) : "",
    };

    if (!aiFormData.clientName || !aiFormData.clientDetails || !aiFormData.serviceDescription || !values.amount || !values.deadline) {
      toast({
        variant: "destructive",
        title: "Informações Faltando",
        description: "Por favor, preencha Nome do Cliente, Detalhes, Serviços, Valor e Prazo antes de gerar o rascunho.",
      });
      return;
    }

    setIsGenerating(true);
    const result = await generateAIProposalAction(aiFormData);
    setIsGenerating(false);

    if (result.success && result.data?.proposalDraft) {
      form.setValue("aiGeneratedDraft", result.data.proposalDraft);
      toast({
        title: "Rascunho Gerado por IA!",
        description: "A IA gerou um rascunho inicial da proposta para você.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Falha ao Gerar Rascunho por IA",
        description: result.error || "Não foi possível gerar o rascunho. Por favor, tente novamente.",
      });
    }
  };

  function onSubmit(values: ProposalFormValues) {
    console.log("Proposta enviada:", values);
    toast({
      title: "Proposta Salva!",
      description: `A proposta para ${values.clientName} foi salva como rascunho.`,
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-headline">Criar Nova Proposta</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Cliente</FormLabel>
                    <FormControl><Input placeholder="Acme Corporation" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Selecione o status" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {PROPOSAL_STATUSES.map(status => (
                          <SelectItem key={status} value={status}>{status}</SelectItem>
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
              name="clientDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detalhes do Cliente</FormLabel>
                  <FormControl><Textarea placeholder="Indústria do cliente, tamanho, necessidades específicas..." {...field} rows={3} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="serviceDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição do Serviço</FormLabel>
                  <FormControl><Textarea placeholder="Descrição detalhada dos serviços oferecidos..." {...field} rows={5} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor</FormLabel>
                    <FormControl><Input type="number" placeholder="5000" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Moeda</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Selecione a moeda" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="BRL">BRL</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="CAD">CAD</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="mb-1.5">Prazo</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <Button type="button" variant="outline" onClick={handleGenerateDraft} disabled={isGenerating} className="w-full md:w-auto mr-2">
                <Sparkles className="mr-2 h-4 w-4" /> {isGenerating ? "Gerando..." : "Rascunho com IA"}
              </Button>
              <FormDescription>
                Use IA para gerar um rascunho inicial com base nos detalhes fornecidos acima. Você pode editá-lo abaixo.
              </FormDescription>
            </div>

            <FormField
              control={form.control}
              name="aiGeneratedDraft"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rascunho da Proposta</FormLabel>
                  <FormControl><Textarea placeholder="O conteúdo da sua proposta aparecerá aqui. Você pode editá-lo diretamente." {...field} rows={15} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <CardFooter className="p-0 pt-6">
              <Button type="submit" className="w-full md:w-auto">
                <Save className="mr-2 h-4 w-4" /> Salvar Proposta
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
