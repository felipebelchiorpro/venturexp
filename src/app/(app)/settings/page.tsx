
"use client"; // Adicionado para usar hooks

import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { MOCK_USER } from "@/lib/constants";

export default function SettingsPage() {
  const { toast } = useToast();

  const handleSaveProfile = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name");
    const email = formData.get("email");
    console.log("Salvando perfil:", { name, email });
    toast({
      title: "Perfil Salvo!",
      description: "Suas informações de perfil foram atualizadas. (Simulação)",
    });
  };

  const handleChangePassword = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const currentPassword = formData.get("currentPassword");
    // No mundo real, aqui haveria validação e envio para API
    console.log("Tentativa de alteração de senha para o usuário:", MOCK_USER.email, { currentPasswordProvided: !!currentPassword });
    toast({
      title: "Senha Alterada!",
      description: "Sua senha foi alterada com sucesso. (Simulação - não verificamos a senha atual)",
    });
    event.currentTarget.reset();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações"
        description="Gerencie sua conta e as configurações do aplicativo."
      />
      
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Perfil</CardTitle>
            <CardDescription>Atualize seus dados pessoais.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSaveProfile}>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="name">Nome Completo</Label>
                <Input id="name" name="name" defaultValue={MOCK_USER.name} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Endereço de Email</Label>
                <Input id="email" name="email" type="email" defaultValue={MOCK_USER.email} />
              </div>
              <Button type="submit">Salvar Perfil</Button>
            </CardContent>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Senha</CardTitle>
            <CardDescription>Altere a senha da sua conta.</CardDescription>
          </CardHeader>
          <form onSubmit={handleChangePassword}>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="currentPassword">Senha Atual</Label>
                <Input id="currentPassword" name="currentPassword" type="password" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="newPassword">Nova Senha</Label>
                <Input id="newPassword" name="newPassword" type="password" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <Input id="confirmPassword" name="confirmPassword" type="password" />
              </div>
              <Button type="submit">Alterar Senha</Button>
            </CardContent>
          </form>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configurações do Aplicativo</CardTitle>
          <CardDescription>Configure as preferências do aplicativo.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Configurações de tema, preferências de notificação, integrações, etc. estarão aqui. (Placeholder)</p>
           <Button variant="outline" className="mt-4" onClick={() => toast({title: "Ação Placeholder", description: "Mais configurações do app virão aqui."})}>
            Ver Mais Opções (Placeholder)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
