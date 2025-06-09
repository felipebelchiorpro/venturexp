"use client";

import { useState, useEffect, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, PlusCircle, ListFilter, FileDown, UserPlus, CheckCircle } from "lucide-react";
import type { Lead } from "@/types";
import { format } from 'date-fns';
import { PIPELINE_STAGES } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';

// Mock data
const mockLeads: Lead[] = [
  { id: 'lead-001', name: 'Alice Wonderland', email: 'alice@example.com', company: 'Wonderland Inc.', status: 'New Lead', source: 'Website', lastContacted: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), createdAt: new Date().toISOString() },
  { id: 'lead-002', name: 'Bob The Builder', email: 'bob@construction.com', company: 'BuildIt LLC', status: 'Contacted', source: 'Referral', assignedTo: 'Jane Doe', lastContacted: new Date().toISOString(), createdAt: new Date().toISOString() },
  { id: 'lead-003', name: 'Charlie Brown', email: 'charlie@peanuts.com', company: 'Peanuts Corp', status: 'Qualified', source: 'Cold Email', lastContacted: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), createdAt: new Date().toISOString() },
  { id: 'lead-004', name: 'Diana Prince', email: 'diana@themyscira.gov', company: 'Amazonian Exports', status: 'Proposal Sent', source: 'Event', assignedTo: 'John Doe', lastContacted: new Date().toISOString(), createdAt: new Date().toISOString(), notes: "Interested in full package. Follow up next week." },
];


export function LeadList() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | 'all'>('all');
  
  // For column visibility toggle
  const [columnVisibility, setColumnVisibility] = useState({
    company: true,
    email: true,
    phone: false,
    source: true,
    assignedTo: true,
    lastContacted: true,
    createdAt: false,
  });

  useEffect(() => {
    setLeads(mockLeads);
  }, []);

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (lead.company && lead.company.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [leads, searchTerm, statusFilter]);

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this lead?")) {
      setLeads(prev => prev.filter(l => l.id !== id));
    }
  };

  const handleExportCSV = () => {
    alert("Export to CSV functionality to be implemented.");
    // Basic CSV export logic can be added here
    const headers = ["ID", "Name", "Company", "Email", "Phone", "Status", "Source", "Assigned To", "Last Contacted", "Created At", "Notes"];
    const rows = filteredLeads.map(lead => [
      lead.id, lead.name, lead.company, lead.email, lead.phone, lead.status, lead.source, lead.assignedTo, 
      format(new Date(lead.lastContacted), "PPP"), format(new Date(lead.createdAt), "PPP"), lead.notes
    ].map(field => `"${String(field || '').replace(/"/g, '""')}"`).join(','));
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "leads.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-2 justify-between items-center">
        <Input
          placeholder="Search leads (name, email, company)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-2 w-full md:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {PIPELINE_STAGES.map(stage => (
                <SelectItem key={stage} value={stage}>{stage}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <ListFilter className="mr-2 h-4 w-4" /> Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {Object.entries(columnVisibility).map(([key, value]) => (
                <DropdownMenuCheckboxItem
                  key={key}
                  className="capitalize"
                  checked={value}
                  onCheckedChange={(checked) => 
                    setColumnVisibility(prev => ({ ...prev, [key]: Boolean(checked) }))
                  }
                >
                  {key.replace(/([A-Z])/g, ' $1')}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={handleExportCSV} variant="outline">
            <FileDown className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="rounded-lg border shadow-sm bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              {columnVisibility.company && <TableHead>Company</TableHead>}
              {columnVisibility.email && <TableHead>Email</TableHead>}
              <TableHead>Status</TableHead>
              {columnVisibility.source && <TableHead>Source</TableHead>}
              {columnVisibility.assignedTo && <TableHead>Assigned To</TableHead>}
              {columnVisibility.lastContacted && <TableHead>Last Contacted</TableHead>}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.length === 0 && (
              <TableRow>
                <TableCell colSpan={Object.values(columnVisibility).filter(Boolean).length + 3} className="h-24 text-center text-muted-foreground">
                  No leads found.
                </TableCell>
              </TableRow>
            )}
            {filteredLeads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell className="font-medium">{lead.name}</TableCell>
                {columnVisibility.company && <TableCell>{lead.company || '-'}</TableCell>}
                {columnVisibility.email && <TableCell>{lead.email}</TableCell>}
                <TableCell><Badge variant="secondary">{lead.status}</Badge></TableCell>
                {columnVisibility.source && <TableCell>{lead.source || '-'}</TableCell>}
                {columnVisibility.assignedTo && <TableCell>{lead.assignedTo || 'Unassigned'}</TableCell>}
                {columnVisibility.lastContacted && <TableCell>{format(new Date(lead.lastContacted), "PPP")}</TableCell>}
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => alert(`View/Edit lead ${lead.id}`)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit Lead
                      </DropdownMenuItem>
                       <DropdownMenuItem onClick={() => alert(`Log interaction for ${lead.id}`)}>
                        <CheckCircle className="mr-2 h-4 w-4" /> Log Interaction
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => alert(`Assign task for ${lead.id}`)}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Assign Task
                      </DropdownMenuItem>
                       <DropdownMenuItem onClick={() => alert(`Assign lead ${lead.id} to user...`)}>
                        <UserPlus className="mr-2 h-4 w-4" /> Assign To...
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDelete(lead.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete Lead
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
