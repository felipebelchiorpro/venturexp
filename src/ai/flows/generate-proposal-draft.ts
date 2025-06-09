'use server';

/**
 * @fileOverview Generates an initial draft of a proposal based on client data and service descriptions.
 *
 * - generateProposalDraft - A function that generates the proposal draft.
 * - GenerateProposalDraftInput - The input type for the generateProposalDraft function.
 * - GenerateProposalDraftOutput - The return type for the generateProposalDraft function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProposalDraftInputSchema = z.object({
  clientName: z.string().describe('The name of the client.'),
  clientDetails: z.string().describe('Details about the client, such as their industry, size, and needs.'),
  serviceDescription: z.string().describe('A description of the services being proposed.'),
  amount: z.string().describe('The amount of money being proposed, including currency.'),
  deadline: z.string().describe('The deadline for the proposal.'),
});
export type GenerateProposalDraftInput = z.infer<typeof GenerateProposalDraftInputSchema>;

const GenerateProposalDraftOutputSchema = z.object({
  proposalDraft: z.string().describe('The generated proposal draft.'),
});
export type GenerateProposalDraftOutput = z.infer<typeof GenerateProposalDraftOutputSchema>;

export async function generateProposalDraft(input: GenerateProposalDraftInput): Promise<GenerateProposalDraftOutput> {
  return generateProposalDraftFlow(input);
}

const generateProposalDraftPrompt = ai.definePrompt({
  name: 'generateProposalDraftPrompt',
  input: {schema: GenerateProposalDraftInputSchema},
  output: {schema: GenerateProposalDraftOutputSchema},
  prompt: `You are an expert proposal writer.

  Based on the following client data and service descriptions, generate an initial draft of a proposal.

  Client Name: {{{clientName}}}
  Client Details: {{{clientDetails}}}
  Service Description: {{{serviceDescription}}}
  Amount: {{{amount}}}
  Deadline: {{{deadline}}}

  Proposal Draft:`,
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
