"use client";

import { useEffect, useState } from "react";
import { Search, Users, Stethoscope, Microscope, Settings } from "lucide-react";

export function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[15vh] px-4 animate-in fade-in duration-300">
            <div className="w-full max-w-xl bg-card border border-border shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center gap-3 px-4 py-4 border-b">
                    <Search className="w-5 h-5 text-muted-foreground" />
                    <input
                        autoFocus
                        placeholder="Search patients, procedures, or settings..."
                        className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-muted-foreground"
                    />
                    <div className="px-1.5 py-0.5 rounded border text-[10px] text-muted-foreground bg-secondary/30">ESC</div>
                </div>

                <div className="p-2 max-h-[400px] overflow-y-auto">
                    <div className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Suggested Actions</div>
                    {[
                        { label: "Find Patient MRN-...", icon: Users },
                        { label: "New Treatment Plan", icon: Stethoscope },
                        { label: "Review Lab Results", icon: Microscope },
                        { label: "Open Settings", icon: Settings },
                    ].map((item, i) => (
                        <button
                            key={i}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 text-sm text-white group"
                            onClick={() => setIsOpen(false)}
                        >
                            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                                <item.icon className="w-4 h-4" />
                            </div>
                            {item.label}
                        </button>
                    ))}
                </div>

                <div className="px-4 py-3 bg-secondary/20 border-t flex items-center justify-end gap-4">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <kbd className="px-1 py-0.5 rounded border bg-card">↑↓</kbd> to navigate
                    </span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <kbd className="px-1 py-0.5 rounded border bg-card">Enter</kbd> to select
                    </span>
                </div>
            </div>
            <div className="fixed inset-0 -z-10" onClick={() => setIsOpen(false)} />
        </div>
    );
}
