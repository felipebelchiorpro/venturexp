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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, FileText, Eye } from "lucide-react";
import type { Proposal } from "@/types";
import { format } from 'date-fns';
import { PROPOSAL_STATUSES } from '@/lib/constants';
import { cn } from '@/lib/utils';

// Mock data
const mockProposals: Proposal[] = [
  { id: 'prop-1', clientName: 'Innovatech Ltd.', serviceDescription: 'Web Development', amount: 12000, currency: 'USD', deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), status: 'Sent', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'prop-2', clientName: 'Synergy Corp', serviceDescription: 'Marketing Campaign', amount: 8500, currency: 'USD', deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), status: 'Draft', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'prop-3', clientName: 'Quantum Solutions', serviceDescription: 'Cloud Migration', amount: 25000, currency: 'EUR', deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(), status: 'Accepted', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'prop-4', clientName: 'Apex Industries', serviceDescription: 'SEO Optimization', amount: 3000, currency: 'USD', deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), status: 'Declined', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

const getStatusBadgeVariant = (status: Proposal['status']): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case 'Accepted': return 'default'; // Using primary color for accepted
    case 'Sent': return 'secondary';
    case 'Draft': return 'outline';
    case 'Declined': return 'destructive';
    case 'Archived': return 'outline'; // A more muted outline perhaps
    default: return 'outline';
  }
};


export function ProposalList() {
  const [proposals, setProposals] = useState<Proposal[]>([]);

  useEffect(() => {
    // Simulate fetching data
    setProposals(mockProposals);
  }, []);

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this proposal?")) {
      setProposals(prev => prev.filter(p => p.id !== id));
      // Add toast notification here
    }
  };

  return (
    <div className="rounded-lg border shadow-sm bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Deadline</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {proposals.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                No proposals found.
              </TableCell>
            </TableRow>
          )}
          {proposals.map((proposal) => (
            <TableRow key={proposal.id}>
              <TableCell className="font-medium">{proposal.clientName}</TableCell>
              <TableCell>{new Intl.NumberFormat('en-US', { style: 'currency', currency: proposal.currency }).format(proposal.amount)}</TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(proposal.status)} className={cn(proposal.status === 'Accepted' && 'bg-green-500 text-white hover:bg-green-600')}>
                  {proposal.status}
                </Badge>
              </TableCell>
              <TableCell>{format(new Date(proposal.deadline), "PPP")}</TableCell>
              <TableCell>{format(new Date(proposal.createdAt), "PPP")}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => alert(`View proposal ${proposal.id}`)}>
                      <Eye className="mr-2 h-4 w-4" /> View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => alert(`Edit proposal ${proposal.id}`)}>
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => alert(`Download PDF for ${proposal.id}`)}>
                      <FileText className="mr-2 h-4 w-4" /> Download PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(proposal.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
