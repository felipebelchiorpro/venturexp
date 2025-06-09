import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, Users, FileText, GanttChartSquare, BellRing, Settings, Briefcase } from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  disabled?: boolean;
}

export const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Sales Funnel', href: '/sales-funnel', icon: GanttChartSquare },
  { label: 'Proposals', href: '/proposals', icon: FileText },
  { label: 'Leads', href: '/leads', icon: Users },
  { label: 'Payment Reminders', href: '/payment-reminders', icon: BellRing },
  // { label: 'Settings', href: '/settings', icon: Settings },
];

export const APP_NAME = "AgencyFlow";
export const APP_ICON = Briefcase;

export const MOCK_USER = {
  name: "John Doe",
  email: "john.doe@agencyflow.com",
  avatarUrl: "https://placehold.co/100x100.png",
};

export const KPI_DATA = [
  { title: "Active Tasks", value: "12", change: "+5%", trend: "up", iconName: "ClipboardList" },
  { title: "New Leads (Month)", value: "34", change: "+12%", trend: "up", iconName: "Users" },
  { title: "Proposals Sent", value: "8", change: "-2%", trend: "down", iconName: "FileText" },
  { title: "Conversion Rate", value: "25%", change: "+3%", trend: "up", iconName: "TrendingUp" },
  { title: "Upcoming Deadlines", value: "3", change: "", trend: "neutral", iconName: "CalendarClock" },
];

export const PIPELINE_STAGES = ['New Lead', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'];

export const PROPOSAL_STATUSES = ['Draft', 'Sent', 'Accepted', 'Declined', 'Archived'];
export const PAYMENT_TEMPLATE_TYPES = ['First Reminder', 'Second Reminder', 'Final Notice'];
