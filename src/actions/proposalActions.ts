'use server';

import { generateProposalDraft, type GenerateProposalDraftInput, type GenerateProposalDraftOutput } from '@/ai/flows/generate-proposal-draft';
import { z } from 'zod';

const CreateProposalSchema = z.object({
  clientName: z.string().min(1, "Client name is required."),
  clientDetails: z.string().min(1, "Client details are required."),
  serviceDescription: z.string().min(1, "Service description is required."),
  amount: z.string().min(1, "Amount is required."), // AI flow expects string
  deadline: z.string().min(1, "Deadline is required."), // AI flow expects string
});

export type CreateProposalFormData = z.infer<typeof CreateProposalSchema>;

interface ActionResult {
  success: boolean;
  data?: GenerateProposalDraftOutput;
  error?: string;
  fieldErrors?: { [key: string]: string[] | undefined };
}

export async function generateAIProposalAction(formData: CreateProposalFormData): Promise<ActionResult> {
  const validationResult = CreateProposalSchema.safeParse(formData);

  if (!validationResult.success) {
    return {
      success: false,
      error: "Invalid form data.",
      fieldErrors: validationResult.error.flatten().fieldErrors,
    };
  }

  const aiInput: GenerateProposalDraftInput = {
    clientName: validationResult.data.clientName,
    clientDetails: validationResult.data.clientDetails,
    serviceDescription: validationResult.data.serviceDescription,
    amount: validationResult.data.amount, // Already string
    deadline: validationResult.data.deadline, // Already string
  };

  try {
    const result = await generateProposalDraft(aiInput);
    if (result && result.proposalDraft) {
      return { success: true, data: result };
    } else {
      return { success: false, error: "AI failed to generate proposal draft." };
    }
  } catch (error) {
    console.error("Error generating AI proposal:", error);
    return { success: false, error: "An unexpected error occurred while generating the proposal." };
  }
}
