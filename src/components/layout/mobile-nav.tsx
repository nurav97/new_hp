"use client";

import { useState } from "react";
import { Menu, X, Dna, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { dashboardNavItems } from "@/config/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

export function MobileNav() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    return (
        <div className="lg:hidden">
            <div className="fixed top-0 left-0 right-0 h-16 border-b bg-card/80 backdrop-blur-xl z-50 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                        <Dna className="w-5 h-5" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white">EHCP</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="text-white">
                    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </Button>
            </div>

            {isOpen && (
                <div className="fixed inset-0 top-16 bg-card z-40 animate-in slide-in-from-top-4 duration-300">
                    <div className="flex flex-col h-[calc(100vh-64px)] p-6 space-y-2">
                        {dashboardNavItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={cn(
                                        "flex items-center gap-4 p-4 rounded-xl text-lg font-medium transition-colors",
                                        isActive ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:text-white"
                                    )}
                                >
                                    <Icon className="w-6 h-6" />
                                    {item.title}
                                </Link>
                            );
                        })}

                        <div className="mt-auto space-y-4">
                            <Separator className="bg-border/50" />
                            <div className="flex items-center gap-4 p-4">
                                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                                    <span className="text-lg font-bold text-primary">JD</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-medium text-white text-lg">Dr. Jane Doe</span>
                                    <span className="text-sm text-muted-foreground">DOCTOR</span>
                                </div>
                            </div>
                            <Button variant="destructive" className="w-full h-12 rounded-xl text-lg gap-2">
                                <LogOut className="w-5 h-5" />
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Bar for quick access */}
            <div className="fixed bottom-0 left-0 right-0 h-16 bg-card/80 backdrop-blur-xl border-t z-40 flex items-center justify-around px-2">
                {dashboardNavItems.slice(0, 5).map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center gap-1 p-2 rounded-xl transition-all",
                                isActive ? "text-primary" : "text-muted-foreground"
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="text-[10px] font-medium uppercase tracking-wider">{item.title}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
