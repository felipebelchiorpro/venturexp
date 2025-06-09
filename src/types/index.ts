
import type { UserRole, TeamMemberStatus, ClientStatus } from "@/lib/constants";

export const PROPOSAL_STATUSES = ['Rascunho', 'Enviada', 'Aceita', 'Recusada', 'Arquivada'] as const;
export type ProposalStatusType = typeof PROPOSAL_STATUSES[number];

export const INVOICE_STATUSES = ['Pendente', 'Paga', 'Atrasada', 'Cancelada'] as const;
export type InvoiceStatusType = typeof INVOICE_STATUSES[number];

export const PAYMENT_METHODS = ['Cartão de Crédito', 'PIX', 'Dinheiro'] as const;
export type PaymentMethodType = typeof PAYMENT_METHODS[number];

export const PAYMENT_CONDITIONS = ['À vista', 'Parcelado'] as const;
export type PaymentConditionType = typeof PAYMENT_CONDITIONS[number];


export interface Proposal {
  id: string;
  clientName: string;
  serviceDescription: string;
  amount: number;
  currency: string;
  deadline: string; // ISO date string
  status: ProposalStatusType;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  aiGeneratedDraft?: string;
}

export interface Lead {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  status: string; // Corresponds to pipeline stage
  source?: string;
  assignedTo?: string; // User ID or name
  lastContacted: string; // ISO date string
  createdAt: string; // ISO date string
  notes?: string;
}

export interface Task {
  id: string;
  title: string;
  dueDate?: string; // ISO date string
  assignedTo?: string; // User ID or name
  relatedLead?: string; // Lead ID
  relatedProposal?: string; // Proposal ID
  isCompleted: boolean;
}

export interface KanbanItem {
  id: string;
  content: string; // Could be Lead name or short description
  leadId?: string; // To link back to full lead details
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: TeamMemberStatus;
  joinedDate: string; // ISO date string
  avatarUrl?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  status: ClientStatus;
  responsable?: string;
  segment?: string;
  createdAt: string; // ISO date string
  avatarUrl?: string;
  // Future fields:
  // address?: string;
  // website?: string;
  // notes?: string;
}

export interface Invoice {
  id: string;
  clientId: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  issueDate: string; // ISO date string
  dueDate: string; // ISO date string
  status: InvoiceStatusType;
  items: InvoiceItem[];
  paymentMethod?: PaymentMethodType | string; // string for flexibility if other methods are added manually
  paymentCondition?: PaymentConditionType;
  installments?: string;
  notes?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface ServiceOrder {
  id: string;
  clientId: string;
  orderNumber: string;
  serviceDescription: string;
  creationDate: string; // ISO date string
  expectedCompletionDate?: string; // ISO date string
  status: 'Aberta' | 'Em Progresso' | 'Concluída' | 'Cancelada';
  assignedTo?: string; // Team member ID or name
  notes?: string;
}

