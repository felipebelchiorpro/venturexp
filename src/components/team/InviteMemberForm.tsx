
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { USER_ROLES, type UserRole } from "@/lib/constants";

const formSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um endereço de e-mail válido." }),
  role: z.enum(USER_ROLES, {
    required_error: "Por favor, selecione uma função.",
  }),
});

type InviteMemberFormValues = z.infer<typeof formSchema>;

export function InviteMemberForm() {
  const { toast } = useToast();
  const form = useForm<InviteMemberFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      role: "Member",
    },
  });

  function onSubmit(values: InviteMemberFormValues) {
    // Mock sending invitation
    console.log("Sending invitation:", values);
    toast({
      title: "Convite Enviado!",
      description: `Um convite foi enviado para ${values.email} com a função de ${values.role}. (Simulação)`,
    });
    form.reset();
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <UserPlus className="h-6 w-6 text-primary" />
          <CardTitle className="text-xl font-headline">Convidar Novo Membro</CardTitle>
        </div>
        <CardDescription>Envie um convite para um novo membro se juntar à sua equipe.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email do Membro</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="nome@exemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Função</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma função" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {USER_ROLES.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full md:w-auto">
              <Send className="mr-2 h-4 w-4" /> Enviar Convite
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
