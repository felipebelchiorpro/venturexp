
"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { APP_LOGO_URL } from "@/lib/constants";
import { LogOut, User, Settings, Sun, Moon, Bell } from "lucide-react";
import { useTheme } from "next-themes"; 
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

const ThemeToggle = () => {
  const { setTheme, theme } = useTheme ? useTheme() : { setTheme: () => {}, theme: 'dark' };

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!mounted || !useTheme) {
    return <Button variant="ghost" size="icon" disabled aria-label="Alternar tema"><Sun className="h-[1.2rem] w-[1.2rem]" /></Button>;
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      aria-label="Alternar tema"
    >
      {theme === "light" ? (
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      )}
    </Button>
  );
};


const UserNav = ({ user }: { user: SupabaseUser | null }) => {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh(); 
  };
  
  const handleSettingsClick = () => {
    router.push('/settings');
  };

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8 border-2 border-primary/50 hover:border-primary transition-colors">
            <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email || "Usuário"} data-ai-hint="user avatar" />
            <AvatarFallback>{user ? getInitials(user.email!) : 'U'}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user?.user_metadata?.full_name || 'Usuário'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email || 'email@exemplo.com'}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push('/settings')}>
            <User className="mr-2 h-4 w-4" />
            <span>Perfil</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSettingsClick}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Configurações</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export function AppHeader() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const supabase = createClient();
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  const handleNotifications = () => {
    toast({
      title: "Notificações",
      description: "Nenhuma notificação nova. (Placeholder)",
    });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur-sm">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
            <Image 
              src={APP_LOGO_URL} 
              alt="Venture XP Logo" 
              width={150} 
              height={33}
              data-ai-hint="logo venture xp" 
              className="h-auto" 
            />
          </Link>
        </div>
        <div className="md:hidden">
          <SidebarTrigger />
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <Button variant="ghost" size="icon" onClick={handleNotifications}>
            <Bell className="h-[1.2rem] w-[1.2rem]" />
            <span className="sr-only">Notificações</span>
          </Button>
          <ThemeToggle />
          <UserNav user={user} />
        </div>
      </div>
    </header>
  );
}
