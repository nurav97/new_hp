"use client"

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Users,
    Clock,
    MoreHorizontal,
    AlertCircle,
    Activity,
    ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

const triageColumns = [
    { id: "INTAKE", title: "New Intake", color: "sky" },
    { id: "TRIAGED", title: "Triaged", color: "purple" },
    { id: "WAITING", title: "Waiting Room", color: "amber" },
    { id: "IN_CONSULTATION", title: "In Consultation", color: "emerald" },
];

export default function TriageQueuePage() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    const { data: patients, isLoading } = useQuery({
        queryKey: ["patients-triage"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("patients")
                .select("*")
                .neq("status", "DISCHARGED")
                .order("updated_at", { ascending: false });
            if (error) throw error;
            return data;
        }
    });

    const updateStatus = useMutation({
        mutationFn: async ({ id, status }: { id: string, status: string }) => {
            const { error } = await supabase
                .from("patients")
                .update({ status })
                .eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["patients-triage"] });
        }
    });

    return (
        <div className="h-full flex flex-col space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Live Triage Queue</h1>
                    <p className="text-muted-foreground mt-1">Real-time monitoring of patient flow and clinical priority.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-500 uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live Sync: Active
                    </div>
                    <Button variant="outline" className="border-border/50 bg-card/50 text-white rounded-xl h-10">Triage Rules</Button>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[600px]">
                {triageColumns.map((col) => (
                    <div key={col.id} className="flex flex-col space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-2">
                                <div className={cn(
                                    "w-2 h-2 rounded-full",
                                    col.color === "sky" && "bg-sky-500",
                                    col.color === "purple" && "bg-purple-500",
                                    col.color === "amber" && "bg-amber-500",
                                    col.color === "emerald" && "bg-emerald-500",
                                )} />
                                <h3 className="font-bold text-white uppercase text-xs tracking-widest">{col.title}</h3>
                                <Badge variant="secondary" className="h-5 px-1.5 bg-secondary/50 text-muted-foreground">
                                    {patients?.filter(p => p.status === col.id).length || 0}
                                </Badge>
                            </div>
                        </div>

                        <div className="flex-1 bg-secondary/10 rounded-2xl border border-dashed border-border/50 p-3 space-y-4">
                            {isLoading ? (
                                <div className="animate-pulse space-y-4">
                                    <div className="h-32 bg-secondary/20 rounded-2xl" />
                                    <div className="h-32 bg-secondary/20 rounded-2xl" />
                                </div>
                            ) : patients?.filter(p => p.status === col.id).map((patient) => (
                                <Card key={patient.id} className="bg-card border-border/50 hover:border-primary/50 transition-all group">
                                    <CardContent className="p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-mono font-bold text-primary">{patient.mrn}</span>
                                            <Badge variant="outline" className={cn(
                                                "text-[9px] h-4 px-1",
                                                patient.priority === "CRITICAL" && "border-rose-500/30 text-rose-500 bg-rose-500/5",
                                                patient.priority === "HIGH" && "border-rose-400/30 text-rose-400 bg-rose-400/5",
                                                patient.priority === "MEDIUM" && "border-amber-500/30 text-amber-500 bg-amber-500/5",
                                                patient.priority === "LOW" && "border-sky-500/30 text-sky-500 bg-sky-500/5",
                                            )}>
                                                {patient.priority}
                                            </Badge>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-white">{patient.first_name} {patient.last_name}</h4>
                                            <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {formatDistanceToNow(new Date(patient.created_at))} wait
                                                </span>
                                            </div>
                                        </div>
                                        <div className="pt-2 flex items-center justify-between">
                                            <div className="flex gap-1">
                                                {triageColumns.filter(c => c.id !== col.id).slice(0, 1).map(next => (
                                                    <Button
                                                        key={next.id}
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-7 text-[9px] border-border/50 bg-secondary/30 hover:bg-primary hover:text-white rounded-lg"
                                                        onClick={() => updateStatus.mutate({ id: patient.id, status: next.id })}
                                                    >
                                                        Move to {next.title.split(' ')[0]}
                                                    </Button>
                                                ))}
                                            </div>
                                            <Link href={`/patients/${patient.id}`}>
                                                <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] gap-1 text-primary hover:bg-primary/10">
                                                    Details
                                                    <ArrowRight className="w-3 h-3" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {!isLoading && patients?.filter(p => p.status === col.id).length === 0 && (
                                <div className="h-32 flex flex-col items-center justify-center text-center p-4">
                                    <Users className="w-8 h-8 text-muted-foreground/30 mb-2" />
                                    <p className="text-[10px] text-muted-foreground">No patients in this stage</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
