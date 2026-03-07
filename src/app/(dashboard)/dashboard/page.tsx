"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import {
    Users,
    Activity,
    Calendar,
    Clock,
    AlertCircle,
    TrendingUp,
    Microscope,
    ChevronRight,
    Loader2,
    ShieldCheck,
    Cpu,
    History,
    UserPlus,
    ClipboardCheck,
    UsersRound
} from "lucide-react";

// --- Main Page Component ---
export default function DashboardPage() {
    const { profile, isLoading } = useAuth();

    // Debugging role issues
    if (profile) {
        console.log("Current Profile:", {
            id: profile.id,
            name: profile.full_name,
            role: profile.role
        });
    }

    if (isLoading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
        );
    }

    const role = profile?.role?.toUpperCase() || 'DOCTOR';
    const userName = profile?.full_name || 'Medical Professional';

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white capitalize">
                        Welcome back, {userName.toLowerCase()}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {role === 'ADMIN' && "System administration and platform oversight dashboard."}
                        {role === 'DOCTOR' && "Here is what is happening at the Clinical Coordination Center today."}
                        {role === 'NURSE' && "Patient triage and care coordination overview."}
                        {role === 'RECEPTIONIST' && "Front desk and patient reception dashboard."}
                        {role === 'LAB_TECH' && "Laboratory testing and results monitoring."}
                        {role === 'BILLING' && "Financial management and revenue cycle oversight."}
                        {!['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'LAB_TECH', 'BILLING'].includes(role) && "Clinical coordination and specialized care dashboard."}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className={cn(
                        "h-8 border-primary/30 text-primary bg-primary/5 px-3 font-mono tracking-wider",
                        role === 'ADMIN' && "border-rose-500/30 text-rose-400 bg-rose-500/5",
                        role === 'DOCTOR' && "border-sky-500/30 text-sky-400 bg-sky-500/5",
                        role === 'NURSE' && "border-emerald-500/30 text-emerald-400 bg-emerald-500/5",
                    )}>
                        {role || 'USER'} ACCESS
                    </Badge>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                </div>
            </div>

            {/* DASHBOARD CONTENT BASED ON ROLE */}
            {role === 'ADMIN' ? <AdminDashboard /> :
                (role === 'NURSE' || role === 'RECEPTIONIST') ? <NurseDashboard /> :
                    <DoctorDashboard />}
        </div>
    );
}

// --- Specialized Dashboards ---

function DoctorDashboard() {
    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { title: "Patients Today", value: "32", icon: Users, trend: "+4 from yesterday", color: "blue" },
                    { title: "Avg. Triage Time", value: "14m", icon: Clock, trend: "-2m improvement", color: "sky" },
                    { title: "Pending Labs", value: "12", icon: Microscope, trend: "3 critical", color: "amber" },
                    { title: "Critical Alerts", value: "2", icon: AlertCircle, trend: "Requires attention", color: "rose" },
                ].map((stat, i) => (
                    <StatCard key={i} {...stat} />
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
                                <AppointmentItem key={i} {...apt} />
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
                                <TriageEventItem key={i} {...ev} isLast={i === 3} />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}

function NurseDashboard() {
    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { title: "Waiting Room", value: "8", icon: UsersRound, trend: "Average wait 12m", color: "blue" },
                    { title: "Triage Queue", value: "5", icon: Activity, trend: "2 Critical", color: "rose" },
                    { title: "Vital checks", value: "14", icon: ClipboardCheck, trend: "Next in 15m", color: "sky" },
                    { title: "Rooms Active", value: "6/10", icon: Calendar, trend: "Full capacity soon", color: "amber" },
                ].map((stat, i) => (
                    <StatCard key={i} {...stat} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
                <Card className="lg:col-span-4 bg-card/50 border-border/50">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-white">Immediate Triage Queue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { time: "Incoming", patient: "James Wilson", type: "Chest Pain", status: "Critical" },
                                { time: "2m ago", patient: "Anna K.", type: "High Fever", status: "High" },
                                { time: "10m ago", patient: "Unknown", type: "Trauma Room 2", status: "Critical" },
                                { time: "15m ago", patient: "Robert Brown", type: "Routine Intake", status: "Normal" },
                            ].map((apt, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/30 border border-transparent hover:border-border/50 transition-all cursor-pointer group">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-12 text-[10px] font-bold uppercase",
                                            apt.status === "Critical" ? "text-rose-500 animate-pulse" : "text-muted-foreground"
                                        )}>{apt.time}</div>
                                        <div>
                                            <div className="text-sm font-medium text-white">{apt.patient}</div>
                                            <div className="text-xs text-muted-foreground">{apt.type}</div>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className={cn(
                                        "text-[10px] h-5",
                                        apt.status === "Critical" && "border-rose-500 text-rose-500 bg-rose-500/5",
                                        apt.status === "High" && "border-amber-500 text-amber-500 bg-amber-500/5",
                                        apt.status === "Normal" && "border-sky-500 text-sky-500 bg-sky-500/5",
                                    )}>
                                        {apt.status}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3 bg-card/50 border-border/50">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-white">Nurse Station Alerts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {[
                                { time: "Now", action: "Lab result ready: M. Chen", priority: "HIGH" },
                                { time: "5 min ago", action: "Shift Change Complete", priority: "NORMAL" },
                                { time: "20 min ago", action: "Pharmacy refill approved", priority: "NORMAL" },
                                { time: "1 hour ago", action: "Biohazard waste pickup", priority: "MEDIUM" },
                            ].map((ev, i) => (
                                <TriageEventItem key={i} {...ev} isLast={i === 3} />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}

function AdminDashboard() {
    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { title: "Total Users", value: "124", icon: UserPlus, trend: "+12 this month", color: "blue" },
                    { title: "System Health", value: "99.9%", icon: Activity, trend: "Status: Stable", color: "sky" },
                    { title: "Security Alerts", value: "0", icon: ShieldCheck, trend: "All systems clear", color: "emerald" },
                    { title: "Resources", value: "72%", icon: Cpu, trend: "Load optimized", color: "amber" },
                ].map((stat, i) => (
                    <StatCard key={i} {...stat} />
                ))}
            </div>

            <Card className="bg-card/50 border-border/50">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-white">Platform Audit Log</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[
                            { time: "2m ago", user: "Admin", action: "Updated RLS Policies", icon: ShieldCheck },
                            { time: "15m ago", user: "SysBot", action: "Automated Backup Completed", icon: History },
                            { time: "45m ago", user: "Staff", action: "Added New Doctor Profile", icon: UserPlus },
                            { time: "2h ago", user: "Admin", action: "System Update v1.2.0 Applied", icon: Cpu },
                        ].map((log, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-secondary/10 border border-border/30">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 rounded-lg bg-slate-900 border border-border/50">
                                        <log.icon className="w-4 h-4 text-primary" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-white">{log.action}</div>
                                        <div className="text-xs text-muted-foreground">Performed by {log.user}</div>
                                    </div>
                                </div>
                                <div className="text-xs font-mono text-muted-foreground">{log.time}</div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </>
    )
}

// --- Shared Helper Components ---

function StatCard({ title, value, icon: Icon, trend, color }: any) {
    return (
        <Card className="bg-card/50 border-border/50 hover:border-primary/50 transition-colors group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <Icon className={cn(
                    "w-4 h-4",
                    color === "blue" && "text-blue-500",
                    color === "sky" && "text-sky-500",
                    color === "amber" && "text-amber-500",
                    color === "rose" && "text-rose-500",
                    color === "emerald" && "text-emerald-500",
                )} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-white">{value}</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                    {trend}
                </p>
            </CardContent>
        </Card>
    );
}

function AppointmentItem({ time, patient, type, status }: any) {
    return (
        <div className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/30 border border-transparent hover:border-border/50 transition-all cursor-pointer group">
            <div className="flex items-center gap-4">
                <div className="w-12 text-xs font-medium text-muted-foreground">{time}</div>
                <div>
                    <div className="text-sm font-medium text-white">{patient}</div>
                    <div className="text-xs text-muted-foreground">{type}</div>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <Badge variant="outline" className={cn(
                    "text-[10px] h-5",
                    status === "Checked In" && "border-emerald-500/30 text-emerald-500 bg-emerald-500/5",
                    status === "Waiting" && "border-sky-500/30 text-sky-500 bg-sky-500/5",
                    status === "Delayed" && "border-amber-500/30 text-amber-500 bg-amber-500/5",
                    status === "Draft" && "border-border text-muted-foreground",
                )}>
                    {status}
                </Badge>
                <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
        </div>
    );
}

function TriageEventItem({ time, action, priority, isLast }: any) {
    return (
        <div className="flex gap-4">
            <div className="relative mt-1">
                <div className={cn(
                    "w-2 h-2 rounded-full",
                    priority === "HIGH" && "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]",
                    priority === "MEDIUM" && "bg-amber-500",
                    priority === "NORMAL" && "bg-sky-500",
                )} />
                {!isLast && <div className="absolute top-2 left-[3px] w-[2px] h-10 bg-border/30" />}
            </div>
            <div className="flex flex-col gap-1">
                <span className="text-sm text-white">{action}</span>
                <span className="text-xs text-muted-foreground">{time}</span>
            </div>
        </div>
    );
}
