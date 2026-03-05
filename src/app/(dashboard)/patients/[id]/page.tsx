"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ChevronLeft,
    Dna,
    Activity,
    Calendar,
    ClipboardList,
    FileText,
    ShieldAlert,
    Droplet,
    Thermometer,
    Heart,
    Wind
} from "lucide-react";
import Link from "next/link";
import { BodyMap3D } from "@/components/clinical/body-map-3d";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";

export default function PatientDetailsPage({ params }: { params: { id: string } }) {
    const supabase = createClient();

    // 1. Fetch Patient Basic Info
    const { data: patient, isLoading: isPatientLoading } = useQuery({
        queryKey: ["patient", params.id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("patients")
                .select("*")
                .eq("id", params.id)
                .single();
            if (error) throw error;
            return data;
        }
    });

    // 2. Fetch Vitals
    const { data: vitals } = useQuery({
        queryKey: ["vitals", params.id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("triage_vitals")
                .select("*")
                .eq("patient_id", params.id)
                .order("created_at", { ascending: false })
                .limit(1)
                .single();
            if (error && error.code !== "PGRST116") throw error; // Handle "no rows" gracefully
            return data;
        }
    });

    // 3. Fetch Allergies
    const { data: allergies } = useQuery({
        queryKey: ["allergies", params.id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("patient_allergies")
                .select("*")
                .eq("patient_id", params.id);
            if (error) throw error;
            return data;
        }
    });

    if (isPatientLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!patient) return <div>Patient not found.</div>;

    const age = patient.date_of_birth ?
        new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear() :
        "N/A";

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col gap-4">
                <Link href="/patients" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors w-fit">
                    <ChevronLeft className="w-4 h-4" />
                    Back to Directory
                </Link>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30">
                            <span className="text-2xl font-bold text-primary">{patient.first_name[0]}{patient.last_name[0]}</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold text-white">{patient.first_name} {patient.last_name}</h1>
                                <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 uppercase">{patient.status}</Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                <span className="font-mono">{patient.mrn}</span>
                                <span>•</span>
                                <span>{patient.date_of_birth ? format(new Date(patient.date_of_birth), 'MMM dd, yyyy') : 'N/A'} ({age}y)</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <Droplet className="w-3 h-3 text-rose-500" />
                                    Blood Type {patient.blood_type || 'Unknown'}
                                </span>
                            </div>
                        </div>
                    </div>
                    {allergies && allergies.length > 0 && (
                        <div className="flex items-center gap-2">
                            <div className="p-3 rounded-2xl border border-rose-500/30 bg-rose-500/5 flex items-center gap-3">
                                <ShieldAlert className="w-5 h-5 text-rose-500" />
                                <div>
                                    <div className="text-[10px] font-bold text-rose-500 uppercase">Alerts</div>
                                    <div className="text-xs text-white font-medium">{allergies.map(a => a.allergen).join(', ')}</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Access Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Heart Rate", value: vitals?.heart_rate || "--", unit: "BPM", icon: Heart, color: "rose" },
                    { label: "Blood Pressure", value: vitals ? `${vitals.systolic_bp}/${vitals.diastolic_bp}` : "--", unit: "mmHg", icon: Activity, color: "sky" },
                    { label: "Temperature", value: vitals?.temperature || "--", unit: "°F", icon: Thermometer, color: "amber" },
                    { label: "O2 Saturation", value: vitals?.oxygen_saturation || "--", unit: "%", icon: Wind, color: "purple" },
                ].map((v, i) => (
                    <Card key={i} className="bg-card/40 border-border/50">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center",
                                v.color === "rose" && "bg-rose-500/10 text-rose-500",
                                v.color === "sky" && "bg-sky-500/10 text-sky-500",
                                v.color === "amber" && "bg-amber-500/10 text-amber-500",
                                v.color === "purple" && "bg-purple-500/10 text-purple-500",
                            )}>
                                <v.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase">{v.label}</p>
                                <p className="text-lg font-bold text-white">
                                    {v.value} <span className="text-xs font-normal text-muted-foreground">{v.unit}</span>
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="bg-card/50 border border-border/50 p-1 rounded-xl h-12 w-full justify-start overflow-x-auto">
                    <TabsTrigger value="overview" className="gap-2 px-6 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
                        <ClipboardList className="w-4 h-4" />
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="bodymap" className="gap-2 px-6 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
                        <Activity className="w-4 h-4" />
                        3D Body Map
                    </TabsTrigger>
                    <TabsTrigger value="genomic" className="gap-2 px-6 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
                        <Dna className="w-4 h-4" />
                        Genomic/Allergy
                    </TabsTrigger>
                    <TabsTrigger value="timeline" className="gap-2 px-6 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
                        <Calendar className="w-4 h-4" />
                        Clinical Timeline
                    </TabsTrigger>
                    <TabsTrigger value="docs" className="gap-2 px-6 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
                        <FileText className="w-4 h-4" />
                        Documents
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-2 bg-card/30 border-border/50">
                            <CardHeader>
                                <CardTitle className="text-white text-lg">Active Allergies & Conditions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {allergies?.map((a) => (
                                        <div key={a.id} className="p-4 rounded-2xl border border-border/50 flex justify-between items-center group hover:bg-secondary/20 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "w-3 h-3 rounded-full",
                                                    a.severity === "CRITICAL" ? "bg-rose-500" : "bg-amber-500"
                                                )} />
                                                <div>
                                                    <div className="text-sm font-bold text-white">{a.allergen}</div>
                                                    <div className="text-xs text-muted-foreground">Severity: {a.severity}</div>
                                                </div>
                                            </div>
                                            <Badge variant="secondary" className="bg-secondary/50">{a.notes || 'No notes'}</Badge>
                                        </div>
                                    ))}
                                    {vitals?.notes && (
                                        <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5">
                                            <div className="text-xs font-bold text-primary uppercase mb-1">Latest Triage Note</div>
                                            <div className="text-sm text-white italic">"{vitals.notes}"</div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-card/30 border-border/50">
                            <CardHeader>
                                <CardTitle className="text-white text-lg">Quick Clinical Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
                                    <div className="text-xs font-bold text-primary uppercase">Current Status</div>
                                    <div className="text-lg font-bold text-white mt-1 capitalize">{patient.status.replace('_', ' ')}</div>
                                    <div className="text-sm text-muted-foreground mt-1">Priority: {patient.priority}</div>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-xs font-bold text-muted-foreground uppercase">Patient Metadata</div>
                                    <div className="text-sm flex justify-between">
                                        <span className="text-muted-foreground">Last Updated</span>
                                        <span className="text-white">{format(new Date(patient.updated_at), 'MMM dd, HH:mm')}</span>
                                    </div>
                                    <div className="text-sm flex justify-between">
                                        <span className="text-muted-foreground">Gender</span>
                                        <span className="text-white">{patient.gender || 'Unknown'}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="bodymap" className="animate-in fade-in zoom-in duration-500">
                    <BodyMap3D patientId={params.id} />
                </TabsContent>

                <TabsContent value="genomic">
                    <Card className="bg-card/30 border-border/50 p-12 text-center">
                        <Dna className="w-12 h-12 text-primary mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-bold text-white mb-2">Genomic Profile: {patient.first_name}</h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            Automatic risk assessment based on genomic sequencing is currently in development.
                        </p>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
