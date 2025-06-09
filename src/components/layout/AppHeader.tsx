"use client";

import Link from "next/link";
import React from "react"; // Added React import
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
import { APP_ICON, APP_NAME, MOCK_USER } from "@/lib/constants"; // Removed navItems as it's not used here
import { LogOut, User, Settings, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes"; 

const ThemeToggle = () => {
  const { setTheme, theme } = useTheme ? useTheme() : { setTheme: () => {}, theme: 'light' };

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!mounted || !useTheme) {
    return <Button variant="ghost" size="icon" disabled><Sun className="h-[1.2rem] w-[1.2rem]" /></Button>;
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      )}
    </Button>
  );
};


const UserNav = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={MOCK_USER.avatarUrl} alt={MOCK_USER.name} data-ai-hint="user avatar" />
            <AvatarFallback>{MOCK_USER.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{MOCK_USER.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {MOCK_USER.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => alert('Logout clicked. Implement actual logout.')}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export function AppHeader() {
  const AppLogoIcon = APP_ICON;
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
            <AppLogoIcon className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">
              {APP_NAME}
            </span>
          </Link>
        </div>
        <div className="md:hidden">
          <SidebarTrigger />
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <ThemeToggle /> {/* Uncommented ThemeToggle */}
          <UserNav />
        </div>
      </div>
    </header>
  );
}
