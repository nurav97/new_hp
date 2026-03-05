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
    Download
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const labOrders = [
    { id: "1", test: "WBC with Differential", patient: "Alice Cooper", status: "COMPLETED", priority: "NORMAL", time: "2h ago" },
    { id: "2", test: "Genomic Sequencing (Panel B)", patient: "John Smith", status: "IN_PROGRESS", priority: "HIGH", time: "5h ago" },
    { id: "3", test: "Lipid Profile", patient: "Robert Brown", status: "PENDING", priority: "LOW", time: "1d ago" },
    { id: "4", test: "Toxicology Screen", patient: "Sarah Wilson", status: "FLAGGED", priority: "CRITICAL", time: "Just now" },
];

export default function LabManagementPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Lab Order Management</h1>
                    <p className="text-muted-foreground mt-1">Track diagnostic tests and review clinical results.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-11 border-border/50 bg-card/50 text-white gap-2 px-4 rounded-xl">
                        <Download className="w-4 h-4" />
                        Export Results
                    </Button>
                    <Button className="bg-primary hover:bg-primary/90 text-white gap-2 h-11 px-6 rounded-xl">
                        <Plus className="w-4 h-4" />
                        Order New Test
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Pending Tests", value: "12", icon: Clock, color: "amber" },
                    { label: "Completed (24h)", value: "48", icon: CheckCircle2, color: "emerald" },
                    { label: "Urgent Actions", value: "3", icon: AlertCircle, color: "rose" },
                ].map((stat, i) => (
                    <Card key={i} className="bg-card/40 border-border/50">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-muted-foreground uppercase">{stat.label}</p>
                                <p className="text-3xl font-bold text-white">{stat.value}</p>
                            </div>
                            <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center",
                                stat.color === "amber" && "bg-amber-500/10 text-amber-500",
                                stat.color === "emerald" && "bg-emerald-500/10 text-emerald-500",
                                stat.color === "rose" && "bg-rose-500/10 text-rose-500",
                            )}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input placeholder="Search orders, patients, or test types..." className="pl-10 bg-card/50 border-border/50 h-11 rounded-xl" />
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
                                <th className="px-6 py-4">Test Type</th>
                                <th className="px-6 py-4">Patient</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Priority</th>
                                <th className="px-6 py-4">Ordered</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {labOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-secondary/20 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center">
                                                <FlaskConical className="w-4 h-4 text-primary" />
                                            </div>
                                            <span className="font-medium text-white">{order.test}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">{order.patient}</td>
                                    <td className="px-6 py-4">
                                        <Badge variant="outline" className={cn(
                                            "text-[10px] h-5 px-1.5",
                                            order.status === "COMPLETED" && "border-emerald-500/30 text-emerald-500 bg-emerald-500/5",
                                            order.status === "IN_PROGRESS" && "border-sky-500/30 text-sky-500 bg-sky-500/5",
                                            order.status === "PENDING" && "border-amber-500/30 text-amber-500 bg-amber-500/5",
                                            order.status === "FLAGGED" && "border-rose-500/30 text-rose-500 bg-rose-500/5 animate-pulse",
                                        )}>
                                            {order.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className={cn(
                                                "w-2 h-2 rounded-full",
                                                order.priority === "CRITICAL" && "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]",
                                                order.priority === "HIGH" && "bg-rose-400",
                                                order.priority === "NORMAL" && "bg-sky-500",
                                                order.priority === "LOW" && "bg-slate-500",
                                            )} />
                                            <span className="text-[10px] text-muted-foreground uppercase">{order.priority}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground flex items-center gap-2">
                                        <Clock className="w-3 h-3" />
                                        {order.time}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white rounded-lg">
                                                <FileText className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10 rounded-lg">
                                                <ArrowUpRight className="w-4 h-4" />
                                            </Button>
                                        </div>
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

function Plus(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    )
}
