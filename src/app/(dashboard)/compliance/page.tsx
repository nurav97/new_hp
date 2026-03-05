import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    ShieldCheck,
    Search,
    Filter,
    Download,
    Eye,
    Lock,
    History,
    AlertTriangle,
    UserCheck
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const auditLogs = [
    { id: "1", user: "Dr. Michael Vance", action: "Accessed Patient Record", resource: "MRN-1001 (John Smith)", time: "2m ago", status: "SUCCESS" },
    { id: "2", user: "Nurse Sarah Wilson", action: "Updated Vitals", resource: "MRN-1002", time: "15m ago", status: "SUCCESS" },
    { id: "3", user: "System Admin", action: "Modified Triage Rule", resource: "Rule #42 (Criticality)", time: "1h ago", status: "SUCCESS" },
    { id: "4", user: "Unknown IP (45.1.2.3)", action: "Failed Login Attempt", resource: "Auth Service", time: "3h ago", status: "FAILED" },
    { id: "5", user: "Dr. Michael Vance", action: "Exported Clinical Summary", resource: "MRN-1015", time: "5h ago", status: "SUCCESS" },
];

export default function CompliancePage() {
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
                                <p className="text-[10px] font-bold text-muted-foreground uppercase">Total Events (24h)</p>
                                <p className="text-xl font-bold text-white">1,429</p>
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
                                <p className="text-[10px] font-bold text-muted-foreground uppercase">Flags Raised</p>
                                <p className="text-xl font-bold text-white">2 Pending</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input placeholder="Search users, actions, or resources..." className="pl-10 bg-card/50 border-border/50 h-11 rounded-xl" />
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
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Timestamp</th>
                                <th className="px-6 py-4 text-right">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {auditLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-secondary/20 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-white">
                                                {log.user.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <span className="font-medium text-white">{log.user}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">{log.action}</td>
                                    <td className="px-6 py-4">
                                        <code className="text-[10px] bg-secondary/50 px-2 py-1 rounded text-primary border border-primary/20">{log.resource}</code>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant="outline" className={cn(
                                            "text-[10px] h-5 px-1.5",
                                            log.status === "SUCCESS" ? "border-emerald-500/30 text-emerald-500 bg-emerald-500/5" : "border-rose-500/30 text-rose-500 bg-rose-500/5"
                                        )}>
                                            {log.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">{log.time}</td>
                                    <td className="px-6 py-4 text-right">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white rounded-lg">
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
