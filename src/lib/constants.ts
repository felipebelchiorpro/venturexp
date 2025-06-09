import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, Users, FileText, GanttChartSquare, BellRing, Settings, Briefcase, UserPlus, Building } from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  disabled?: boolean;
  executiveOnly?: boolean; // Added for conditional rendering
}

export const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Executive Dashboard', href: '/executive-dashboard', icon: Building, executiveOnly: true },
  { label: 'Sales Funnel', href: '/sales-funnel', icon: GanttChartSquare },
  { label: 'Proposals', href: '/proposals', icon: FileText },
  { label: 'Leads', href: '/leads', icon: Users },
  { label: 'Team Management', href: '/team', icon: UserPlus },
  { label: 'Payment Reminders', href: '/payment-reminders', icon: BellRing },
  // { label: 'Settings', href: '/settings', icon: Settings },
];

export const APP_NAME = "AgencyFlow";
export const APP_ICON = Briefcase;

export const MOCK_USER = {
  name: "John Doe",
  email: "john.doe@agencyflow.com",
  avatarUrl: "https://placehold.co/100x100.png",
  role: "Executive" as UserRole, 
};

export const KPI_DATA = [
  { title: "Active Tasks", value: "12", change: "+5%", trend: "up" as const, iconName: "ClipboardList" as const },
  { title: "New Leads (Month)", value: "34", change: "+12%", trend: "up" as const, iconName: "Users" as const },
  { title: "Proposals Sent", value: "8", change: "-2%", trend: "down" as const, iconName: "FileText" as const },
  { title: "Conversion Rate", value: "25%", change: "+3%", trend: "up" as const, iconName: "TrendingUp" as const },
  { title: "Upcoming Deadlines", value: "3", change: "", trend: "neutral" as const, iconName: "CalendarClock" as const },
];

export const PIPELINE_STAGES = ['New Lead', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'];

export const PROPOSAL_STATUSES = ['Draft', 'Sent', 'Accepted', 'Declined', 'Archived'];
export const PAYMENT_TEMPLATE_TYPES = ['First Reminder', 'Second Reminder', 'Final Notice'];

export const USER_ROLES = ['Admin', 'Executive', 'Manager', 'Member', 'Analyst'] as const;
export type UserRole = typeof USER_ROLES[number];

export const TEAM_MEMBER_STATUSES = ['Active', 'Pending Invitation', 'Inactive'] as const;
export type TeamMemberStatus = typeof TEAM_MEMBER_STATUSES[number];
