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
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";

// All fields as strings to satisfy react-hook-form/zod interoperability
const formSchema = z.object({
    patient_id: z.string().min(1, "Patient is required"),
    doctor_id: z.string().min(1, "Doctor is required"),
    appointment_date: z.string().min(1, "Date is required"),
    appointment_time: z.string().min(1, "Time is required"),
    duration_minutes: z.string().min(1, "Duration is required"),
    reason: z.string().min(3, "Reason is required"),
    notes: z.string().optional(),
    is_telemedicine: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export function NewAppointmentDialog() {
    const [open, setOpen] = useState(false);
    const supabase = createClient();
    const queryClient = useQueryClient();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            patient_id: "",
            doctor_id: "",
            appointment_date: new Date().toISOString().split("T")[0],
            appointment_time: "09:00",
            duration_minutes: "30",
            reason: "",
            notes: "",
            is_telemedicine: false,
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

    const { data: doctors } = useQuery({
        queryKey: ["doctors-list"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("profiles")
                .select("id, full_name")
                .eq("role", "DOCTOR")
                .order("full_name");
            if (error) throw error;
            return data;
        },
    });

    const createAppointment = useMutation({
        mutationFn: async (values: FormValues) => {
            // Robust date construction
            const [year, month, day] = values.appointment_date.split('-').map(Number);
            const [hours, minutes] = values.appointment_time.split(':').map(Number);

            if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hours) || isNaN(minutes)) {
                throw new Error("Invalid date or time format selected");
            }

            const date = new Date(year, month - 1, day, hours, minutes);

            if (isNaN(date.getTime())) {
                throw new Error("The selected date and time are invalid");
            }

            const appointment_time = date.toISOString();

            const { error } = await supabase.from("appointments").insert([
                {
                    patient_id: values.patient_id,
                    doctor_id: values.doctor_id,
                    appointment_time,
                    duration_minutes: parseInt(values.duration_minutes, 10),
                    reason: values.reason,
                    notes: values.notes,
                    status: "SCHEDULED",
                    is_telemedicine: values.is_telemedicine,
                },
            ]);

            if (error) {
                console.error("Supabase Insertion Error:", error);
                throw new Error(error.message);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["appointments"] });
            toast.success("Appointment scheduled successfully");
            setOpen(false);
            form.reset();
        },
        onError: (error: Error) => {
            toast.error(`Failed to schedule: ${error.message}`);
        },
    });

    function onSubmit(values: FormValues) {
        createAppointment.mutate(values);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-white gap-2 h-11 px-6 rounded-xl">
                    <Plus className="w-4 h-4" />
                    New Appointment
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-slate-900 border-border/50 text-white">
                <DialogHeader>
                    <DialogTitle>Schedule New Appointment</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
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
                            <FormField
                                control={form.control}
                                name="doctor_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Doctor</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-slate-950 border-border/50">
                                                    <SelectValue placeholder="Select doctor" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-slate-900 border-border/50 text-white">
                                                {doctors?.map((d) => (
                                                    <SelectItem key={d.id} value={d.id}>
                                                        {d.full_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="appointment_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date</FormLabel>
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
                            <FormField
                                control={form.control}
                                name="appointment_time"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Time</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="time"
                                                {...field}
                                                className="bg-slate-950 border-border/50"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="duration_minutes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Duration (minutes)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min="5"
                                            {...field}
                                            className="bg-slate-950 border-border/50"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="reason"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Reason for Visit</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g. Clinical Review"
                                            {...field}
                                            className="bg-slate-950 border-border/50"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="is_telemedicine"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border/50 p-3 shadow-sm bg-slate-950">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base font-semibold text-white">Telemedicine</FormLabel>
                                        <p className="text-[10px] text-muted-foreground italic">Enable encrypted video consultation.</p>
                                    </div>
                                    <FormControl>
                                        <input
                                            type="checkbox"
                                            checked={field.value}
                                            onChange={field.onChange}
                                            className="w-5 h-5 rounded-md border-gray-300 text-primary focus:ring-primary bg-slate-900 border-border/50"
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes (Optional)</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Extra clinical notes"
                                            {...field}
                                            className="bg-slate-950 border-border/50"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

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
                                disabled={createAppointment.isPending}
                                className="bg-primary text-white"
                            >
                                {createAppointment.isPending && (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                )}
                                Schedule Appointment
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
