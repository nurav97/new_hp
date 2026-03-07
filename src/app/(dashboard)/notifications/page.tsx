"use client"

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import {
    Bell,
    CheckCircle2,
    Clock,
    Filter,
    Search,
    MoreHorizontal,
    Inbox,
    Trash2,
    Calendar,
    ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

export default function NotificationsPage() {
    const supabase = createClient();
    const queryClient = useQueryClient();
    const { profile } = useAuth();
    const [filter, setFilter] = useState<"all" | "unread">("all");
    const [searchQuery, setSearchQuery] = useState("");

    const { data: notifications, isLoading } = useQuery({
        queryKey: ["notifications-full", profile?.id],
        queryFn: async () => {
            if (!profile?.id) return [];
            const { data, error } = await supabase
                .from("notifications")
                .select("*")
                .eq("user_id", profile.id)
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data;
        },
        enabled: !!profile?.id,
    });

    const filteredNotifications = notifications?.filter(n => {
        const matchesFilter = filter === "all" || !n.is_read;
        const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.message.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const { mutate: markAllAsRead } = useMutation({
        mutationFn: async () => {
            if (!profile?.id) return;
            const { error } = await supabase
                .from("notifications")
                .update({ is_read: true })
                .eq("user_id", profile.id)
                .eq("is_read", false);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({ queryKey: ["notifications-full"] });
            toast.success("All notifications marked as read");
        },
    });

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
            queryClient.invalidateQueries({ queryKey: ["notifications-full"] });
        },
    });

    const { mutate: deleteNotification } = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from("notifications")
                .delete()
                .eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications-full"] });
            toast.success("Notification deleted");
        },
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white font-outfit">Notifications Center</h1>
                    <p className="text-muted-foreground mt-1 font-inter">Manage your alerts, clinical updates, and system activities.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={() => markAllAsRead()}
                        className="h-11 border-border/50 bg-card/50 text-white gap-2 px-4 rounded-xl hover:bg-white/5 transition-all"
                    >
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        Mark All Read
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-card/40 border border-border/50 rounded-2xl p-4 backdrop-blur-sm shadow-xl">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-4 px-2">Filters</p>
                        <div className="space-y-1">
                            <Button
                                variant={filter === "all" ? "secondary" : "ghost"}
                                className="w-full justify-start gap-3 rounded-xl h-12"
                                onClick={() => setFilter("all")}
                            >
                                <Inbox className="w-4 h-4" />
                                All Activity
                                <Badge className="ml-auto bg-white/5 text-muted-foreground border-none px-2 h-5">
                                    {notifications?.length || 0}
                                </Badge>
                            </Button>
                            <Button
                                variant={filter === "unread" ? "secondary" : "ghost"}
                                className="w-full justify-start gap-3 rounded-xl h-12"
                                onClick={() => setFilter("unread")}
                            >
                                <Bell className="w-4 h-4 text-amber-500" />
                                Unread
                                <Badge className="ml-auto bg-amber-500/20 text-amber-500 border-none px-2 h-5">
                                    {notifications?.filter(n => !n.is_read).length || 0}
                                </Badge>
                            </Button>
                        </div>
                    </div>

                    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="font-bold text-white mb-2">Push Notifications</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Get instant clinical alerts directly on your device.
                            </p>
                            <Button className="w-full mt-4 bg-primary hover:bg-primary/90 rounded-xl h-10 text-xs">
                                Enable Desktop Alerts
                            </Button>
                        </div>
                        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all" />
                    </div>
                </div>

                <div className="lg:col-span-3 space-y-4">
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by title or content..."
                                className="pl-11 bg-card/50 border-border/50 h-12 rounded-xl focus:ring-primary/20 transition-all font-inter"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="h-24 w-full bg-secondary/20 rounded-2xl animate-pulse" />
                            ))
                        ) : filteredNotifications && filteredNotifications.length > 0 ? (
                            filteredNotifications.map((n) => (
                                <div
                                    key={n.id}
                                    className={cn(
                                        "group bg-card/30 border border-border/50 rounded-2xl p-5 backdrop-blur-sm hover:translate-x-1 hover:bg-card/40 transition-all duration-300 relative",
                                        !n.is_read && "border-l-4 border-l-primary bg-primary/5"
                                    )}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex gap-4">
                                            <div className={cn(
                                                "w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center border transition-transform group-hover:scale-105",
                                                n.type === 'SUCCESS' && "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                                                n.type === 'INFO' && "bg-sky-500/10 text-sky-500 border-sky-500/20",
                                                n.type === 'WARNING' && "bg-amber-500/10 text-amber-500 border-amber-500/20",
                                                n.type === 'ERROR' && "bg-rose-500/10 text-rose-500 border-rose-500/20",
                                            )}>
                                                {n.type === 'SUCCESS' ? <CheckCircle2 className="w-6 h-6" /> : <Bell className="w-6 h-6" />}
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-white text-[15px]">{n.title}</h3>
                                                    {!n.is_read && <span className="w-2 h-2 rounded-full bg-primary" />}
                                                </div>
                                                <p className="text-sm text-muted-foreground leading-relaxed">
                                                    {n.message}
                                                </p>
                                                <div className="flex items-center gap-4 mt-2">
                                                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60 font-bold uppercase tracking-widest">
                                                        <Clock className="w-3 h-3" />
                                                        {formatDistanceToNow(new Date(n.created_at))} ago
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60 font-bold uppercase tracking-widest">
                                                        <Calendar className="w-3 h-3" />
                                                        {format(new Date(n.created_at), "MMM d, h:mm a")}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {!n.is_read && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 text-primary hover:bg-primary/10 rounded-xl"
                                                    onClick={() => markAsRead(n.id)}
                                                >
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </Button>
                                            )}
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-white rounded-xl">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-slate-900 border-border/50 text-white min-w-[160px] p-2 backdrop-blur-2xl">
                                                    {n.link && (
                                                        <DropdownMenuItem
                                                            className="gap-2 p-2.5 rounded-lg cursor-pointer hover:bg-white/5"
                                                            onClick={() => n.link && window.location.assign(n.link)}
                                                        >
                                                            <ArrowUpRight className="w-4 h-4 text-sky-400" />
                                                            View Details
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem
                                                        className="gap-2 p-2.5 rounded-lg cursor-pointer text-rose-500 hover:bg-rose-500/10 focus:text-rose-400"
                                                        onClick={() => deleteNotification(n.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="h-64 flex flex-col items-center justify-center text-center bg-card/20 border-2 border-dashed border-border/30 rounded-3xl opacity-40">
                                <Inbox className="w-16 h-16 mb-4 text-muted-foreground" />
                                <h3 className="text-xl font-bold text-white font-outfit">Clear Inbox</h3>
                                <p className="text-sm">You've responded to all clinical alerts.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
