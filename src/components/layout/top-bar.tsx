"use client";

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

export function TopBar() {
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
                <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-white rounded-full">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background"></span>
                </Button>
                <div className="w-px h-6 bg-border mx-2" />
                <Button variant="ghost" className="gap-2 px-2 hover:bg-secondary/50 rounded-full">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                        <User className="w-4 h-4 text-primary" />
                    </div>
                </Button>
            </div>
        </header>
    );
}
