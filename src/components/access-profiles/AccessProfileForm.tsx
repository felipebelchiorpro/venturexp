
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Save, User, Mail, KeyRound, Briefcase, ListChecks, BarChart3, Shield, Settings, Users2, UserCheck, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from 'date-fns/locale';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ACCESS_PERMISSION_MODULES_PT, ACCESS_RESTRICTION_LEVELS_PT } from "@/lib/constants";
import { ACCESS_STATUSES } from "@/types";
import type { AccessPermissions, AccessRestrictions, AccessStatusType, AccessProfile } from "@/types";

const permissionSchema = z.object(
  Object.fromEntries(ACCESS_PERMISSION_MODULES_PT.map(module => [module.id, z.boolean().optional()]))
) as z.ZodType<AccessPermissions>;

const restrictionSchema = z.object(
  Object.fromEntries(ACCESS_RESTRICTION_LEVELS_PT.map(level => [level.id, z.boolean().optional()]))
) as z.ZodType<AccessRestrictions>;


const formSchema = z.object({
  collaboratorName: z.string().min(2, { message: "🧑‍💼 O nome do colaborador é obrigatório." }),
  loginEmail: z.string().email({ message: "📧 E-mail de login inválido." }),
  temporaryPassword: z.string().optional(),
  roleOrFunction: z.string().min(2, { message: "🧭 O cargo ou função é obrigatório." }),
  permissions: permissionSchema,
  activateIndividualDashboard: z.boolean().default(false),
  restrictions: restrictionSchema,
  activationDate: z.date({ required_error: "📆 A data de ativação é obrigatória." }),
  accessStatus: z.enum(ACCESS_STATUSES, { required_error: "✅ O status do acesso é obrigatório." }),
});

type AccessProfileFormValues = z.infer<typeof formSchema>;

export function AccessProfileForm() {
  const { toast } = useToast();

  const form = useForm<AccessProfileFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      collaboratorName: "",
      loginEmail: "",
      temporaryPassword: "",
      roleOrFunction: "",
      permissions: {},
      activateIndividualDashboard: false,
      restrictions: {},
      activationDate: new Date(),
      accessStatus: "Aguardando Ativação",
    },
  });

  function onSubmit(values: AccessProfileFormValues) {
    const newProfileData: AccessProfile = {
        id: `ap-${Date.now()}`,
        ...values,
        activationDate: values.activationDate.toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    console.log("Dados do Perfil de Acesso (Simulação):", newProfileData);
    toast({
      title: "Perfil de Acesso Criado!",
      description: `O perfil para ${values.collaboratorName} foi criado com sucesso. (Simulação)`,
    });
    form.reset(); 
  }

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-xl rounded-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Criar Perfil de Acesso do Colaborador</CardTitle>
        <CardDescription>Preencha os dados abaixo para definir o que o colaborador pode visualizar ou gerenciar.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <CardContent className="space-y-6 pt-6">
            <FormField
              control={form.control}
              name="collaboratorName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center"><User className="mr-2 h-4 w-4 text-primary" /> 🧑‍💼 Nome do Colaborador</FormLabel>
                  <FormControl><Input placeholder="Ex: Ana Paula, João Silva" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="loginEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Mail className="mr-2 h-4 w-4 text-primary" /> 📧 E-mail de Login</FormLabel>
                    <FormControl><Input type="email" placeholder="E-mail usado para login" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="temporaryPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><KeyRound className="mr-2 h-4 w-4 text-primary" /> 🔑 Senha Temporária ou Link</FormLabel>
                    <FormControl><Input placeholder="(Opcional)" {...field} /></FormControl>
                    <FormDescription>Pode ser gerado automaticamente.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="roleOrFunction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center"><Briefcase className="mr-2 h-4 w-4 text-primary" /> 🧭 Cargo ou Função no Sistema</FormLabel>
                  <FormControl><Input placeholder="Ex: Vendedor, Gerente, Técnico" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel className="flex items-center"><ListChecks className="mr-2 h-4 w-4 text-primary" /> 📋 Permissões de Acesso</FormLabel>
              <FormDescription>Marque as áreas que esse colaborador poderá acessar:</FormDescription>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                {ACCESS_PERMISSION_MODULES_PT.map((module) => (
                  <FormField
                    key={module.id}
                    control={form.control}
                    name={`permissions.${module.id}` as const}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3 shadow-sm">
                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        <FormLabel className="font-normal cursor-pointer">{module.icon} {module.label}</FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </FormItem>

            <FormField
              control={form.control}
              name="activateIndividualDashboard"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3 shadow-sm">
                  <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  <div>
                    <FormLabel className="font-normal cursor-pointer flex items-center"><BarChart3 className="mr-2 h-4 w-4 text-primary" /> 📊 Ativar dashboard individualizado</FormLabel>
                    <FormDescription className="text-xs">Exibe apenas dados e resultados gerados ou atribuídos a ele.</FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            <FormItem>
              <FormLabel className="flex items-center"><Shield className="mr-2 h-4 w-4 text-primary" /> 🔐 Restrições de Visualização</FormLabel>
              <div className="space-y-2 pt-2">
                {ACCESS_RESTRICTION_LEVELS_PT.map((level) => (
                  <FormField
                    key={level.id}
                    control={form.control}
                    name={`restrictions.${level.id}` as const}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        <FormLabel className="font-normal cursor-pointer">{level.label}</FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </FormItem>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="activationDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="flex items-center"><CalendarIcon className="mr-2 h-4 w-4 text-primary" /> 📆 Data de Ativação</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("w-full justify-start text-left font-normal mt-1",!field.value && "text-muted-foreground")}
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
              <FormField
                control={form.control}
                name="accessStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      {field.value === 'Ativo' ? <UserCheck className="mr-2 h-4 w-4 text-primary" /> : 
                       field.value === 'Inativo' ? <AlertTriangle className="mr-2 h-4 w-4 text-primary" /> : 
                       <Clock className="mr-2 h-4 w-4 text-primary" />
                      }
                       ✅ Status do Acesso
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Selecione o status" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {ACCESS_STATUSES.map(status => (
                          <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="border p-4 rounded-md bg-muted/50">
                <p className="text-sm font-medium flex items-center"><Settings className="mr-2 h-4 w-4 text-primary"/>💡 Exemplo de Uso:</p>
                <p className="text-xs text-muted-foreground mt-1">
                    João (vendedor) pode ter acesso apenas a "Clientes", "Ordens de Serviço" e seu "Dashboard Individualizado", com restrição para "ver apenas seus próprios atendimentos". 
                    Ana (gerente) pode ter acesso a todos os módulos e "ver dados de outros colaboradores".
                </p>
            </div>


          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button type="submit" className="w-full md:w-auto">
              <Save className="mr-2 h-4 w-4" /> Criar Perfil de Acesso
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
