
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
import type { AccessProfile } from "@/types";
import { useEffect, useState } from "react";

const formSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um endereço de e-mail válido." }),
  accessProfileId: z.string().min(1, { message: "Por favor, selecione um perfil de acesso." }),
});

type InviteMemberFormValues = z.infer<typeof formSchema>;

export function InviteMemberForm() {
  const { toast } = useToast();
  const [accessProfiles, setAccessProfiles] = useState<AccessProfile[]>([]);
  
  useEffect(() => {
    // In a real app, this would be fetched from an API.
    // For a clean state, we initialize with an empty array.
    setAccessProfiles([]);
  }, []);
  
  const form = useForm<InviteMemberFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      accessProfileId: "",
    },
  });

  function onSubmit(values: InviteMemberFormValues) {
    const selectedProfile = accessProfiles.find(p => p.id === values.accessProfileId);
    const profileName = selectedProfile ? selectedProfile.roleOrFunction : "Perfil Desconhecido";
    
    console.log("Enviando convite:", { email: values.email, accessProfileId: values.accessProfileId, profileName });
    toast({
      title: "Convite Enviado!",
      description: `Um convite foi enviado para ${values.email} com o perfil de acesso: ${profileName}. (Simulação)`,
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
        <CardDescription>Envie um convite para um novo membro se juntar à sua equipe, atribuindo um perfil de acesso.</CardDescription>
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
              name="accessProfileId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Perfil de Acesso</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={accessProfiles.length === 0 ? "Nenhum perfil de acesso criado" : "Selecione um perfil de acesso"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {accessProfiles.length > 0 ? (
                        accessProfiles.map((profile) => (
                          <SelectItem key={profile.id} value={profile.id}>
                            {profile.roleOrFunction} (Perfil)
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-sm text-muted-foreground">Crie um perfil de acesso primeiro.</div>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full md:w-auto" disabled={accessProfiles.length === 0}>
              <Send className="mr-2 h-4 w-4" /> Enviar Convite
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
