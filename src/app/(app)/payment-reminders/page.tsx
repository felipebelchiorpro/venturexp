
import { PageHeader } from "@/components/PageHeader";
import { ReminderForm } from "@/components/payment-reminders/ReminderForm";

export const dynamic = 'force-dynamic';

export default function PaymentRemindersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Lembretes de Pagamento"
        description="Automatize e monitore os lembretes de pagamento para seus clientes."
      />
      <ReminderForm />
      
      <div className="mt-8 rounded-lg border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-card-foreground mb-4">Registro de Lembretes Enviados</h3>
        <p className="text-sm text-muted-foreground">Um registro dos lembretes de pagamento enviados será exibido aqui. (Placeholder)</p>
        {/* Placeholder for reminder log table */}
      </div>
    </div>
  );
}
