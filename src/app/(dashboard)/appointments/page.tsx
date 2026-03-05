"use client"

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    Calendar as CalendarIcon,
    Clock,
    User,
    MapPin,
    Filter
} from "lucide-react";
import { cn } from "@/lib/utils";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM

const mockAppointments = [
    { id: "1", title: "Genomic Review", patient: "John Smith", time: "9:00 AM", duration: "1h", type: "CLINICAL", day: 15 },
    { id: "2", title: "Routine Checkup", patient: "Sarah Wilson", time: "11:00 AM", duration: "30m", type: "GENERAL", day: 15 },
    { id: "3", title: "Lab Results Follow-up", patient: "Michael Chen", time: "2:30 PM", duration: "45m", type: "URGENT", day: 16 },
];

export default function AppointmentsPage() {
    const [currentDate, setCurrentDate] = useState(new Date(2024, 2, 15)); // March 15, 2024

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Clinical Schedule</h1>
                    <p className="text-muted-foreground mt-1">Manage doctor availability and patient bookings.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-11 border-border/50 bg-card/50 text-white gap-2 px-4 rounded-xl">
                        <Filter className="w-4 h-4" />
                        Filters
                    </Button>
                    <Button className="bg-primary hover:bg-primary/90 text-white gap-2 h-11 px-6 rounded-xl">
                        <Plus className="w-4 h-4" />
                        New Appointment
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Calendar Mini-view */}
                <div className="space-y-6">
                    <Card className="bg-card/40 border-border/50">
                        <CardHeader className="p-4 border-b border-border/50 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-bold text-white">March 2024</CardTitle>
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-7 w-7"><ChevronLeft className="w-4 h-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7"><ChevronRight className="w-4 h-4" /></Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                                {days.map(d => <div key={d} className="text-[10px] font-bold text-muted-foreground uppercase">{d[0]}</div>)}
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                                {Array.from({ length: 31 }, (_, i) => (
                                    <button
                                        key={i}
                                        className={cn(
                                            "h-8 w-8 rounded-lg text-xs flex items-center justify-center transition-all",
                                            i + 1 === 15 ? "bg-primary text-white font-bold shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-secondary/50"
                                        )}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/40 border-border/50">
                        <CardHeader className="p-4 border-b border-border/50">
                            <CardTitle className="text-sm font-bold text-white">Upcoming Today</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-border/30">
                                {mockAppointments.filter(a => a.day === 15).map(app => (
                                    <div key={app.id} className="p-4 hover:bg-secondary/20 transition-all cursor-pointer">
                                        <div className="text-[10px] font-bold text-primary uppercase mb-1">{app.time}</div>
                                        <div className="text-sm font-bold text-white">{app.title}</div>
                                        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                            <User className="w-3 h-3" />
                                            {app.patient}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Calendar Grid */}
                <Card className="lg:col-span-3 bg-card/40 border-border/50 overflow-hidden">
                    <div className="grid grid-cols-1 divide-y divide-border/50">
                        {/* Calendar Header Row */}
                        <div className="bg-secondary/20 p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <h2 className="text-lg font-bold text-white">Friday, March 15</h2>
                                <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary">3 Appointments</Badge>
                            </div>
                            <div className="flex bg-secondary/50 rounded-lg p-1">
                                <Button variant="ghost" size="sm" className="h-8 px-4 rounded-md text-xs">Day</Button>
                                <Button variant="secondary" size="sm" className="h-8 px-4 rounded-md text-xs shadow-sm">Week</Button>
                                <Button variant="ghost" size="sm" className="h-8 px-4 rounded-md text-xs">Month</Button>
                            </div>
                        </div>

                        {/* Time Slots Area */}
                        <div className="relative h-[600px] overflow-y-auto bg-slate-950/50">
                            {hours.map(h => (
                                <div key={h} className="group relative h-20 border-b border-border/30">
                                    <div className="absolute -top-3 left-4 text-[10px] font-bold text-muted-foreground uppercase bg-slate-950 px-2 group-first:hidden">
                                        {h > 12 ? h - 12 : h} {h >= 12 ? 'PM' : 'AM'}
                                    </div>

                                    {/* Appointment Overlays */}
                                    {h === 9 && (
                                        <div className="absolute top-2 left-24 right-4 h-16 rounded-xl bg-primary/20 border-l-4 border-primary p-3 shadow-lg backdrop-blur-md">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-white">Genomic Review - John Smith</span>
                                                <span className="text-[10px] text-primary/80 font-bold">9:00 - 10:00 AM</span>
                                            </div>
                                            <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Room 302</span>
                                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Dr. Vance</span>
                                            </div>
                                        </div>
                                    )}

                                    {h === 11 && (
                                        <div className="absolute top-2 left-24 right-4 h-12 rounded-xl bg-sky-500/10 border-l-4 border-sky-500 p-2 shadow-lg backdrop-blur-md">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-white">Routine Checkup - Sarah Wilson</span>
                                                <span className="text-[10px] text-sky-400 font-bold">11:00 - 11:30 AM</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
