"use client";

import { cn } from "@/lib/utils";
import {
    Bell,
    Search,
    ChevronRight,
    Home,
    User
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { LogOut, Settings, Loader2, Check, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export function TopBar() {
    const router = useRouter();
    const supabase = createClient();
    const queryClient = useQueryClient();
    const { profile, initials, isLoading: isProfileLoading } = useAuth();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const { data: notifications } = useQuery({
        queryKey: ["notifications", profile?.id],
        queryFn: async () => {
            if (!profile?.id) return [];
            const { data, error } = await supabase
                .from("notifications")
                .select("*")
                .eq("user_id", profile.id)
                .order("created_at", { ascending: false })
                .limit(5);
            if (error) throw error;
            return data;
        },
        enabled: !!profile?.id,
    });

    const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

    const { mutate: markAsRead } = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from("notifications")
                .update({ is_read: true })
                .eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true);
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            router.push("/login");
            toast.success("Logged out successfully");
        } catch (error: any) {
            toast.error(error.message || "Failed to logout");
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <header className="h-16 border-b bg-card/50 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Home className="w-4 h-4" />
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-white font-medium">Dashboard</span>
                </div>
            </div>

            <div className="flex items-center gap-4 flex-1 justify-center max-w-xl px-8">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search patients, events, or actions (Ctrl + K)..."
                        className="pl-10 bg-secondary/50 border-border/50 focus-visible:ring-primary/50 w-full rounded-xl"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-white rounded-full transition-all hover:bg-white/5">
                            <Bell className="w-5 h-5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background animate-pulse"></span>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[380px] bg-slate-900 border-border/50 text-white p-0 overflow-hidden shadow-2xl backdrop-blur-xl">
                        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-primary/5">
                            <DropdownMenuLabel className="font-outfit text-base p-0">Notifications</DropdownMenuLabel>
                            {unreadCount > 0 && <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">{unreadCount} New</Badge>}
                        </div>
                        <div className="max-h-[400px] overflow-y-auto">
                            {notifications && notifications.length > 0 ? (
                                notifications.map((notification) => (
                                    <DropdownMenuItem
                                        key={notification.id}
                                        className={cn(
                                            "flex flex-col items-start gap-1 p-4 cursor-pointer border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors",
                                            !notification.is_read && "bg-primary/5 border-l-2 border-l-primary"
                                        )}
                                        onClick={() => markAsRead(notification.id)}
                                    >
                                        <div className="flex items-center justify-between w-full gap-2">
                                            <span className="font-bold text-sm">{notification.title}</span>
                                            <span className="text-[10px] text-muted-foreground shrink-0 uppercase tracking-tighter">
                                                {formatDistanceToNow(new Date(notification.created_at))} ago
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                            {notification.message}
                                        </p>
                                    </DropdownMenuItem>
                                ))
                            ) : (
                                <div className="p-12 flex flex-col items-center justify-center text-center opacity-40">
                                    <Bell className="w-12 h-12 mb-4 text-muted-foreground" />
                                    <p className="text-sm font-medium">All caught up!</p>
                                    <p className="text-[10px]">No new notifications for you.</p>
                                </div>
                            )}
                        </div>
                        <DropdownMenuSeparator className="bg-white/5 m-0" />
                        <Link href="/notifications" className="block w-full">
                            <Button variant="ghost" className="w-full rounded-none h-12 text-xs gap-2 text-primary hover:text-primary hover:bg-primary/10 transition-all font-bold">
                                View All Activity
                                <ArrowRight className="w-3 h-3" />
                            </Button>
                        </Link>
                    </DropdownMenuContent>
                </DropdownMenu>
                <div className="w-px h-6 bg-border mx-2" />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="gap-2 px-2 hover:bg-secondary/50 rounded-full">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 shrink-0">
                                <span className="text-xs font-bold text-primary">
                                    {isProfileLoading ? "..." : initials}
                                </span>
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-slate-900 border-border/50 text-white min-w-[200px] p-2">
                        <DropdownMenuLabel className="font-outfit pb-1">
                            {isProfileLoading ? "Loading..." : profile?.full_name}
                        </DropdownMenuLabel>
                        <p className="px-3 pb-2 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                            {isProfileLoading ? "Role" : profile?.role}
                        </p>
                        <DropdownMenuSeparator className="bg-border/50" />
                        <Link href="/profile">
                            <DropdownMenuItem className="gap-2 cursor-pointer hover:bg-slate-800">
                                <User className="w-4 h-4 text-sky-500" />
                                Profile
                            </DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem className="gap-2 cursor-pointer hover:bg-slate-800">
                            <Settings className="w-4 h-4 text-amber-500" />
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border/50" />
                        <DropdownMenuItem
                            className="gap-2 cursor-pointer text-rose-500 focus:text-rose-400 hover:bg-rose-500/10"
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                        >
                            {isLoggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                            {isLoggingOut ? "Logging out..." : "Logout"}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
