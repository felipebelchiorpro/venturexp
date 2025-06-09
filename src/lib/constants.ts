
import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, Users, FileText, GanttChartSquare, BellRing, Briefcase, UserPlus, Building } from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  disabled?: boolean;
  executiveOnly?: boolean; // Added for conditional rendering
}

export const navItems: NavItem[] = [
  { label: 'Painel Principal', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Painel Executivo', href: '/executive-dashboard', icon: Building, executiveOnly: true },
  { label: 'Funil de Vendas', href: '/sales-funnel', icon: GanttChartSquare },
  { label: 'Propostas', href: '/proposals', icon: FileText },
  { label: 'Leads', href: '/leads', icon: Users },
  { label: 'Gerenciar Equipe', href: '/team', icon: UserPlus },
  { label: 'Lembretes de Pag.', href: '/payment-reminders', icon: BellRing },
  // { label: 'Configurações', href: '/settings', icon: Settings },
];

export const APP_NAME = "AgencyFlow";
export const APP_ICON = Briefcase;

export const MOCK_USER = {
  name: "João Silva", // Translated name
  email: "joao.silva@agencyflow.com",
  avatarUrl: "https://placehold.co/100x100.png",
  role: "Executive" as UserRole, 
};

export const KPI_DATA = [
  { title: "Tarefas Ativas", value: "12", change: "+5%", trend: "up" as const, iconName: "ClipboardList" as const },
  { title: "Novos Leads (Mês)", value: "34", change: "+12%", trend: "up" as const, iconName: "Users" as const },
  { title: "Propostas Enviadas", value: "8", change: "-2%", trend: "down" as const, iconName: "FileText" as const },
  { title: "Taxa de Conversão", value: "25%", change: "+3%", trend: "up" as const, iconName: "TrendingUp" as const },
  { title: "Prazos Próximos", value: "3", change: "", trend: "neutral" as const, iconName: "CalendarClock" as const },
];

export const PIPELINE_STAGES = ['Novo Lead', 'Contactado', 'Qualificado', 'Proposta Enviada', 'Negociação', 'Ganho', 'Perdido'];

export const PROPOSAL_STATUSES = ['Rascunho', 'Enviada', 'Aceita', 'Recusada', 'Arquivada'];
export const PAYMENT_TEMPLATE_TYPES = ['Primeiro Lembrete', 'Segundo Lembrete', 'Aviso Final'];

// USER_ROLES and TEAM_MEMBER_STATUSES are already in PT in their respective components,
// but for consistency and potential future use, they are also translated here if needed.
// For now, team page is already mostly PT.
export const USER_ROLES = ['Admin', 'Executive', 'Manager', 'Member', 'Analyst'] as const; // Kept in English as they are often used as identifiers/keys
export type UserRole = typeof USER_ROLES[number];

export const TEAM_MEMBER_STATUSES = ['Ativo', 'Convite Pendente', 'Inativo'] as const;
export type TeamMemberStatus = typeof TEAM_MEMBER_STATUSES[number];
