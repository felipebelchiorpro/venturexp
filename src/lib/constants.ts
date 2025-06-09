
import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, Users, FileText, GanttChartSquare, BellRing, Briefcase, UserPlus, Building, Contact } from 'lucide-react'; // Adicionado Contact
import type { ServiceOrderStatusType, ClientType } from '@/types';


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
  { label: 'Clientes', href: '/clients', icon: Contact }, // Novo item de menu Clientes
  { label: 'Funil de Vendas', href: '/sales-funnel', icon: GanttChartSquare },
  { label: 'Propostas', href: '/proposals', icon: FileText },
  { label: 'Leads', href: '/leads', icon: Users },
  { label: 'Gerenciar Equipe', href: '/team', icon: UserPlus },
  { label: 'Lembretes de Pag.', href: '/payment-reminders', icon: BellRing },
];

export const APP_NAME = "AgencyFlow";
export const APP_ICON = Briefcase;

export const MOCK_USER = {
  name: "João Silva",
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

export const PROPOSAL_STATUSES = ['Rascunho', 'Enviada', 'Aceita', 'Recusada', 'Arquivada'] as [string, ...string[]]; // Garantindo o tipo correto
export const PAYMENT_TEMPLATE_TYPES = ['Primeiro Lembrete', 'Segundo Lembrete', 'Aviso Final'];

export const USER_ROLES = ['Admin', 'Executive', 'Manager', 'Member', 'Analyst'] as const;
export type UserRole = typeof USER_ROLES[number];

export const TEAM_MEMBER_STATUSES = ['Ativo', 'Convite Pendente', 'Inativo'] as const;
export type TeamMemberStatus = typeof TEAM_MEMBER_STATUSES[number];

export const CLIENT_STATUSES = ['Ativo', 'Inativo', 'Potencial'] as const;
export type ClientStatus = typeof CLIENT_STATUSES[number];

export const CLIENT_TYPES_PT: ClientType[] = ['Pessoa Física', 'Pessoa Jurídica'];


export const SERVICE_ORDER_STATUSES_PT: ServiceOrderStatusType[] = ['Aberta', 'Em Andamento', 'Finalizada', 'Aguardando Peças', 'Aguardando Aprovação', 'Cancelada'];


export const MOCK_CLIENTS = [
  { id: 'client-001', name: 'Soluções Inovadoras Ltda', email: 'contato@solucoesinovadoras.com', company: 'Soluções Inovadoras Ltda', phone: '(11) 98765-4321', status: 'Ativo' as ClientStatus, createdAt: new Date(2023, 0, 15).toISOString(), responsable: 'Carlos Pereira', segment: 'Tecnologia', avatarUrl: 'https://placehold.co/100x100.png', address: 'Rua das Palmeiras, 123, Vila Mariana, São Paulo, SP, 04003-010', document: '12.345.678/0001-99', clientType: 'Pessoa Jurídica' as ClientType, frequentServices: 'Desenvolvimento Web, Consultoria SEO', internalNotes: 'Cliente VIP, prefere contato por email após as 18h.', registrationDate: new Date(2023, 0, 1).toISOString() },
  { id: 'client-002', name: 'Maria Antônia da Silva', email: 'maria.antonia@emailpessoal.com', company: undefined, phone: '(21) 91234-5678', status: 'Ativo' as ClientStatus, createdAt: new Date(2022, 5, 20).toISOString(), responsable: 'Ana Beatriz Costa', segment: 'Varejo', avatarUrl: 'https://placehold.co/100x100.png', address: 'Av. Copacabana, 789, Apto 101, Rio de Janeiro, RJ, 22020-001', document: '123.456.789-00', clientType: 'Pessoa Física' as ClientType, frequentServices: 'Compra de suplementos (Whey, Creatina)', internalNotes: 'Sempre pede para verificar promoções antes de fechar pedido.', registrationDate: new Date(2022, 5, 1).toISOString() },
  { id: 'client-003', name: 'Consultoria Delta', email: 'parceria@consultoriadelta.com.br', company: 'Consultoria Delta', phone: '(31) 99999-8888', status: 'Inativo' as ClientStatus, createdAt: new Date(2023, 8, 10).toISOString(), responsable: 'Fernando Martins', segment: 'Serviços', avatarUrl: 'https://placehold.co/100x100.png', address: 'Rua dos Inconfidentes, 500, Savassi, Belo Horizonte, MG, 30140-120', document: '98.765.432/0001-11', clientType: 'Pessoa Jurídica' as ClientType, frequentServices: 'Consultoria Financeira Mensal', internalNotes: 'Contrato suspenso temporariamente.', registrationDate: new Date(2023, 7, 15).toISOString() },
  { id: 'client-004', name: 'Agro Forte Brasil', email: 'financeiro@agroforte.com', company: 'Agro Forte Brasil', phone: '(62) 98877-6655', status: 'Potencial' as ClientStatus, createdAt: new Date(2024, 2, 1).toISOString(), responsable: 'Juliana Alves', segment: 'Agronegócio', avatarUrl: 'https://placehold.co/100x100.png', address: 'Fazenda Boa Esperança, Lote 7, Zona Rural, Rio Verde, GO, 75900-000', document: '01.234.567/0001-00', clientType: 'Pessoa Jurídica' as ClientType, frequentServices: 'Análise de solo, Compra de insumos', internalNotes: 'Interessado em financiamento para nova safra.', registrationDate: new Date(2024, 1, 20).toISOString() },
];
