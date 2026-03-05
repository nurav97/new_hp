import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
    Users,
    Activity,
    Calendar,
    Clock,
    AlertCircle,
    TrendingUp,
    Microscope,
    ChevronRight
} from "lucide-react";

export default function DashboardPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Welcome back, Dr. Jane Doe</h1>
                    <p className="text-muted-foreground mt-1">Here is what is happening at the Clinical Coordination Center today.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="h-8 border-primary/30 text-primary bg-primary/5">
                        System Online
                    </Badge>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { title: "Patients Today", value: "32", icon: Users, trend: "+4 from yesterday", color: "blue" },
                    { title: "Avg. Triage Time", value: "14m", icon: Clock, trend: "-2m improvement", color: "sky" },
                    { title: "Pending Labs", value: "12", icon: Microscope, trend: "3 critical", color: "amber" },
                    { title: "Critical Alerts", value: "2", icon: AlertCircle, trend: "Requires attention", color: "rose" },
                ].map((stat, i) => (
                    <Card key={i} className="bg-card/50 border-border/50 hover:border-primary/50 transition-colors group">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className={cn(
                                "w-4 h-4",
                                stat.color === "blue" && "text-blue-500",
                                stat.color === "sky" && "text-sky-500",
                                stat.color === "amber" && "text-amber-500",
                                stat.color === "rose" && "text-rose-500",
                            )} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{stat.value}</div>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3 text-emerald-500" />
                                {stat.trend}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
                <Card className="lg:col-span-4 bg-card/50 border-border/50">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-white">Today's Appointments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { time: "09:00 AM", patient: "John Smith", type: "General Consultation", status: "Checked In" },
                                { time: "10:30 AM", patient: "Sarah Wilson", type: "Genomic Review", status: "Waiting" },
                                { time: "11:15 AM", patient: "Michael Chen", type: "Lab Follow-up", status: "Delayed" },
                                { time: "01:00 PM", patient: "Emma Davis", type: "Intake Wizard", status: "Draft" },
                            ].map((apt, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/30 border border-transparent hover:border-border/50 transition-all cursor-pointer group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 text-xs font-medium text-muted-foreground">{apt.time}</div>
                                        <div>
                                            <div className="text-sm font-medium text-white">{apt.patient}</div>
                                            <div className="text-xs text-muted-foreground">{apt.type}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline" className={cn(
                                            "text-[10px] h-5",
                                            apt.status === "Checked In" && "border-emerald-500/30 text-emerald-500 bg-emerald-500/5",
                                            apt.status === "Waiting" && "border-sky-500/30 text-sky-500 bg-sky-500/5",
                                            apt.status === "Delayed" && "border-amber-500/30 text-amber-500 bg-amber-500/5",
                                            apt.status === "Draft" && "border-border text-muted-foreground",
                                        )}>
                                            {apt.status}
                                        </Badge>
                                        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3 bg-card/50 border-border/50">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-white">Recent Triage Events</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {[
                                { time: "5 min ago", action: "Patient MRN-402 Priority Escalated", priority: "HIGH" },
                                { time: "12 min ago", action: "New Intake: David Miller", priority: "MEDIUM" },
                                { time: "24 min ago", action: "Vitals Recorded: Sarah Wilson", priority: "NORMAL" },
                                { time: "1 hour ago", action: "Lab Order #842 Sync Complete", priority: "NORMAL" },
                            ].map((ev, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="relative mt-1">
                                        <div className={cn(
                                            "w-2 h-2 rounded-full",
                                            ev.priority === "HIGH" && "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]",
                                            ev.priority === "MEDIUM" && "bg-amber-500",
                                            ev.priority === "NORMAL" && "bg-sky-500",
                                        )} />
                                        {i !== 3 && <div className="absolute top-2 left-[3px] w-[2px] h-10 bg-border/30" />}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-sm text-white">{ev.action}</span>
                                        <span className="text-xs text-muted-foreground">{ev.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
