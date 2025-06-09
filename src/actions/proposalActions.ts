
'use server';

import { generateProposalDraft, type GenerateProposalDraftInput, type GenerateProposalDraftOutput } from '@/ai/flows/generate-proposal-draft';
import { z } from 'zod';

const CreateProposalSchema = z.object({
  clientName: z.string().min(1, "O nome do cliente é obrigatório."),
  clientDetails: z.string().min(1, "Os detalhes do cliente são obrigatórios."),
  serviceDescription: z.string().min(1, "A descrição do serviço é obrigatória."),
  amount: z.string().min(1, "O valor é obrigatório."), 
  deadline: z.string().min(1, "O prazo é obrigatório."), 
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
      error: "Dados do formulário inválidos.",
      fieldErrors: validationResult.error.flatten().fieldErrors,
    };
  }

  const aiInput: GenerateProposalDraftInput = {
    clientName: validationResult.data.clientName,
    clientDetails: validationResult.data.clientDetails,
    serviceDescription: validationResult.data.serviceDescription,
    amount: validationResult.data.amount,
    deadline: validationResult.data.deadline, 
  };

  try {
    const result = await generateProposalDraft(aiInput);
    if (result && result.proposalDraft) {
      return { success: true, data: result };
    } else {
      return { success: false, error: "A IA falhou ao gerar o rascunho da proposta." };
    }
  } catch (error) {
    console.error("Erro ao gerar proposta com IA:", error);
    return { success: false, error: "Ocorreu um erro inesperado ao gerar a proposta." };
  }
}
