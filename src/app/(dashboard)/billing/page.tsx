"use client"

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Search,
    Filter,
    Plus,
    Download,
    CreditCard,
    ArrowUpRight,
    ArrowDownLeft,
    DollarSign,
    MoreHorizontal,
    Eye,
    Receipt,
    History,
    FileText,
    Calendar
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CreateInvoiceDialog } from "@/components/clinical/create-invoice-dialog";

export default function BillingPage() {
    const supabase = createClient();
    const [searchQuery, setSearchQuery] = useState("");

    const { data: invoices, isLoading } = useQuery({
        queryKey: ["invoices"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("invoices")
                .select(`
                    *,
                    patient:patients(first_name, last_name, mrn)
                `)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data;
        },
    });

    const filteredInvoices = invoices?.filter((inv) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();

        // Handle potential array response from Supabase join
        const p = Array.isArray(inv.patient) ? inv.patient[0] : inv.patient;

        return (
            p?.first_name?.toLowerCase().includes(query) ||
            p?.last_name?.toLowerCase().includes(query) ||
            p?.mrn?.toLowerCase().includes(query) ||
            inv.status?.toLowerCase().includes(query)
        );
    });

    const totalRevenue = invoices?.reduce((acc, inv) =>
        inv.status === 'PAID' ? acc + Number(inv.amount) : acc, 0
    ) || 0;

    const pendingRevenue = invoices?.reduce((acc, inv) =>
        (inv.status === 'SENT' || inv.status === 'DRAFT') ? acc + Number(inv.amount) : acc, 0
    ) || 0;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white font-outfit">Financial Center</h1>
                    <p className="text-muted-foreground mt-1 font-inter">Manage patient billing, insurance claims, and revenue cycles.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-11 border-border/50 bg-card/40 text-white gap-2 px-4 rounded-xl">
                        <Download className="w-4 h-4" />
                        Export
                    </Button>
                    <CreateInvoiceDialog />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-card/40 border-border/50 backdrop-blur-sm overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ArrowUpRight className="w-20 h-20 text-emerald-500" />
                    </div>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Revenue</CardTitle>
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <DollarSign className="w-4 h-4 text-emerald-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white font-outfit">
                            ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-emerald-500 text-xs mt-1 flex items-center gap-1">
                            <ArrowUpRight className="w-3 h-3" />
                            +12.5% from last month
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-card/40 border-border/50 backdrop-blur-sm overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ArrowDownLeft className="w-20 h-20 text-amber-500" />
                    </div>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Pending Receivables</CardTitle>
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                            <CreditCard className="w-4 h-4 text-amber-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white font-outfit">
                            ${pendingRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-amber-500 text-xs mt-1 flex items-center gap-1">
                            <History className="w-3 h-3" />
                            14 items awaiting payment
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-card/40 border-border/50 backdrop-blur-sm overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Receipt className="w-20 h-20 text-sky-500" />
                    </div>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Average Ticket</CardTitle>
                        <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center">
                            <Receipt className="w-4 h-4 text-sky-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white font-outfit">
                            $450.00
                        </div>
                        <p className="text-sky-500 text-xs mt-1">Based on previous 30 days</p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground hover:text-white transition-colors" />
                    <Input
                        placeholder="Search invoices by patient name or MRN..."
                        className="pl-11 bg-card/40 border-border/50 h-12 rounded-xl focus:ring-primary/20 backdrop-blur-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="h-12 border-border/50 bg-card/40 text-muted-foreground hover:text-white gap-2 px-6 rounded-xl backdrop-blur-sm">
                    <Filter className="w-4 h-4" />
                    Advanced Filters
                </Button>
            </div>

            <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-md overflow-hidden shadow-2xl">
                <Table>
                    <TableHeader className="bg-secondary/20">
                        <TableRow className="hover:bg-transparent border-border/50 h-14">
                            <TableHead className="font-bold text-white px-6">Invoice #</TableHead>
                            <TableHead className="font-bold text-white">Patient</TableHead>
                            <TableHead className="font-bold text-white">Amount</TableHead>
                            <TableHead className="font-bold text-white">Due Date</TableHead>
                            <TableHead className="font-bold text-white">Status</TableHead>
                            <TableHead className="text-right font-bold text-white px-6">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i} className="animate-pulse border-border/50 h-20">
                                    <TableCell className="px-6"><div className="h-6 w-24 bg-secondary/40 rounded-lg" /></TableCell>
                                    <TableCell><div className="h-10 w-48 bg-secondary/40 rounded-lg" /></TableCell>
                                    <TableCell><div className="h-6 w-20 bg-secondary/40 rounded-lg" /></TableCell>
                                    <TableCell><div className="h-6 w-32 bg-secondary/40 rounded-lg" /></TableCell>
                                    <TableCell><div className="h-6 w-16 bg-secondary/40 rounded-full" /></TableCell>
                                    <TableCell className="px-6"><div className="h-8 w-8 bg-secondary/40 rounded-lg ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : filteredInvoices && filteredInvoices.length > 0 ? (
                            filteredInvoices.map((inv) => {
                                const p = Array.isArray(inv.patient) ? inv.patient[0] : inv.patient;

                                return (
                                    <TableRow key={inv.id} className="border-border/50 hover:bg-white/5 transition-all duration-300 group h-20">
                                        <TableCell className="px-6">
                                            <div className="font-mono text-xs text-muted-foreground uppercase">
                                                #{inv.id.slice(0, 8)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-white text-sm group-hover:text-primary transition-colors">
                                                    {p?.first_name} {p?.last_name}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground mt-0.5 tracking-wider font-mono">
                                                    {p?.mrn}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-bold text-white font-outfit">
                                                ${Number(inv.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {inv.due_date ? format(new Date(inv.due_date), "MMM d, yyyy") : "N/A"}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={cn(
                                                "uppercase text-[10px] px-2 py-0.5 font-bold tracking-wider rounded-md",
                                                inv.status === "PAID" && "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                                                inv.status === "SENT" && "bg-sky-500/10 text-sky-500 border-sky-500/20",
                                                inv.status === "OVERDUE" && "bg-rose-500/10 text-rose-500 border-rose-500/20",
                                                inv.status === "VOID" && "bg-slash-500/10 text-muted-foreground border-border/50",
                                                inv.status === "DRAFT" && "bg-amber-500/10 text-amber-500 border-amber-500/20",
                                            )}>
                                                {inv.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-6 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-white hover:bg-white/10 rounded-xl transition-all">
                                                        <MoreHorizontal className="w-5 h-5" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-slate-900 border-border/50 text-white min-w-[180px] p-2 shadow-2xl backdrop-blur-xl">
                                                    <DropdownMenuLabel className="px-3 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">Options</DropdownMenuLabel>
                                                    <DropdownMenuSeparator className="bg-border/50 my-1" />
                                                    <DropdownMenuItem className="gap-3 cursor-pointer hover:bg-white/10 rounded-lg p-2.5 transition-colors">
                                                        <Eye className="w-4 h-4 text-sky-400" />
                                                        <span className="text-sm font-medium">View Invoice</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="gap-3 cursor-pointer hover:bg-white/10 rounded-lg p-2.5 transition-colors">
                                                        <Download className="w-4 h-4 text-emerald-400" />
                                                        <span className="text-sm font-medium">Download PDF</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="gap-3 cursor-pointer hover:bg-white/10 rounded-lg p-2.5 transition-colors">
                                                        <CreditCard className="w-4 h-4 text-primary" />
                                                        <span className="text-sm font-medium">Process Payment</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-border/50 my-1" />
                                                    <DropdownMenuItem className="gap-3 cursor-pointer text-rose-500 hover:bg-rose-500/10 rounded-lg p-2.5 transition-colors focus:text-rose-400">
                                                        <FileText className="w-4 h-4" />
                                                        <span className="text-sm font-medium">Void Invoice</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-64 text-center">
                                    <div className="flex flex-col items-center justify-center space-y-3 opacity-40">
                                        <Receipt className="w-16 h-16 text-muted-foreground mb-2" />
                                        <p className="text-lg font-bold text-white">No invoices yet</p>
                                        <p className="text-sm text-muted-foreground max-w-[250px]">
                                            Ready to begin billing? Create an invoice for your first patient.
                                        </p>
                                        <Button className="mt-4 bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 rounded-xl">
                                            Get Started
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
