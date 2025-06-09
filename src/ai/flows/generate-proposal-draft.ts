
'use server';

/**
 * @fileOverview Gera um rascunho inicial de uma proposta com base nos dados do cliente e descrições de serviço.
 *
 * - generateProposalDraft - Uma função que gera o rascunho da proposta.
 * - GenerateProposalDraftInput - O tipo de entrada para a função generateProposalDraft.
 * - GenerateProposalDraftOutput - O tipo de retorno para a função generateProposalDraft.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProposalDraftInputSchema = z.object({
  clientName: z.string().describe('O nome do cliente.'),
  clientDetails: z.string().describe('Detalhes sobre o cliente, como sua indústria, tamanho e necessidades.'),
  serviceDescription: z.string().describe('Uma descrição dos serviços sendo propostos.'),
  amount: z.string().describe('O valor monetário sendo proposto, incluindo a moeda.'),
  deadline: z.string().describe('O prazo para a proposta.'),
});
export type GenerateProposalDraftInput = z.infer<typeof GenerateProposalDraftInputSchema>;

const GenerateProposalDraftOutputSchema = z.object({
  proposalDraft: z.string().describe('O rascunho da proposta gerado.'),
});
export type GenerateProposalDraftOutput = z.infer<typeof GenerateProposalDraftOutputSchema>;

export async function generateProposalDraft(input: GenerateProposalDraftInput): Promise<GenerateProposalDraftOutput> {
  return generateProposalDraftFlow(input);
}

const generateProposalDraftPrompt = ai.definePrompt({
  name: 'generateProposalDraftPrompt',
  input: {schema: GenerateProposalDraftInputSchema},
  output: {schema: GenerateProposalDraftOutputSchema},
  prompt: `Você é um redator de propostas especialista.

  Com base nos seguintes dados do cliente e descrições de serviço, gere um rascunho inicial de uma proposta.
  A proposta deve ser profissional, concisa e persuasiva.
  Adapte o tom e o conteúdo para um cliente corporativo.
  Use marcadores para listar os principais entregáveis ou benefícios, se apropriado.
  Certifique-se de que o valor e o prazo estejam claramente declarados.

  Nome do Cliente: {{{clientName}}}
  Detalhes do Cliente: {{{clientDetails}}}
  Descrição do Serviço: {{{serviceDescription}}}
  Valor: {{{amount}}}
  Prazo: {{{deadline}}}

  Rascunho da Proposta:`,
});

const generateProposalDraftFlow = ai.defineFlow(
  {
    name: 'generateProposalDraftFlow',
    inputSchema: GenerateProposalDraftInputSchema,
    outputSchema: GenerateProposalDraftOutputSchema,
  },
  async input => {
    const {output} = await generateProposalDraftPrompt(input);
    return output!;
  }
);
