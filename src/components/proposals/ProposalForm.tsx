"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Sparkles, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { PROPOSAL_STATUSES } from "@/lib/constants";
import { generateAIProposalAction, type CreateProposalFormData } from "@/actions/proposalActions";
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";

const formSchema = z.object({
  clientName: z.string().min(2, { message: "Client name must be at least 2 characters." }),
  clientDetails: z.string().min(10, { message: "Client details must be at least 10 characters." }),
  serviceDescription: z.string().min(10, { message: "Service description must be at least 10 characters." }),
  amount: z.coerce.number().positive({ message: "Amount must be a positive number." }),
  currency: z.string().default("USD"),
  deadline: z.date({ required_error: "Deadline is required." }),
  status: z.enum(PROPOSAL_STATUSES as [string, ...string[]], { required_error: "Status is required." }),
  aiGeneratedDraft: z.string().optional(),
});

type ProposalFormValues = z.infer<typeof formSchema>;

export function ProposalForm() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  
  const form = useForm<ProposalFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: "",
      clientDetails: "",
      serviceDescription: "",
      amount: 0,
      currency: "USD",
      status: "Draft",
      aiGeneratedDraft: "",
    },
  });

  const handleGenerateDraft = async () => {
    const values = form.getValues();
    const aiFormData: CreateProposalFormData = {
      clientName: values.clientName,
      clientDetails: values.clientDetails,
      serviceDescription: values.serviceDescription,
      amount: `${values.currency} ${values.amount}`,
      deadline: values.deadline ? format(values.deadline, "PPP") : "",
    };

    // Basic client-side validation for AI fields
    if (!aiFormData.clientName || !aiFormData.clientDetails || !aiFormData.serviceDescription || !values.amount || !values.deadline) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in Client Name, Details, Services, Amount, and Deadline before generating draft.",
      });
      return;
    }

    setIsGenerating(true);
    const result = await generateAIProposalAction(aiFormData);
    setIsGenerating(false);

    if (result.success && result.data?.proposalDraft) {
      form.setValue("aiGeneratedDraft", result.data.proposalDraft);
      toast({
        title: "AI Draft Generated!",
        description: "The AI has generated an initial proposal draft for you.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "AI Draft Generation Failed",
        description: result.error || "Could not generate draft. Please try again.",
      });
    }
  };

  function onSubmit(values: ProposalFormValues) {
    // Mock submission
    console.log("Proposal submitted:", values);
    toast({
      title: "Proposal Saved!",
      description: `Proposal for ${values.clientName} has been saved as a draft.`,
    });
    // form.reset(); // Optionally reset form
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-headline">Create New Proposal</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Name</FormLabel>
                    <FormControl><Input placeholder="Acme Corporation" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {PROPOSAL_STATUSES.map(status => (
                          <SelectItem key={status} value={status}>{status}</SelectItem>
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
              name="clientDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Details</FormLabel>
                  <FormControl><Textarea placeholder="Client industry, size, specific needs..." {...field} rows={3} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="serviceDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Description</FormLabel>
                  <FormControl><Textarea placeholder="Detailed description of services offered..." {...field} rows={5} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl><Input type="number" placeholder="5000" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select currency" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="CAD">CAD</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="mb-1.5">Deadline</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <Button type="button" variant="outline" onClick={handleGenerateDraft} disabled={isGenerating} className="w-full md:w-auto mr-2">
                <Sparkles className="mr-2 h-4 w-4" /> {isGenerating ? "Generating..." : "AI Draft Proposal"}
              </Button>
              <FormDescription>
                Use AI to generate an initial draft based on the details provided above. You can edit it below.
              </FormDescription>
            </div>

            <FormField
              control={form.control}
              name="aiGeneratedDraft"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proposal Draft</FormLabel>
                  <FormControl><Textarea placeholder="Your proposal content will appear here. You can edit it directly." {...field} rows={15} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <CardFooter className="p-0 pt-6">
              <Button type="submit" className="w-full md:w-auto">
                <Save className="mr-2 h-4 w-4" /> Save Proposal
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
