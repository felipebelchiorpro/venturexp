
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
import { APP_ICON, APP_NAME, navItems, MOCK_USER } from "@/lib/constants";
import { LogOut, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast"; // Import useToast

export function AppSidebar() {
  const pathname = usePathname();
  const AppLogoIcon = APP_ICON;
  const { toast } = useToast(); // Initialize useToast

  const availableNavItems = navItems.filter(item => {
    if (item.executiveOnly) {
      return MOCK_USER.role === 'Executive';
    }
    return true;
  });

  const handleLogout = () => {
    // No futuro, isso chamaria uma API de logout e redirecionaria.
    // Por agora, apenas um toast.
    toast({
      title: "Logout Realizado",
      description: "Você foi desconectado. (Simulação)",
    });
    // Idealmente, redirecionar para a página de login:
    // import { useRouter } from 'next/navigation';
    // const router = useRouter();
    // router.push('/login'); 
    console.log("Logout simulado");
  };


  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left">
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <AppLogoIcon className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold text-primary group-data-[collapsible=icon]:hidden">
            {APP_NAME}
          </h1>
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
