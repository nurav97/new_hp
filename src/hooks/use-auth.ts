"use client"

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export type UserRole = 'ADMIN' | 'DOCTOR' | 'NURSE' | 'RECEPTIONIST' | 'SPECIALIST' | 'COMPLIANCE' | 'BILLING' | 'LAB_TECH';

export interface UserProfile {
    id: string;
    full_name: string | null;
    role: UserRole;
    avatar_url: string | null;
    specialty: string | null;
}

export function useAuth() {
    const supabase = createClient();

    const { data: profile, isLoading, error } = useQuery({
        queryKey: ["auth-profile"],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;

            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            if (error) {
                console.error("Error fetching profile:", error);
                return null;
            }

            return data as UserProfile;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const initials = profile?.full_name
        ? profile.full_name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
        : "??";

    return {
        profile,
        isLoading,
        error,
        initials,
    };
}
