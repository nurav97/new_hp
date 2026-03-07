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
    Filter,
    Loader2,
    Video
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { format, startOfDay, endOfDay, addDays, subDays } from "date-fns";
import { NewAppointmentDialog } from "@/components/clinical/new-appointment-dialog";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM

export default function AppointmentsPage() {
    const supabase = createClient();
    const [selectedDate, setSelectedDate] = useState(new Date());

    const { data: appointments, isLoading } = useQuery({
        queryKey: ["appointments", selectedDate.toISOString().split('T')[0]],
        queryFn: async () => {
            const start = startOfDay(selectedDate).toISOString();
            const end = endOfDay(selectedDate).toISOString();

            const { data, error } = await supabase
                .from("appointments")
                .select(`
                    *,
                    patient:patients(first_name, last_name),
                    doctor:profiles!appointments_doctor_id_fkey(full_name)
                `)
                .gte("appointment_time", start)
                .lte("appointment_time", end)
                .order("appointment_time");

            if (error) throw error;
            return data;
        },
    });

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
                    <NewAppointmentDialog />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Calendar Mini-view */}
                <div className="space-y-6">
                    <Card className="bg-card/40 border-border/50">
                        <CardHeader className="p-4 border-b border-border/50 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-bold text-white">
                                {format(selectedDate, "MMMM yyyy")}
                            </CardTitle>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => setSelectedDate(d => subDays(d, 30))}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => setSelectedDate(d => addDays(d, 30))}
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                                {days.map(d => <div key={d} className="text-[10px] font-bold text-muted-foreground uppercase">{d[0]}</div>)}
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                                {Array.from({ length: new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate() }, (_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            const newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), i + 1);
                                            setSelectedDate(newDate);
                                        }}
                                        className={cn(
                                            "h-8 w-8 rounded-lg text-xs flex items-center justify-center transition-all",
                                            selectedDate.getDate() === i + 1 ? "bg-primary text-white font-bold shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-secondary/50"
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
                            <div className="divide-y divide-border/30 max-h-[300px] overflow-y-auto">
                                {isLoading ? (
                                    <div className="p-8 flex justify-center">
                                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                    </div>
                                ) : appointments && appointments.length > 0 ? (
                                    appointments.map(app => (
                                        <div key={app.id} className="p-4 hover:bg-secondary/20 transition-all cursor-pointer">
                                            <div className="text-[10px] font-bold text-primary uppercase mb-1">
                                                {format(new Date(app.appointment_time), "h:mm a")}
                                            </div>
                                            <div className="text-sm font-bold text-white truncate">{app.reason}</div>
                                            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                                <User className="w-3 h-3" />
                                                {app.patient?.first_name} {app.patient?.last_name}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-xs text-muted-foreground">
                                        No appointments for this day.
                                    </div>
                                )}
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
                                <h2 className="text-lg font-bold text-white">{format(selectedDate, "EEEE, MMMM do")}</h2>
                                <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary">
                                    {appointments?.length || 0} Appointments
                                </Badge>
                            </div>
                            <div className="flex bg-secondary/50 rounded-lg p-1">
                                <Button variant="ghost" size="sm" className="h-8 px-4 rounded-md text-xs">Day</Button>
                                <Button variant="secondary" size="sm" className="h-8 px-4 rounded-md text-xs shadow-sm">Week</Button>
                                <Button variant="ghost" size="sm" className="h-8 px-4 rounded-md text-xs">Month</Button>
                            </div>
                        </div>

                        {/* Time Slots Area */}
                        <div className="relative h-[600px] overflow-y-auto bg-slate-950/50">
                            {hours.map(h => {
                                const appointmentsAtHour = appointments?.filter(app => {
                                    const appDate = new Date(app.appointment_time);
                                    return appDate.getHours() === h;
                                });

                                return (
                                    <div key={h} className="group relative h-24 border-b border-border/30">
                                        <div className="absolute top-2 left-4 text-[10px] font-bold text-muted-foreground uppercase bg-slate-950 px-2 rounded">
                                            {h > 12 ? h - 12 : h} {h >= 12 ? 'PM' : 'AM'}
                                        </div>

                                        <div className="ml-24 mr-4 py-2 h-full relative">
                                            {appointmentsAtHour?.map((app, idx) => (
                                                <div
                                                    key={app.id}
                                                    className={cn(
                                                        "absolute left-0 right-0 rounded-xl border-l-4 p-3 shadow-lg backdrop-blur-md transition-all hover:scale-[1.01] z-10",
                                                        app.status === 'COMPLETED' ? "bg-emerald-500/10 border-emerald-500" :
                                                            app.status === 'CANCELLED' ? "bg-rose-500/10 border-rose-500" :
                                                                "bg-primary/20 border-primary"
                                                    )}
                                                    style={{
                                                        top: `${idx * 10}px`,
                                                        height: '80%'
                                                    }}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-bold text-white truncate max-w-[70%]">
                                                            {app.reason} - {app.patient?.first_name} {app.patient?.last_name}
                                                        </span>
                                                        <span className="text-[10px] text-primary/80 font-bold whitespace-nowrap">
                                                            {format(new Date(app.appointment_time), "h:mm a")}
                                                        </span>
                                                    </div>
                                                    {app.is_telemedicine && (
                                                        <div className="mt-2 flex items-center gap-2">
                                                            <div className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                                            <a
                                                                href={`/telemedicine/${app.id}`}
                                                                className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 underline underline-offset-2 flex items-center gap-1"
                                                            >
                                                                <Video className="w-3 h-3" />
                                                                Join Video Consultation
                                                            </a>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            <User className="w-3 h-3" />
                                                            {app.doctor?.full_name || 'Unassigned'}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {app.duration_minutes}m
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
