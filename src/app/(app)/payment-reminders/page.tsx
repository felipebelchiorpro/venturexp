import { PageHeader } from "@/components/PageHeader";
import { ReminderForm } from "@/components/payment-reminders/ReminderForm";

export default function PaymentRemindersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Reminders"
        description="Automate and track payment reminders to your clients."
      />
      <ReminderForm />
      
      <div className="mt-8 rounded-lg border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-card-foreground mb-4">Sent Reminders Log</h3>
        <p className="text-sm text-muted-foreground">A log of sent payment reminders will be displayed here. (Placeholder)</p>
        {/* Placeholder for reminder log table */}
      </div>
    </div>
  );
}
