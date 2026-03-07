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
import { Input } from "@/components/ui/input";
import {
    Search,
    Filter,
    MoreHorizontal,
    Eye,
    Edit,
    Activity,
    Archive,
    Loader2,
    Calendar,
    User,
    FileText
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
import { NewTreatmentPlanDialog } from "@/components/clinical/new-treatment-plan-dialog";

export default function TreatmentPlansPage() {
    const supabase = createClient();
    const [searchQuery, setSearchQuery] = useState("");

    const { data: plans, isLoading } = useQuery({
        queryKey: ["treatment-plans"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("treatment_plans")
                .select(`
                    *,
                    patient:patients(first_name, last_name, mrn),
                    creator:profiles!treatment_plans_created_by_fkey(full_name)
                `)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data;
        },
    });

    const filteredPlans = plans?.filter((plan) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();

        // Supabase foreign table returns may be objects or arrays of objects natively
        // In our query `patient:patients(first_name, last_name, mrn)`, it's typically an object (single relational lookup)
        // But TS assumes it could be an array based on DB types. Handle both for safety/TS.
        const p = Array.isArray(plan.patient) ? plan.patient[0] : plan.patient;

        return (
            plan.title?.toLowerCase().includes(query) ||
            p?.first_name?.toLowerCase().includes(query) ||
            p?.last_name?.toLowerCase().includes(query) ||
            p?.mrn?.toLowerCase().includes(query)
        );
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Treatment Plans</h1>
                    <p className="text-muted-foreground mt-1">Manage and track ongoing patient care regimens.</p>
                </div>
                <NewTreatmentPlanDialog />
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by title, patient name, or MRN..."
                        className="pl-10 bg-card/50 border-border/50 h-11 rounded-xl"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="h-11 border-border/50 bg-card/50 text-muted-foreground hover:text-white gap-2 px-4 rounded-xl">
                    <Filter className="w-4 h-4" />
                    Filters
                </Button>
            </div>

            <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-secondary/30">
                        <TableRow className="hover:bg-transparent border-border/50">
                            <TableHead className="font-semibold text-white">Plan Info</TableHead>
                            <TableHead className="font-semibold text-white">Patient</TableHead>
                            <TableHead className="font-semibold text-white">Timeline</TableHead>
                            <TableHead className="font-semibold text-white">Status</TableHead>
                            <TableHead className="text-right font-semibold text-white">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i} className="animate-pulse border-border/50">
                                    <TableCell><div className="h-10 w-48 bg-secondary/50 rounded" /></TableCell>
                                    <TableCell><div className="h-8 w-32 bg-secondary/50 rounded" /></TableCell>
                                    <TableCell><div className="h-8 w-24 bg-secondary/50 rounded" /></TableCell>
                                    <TableCell><div className="h-6 w-20 bg-secondary/50 rounded-full" /></TableCell>
                                    <TableCell className="text-right"><div className="h-8 w-8 bg-secondary/50 rounded ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : filteredPlans && filteredPlans.length > 0 ? (
                            filteredPlans.map((plan) => {
                                const p = Array.isArray(plan.patient) ? plan.patient[0] : plan.patient;
                                const c = Array.isArray(plan.creator) ? plan.creator[0] : plan.creator;

                                return (
                                    <TableRow key={plan.id} className="border-border/50 hover:bg-secondary/20 transition-colors">
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-white text-sm">{plan.title}</span>
                                                <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                                    <User className="w-3 h-3" />
                                                    Created by: {c?.full_name || 'Unknown'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-white text-sm">
                                                    {p?.first_name} {p?.last_name}
                                                </span>
                                                <span className="text-xs text-primary font-mono mt-0.5">
                                                    {p?.mrn}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                                                {plan.start_date && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="w-3.5 h-3.5 text-sky-400" />
                                                        <span>Start: {format(new Date(plan.start_date), "MMM d, yyyy")}</span>
                                                    </div>
                                                )}
                                                {plan.end_date && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="w-3.5 h-3.5 text-rose-400" />
                                                        <span>End: {format(new Date(plan.end_date), "MMM d, yyyy")}</span>
                                                    </div>
                                                )}
                                                {!plan.start_date && !plan.end_date && <span>No dates set</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={cn(
                                                "text-[10px] h-5 px-1.5",
                                                plan.status === "ACTIVE" && "border-emerald-500/30 text-emerald-500 bg-emerald-500/5",
                                                plan.status === "DRAFT" && "border-amber-500/30 text-amber-500 bg-amber-500/5",
                                                plan.status === "COMPLETED" && "border-sky-500/30 text-sky-500 bg-sky-500/5",
                                                plan.status === "SUSPENDED" && "border-rose-500/30 text-rose-500 bg-rose-500/5",
                                            )}>
                                                {plan.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white rounded-lg">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-slate-900 border-border/50 text-white">
                                                    <DropdownMenuLabel>Plan Actions</DropdownMenuLabel>
                                                    <DropdownMenuSeparator className="bg-border/50" />
                                                    <DropdownMenuItem className="gap-2 cursor-pointer hover:bg-slate-800">
                                                        <Eye className="w-4 h-4 text-sky-500" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="gap-2 cursor-pointer hover:bg-slate-800">
                                                        <Edit className="w-4 h-4 text-amber-500" />
                                                        Edit Plan
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="gap-2 cursor-pointer hover:bg-slate-800">
                                                        <FileText className="w-4 h-4 text-emerald-500" />
                                                        Manage Medications
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-border/50" />
                                                    <DropdownMenuItem className="gap-2 cursor-pointer text-rose-500 focus:text-rose-400 hover:bg-slate-800">
                                                        <Archive className="w-4 h-4" />
                                                        Suspend Plan
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                    No treatment plans found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
