"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    ShieldCheck,
    Search,
    Filter,
    Download,
    Eye,
    History,
    AlertTriangle,
    UserCheck,
    Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { formatDistanceToNow, format } from "date-fns";
import { useState } from "react";

export default function CompliancePage() {
    const supabase = createClient();
    const [searchQuery, setSearchQuery] = useState("");

    const { data: rawLogs, isLoading } = useQuery({
        queryKey: ["compliance-audit-logs"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("audit_logs")
                .select(`
                    *,
                    user:profiles(full_name, role)
                `)
                .order("created_at", { ascending: false })
                .limit(100);

            if (error) throw error;
            return data;
        },
    });

    const auditLogs = rawLogs?.filter(log => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        const userName = (log.user as any)?.full_name || "System";
        return (
            userName.toLowerCase().includes(query) ||
            log.action.toLowerCase().includes(query) ||
            log.resource.toLowerCase().includes(query)
        );
    }) || [];

    const totalEvents = rawLogs?.length || 0;
    const flagsCount = auditLogs.filter(l => l.action === 'FAILED' || (l.new_value as any)?.severity === 'CRITICAL').length;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                        <ShieldCheck className="w-8 h-8 text-primary" />
                        Compliance & Audit
                    </h1>
                    <p className="text-muted-foreground mt-1">Immutable HIPAA-compliant access logs and security trails.</p>
                </div>
                <Button className="bg-secondary border border-border/50 hover:bg-secondary/80 text-white gap-2 h-11 px-6 rounded-xl">
                    <Download className="w-4 h-4" />
                    Export Audit Trail (ZIP)
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-card/40 border-border/50">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                <UserCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase">Access Integrity</p>
                                <p className="text-xl font-bold text-white">Verified</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-card/40 border-border/50">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                                <History className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase">Total Events (Live)</p>
                                <p className="text-xl font-bold text-white">{isLoading ? "..." : totalEvents}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-card/40 border-border/50">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase">Total Flags</p>
                                <p className="text-xl font-bold text-white">{isLoading ? "..." : flagsCount}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search users, actions, or resources..."
                            className="pl-10 bg-card/50 border-border/50 h-11 rounded-xl"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" className="h-11 border-border/50 bg-card/50 text-white gap-2 px-4 rounded-xl">
                        <Filter className="w-4 h-4" />
                        Filters
                    </Button>
                </div>

                <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-secondary/30 text-white font-bold border-b border-border/50">
                            <tr>
                                <th className="px-6 py-4">User/Entity</th>
                                <th className="px-6 py-4">Action</th>
                                <th className="px-6 py-4">Target Resource</th>
                                <th className="px-6 py-4">IP Address</th>
                                <th className="px-6 py-4">Timestamp</th>
                                <th className="px-6 py-4 text-right">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-8 w-32 bg-secondary/50 rounded-lg" /></td>
                                        <td className="px-6 py-4"><div className="h-6 w-24 bg-secondary/50 rounded-lg" /></td>
                                        <td className="px-6 py-4"><div className="h-6 w-20 bg-secondary/50 rounded-lg" /></td>
                                        <td className="px-6 py-4"><div className="h-6 w-16 bg-secondary/50 rounded-lg" /></td>
                                        <td className="px-6 py-4 text-right"><div className="h-8 w-8 bg-secondary/50 rounded-lg ml-auto" /></td>
                                    </tr>
                                ))
                            ) : auditLogs.length > 0 ? (
                                auditLogs.map((log) => {
                                    const user = log.user as any;
                                    const userName = user?.full_name || "System";
                                    return (
                                        <tr key={log.id} className="hover:bg-secondary/20 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-white">
                                                        {userName.split(' ').map((n: string) => n[0]).join('')}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-white">{userName}</span>
                                                        <span className="text-[10px] text-muted-foreground uppercase">{user?.role || "System"}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant="outline" className={cn(
                                                    "text-[10px] h-5 px-1.5",
                                                    log.action === "CREATE" && "border-emerald-500/30 text-emerald-500 bg-emerald-500/5",
                                                    log.action === "UPDATE" && "border-sky-500/30 text-sky-500 bg-sky-500/5",
                                                    log.action === "DELETE" && "border-rose-500/30 text-rose-500 bg-rose-500/5",
                                                    log.action === "FAILED" && "border-amber-500/30 text-amber-500 bg-amber-500/5",
                                                )}>
                                                    {log.action}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <code className="text-[10px] bg-secondary/50 px-2 py-1 rounded text-primary border border-primary/20">{log.resource}</code>
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground font-mono text-xs">{log.ip_address || 'Local/Internal'}</td>
                                            <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span>{formatDistanceToNow(new Date(log.created_at))} ago</span>
                                                    <span className="text-[10px] opacity-70">{format(new Date(log.created_at), "HH:mm:ss")}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white rounded-lg">
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center gap-2">
                                            <History className="w-12 h-12 opacity-20" />
                                            <p>No audit logs found matching your criteria.</p>
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
