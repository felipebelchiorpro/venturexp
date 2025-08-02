
import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, Users, FileText, GanttChartSquare, BellRing, Briefcase, UserPlus, Building, Contact, ShieldCheck, ShoppingCart } from 'lucide-react';
import type { NavItem } from '@/types';

export const navItems: NavItem[] = [
  { label: 'Painel Principal', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Painel Executivo', href: '/executive-dashboard', icon: Building, executiveOnly: true },
  { label: 'Clientes', href: '/clients', icon: Contact },
  { label: 'Funil de Vendas', href: '/sales-funnel', icon: GanttChartSquare },
  { label: 'Propostas', href: '/proposals', icon: FileText },
  { label: 'Leads', href: '/leads', icon: Users },
  { label: 'Produtos', href: '/products', icon: ShoppingCart },
  { label: 'Gerenciar Equipe', href: '/team', icon: UserPlus },
  { label: 'Perfis de Acesso', href: '/access-profiles/new', icon: ShieldCheck },
  { label: 'Lembretes de Pag.', href: '/payment-reminders', icon: BellRing },
];

export const APP_NAME = "Venture XP";
export const APP_ICON = Briefcase; 
export const APP_LOGO_URL = "https://placehold.co/180x40.png";
