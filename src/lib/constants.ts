
import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, Users, FileText, GanttChartSquare, BellRing, Briefcase, UserPlus, Building, Contact, ShieldCheck } from 'lucide-react';
import type { ServiceOrderStatusType, ClientType, AccessPermissionModuleIdType, AccessRestrictionType, AccessStatusType, AccessProfile, Client, UserRole } from '@/types';


export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  disabled?: boolean;
  executiveOnly?: boolean;
}

export const navItems: NavItem[] = [
  { label: 'Painel Principal', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Painel Executivo', href: '/executive-dashboard', icon: Building, executiveOnly: true },
  { label: 'Clientes', href: '/clients', icon: Contact },
  { label: 'Funil de Vendas', href: '/sales-funnel', icon: GanttChartSquare },
  { label: 'Propostas', href: '/proposals', icon: FileText },
  { label: 'Leads', href: '/leads', icon: Users },
  { label: 'Gerenciar Equipe', href: '/team', icon: UserPlus },
  { label: 'Perfis de Acesso', href: '/access-profiles/new', icon: ShieldCheck },
  { label: 'Lembretes de Pag.', href: '/payment-reminders', icon: BellRing },
];

export const APP_NAME = "Venture XP";
export const APP_ICON = Briefcase; 
export const APP_LOGO_URL = "https://placehold.co/180x40.png";

export const MOCK_USER = {
  name: "Usuário Padrão",
  email: "usuario@exemplo.com",
  avatarUrl: "https://placehold.co/100x100.png", 
  role: "Executive" as UserRole, 
};

export const KPI_DATA: { title: string; value: string; change: string; trend: "up" | "down" | "neutral"; iconName: string; }[] = [];

export const PIPELINE_STAGES = ['Novo Lead', 'Contactado', 'Qualificado', 'Proposta Enviada', 'Negociação', 'Ganho', 'Perdido'];

export const PROPOSAL_STATUSES = ['Rascunho', 'Enviada', 'Aceita', 'Recusada', 'Arquivada'] as [string, ...string[]];
export const PAYMENT_TEMPLATE_TYPES = ['Primeiro Lembrete', 'Segundo Lembrete', 'Aviso Final'];

export const CLIENT_TYPES_PT: ClientType[] = ['Pessoa Física', 'Pessoa Jurídica'];


export const SERVICE_ORDER_STATUSES_PT: ServiceOrderStatusType[] = ['Aberta', 'Em Andamento', 'Finalizada', 'Aguardando Peças', 'Aguardando Aprovação', 'Cancelada'];


export const MOCK_CLIENTS: Client[] = [];

export const ACCESS_PERMISSION_MODULES_PT: { id: AccessPermissionModuleIdType; label: string; icon: string; }[] = [
    { id: 'clients', label: 'Clientes', icon: '📁' },
    { id: 'serviceOrders', label: 'Ordens de Serviço', icon: '🛠️' },
    { id: 'productsAndStock', label: 'Produtos e Estoque', icon: '📦' },
    { id: 'financial', label: 'Financeiro', icon: '💰' },
    { id: 'reportsAndDashboard', label: 'Relatórios e Dashboard', icon: '📈' },
    { id: 'systemSettings', label: 'Configurações do Sistema', icon: '⚙️' },
    { id: 'collaboratorManagement', label: 'Gestão de Colaboradores', icon: '🧑‍🤝‍🧑' },
];

export const ACCESS_RESTRICTION_LEVELS_PT: { id: AccessRestrictionType; label: string; }[] = [
    { id: 'viewOwnOnly', label: 'Pode ver apenas seus próprios atendimentos/vendas' },
    { id: 'editOwnOnly', label: 'Pode editar apenas seus próprios registros' },
    { id: 'viewAllAsManager', label: 'Pode ver dados de outros colaboradores (nível gestor)' },
];

export const ACCESS_STATUSES_PT: AccessStatusType[] = ['Ativo', 'Inativo', 'Aguardando Ativação'];

export const MOCK_ACCESS_PROFILES: AccessProfile[] = [];
    
