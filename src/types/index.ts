
export const USER_ROLES = ['Admin', 'Executive', 'Manager', 'Member', 'Analyst'] as const;
export type UserRole = typeof USER_ROLES[number];

export const TEAM_MEMBER_STATUSES = ['Active', 'Pending Invitation', 'Inactive'] as const;
export type TeamMemberStatus = typeof TEAM_MEMBER_STATUSES[number];

export const CLIENT_STATUSES = ['Ativo', 'Inativo', 'Potencial'] as const;
export type ClientStatus = typeof CLIENT_STATUSES[number];

export const PROPOSAL_STATUSES = ['Rascunho', 'Enviada', 'Aceita', 'Recusada', 'Arquivada'] as const;
export type ProposalStatusType = typeof PROPOSAL_STATUSES[number];

export const INVOICE_STATUSES = ['Pendente', 'Paga', 'Atrasada', 'Cancelada'] as const;
export type InvoiceStatusType = typeof INVOICE_STATUSES[number];

export const PAYMENT_METHODS = ['Cartão de Crédito', 'PIX', 'Dinheiro'] as const;
export type PaymentMethodType = typeof PAYMENT_METHODS[number];

export const PAYMENT_CONDITIONS = ['À vista', 'Parcelado'] as const;
export type PaymentConditionType = typeof PAYMENT_CONDITIONS[number];

export const SERVICE_ORDER_STATUSES = ['Aberta', 'Em Andamento', 'Finalizada', 'Aguardando Peças', 'Aguardando Aprovação', 'Cancelada'] as const;
export type ServiceOrderStatusType = typeof SERVICE_ORDER_STATUSES[number];

export const CLIENT_TYPES = ['Pessoa Física', 'Pessoa Jurídica'] as const;
export type ClientType = typeof CLIENT_TYPES[number];

export const ACCESS_PERMISSION_MODULE_IDS = ['clients', 'serviceOrders', 'productsAndStock', 'financial', 'reportsAndDashboard', 'systemSettings', 'collaboratorManagement'] as const;
export type AccessPermissionModuleIdType = typeof ACCESS_PERMISSION_MODULE_IDS[number];

export type AccessPermissions = {
  [K in AccessPermissionModuleIdType]?: boolean;
};

export const ACCESS_RESTRICTION_TYPES = ['viewOwnOnly', 'editOwnOnly', 'viewAllAsManager'] as const;
export type AccessRestrictionType = typeof ACCESS_RESTRICTION_TYPES[number];

export type AccessRestrictions = {
  [K in AccessRestrictionType]?: boolean;
};

export const ACCESS_STATUSES = ['Ativo', 'Inativo', 'Aguardando Ativação'] as const;
export type AccessStatusType = typeof ACCESS_STATUSES[number];


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
  name: string; // Nome Completo ou Razão Social
  email: string;
  company?: string; // Can be derived from name if Pessoa Jurídica
  phone?: string; // Telefone / WhatsApp
  status: ClientStatus;
  responsable?: string;
  segment?: string;
  createdAt: string; // ISO date string
  avatarUrl?: string;
  address?: string; // Endereço Completo
  document?: string; // CPF ou CNPJ
  clientType?: ClientType; // Pessoa Física / Pessoa Jurídica
  frequentServices?: string; // Produtos ou Serviços Contratados com Frequência
  internalNotes?: string; // Observações / Anotações internas
  registrationDate: string; // Data de Cadastro (ISO date string)
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
  clientName?: string; // Denormalized for easier display
  contactPhone?: string;
  serviceAddress?: string;
  serviceType: string;
  productsUsed?: string;
  creationDate: string; // ISO date string
  executionDeadline?: string; // ISO date string
  serviceValue?: number | null; // Allow null if value is not set
  currency?: string;
  additionalNotes?: string;
  status: ServiceOrderStatusType;
  assignedTo?: string;
}

export interface AccessProfile {
  id: string;
  collaboratorName: string;
  loginEmail: string;
  temporaryPassword?: string;
  roleOrFunction: string;
  permissions: AccessPermissions;
  activateIndividualDashboard: boolean;
  restrictions: AccessRestrictions;
  activationDate: string; // ISO date string
  accessStatus: AccessStatusType;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}
