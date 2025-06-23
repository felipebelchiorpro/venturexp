
"use client";

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, MailWarning, ShieldCheck, UserCog, Users } from "lucide-react";
import type { TeamMember, TeamMemberStatus } from "@/types";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

// Mock data for team members - now initialized empty
const mockTeamMembers: TeamMember[] = [];

const getStatusBadgeVariant = (status: TeamMemberStatus): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case 'Active': return 'default'; // Green or primary
    case 'Pending Invitation': return 'secondary'; // Yellow or secondary
    case 'Inactive': return 'outline'; // Gray or outline
    default: return 'outline';
  }
};

export function MemberList() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    setMembers(mockTeamMembers); // Will set to empty array
  }, []);

  const handleDelete = (id: string, name: string) => {
    if (window.confirm("Tem certeza que deseja remover este membro da equipe?")) {
      setMembers(prev => prev.filter(m => m.id !== id));
      toast({
        title: "Membro Removido",
        description: `O membro ${name} foi removido. (Simulação)`,
        variant: "destructive",
      });
    }
  };

  const handleResendInvite = (email: string) => {
    toast({
        title: "Reenviar Convite",
        description: `Reenviando convite para ${email}. (Simulação)`,
    });
  };
  
  const handleGenericAction = (action: string, memberName: string) => {
    toast({
      title: action,
      description: `${action} para ${memberName}. (Simulação)`,
    });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Users className="h-6 w-6 text-primary" />
          <CardTitle className="text-xl font-headline">Membros da Equipe</CardTitle>
        </div>
        <CardDescription>Visualize e gerencie os membros da sua equipe.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Função/Perfil</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data de Ingresso</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Nenhum membro da equipe encontrado. Convide novos membros acima.
                  </TableCell>
                </TableRow>
              )}
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.avatarUrl} alt={member.name} data-ai-hint="person people" />
                        <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{member.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>
                    <Badge variant={member.role === 'Admin' || member.role === 'Executive' ? "default" : "secondary"}>
                      {member.role} {/* Idealmente, isso mostraria o nome do perfil de acesso */}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(member.status)} 
                           className={member.status === 'Active' ? 'bg-green-500 text-white hover:bg-green-600' : 
                                      member.status === 'Pending Invitation' ? 'bg-yellow-500 text-white hover:bg-yellow-600' : ''}>
                      {member.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(member.joinedDate), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Gerenciar Membro</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {member.status === 'Pending Invitation' && (
                          <DropdownMenuItem onClick={() => handleResendInvite(member.email)}>
                            <MailWarning className="mr-2 h-4 w-4" /> Reenviar Convite
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleGenericAction('Editar Função/Perfil', member.name)}>
                          <UserCog className="mr-2 h-4 w-4" /> Editar Função/Perfil
                        </DropdownMenuItem>
                         <DropdownMenuItem onClick={() => handleGenericAction('Ver Permissões', member.name)}>
                          <ShieldCheck className="mr-2 h-4 w-4" /> Ver Permissões
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(member.id, member.name)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                          <Trash2 className="mr-2 h-4 w-4" /> Remover Membro
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
    
