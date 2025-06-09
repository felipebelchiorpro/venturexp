
"use client";

import { PageHeader } from "@/components/PageHeader";
import { AccessProfileForm } from "@/components/access-profiles/AccessProfileForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CreateAccessProfilePage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Criar Novo Perfil de Acesso"
        description="Defina as permissões e acesso do colaborador no sistema."
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        }
      />
      <AccessProfileForm />
    </div>
  );
}
