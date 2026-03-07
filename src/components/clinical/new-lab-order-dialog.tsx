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
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
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
import { Plus, Loader2, FlaskConical, Calendar } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const formSchema = z.object({
    patient_id: z.string().min(1, "Patient is required"),
    test_name: z.string().min(3, "Test name is required"),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
    sla_deadline: z.string().optional(),
    notes: z.string().optional(),
});

export function NewLabOrderDialog() {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();
    const supabase = createClient();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            priority: "MEDIUM",
            test_name: "",
            notes: "",
        },
    });

    const { data: patients } = useQuery({
        queryKey: ["patients"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("patients")
                .select("id, first_name, last_name, mrn")
                .order("last_name");
            if (error) throw error;
            return data;
        },
    });

    const { mutate: createOrder, isPending } = useMutation({
        mutationFn: async (values: z.infer<typeof formSchema>) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const { error } = await supabase.from("lab_orders").insert({
                patient_id: values.patient_id,
                test_name: values.test_name,
                priority: values.priority,
                sla_deadline: values.sla_deadline ? new Date(values.sla_deadline).toISOString() : null,
                ordered_by: user.id,
                status: "PENDING"
            });

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["lab-orders"] });
            toast.success("Lab order placed successfully");
            setOpen(false);
            form.reset();
        },
        onError: (error) => {
            toast.error(`Error: ${error.message}`);
        },
    });

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-white gap-2 h-11 px-6 rounded-xl shadow-lg shadow-primary/20">
                    <Plus className="w-4 h-4" />
                    Order New Test
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-slate-900 border-border/50 text-white overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-sky-500 to-primary" />
                <DialogHeader>
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 border border-primary/20">
                        <FlaskConical className="w-6 h-6 text-primary" />
                    </div>
                    <DialogTitle className="text-2xl font-bold font-outfit">New Lab Order</DialogTitle>
                    <DialogDescription className="text-muted-foreground font-inter">
                        Create a new diagnostic test order for a patient.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit((data) => createOrder(data))} className="space-y-5 py-4">
                        <FormField
                            control={form.control}
                            name="patient_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Select Patient</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="bg-slate-800/50 border-border/50 h-11">
                                                <SelectValue placeholder="Search patients..." />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="bg-slate-900 border-border/50 text-white">
                                            {patients?.map((p) => (
                                                <SelectItem key={p.id} value={p.id}>
                                                    {p.first_name} {p.last_name} ({p.mrn})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="test_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Test Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g., Complete Blood Count, Lipid Panel..."
                                            className="bg-slate-800/50 border-border/50 h-11 focus:ring-primary/20"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="priority"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Priority</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-slate-800/50 border-border/50 h-11">
                                                    <SelectValue placeholder="Set priority" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-slate-900 border-border/50 text-white">
                                                <SelectItem value="LOW">Low</SelectItem>
                                                <SelectItem value="MEDIUM">Medium</SelectItem>
                                                <SelectItem value="HIGH">High</SelectItem>
                                                <SelectItem value="CRITICAL">Critical</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="sla_deadline"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Results Deadline (Optional)</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <Input
                                                    type="date"
                                                    className="bg-slate-800/50 border-border/50 h-11 pl-10 appearance-none"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Clinical Notes</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Additional instructions for the lab technician..."
                                            className="bg-slate-800/50 border-border/50 min-h-[100px] resize-none focus:ring-primary/20"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="pt-4">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setOpen(false)}
                                className="text-muted-foreground hover:text-white"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isPending}
                                className="bg-primary hover:bg-primary/90 text-white min-w-[140px]"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Placing Order...
                                    </>
                                ) : (
                                    "Place Lab Order"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
