"use client"

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import {
    User,
    Mail,
    Shield,
    Briefcase,
    Camera,
    Check,
    Loader2,
    Save,
    Calendar,
    Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const profileSchema = z.object({
    full_name: z.string().min(2, "Full name must be at least 2 characters"),
    specialty: z.string().min(2, "Specialty must be at least 2 characters"),
});

export default function ProfilePage() {
    const supabase = createClient();
    const queryClient = useQueryClient();
    const { profile, initials, isLoading: isProfileLoading } = useAuth();

    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        values: {
            full_name: profile?.full_name || "",
            specialty: profile?.specialty || "",
        },
    });

    const { mutate: updateProfile } = useMutation({
        mutationFn: async (values: z.infer<typeof profileSchema>) => {
            if (!profile?.id) return;
            const { error } = await supabase
                .from("profiles")
                .update({
                    full_name: values.full_name,
                    specialty: values.specialty,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", profile.id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["auth-profile"] });
            toast.success("Profile updated successfully");
            setIsSaving(false);
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update profile");
            setIsSaving(false);
        },
    });

    if (isProfileLoading) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center space-y-4 opacity-50">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-sm font-medium">Synchronizing profile data...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight text-white font-outfit">My Profile</h1>
                <p className="text-muted-foreground font-inter">Manage your professional identity and account settings.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Left Column: Avatar & Quick Info */}
                <div className="md:col-span-4 space-y-6">
                    <Card className="bg-card/40 border-border/50 overflow-hidden backdrop-blur-sm shadow-xl">
                        <div className="h-24 bg-gradient-to-r from-primary/20 via-sky-500/20 to-primary/20" />
                        <CardContent className="pt-0 relative px-6 pb-6 text-center">
                            <div className="relative -top-12 inline-block group">
                                <div className="w-24 h-24 rounded-3xl bg-slate-900 border-4 border-slate-900 flex items-center justify-center text-3xl font-bold text-primary shadow-2xl transition-transform group-hover:scale-105 overflow-hidden">
                                    {profile?.avatar_url ? (
                                        <img src={profile.avatar_url} alt={profile.full_name || ""} className="w-full h-full object-cover" />
                                    ) : (
                                        initials
                                    )}
                                </div>
                                <Button size="icon" className="absolute bottom-[-10px] right-[-10px] w-10 h-10 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg border-2 border-slate-900">
                                    <Camera className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="mt-[-2rem] space-y-1">
                                <h2 className="text-xl font-bold text-white font-outfit">{profile?.full_name}</h2>
                                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 uppercase tracking-widest text-[10px] font-bold h-5">
                                    {profile?.role}
                                </Badge>
                                <p className="text-sm text-muted-foreground mt-2 font-inter leading-relaxed">
                                    {profile?.specialty || "General Practitioner"}
                                </p>
                            </div>

                            <Separator className="my-6 bg-border/30" />

                            <div className="space-y-4 text-left">
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <Briefcase className="w-4 h-4 text-primary" />
                                    <span>Clinical Staff</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <Shield className="w-4 h-4 text-primary" />
                                    <span>Verified Account</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <Calendar className="w-4 h-4 text-primary" />
                                    <span>Joined Mar 2024</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-primary/5 border border-primary/20 rounded-2xl overflow-hidden shadow-lg group">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <Award className="w-5 h-5 text-primary" />
                                <h3 className="font-bold text-white text-sm">Professional Badge</h3>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Your account is certified for high-compliance clinical operations.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Edit Form */}
                <div className="md:col-span-8">
                    <Card className="bg-card/40 border-border/50 backdrop-blur-xl shadow-2xl">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-2xl font-outfit">Identity Details</CardTitle>
                            <CardDescription className="text-muted-foreground font-inter">
                                Update your name and clinical specialty displayed across the platform.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 pt-4">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit((data) => {
                                    setIsSaving(true);
                                    updateProfile(data);
                                })} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="full_name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Full Name</     FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                            <Input
                                                                placeholder="Dr. Jane Doe"
                                                                className="pl-10 h-12 bg-slate-900/50 border-border/50 focus:ring-primary/20 rounded-xl"
                                                                {...field}
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormItem>
                                            <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email Address</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                    <Input
                                                        disabled
                                                        value="contact@healthcare.com"
                                                        className="pl-10 h-12 bg-slate-900/50 border-border/50 opacity-50 cursor-not-allowed rounded-xl"
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormDescription className="text-[10px]">
                                                Contact support to change email.
                                            </FormDescription>
                                        </FormItem>
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="specialty"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Specialty / Role Focus</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                        <Input
                                                            placeholder="Senior Cardiologist"
                                                            className="pl-10 h-12 bg-slate-900/50 border-border/50 focus:ring-primary/20 rounded-xl"
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="flex items-center justify-end gap-3 pt-6">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => form.reset()}
                                            className="h-11 px-6 rounded-xl text-muted-foreground hover:text-white"
                                        >
                                            Discard Changes
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={isSaving}
                                            className="h-11 px-8 rounded-xl bg-primary hover:bg-primary/90 text-white gap-2 font-bold shadow-lg shadow-primary/20 min-w-[160px]"
                                        >
                                            {isSaving ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Synchronizing...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-4 h-4" />
                                                    Update Identity
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
