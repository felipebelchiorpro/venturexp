
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { APP_ICON, APP_LOGO_URL, navItems, MOCK_USER } from "@/lib/constants";
import { LogOut, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast"; 
import Image from "next/image";

export function AppSidebar() {
  const pathname = usePathname();
  const AppLogoIcon = APP_ICON;
  const { toast } = useToast(); 

  const availableNavItems = navItems.filter(item => {
    if (item.executiveOnly) {
      return MOCK_USER.role === 'Executive';
    }
    return true;
  });

  const handleLogout = () => {
    toast({
      title: "Logout Realizado",
      description: "Você foi desconectado. (Simulação)",
    });
    console.log("Logout simulado");
  };


  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left">
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <AppLogoIcon className="h-8 w-8 text-primary" />
          <Image 
            src={APP_LOGO_URL} 
            alt="Venture XP Logo" 
            width={150} 
            height={33} // Approx ratio for 180x40 -> 150x33.33
            data-ai-hint="logo venture xp" 
            className="group-data-[collapsible=icon]:hidden h-auto"
          />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {availableNavItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href)}
                tooltip={{ children: item.label, className: "group-data-[collapsible=icon]:block hidden" }}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
         <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={{ children: "Configurações", className: "group-data-[collapsible=icon]:block hidden"  }} isActive={pathname === '/settings'}>
                <Link href="/settings">
                  <Settings />
                  <span>Configurações</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
               <SidebarMenuButton onClick={handleLogout} tooltip={{ children: "Sair", className: "group-data-[collapsible=icon]:block hidden"  }}>
                  <LogOut />
                  <span>Sair</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
