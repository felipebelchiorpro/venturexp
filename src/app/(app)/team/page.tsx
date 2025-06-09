
import { PageHeader } from "@/components/PageHeader";
import { InviteMemberForm } from "@/components/team/InviteMemberForm";
import { MemberList } from "@/components/team/MemberList";

export default function TeamManagementPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Gerenciamento de Equipe"
        description="Convide novos membros para sua equipe e gerencie suas funções e acessos."
      />
      
      <div className="space-y-8">
        <InviteMemberForm />
        <MemberList />
      </div>
    </div>
  );
}
