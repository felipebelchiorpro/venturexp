import type { UserRole, TeamMemberStatus } from "@/lib/constants";

export interface Proposal {
  id: string;
  clientName: string;
  serviceDescription: string;
  amount: number;
  currency: string;
  deadline: string; // ISO date string
  status: 'Draft' | 'Sent' | 'Accepted' | 'Declined' | 'Archived';
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
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
