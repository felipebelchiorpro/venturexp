
"use client";

import { PageHeader } from "@/components/PageHeader";
import { ClientForm } from "@/components/clients/ClientForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NewClientPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cadastrar Novo Cliente"
        description="Preencha os dados abaixo para adicionar um novo cliente ao sistema."
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Clientes
          </Button>
        }
      />
      <ClientForm />
    </div>
  );
}
