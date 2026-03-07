"use client"

import { Button } from "@/components/ui/button";

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
    User,
    Droplet,
    Thermometer,
    Heart,
    Wind,
    ShieldCheck,
    FlaskConical,
    Microscope,
    AlertTriangle,
    Info,
    Zap,
    Scale,
    CheckCircle2,
    FileType,
    Download,
    Eye,
    History,
    Stethoscope,
    Pill,
    Image,
    AlertCircle
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

                <TabsContent value="genomic" className="space-y-8 animate-in fade-in duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* 1. Genetic Risk Profile */}
                        <Card className="lg:col-span-2 bg-card/30 border-border/50">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-white text-lg flex items-center gap-2">
                                    <Dna className="w-5 h-5 text-primary" />
                                    Genomic Risk Profile
                                </CardTitle>
                                <Badge variant="outline" className="border-primary/30 text-primary">Next-Gen Sequencing V2.1</Badge>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        { gene: "BRCA1", variation: "Wild Type", risk: "Low", status: "Negative", color: "emerald" },
                                        { gene: "APOE4", variation: "ε3/ε4", risk: "Moderate", status: "Carrier", color: "amber" },
                                        { gene: "F5", variation: "Leiden Mutant", risk: "High", status: "Heterozygous", color: "rose" },
                                        { gene: "MTHFR", variation: "C677T", risk: "Moderate", status: "Homozygous", color: "amber" },
                                    ].map((g, i) => (
                                        <div key={i} className="p-4 rounded-2xl border border-border/50 bg-secondary/10 flex justify-between items-center">
                                            <div>
                                                <div className="text-sm font-bold text-white">{g.gene}</div>
                                                <div className="text-[10px] text-muted-foreground uppercase">{g.variation}</div>
                                            </div>
                                            <Badge className={cn(
                                                "capitalize",
                                                g.color === "emerald" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                                    g.color === "amber" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                                                        "bg-rose-500/10 text-rose-500 border-rose-500/20"
                                            )} variant="outline">
                                                {g.risk} Risk
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 flex gap-4">
                                    <Info className="w-5 h-5 text-primary shrink-0 mt-1" />
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Patient shows a <span className="text-white font-medium">Factor V Leiden Mutation</span>, suggesting an increased risk for venous thromboembolism. Prophylactic measures advised for surgeries or long-duration travel.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 2. Pharmacogenomics */}
                        <Card className="bg-card/30 border-border/50">
                            <CardHeader>
                                <CardTitle className="text-white text-lg flex items-center gap-2">
                                    <FlaskConical className="w-5 h-5 text-emerald-400" />
                                    Drug Metabolism
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {[
                                    { drug: "Warfarin", marker: "CYP2C9", metabolic: "Slow", color: "rose" },
                                    { drug: "Statins", marker: "SLCO1B1", metabolic: "Normal", color: "emerald" },
                                    { drug: "Clopidogrel", marker: "CYP2C19", metabolic: "Intermediate", color: "amber" },
                                    { drug: "Codeine", marker: "CYP2D6", metabolic: "Ultra-Fast", color: "purple" },
                                ].map((p, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-border/30">
                                        <div>
                                            <div className="text-sm font-medium text-white">{p.drug}</div>
                                            <div className="text-[10px] text-muted-foreground">{p.marker}</div>
                                        </div>
                                        <div className={cn(
                                            "px-2 py-1 rounded-lg text-[10px] font-bold uppercase",
                                            p.color === "rose" && "bg-rose-500/10 text-rose-500",
                                            p.color === "emerald" && "bg-emerald-500/10 text-emerald-500",
                                            p.color === "amber" && "bg-amber-500/10 text-amber-500",
                                            p.color === "purple" && "bg-purple-500/10 text-purple-500",
                                        )}>
                                            {p.metabolic}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* 3. Advanced Allergy Screening */}
                        <Card className="bg-card/30 border-border/50 lg:col-span-3">
                            <CardHeader>
                                <CardTitle className="text-white text-lg flex items-center gap-2">
                                    <ShieldAlert className="w-5 h-5 text-rose-500" />
                                    Advanced Sensitivity Analysis
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    {[
                                        { allergen: "Penicillin", type: "Drug", level: "92 IU/mL", severity: "CRITICAL", trend: "increasing" },
                                        { allergen: "Peanuts", type: "Food", level: "45 IU/mL", severity: "HIGH", trend: "stable" },
                                        { allergen: "Latex", type: "Contact", level: "12 IU/mL", severity: "MODERATE", trend: "decreasing" },
                                        { allergen: "Dust Mites", type: "Environmental", level: "8 IU/mL", severity: "LOW", trend: "stable" },
                                    ].map((a, i) => (
                                        <div key={i} className="relative group p-5 rounded-3xl border border-border/50 hover:border-primary/30 transition-all overflow-hidden">
                                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                                <AlertTriangle className="w-12 h-12" />
                                            </div>
                                            <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">{a.type}</div>
                                            <div className="text-lg font-extrabold text-white mb-2">{a.allergen}</div>
                                            <div className="flex items-center gap-2 mb-4">
                                                <Badge className={cn(
                                                    "text-[10px]",
                                                    a.severity === "CRITICAL" ? "bg-rose-500 text-white" :
                                                        a.severity === "HIGH" ? "bg-amber-500 text-white" :
                                                            "bg-secondary/50 text-muted-foreground"
                                                )}>
                                                    {a.severity}
                                                </Badge>
                                                <span className="text-[10px] text-muted-foreground">{a.level}</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className={cn(
                                                        "h-full rounded-full transition-all duration-1000",
                                                        a.severity === "CRITICAL" ? "bg-rose-500" :
                                                            a.severity === "HIGH" ? "bg-amber-500" :
                                                                "bg-emerald-500"
                                                    )}
                                                    style={{ width: `${a.severity === "CRITICAL" ? 95 : a.severity === "HIGH" ? 70 : 35}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="timeline" className="animate-in fade-in duration-500">
                    <Card className="bg-card/30 border-border/50">
                        <CardHeader>
                            <CardTitle className="text-white text-lg flex items-center gap-2">
                                <History className="w-5 h-5 text-primary" />
                                Clinical History & Timeline
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                                {[
                                    {
                                        date: "Oct 24, 2023",
                                        time: "14:30",
                                        title: "Telemedicine Consultation",
                                        description: "Follow-up for hypertension management. BP steady at 125/82. Prescription renewed.",
                                        type: "visit",
                                        status: "completed",
                                        icon: Stethoscope,
                                        color: "sky"
                                    },
                                    {
                                        date: "Oct 12, 2023",
                                        time: "09:15",
                                        title: "Lab Results: Genomic Panel",
                                        description: "Full sequencing results available. Identified Factor V Leiden mutation. Genetic counseling scheduled.",
                                        type: "lab",
                                        status: "critical",
                                        icon: FlaskConical,
                                        color: "rose"
                                    },
                                    {
                                        date: "Sep 28, 2023",
                                        time: "11:00",
                                        title: "Prescription Issued",
                                        description: "Lisinopril 10mg once daily. Started as primary treatment for stage 1 hypertension.",
                                        type: "pharmacy",
                                        status: "active",
                                        icon: Pill,
                                        color: "emerald"
                                    },
                                    {
                                        date: "Sep 15, 2023",
                                        time: "10:00",
                                        title: "Initial Specialist Consultation",
                                        description: "Primary cardiology assessment. Patient presenting with chronic fatigue and mild palpitations.",
                                        type: "visit",
                                        status: "completed",
                                        icon: User,
                                        color: "purple"
                                    }
                                ].map((item, i) => (
                                    <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-border/50 bg-slate-900 text-primary shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-transform group-hover:scale-110">
                                            <item.icon className="w-5 h-5" />
                                        </div>
                                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-border/50 bg-secondary/10 group-hover:bg-secondary/20 transition-all">
                                            <div className="flex items-center justify-between mb-1">
                                                <time className="font-mono text-[10px] font-bold text-primary uppercase">{item.date} • {item.time}</time>
                                                <Badge className={cn(
                                                    "text-[8px] px-1.5 py-0",
                                                    item.status === 'completed' && "bg-emerald-500/10 text-emerald-500",
                                                    item.status === 'critical' && "bg-rose-500/10 text-rose-500 animate-pulse",
                                                    item.status === 'active' && "bg-sky-500/10 text-sky-500",
                                                )} variant="outline">{item.status}</Badge>
                                            </div>
                                            <div className="text-sm font-bold text-white mb-1">{item.title}</div>
                                            <div className="text-xs text-muted-foreground leading-relaxed">{item.description}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="docs" className="animate-in fade-in duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { name: "MRI_Brain_Scan_2023.pdf", type: "Imaging", date: "Oct 25, 2023", size: "12.4 MB", icon: Image, color: "sky" },
                            { name: "Genomic_Sequence_Final.json", type: "Lab Report", date: "Oct 12, 2023", size: "450 KB", icon: FlaskConical, color: "rose" },
                            { name: "Cardiac_Consult_Notes.pdf", type: "Clinical Note", date: "Sep 15, 2023", size: "1.2 MB", icon: FileText, color: "purple" },
                            { name: "Blood_Panel_Comprehensive.pdf", type: "Lab Result", date: "Aug 30, 2023", size: "850 KB", icon: FlaskConical, color: "emerald" },
                            { name: "Discharge_Summary_V1.pdf", type: "Clinical Note", date: "July 22, 2023", size: "2.1 MB", icon: ClipboardList, color: "amber" },
                            { name: "Insurance_Auth_Primary.pdf", type: "Administrative", date: "July 15, 2023", size: "540 KB", icon: ShieldCheck, color: "slate" },
                        ].map((doc, i) => (
                            <Card key={i} className="bg-card/30 border-border/50 hover:border-primary/30 transition-all group overflow-hidden">
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                                            doc.color === "sky" && "bg-sky-500/10 text-sky-500",
                                            doc.color === "rose" && "bg-rose-500/10 text-rose-500",
                                            doc.color === "purple" && "bg-purple-500/10 text-purple-500",
                                            doc.color === "emerald" && "bg-emerald-500/10 text-emerald-500",
                                            doc.color === "amber" && "bg-amber-500/10 text-amber-500",
                                            doc.color === "slate" && "bg-slate-500/10 text-slate-500",
                                        )}>
                                            <doc.icon className="w-6 h-6" />
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-white hover:bg-white/10">
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-white hover:bg-white/10">
                                                <Download className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">{doc.type}</div>
                                        <div className="text-sm font-bold text-white truncate mb-1">{doc.name}</div>
                                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                            <span>{doc.date}</span>
                                            <span>{doc.size}</span>
                                        </div>
                                    </div>
                                </CardContent>
                                <div className="h-1 w-full bg-slate-800 absolute bottom-0">
                                    <div className={cn(
                                        "h-full rounded-r-full transition-all duration-500 w-0 group-hover:w-full",
                                        doc.color === "sky" && "bg-sky-500",
                                        doc.color === "rose" && "bg-rose-500",
                                        doc.color === "purple" && "bg-purple-500",
                                        doc.color === "emerald" && "bg-emerald-500",
                                        doc.color === "amber" && "bg-amber-500",
                                        doc.color === "slate" && "bg-slate-500",
                                    )} />
                                </div>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
