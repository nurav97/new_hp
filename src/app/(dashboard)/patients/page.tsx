"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Search,
    Filter,
    MoreHorizontal,
    ArrowUpDown,
    UserPlus,
    Eye,
    Edit,
    Activity,
    Archive,
    Trash2
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

import { useRouter } from "next/navigation";

export default function PatientsPage() {
    const supabase = createClient();
    const queryClient = useQueryClient();
    const router = useRouter();

    const { data: patients, isLoading, error } = useQuery({
        queryKey: ["patients"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("patients")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data;
        },
    });

    const updateStatus = useMutation({
        mutationFn: async ({ id, status, navigate }: { id: string, status: string, navigate?: boolean }) => {
            const { error } = await supabase
                .from("patients")
                .update({ status })
                .eq("id", id);
            if (error) throw error;
            return { navigate };
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["patients"] });
            toast.success("Patient status updated");
            if (data.navigate) {
                router.push("/triage");
            }
        },
        onError: (err: any) => {
            toast.error(`Update failed: ${err.message}`);
        }
    });

    if (error) {
        toast.error("Failed to load patients");
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Patient Directory</h1>
                    <p className="text-muted-foreground mt-1">Manage and monitor patient status across clinical workflows.</p>
                </div>
                <Link href="/patients/new">
                    <Button className="bg-primary hover:bg-primary/90 text-white gap-2 h-11 px-6 rounded-xl">
                        <UserPlus className="w-4 h-4" />
                        New Intake
                    </Button>
                </Link>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by MRN, name, or status..."
                        className="pl-10 bg-card/50 border-border/50 h-11 rounded-xl"
                    />
                </div>
                <Button variant="outline" className="h-11 border-border/50 bg-card/50 text-muted-foreground hover:text-white gap-2 px-4 rounded-xl">
                    <Filter className="w-4 h-4" />
                    Filters
                </Button>
            </div>

            <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-secondary/30">
                        <TableRow className="hover:bg-transparent border-border/50">
                            <TableHead className="w-[120px] font-semibold text-white">MRN</TableHead>
                            <TableHead className="font-semibold text-white">
                                <div className="flex items-center gap-2">
                                    Patient Name
                                    <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
                                </div>
                            </TableHead>
                            <TableHead className="font-semibold text-white">DOB</TableHead>
                            <TableHead className="font-semibold text-white">Status</TableHead>
                            <TableHead className="font-semibold text-white">Priority</TableHead>
                            <TableHead className="text-right font-semibold text-white">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i} className="animate-pulse border-border/50">
                                    <TableCell><div className="h-4 w-20 bg-secondary/50 rounded" /></TableCell>
                                    <TableCell><div className="h-4 w-32 bg-secondary/50 rounded" /></TableCell>
                                    <TableCell><div className="h-4 w-24 bg-secondary/50 rounded" /></TableCell>
                                    <TableCell><div className="h-6 w-20 bg-secondary/50 rounded-full" /></TableCell>
                                    <TableCell><div className="h-4 w-16 bg-secondary/50 rounded" /></TableCell>
                                    <TableCell className="text-right"><div className="h-8 w-8 bg-secondary/50 rounded ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : patients?.map((patient) => (
                            <TableRow key={patient.id} className="border-border/50 hover:bg-secondary/20 transition-colors">
                                <TableCell className="font-mono text-xs text-primary font-bold">{patient.mrn}</TableCell>
                                <TableCell className="font-medium text-white">{patient.first_name} {patient.last_name}</TableCell>
                                <TableCell className="text-muted-foreground">{patient.date_of_birth}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={cn(
                                        "text-[10px] h-5 px-1.5",
                                        patient.status === "WAITING" && "border-amber-500/30 text-amber-500 bg-amber-500/5",
                                        patient.status === "INTAKE" && "border-sky-500/30 text-sky-500 bg-sky-500/5",
                                        patient.status === "LABS_PENDING" && "border-purple-500/30 text-purple-500 bg-purple-500/5",
                                        patient.status === "TRIAGED" && "border-emerald-500/30 text-emerald-500 bg-emerald-500/5",
                                        patient.status === "IN_CONSULTATION" && "border-primary/30 text-primary bg-primary/5",
                                        patient.status === "DISCHARGED" && "border-border text-muted-foreground bg-muted/5",
                                    )}>
                                        {patient.status.replace("_", " ")}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className={cn(
                                            "w-2 h-2 rounded-full",
                                            patient.priority === "CRITICAL" && "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]",
                                            patient.priority === "HIGH" && "bg-rose-400",
                                            patient.priority === "MEDIUM" && "bg-amber-500",
                                            patient.priority === "NORMAL" && "bg-sky-500",
                                            patient.priority === "LOW" && "bg-slate-500",
                                        )} />
                                        <span className="text-xs text-muted-foreground uppercase">{patient.priority}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white rounded-lg">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Clinical Actions</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <Link href={`/patients/${patient.id}`}>
                                                <DropdownMenuItem className="gap-2 cursor-pointer">
                                                    <Eye className="w-4 h-4 text-sky-500" />
                                                    View Details
                                                </DropdownMenuItem>
                                            </Link>
                                            <DropdownMenuItem
                                                className="gap-2 cursor-pointer"
                                                onClick={() => toast.info("Edit Profile feature coming soon")}
                                            >
                                                <Edit className="w-4 h-4 text-amber-500" />
                                                Edit Profile
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="gap-2 cursor-pointer"
                                                onClick={() => updateStatus.mutate({ id: patient.id, status: "TRIAGED", navigate: true })}
                                            >
                                                <Activity className="w-4 h-4 text-emerald-500" />
                                                Start Triage
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="gap-2 cursor-pointer text-rose-500 focus:text-rose-400"
                                                onClick={() => updateStatus.mutate({ id: patient.id, status: "DISCHARGED" })}
                                            >
                                                <Archive className="w-4 h-4" />
                                                Discharge Patient
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
