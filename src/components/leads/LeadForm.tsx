
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
import { Save, User, Mail, Phone, Building, CheckSquare, Tags, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect } from "react";
import type { Lead } from "@/types";
import { PIPELINE_STAGES } from "@/types";

const formSchema = z.object({
  name: z.string().min(2, { message: "O nome do lead é obrigatório." }),
  email: z.string().email({ message: "Endereço de e-mail inválido." }).optional().or(z.literal('')),
  phone: z.string().optional(),
  company: z.string().optional(),
  status: z.string().min(1, { message: "O status é obrigatório." }),
  source: z.string().optional(),
  notes: z.string().optional(),
});

type LeadFormValues = z.infer<typeof formSchema>;

interface LeadFormProps {
  lead?: Lead | null;
  onSuccess?: () => void;
  initialStage?: string;
}

export function LeadForm({ lead, onSuccess, initialStage }: LeadFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClient();
  const isEditMode = !!lead;

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      status: initialStage || PIPELINE_STAGES[0],
      source: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (isEditMode && lead) {
      form.reset({
        name: lead.name,
        email: lead.email ?? "",
        phone: lead.phone ?? "",
        company: lead.company ?? "",
        status: lead.status,
        source: lead.source ?? "",
        notes: lead.notes ?? "",
      });
    } else if (initialStage) {
        form.setValue('status', initialStage);
    }
  }, [isEditMode, lead, form, initialStage]);

  async function onSubmit(values: LeadFormValues) {
    const leadData = {
      ...values,
      last_contacted_at: new Date().toISOString(),
    };

    if (isEditMode && lead) {
      const { error } = await supabase
        .from('leads')
        .update(leadData)
        .eq('id', lead.id);

      if (error) {
        toast({ title: "Erro ao atualizar lead", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Lead Atualizado!", description: `O lead "${values.name}" foi atualizado.` });
    } else {
      const { error } = await supabase.from('leads').insert([leadData]);

      if (error) {
        toast({ title: "Erro ao criar lead", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Lead Criado!", description: `O lead "${values.name}" foi adicionado ao funil.` });
    }
    
    if (onSuccess) {
      onSuccess();
    } else {
      router.refresh();
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center"><User className="mr-2 h-4 w-4" /> Nome do Lead</FormLabel>
              <FormControl><Input placeholder="Ex: João Silva" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center"><Building className="mr-2 h-4 w-4" /> Empresa (Opcional)</FormLabel>
              <FormControl><Input placeholder="Ex: Acme Inc." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
                <FormItem>
                <FormLabel className="flex items-center"><Mail className="mr-2 h-4 w-4" /> E-mail (Opcional)</FormLabel>
                <FormControl><Input type="email" placeholder="Ex: joao.silva@email.com" {...field} /></FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
                <FormItem>
                <FormLabel className="flex items-center"><Phone className="mr-2 h-4 w-4" /> Telefone (Opcional)</FormLabel>
                <FormControl><Input placeholder="(XX) 99999-9999" {...field} /></FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><CheckSquare className="mr-2 h-4 w-4" /> Etapa / Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Selecione a etapa do funil" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {PIPELINE_STAGES.map(stage => (
                          <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Tags className="mr-2 h-4 w-4" /> Fonte (Opcional)</FormLabel>
                    <FormControl><Input placeholder="Ex: Indicação, Site, Evento" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
        </div>
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center"><MessageSquare className="mr-2 h-4 w-4" /> Anotações (Opcional)</FormLabel>
              <FormControl><Textarea placeholder="Detalhes importantes sobre o lead, conversas, etc." {...field} rows={4} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          <Save className="mr-2 h-4 w-4" /> 
          {form.formState.isSubmitting ? 'Salvando...' : (isEditMode ? 'Salvar Alterações' : 'Criar Lead')}
        </Button>
      </form>
    </Form>
  );
}
