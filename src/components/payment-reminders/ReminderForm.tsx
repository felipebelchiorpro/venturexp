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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Send } from "lucide-react";
import { PAYMENT_TEMPLATE_TYPES } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";

// Mock client data
const mockClients = [
  { id: 'client-1', name: 'Alpha Corp' },
  { id: 'client-2', name: 'Beta LLC' },
  { id: 'client-3', name: 'Gamma Inc' },
];

const formSchema = z.object({
  templateType: z.string().min(1, { message: "Template type is required." }),
  clientId: z.string().min(1, { message: "Client is required." }),
  subject: z.string().min(5, { message: "Subject must be at least 5 characters." }),
  body: z.string().min(20, { message: "Body must be at least 20 characters." }),
});

type ReminderFormValues = z.infer<typeof formSchema>;

export function ReminderForm() {
  const { toast } = useToast();
  const form = useForm<ReminderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      templateType: "",
      clientId: "",
      subject: "",
      body: "",
    },
  });

  const handleTemplateChange = (templateType: string) => {
    // Mock: Populate subject and body based on template type
    if (templateType === "First Reminder") {
      form.setValue("subject", "Friendly Reminder: Invoice Due Soon");
      form.setValue("body", "Hi [Client Name],\n\nThis is a friendly reminder that your invoice [Invoice Number] for [Amount] is due on [Due Date].\n\nPlease let us know if you have any questions.\n\nThanks,\n[Your Name/Company]");
    } else if (templateType === "Second Reminder") {
      form.setValue("subject", "Action Required: Invoice Overdue");
      form.setValue("body", "Hi [Client Name],\n\nOur records show that invoice [Invoice Number] for [Amount] is now overdue. The original due date was [Due Date].\n\nPlease arrange for payment at your earliest convenience.\n\nThanks,\n[Your Name/Company]");
    } else if (templateType === "Final Notice") {
       form.setValue("subject", "URGENT: Final Notice - Invoice Overdue");
       form.setValue("body", "Hi [Client Name],\n\nThis is a final notice regarding the overdue invoice [Invoice Number] for [Amount], originally due on [Due Date].\n\nFailure to make payment by [New Deadline] may result in [Consequences].\n\nPlease contact us immediately to resolve this matter.\n\nRegards,\n[Your Name/Company]");
    } else {
      form.setValue("subject", "");
      form.setValue("body", "");
    }
  };


  function onSubmit(values: ReminderFormValues) {
    // Mock sending reminder
    const clientName = mockClients.find(c => c.id === values.clientId)?.name || "Client";
    console.log("Sending reminder:", values);
    toast({
      title: "Payment Reminder Sent!",
      description: `Reminder sent to ${clientName} with subject: "${values.subject}". (Mock send)`,
    });
    form.reset();
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-headline">Send Payment Reminder</CardTitle>
        <CardDescription>Compose and send automated payment reminders to clients.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="templateType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Type</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleTemplateChange(value);
                      }} 
                      defaultValue={field.value}
                    >
                      <FormControl><SelectTrigger><SelectValue placeholder="Select template" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {PAYMENT_TEMPLATE_TYPES.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {mockClients.map(client => (
                          <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl><Input placeholder="Reminder: Invoice #123 Due" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Body</FormLabel>
                  <FormControl><Textarea placeholder="Dear Client..." {...field} rows={10} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <CardFooter className="p-0 pt-6">
              <Button type="submit" className="w-full md:w-auto">
                <Send className="mr-2 h-4 w-4" /> Send Reminder
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
