"use client"

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    FlaskConical,
    Search,
    Filter,
    ArrowUpRight,
    Clock,
    CheckCircle2,
    AlertCircle,
    FileText,
    Download,
    MoreHorizontal,
    Eye,
    History
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import { NewLabOrderDialog } from "@/components/clinical/new-lab-order-dialog";

export default function LabManagementPage() {
    const supabase = createClient();
    const [searchQuery, setSearchQuery] = useState("");

    const { data: labOrders, isLoading } = useQuery({
        queryKey: ["lab-orders"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("lab_orders")
                .select(`
                    *,
                    patient:patients(first_name, last_name, mrn),
                    creator:profiles!lab_orders_ordered_by_fkey(full_name)
                `)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data;
        },
    });

    const filteredOrders = labOrders?.filter((order) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();

        const p = Array.isArray(order.patient) ? order.patient[0] : order.patient;

        return (
            order.test_name?.toLowerCase().includes(query) ||
            p?.first_name?.toLowerCase().includes(query) ||
            p?.last_name?.toLowerCase().includes(query) ||
            p?.mrn?.toLowerCase().includes(query)
        );
    });

    const stats = [
        {
            label: "Pending Tests",
            value: labOrders?.filter(o => o.status === 'PENDING' || o.status === 'IN_PROGRESS').length.toString() || "0",
            icon: Clock,
            color: "amber"
        },
        {
            label: "Completed (Life)",
            value: labOrders?.filter(o => o.status === 'COMPLETED' || o.status === 'REVIEWED').length.toString() || "0",
            icon: CheckCircle2,
            color: "emerald"
        },
        {
            label: "Priority Actions",
            value: labOrders?.filter(o => o.priority === 'CRITICAL' || o.priority === 'HIGH').length.toString() || "0",
            icon: AlertCircle,
            color: "rose"
        },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white font-outfit">Lab Order Management</h1>
                    <p className="text-muted-foreground mt-1 font-inter">Track diagnostic tests and review clinical results in real-time.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-11 border-border/50 bg-card/50 text-white gap-2 px-4 rounded-xl">
                        <Download className="w-4 h-4" />
                        Export Batch
                    </Button>
                    <NewLabOrderDialog />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <Card key={i} className="bg-card/40 border-border/50 backdrop-blur-sm overflow-hidden group transition-all hover:bg-card/60">
                        <CardContent className="p-6 flex items-center justify-between relative">
                            <div className="space-y-1 relative z-10">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                                <p className="text-3xl font-bold text-white font-outfit">{isLoading ? "..." : stat.value}</p>
                            </div>
                            <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center relative z-10 group-hover:scale-110 transition-transform",
                                stat.color === "amber" && "bg-amber-500/10 text-amber-500",
                                stat.color === "emerald" && "bg-emerald-500/10 text-emerald-500",
                                stat.color === "rose" && "bg-rose-500/10 text-rose-500",
                            )}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div className={cn(
                                "absolute -bottom-4 -right-4 w-24 h-24 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity",
                                stat.color === "amber" && "bg-amber-500",
                                stat.color === "emerald" && "bg-emerald-500",
                                stat.color === "rose" && "bg-rose-500",
                            )} />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search orders, patients, or test types..."
                            className="pl-11 bg-card/50 border-border/50 h-12 rounded-xl focus:ring-primary/20 transition-all font-inter"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" className="h-12 border-border/50 bg-card/50 text-white gap-2 px-6 rounded-xl hover:bg-card/80 transition-all">
                        <Filter className="w-4 h-4" />
                        Advanced Filters
                    </Button>
                </div>

                <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-md overflow-hidden shadow-xl">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-secondary/40 text-white font-bold border-b border-border/50">
                            <tr>
                                <th className="px-6 py-5 font-bold uppercase tracking-wider text-[11px]">Test Particulars</th>
                                <th className="px-6 py-5 font-bold uppercase tracking-wider text-[11px]">Patient</th>
                                <th className="px-6 py-5 font-bold uppercase tracking-wider text-[11px]">Clinical State</th>
                                <th className="px-6 py-5 font-bold uppercase tracking-wider text-[11px]">Priority</th>
                                <th className="px-6 py-5 font-bold uppercase tracking-wider text-[11px]">Timeline</th>
                                <th className="px-6 py-5 text-right font-bold uppercase tracking-wider text-[11px]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/20">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse h-20">
                                        <td className="px-6"><div className="h-10 w-48 bg-secondary/40 rounded-lg" /></td>
                                        <td className="px-6"><div className="h-6 w-32 bg-secondary/40 rounded-lg" /></td>
                                        <td className="px-6"><div className="h-6 w-20 bg-secondary/40 rounded-full" /></td>
                                        <td className="px-6"><div className="h-6 w-24 bg-secondary/40 rounded-lg" /></td>
                                        <td className="px-6"><div className="h-6 w-28 bg-secondary/40 rounded-lg" /></td>
                                        <td className="px-6 text-right"><div className="h-8 w-8 bg-secondary/40 rounded-lg ml-auto" /></td>
                                    </tr>
                                ))
                            ) : filteredOrders && filteredOrders.length > 0 ? (
                                filteredOrders.map((order) => {
                                    const p = Array.isArray(order.patient) ? order.patient[0] : order.patient;
                                    const c = Array.isArray(order.creator) ? order.creator[0] : order.creator;

                                    return (
                                        <tr key={order.id} className="group hover:bg-white/5 transition-all duration-300 h-20">
                                            <td className="px-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-secondary/60 flex items-center justify-center border border-border/30 group-hover:border-primary/50 transition-colors">
                                                        <FlaskConical className="w-5 h-5 text-primary" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-white text-[15px]">{order.test_name}</span>
                                                        <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                                            <History className="w-3 h-3" />
                                                            ID: {order.id.slice(0, 8).toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6">
                                                <div className="flex flex-col">
                                                    <span className="text-white font-medium">{p?.first_name} {p?.last_name}</span>
                                                    <span className="text-[10px] text-primary font-mono mt-0.5 uppercase tracking-tighter">{p?.mrn}</span>
                                                </div>
                                            </td>
                                            <td className="px-6">
                                                <Badge variant="outline" className={cn(
                                                    "text-[10px] px-2.5 py-0.5 font-bold tracking-tight rounded-md border-0 bg-opacity-10",
                                                    order.status === "COMPLETED" && "text-emerald-500 bg-emerald-500/10",
                                                    order.status === "IN_PROGRESS" && "text-sky-500 bg-sky-500/10",
                                                    order.status === "PENDING" && "text-amber-500 bg-amber-500/10",
                                                    order.status === "REVIEWED" && "text-purple-500 bg-purple-500/10",
                                                    order.status === "FLAGGED" && "text-rose-500 bg-rose-500/20 animate-pulse",
                                                )}>
                                                    {order.status}
                                                </Badge>
                                            </td>
                                            <td className="px-6">
                                                <div className="flex items-center gap-2">
                                                    <div className={cn(
                                                        "w-2.5 h-2.5 rounded-full ring-4 ring-opacity-10",
                                                        order.priority === "CRITICAL" && "bg-rose-600 ring-rose-600 shadow-[0_0_12px_rgba(225,29,72,0.4)]",
                                                        order.priority === "HIGH" && "bg-rose-400 ring-rose-400",
                                                        order.priority === "MEDIUM" && "bg-amber-400 ring-amber-400",
                                                        order.priority === "LOW" && "bg-emerald-400 ring-emerald-400",
                                                    )} />
                                                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{order.priority}</span>
                                                </div>
                                            </td>
                                            <td className="px-6">
                                                <div className="flex flex-col gap-1">
                                                    <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {formatDistanceToNow(new Date(order.created_at))} ago
                                                    </div>
                                                    {order.sla_deadline && (
                                                        <div className="text-[10px] font-bold text-rose-400/80 flex items-center gap-2">
                                                            <ArrowUpRight className="w-3 h-3" />
                                                            Due: {format(new Date(order.sla_deadline), "MMM d")}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-white rounded-xl hover:bg-white/10 transition-all">
                                                            <MoreHorizontal className="w-5 h-5" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="bg-slate-900 border-border/50 text-white min-w-[200px] p-2 backdrop-blur-2xl shadow-2xl">
                                                        <DropdownMenuLabel className="px-3 py-2 text-xs font-bold uppercase text-muted-foreground tracking-widest">Order Actions</DropdownMenuLabel>
                                                        <DropdownMenuSeparator className="bg-border/20" />
                                                        <DropdownMenuItem className="gap-3 p-2.5 cursor-pointer hover:bg-white/5 rounded-lg transition-colors">
                                                            <Eye className="w-4 h-4 text-sky-400" />
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-medium">View Results</span>
                                                                <span className="text-[10px] text-muted-foreground">Detailed clinical data</span>
                                                            </div>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="gap-3 p-2.5 cursor-pointer hover:bg-white/5 rounded-lg transition-colors">
                                                            <FileText className="w-4 h-4 text-emerald-400" />
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-medium">Download PDF</span>
                                                                <span className="text-[10px] text-muted-foreground">Certified medical report</span>
                                                            </div>
                                                        </DropdownMenuItem>
                                                        {order.status !== 'COMPLETED' && (
                                                            <DropdownMenuItem className="gap-3 p-2.5 cursor-pointer hover:bg-white/5 rounded-lg transition-colors">
                                                                <CheckCircle2 className="w-4 h-4 text-primary" />
                                                                <div className="flex flex-col">
                                                                    <span className="text-sm font-medium">Mark as Completed</span>
                                                                    <span className="text-[10px] text-muted-foreground">Update processing state</span>
                                                                </div>
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuSeparator className="bg-border/20" />
                                                        <DropdownMenuItem className="gap-3 p-2.5 cursor-pointer hover:bg-rose-500/10 text-rose-500 rounded-lg transition-colors focus:text-rose-400">
                                                            <AlertCircle className="w-4 h-4" />
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-medium">Flag Order</span>
                                                                <span className="text-[10px] opacity-70">Mark for urgent review</span>
                                                            </div>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr className="h-64">
                                    <td colSpan={6} className="text-center group">
                                        <div className="flex flex-col items-center justify-center space-y-4 opacity-40 group-hover:opacity-60 transition-opacity">
                                            <div className="w-20 h-20 rounded-3xl bg-secondary/30 flex items-center justify-center border border-dashed border-border group-hover:border-primary/50 transition-all">
                                                <FlaskConical className="w-10 h-10 text-muted-foreground transition-colors group-hover:text-primary" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xl font-bold text-white font-outfit">Awaiting Lab Orders</p>
                                                <p className="text-sm text-muted-foreground font-inter">Diagnostic queue is currently empty.</p>
                                            </div>
                                            <NewLabOrderDialog />
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
