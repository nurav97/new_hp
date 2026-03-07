"use client"

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";

const formSchema = z.object({
    patient_id: z.string().min(1, "Patient is required"),
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().optional(),
    status: z.enum(["DRAFT", "ACTIVE", "COMPLETED", "SUSPENDED"]),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function NewTreatmentPlanDialog() {
    const [open, setOpen] = useState(false);
    const supabase = createClient();
    const queryClient = useQueryClient();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            patient_id: "",
            title: "",
            description: "",
            status: "DRAFT",
            start_date: new Date().toISOString().split("T")[0],
            end_date: "",
        },
    });

    const { data: patients } = useQuery({
        queryKey: ["patients-list"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("patients")
                .select("id, first_name, last_name")
                .order("last_name");
            if (error) throw error;
            return data;
        },
    });

    const createTreatmentPlan = useMutation({
        mutationFn: async (values: FormValues) => {
            // Get the current user for the created_by field
            const { data: { user } } = await supabase.auth.getUser();

            const { error } = await supabase.from("treatment_plans").insert([
                {
                    patient_id: values.patient_id,
                    created_by: user?.id,
                    title: values.title,
                    description: values.description,
                    status: values.status,
                    start_date: values.start_date || null,
                    end_date: values.end_date || null,
                },
            ]);

            if (error) {
                console.error("Supabase Insertion Error (Treatment Plan):", error);
                throw new Error(error.message);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["treatment-plans"] });
            toast.success("Treatment plan created successfully");
            setOpen(false);
            form.reset();
        },
        onError: (error: Error) => {
            toast.error(`Creation failed: ${error.message}`);
        },
    });

    function onSubmit(values: FormValues) {
        createTreatmentPlan.mutate(values);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-white gap-2 h-11 px-6 rounded-xl">
                    <Plus className="w-4 h-4" />
                    New Treatment Plan
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] bg-slate-900 border-border/50 text-white">
                <DialogHeader>
                    <DialogTitle>Create New Treatment Plan</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField<FormValues, "patient_id">
                            control={form.control}
                            name="patient_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Patient</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="bg-slate-950 border-border/50">
                                                <SelectValue placeholder="Select patient" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="bg-slate-900 border-border/50 text-white">
                                            {patients?.map((p) => (
                                                <SelectItem key={p.id} value={p.id}>
                                                    {p.first_name} {p.last_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField<FormValues, "title">
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Plan Title</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g. Post-Op Recovery Plan"
                                            {...field}
                                            className="bg-slate-950 border-border/50"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField<FormValues, "description">
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Detailed treatment goals and instructions..."
                                            {...field}
                                            className="bg-slate-950 border-border/50 min-h-[100px]"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField<FormValues, "status">
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Initial Status</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-slate-950 border-border/50">
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-slate-900 border-border/50 text-white">
                                                <SelectItem value="DRAFT">Draft</SelectItem>
                                                <SelectItem value="ACTIVE">Active</SelectItem>
                                                <SelectItem value="COMPLETED">Completed</SelectItem>
                                                <SelectItem value="SUSPENDED">Suspended</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField<FormValues, "start_date">
                                control={form.control}
                                name="start_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Start Date</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="date"
                                                {...field}
                                                className="bg-slate-950 border-border/50"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField<FormValues, "end_date">
                                control={form.control}
                                name="end_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>End Date (Optional)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="date"
                                                {...field}
                                                className="bg-slate-950 border-border/50"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => setOpen(false)}
                                className="border-border/50"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={createTreatmentPlan.isPending}
                                className="bg-primary text-white"
                            >
                                {createTreatmentPlan.isPending && (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                )}
                                Create Plan
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
