"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    BarChart3,
    TrendingUp,
    Users,
    FileText,
    Download,
    Calendar,
    Filter,
    ArrowUpRight,
    ArrowDownRight
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    Cell
} from "recharts";
import { cn } from "@/lib/utils";

const patientFlowData = [
    { name: "Mon", patients: 45, baseline: 40 },
    { name: "Tue", patients: 52, baseline: 40 },
    { name: "Wed", patients: 38, baseline: 40 },
    { name: "Thu", patients: 65, baseline: 40 },
    { name: "Fri", patients: 48, baseline: 40 },
    { name: "Sat", patients: 24, baseline: 40 },
    { name: "Sun", patients: 18, baseline: 40 },
];

const priorityDistribution = [
    { name: "Critical", value: 5, color: "#f43f5e" },
    { name: "High", value: 15, color: "#fb7185" },
    { name: "Medium", value: 35, color: "#f59e0b" },
    { name: "Low", value: 25, color: "#0ea5e9" },
];

export default function ReportsPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">System Intelligence</h1>
                    <p className="text-muted-foreground mt-1">Analytics and performance metrics for clinical operations.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-11 border-border/50 bg-card/50 text-white gap-2 px-4 rounded-xl">
                        <Calendar className="w-4 h-4" />
                        Last 30 Days
                    </Button>
                    <Button className="bg-primary hover:bg-primary/90 text-white gap-2 h-11 px-6 rounded-xl">
                        <Download className="w-4 h-4" />
                        Generate PDF Report
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Total Visits", value: "1,284", change: "+12.5%", trend: "up", icon: Users, color: "sky" },
                    { label: "Avg Triage Time", value: "18m", change: "-4.2%", trend: "up", icon: TrendingUp, color: "emerald" },
                    { label: "Critical Cases", value: "42", change: "+8.1%", trend: "down", icon: BarChart3, color: "rose" },
                    { label: "Report Accuracy", value: "99.2%", change: "+0.4%", trend: "up", icon: FileText, color: "purple" },
                ].map((stat, i) => (
                    <Card key={i} className="bg-card/40 border-border/50">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-2">
                                <div className={cn(
                                    "p-2 rounded-lg",
                                    stat.color === "sky" && "bg-sky-500/10 text-sky-500",
                                    stat.color === "emerald" && "bg-emerald-500/10 text-emerald-500",
                                    stat.color === "rose" && "bg-rose-500/10 text-rose-500",
                                    stat.color === "purple" && "bg-purple-500/10 text-purple-500",
                                )}>
                                    <stat.icon className="w-5 h-5" />
                                </div>
                                <div className={cn(
                                    "flex items-center gap-1 text-xs font-bold",
                                    stat.trend === "up" ? "text-emerald-500" : "text-rose-500"
                                )}>
                                    {stat.trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                    {stat.change}
                                </div>
                            </div>
                            <p className="text-xs font-bold text-muted-foreground uppercase">{stat.label}</p>
                            <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 bg-card/40 border-border/50">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            Patient Flow Over Time
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={patientFlowData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="patients" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="bg-card/40 border-border/50">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-rose-500" />
                            Priority Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {priorityDistribution.map((item) => (
                                <div key={item.name} className="space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground">{item.name}</span>
                                        <span className="text-white font-bold">{item.value}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden">
                                        <div
                                            className="h-full transition-all duration-1000"
                                            style={{ width: `${item.value}%`, backgroundColor: item.color }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 p-4 rounded-2xl bg-primary/5 border border-primary/20">
                            <p className="text-[10px] font-bold text-primary uppercase mb-2">AI Optimization Tip</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Critical load is 12% higher than last week. Consider re-allocating Specialist A to the Triage overflow.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
