
"use client"; // Adicionado para usar useRouter e useState/useEffect
import { PageHeader } from "@/components/PageHeader";
import { LeadList } from "@/components/leads/LeadList";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
// import { useRouter } from "next/navigation"; // Se for redirecionar para um formulário

export const dynamic = 'force-dynamic';

export default function LeadsPage() {
  const { toast } = useToast();
  // const router = useRouter(); // Descomente se for usar navegação

  const handleAddLead = () => {
    toast({
      title: "Adicionar Novo Lead",
      description: "Funcionalidade para adicionar um novo lead será implementada (ex: abrir modal ou ir para formulário).",
    });
    // Exemplo: router.push('/leads/new');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Prospecção de Leads"
        description="Monitore, gerencie e segmente seus leads de forma eficaz."
        actions={
          <Button onClick={handleAddLead}>
            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Novo Lead
          </Button>
        }
      />
      <LeadList />
    </div>
  );
}
