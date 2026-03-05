"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { dashboardNavItems } from "@/config/navigation";
import { Dna, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="hidden border-r bg-card/50 backdrop-blur-xl lg:block w-64 h-screen fixed">
            <div className="flex flex-col h-full py-4">
                <div className="px-6 py-2 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                        <Dna className="w-5 h-5" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white">EHCP</span>
                </div>

                <div className="flex-1 px-4 mt-8 space-y-1">
                    {dashboardNavItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    buttonVariants({ variant: isActive ? "secondary" : "ghost" }),
                                    "w-full justify-start gap-3 px-3",
                                    isActive ? "bg-secondary text-white" : "text-muted-foreground hover:text-white"
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                {item.title}
                            </Link>
                        );
                    })}
                </div>

                <div className="px-4 mt-auto">
                    <Separator className="mb-4 bg-border/50" />
                    <div className="p-2 mb-4 bg-secondary/30 rounded-xl border border-border/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                                <span className="text-sm font-bold text-primary">JD</span>
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-medium text-white truncate">Dr. Jane Doe</span>
                                <Badge variant="secondary" className="w-fit h-4 text-[10px] px-1 py-0 bg-primary/10 text-primary border-primary/20">
                                    DOCTOR
                                </Badge>
                            </div>
                        </div>
                        <button className={cn(
                            buttonVariants({ variant: "ghost", size: "sm" }),
                            "w-full justify-start gap-2 mt-4 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        )}>
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
