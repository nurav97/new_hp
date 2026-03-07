import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Users,
    Settings as SettingsIcon,
    Database,
    Bell,
    Lock,
    Mail,
    Globe,
    Monitor,
    Cpu,
    ShieldCheck,
    ChevronRight
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface SettingItem {
    label: string;
    icon: any;
    desc: string;
    badge?: string;
}

interface SettingGroup {
    title: string;
    description: string;
    items: SettingItem[];
}

const settingGroups: SettingGroup[] = [
    {
        title: "Account & Profile",
        description: "Manage your personal information and preferences.",
        items: [
            { label: "Profile Information", icon: Users, desc: "Edit name, avatar, and specialty" },
            { label: "Security & MFA", icon: Lock, desc: "Password and two-factor authentication", badge: "Required" },
            { label: "Notifications", icon: Bell, desc: "Email and clinical alert triggers" },
        ]
    },
    {
        title: "Clinical System",
        description: "Global clinical defaults and triage rules.",
        items: [
            { label: "Triage Rules Engine", icon: Cpu, desc: "Modify AI-driven priority calculation" },
            { label: "Lab Integrations", icon: Database, desc: "Manage external diagnostic partners" },
            { label: "Anatomical Presets", icon: Monitor, desc: "3D Body Map layer configurations" },
        ]
    },
    {
        title: "Organization",
        description: "Whitelabeling and organizational hierarchy.",
        items: [
            { label: "Branding & Theme", icon: Globe, desc: "Custom logos and accent colors" },
            { label: "User Management", icon: UserCheck, desc: "Manage staff roles and access levels" },
            { label: "Compliance Standards", icon: ShieldCheck, desc: "HIPAA and GDPR configuration" },
        ]
    }
];

export default function SettingsPage() {
    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">System Settings</h1>
                <p className="text-muted-foreground mt-1">Configure global application behavior and security protocols.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-4">
                    <Card className="bg-card/40 border-border/50 sticky top-24">
                        <CardHeader>
                            <CardTitle className="text-sm font-bold text-white uppercase tracking-widest">System Health</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                { label: "Supabase DB", status: "Operational", color: "emerald" },
                                { label: "Auth Service", status: "Operational", color: "emerald" },
                                { label: "3D Engine", status: "Optimized", color: "sky" },
                                { label: "AI Triage", status: "Active", color: "emerald" },
                            ].map((s, i) => (
                                <div key={i} className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">{s.label}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-white font-medium">{s.status}</span>
                                        <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", `bg-${s.color}-500`)} />
                                    </div>
                                </div>
                            ))}
                            <Separator className="bg-border/30" />
                            <div className="space-y-2">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase">Version Control</p>
                                <p className="text-[10px] text-white font-mono">v1.4.2-stable (EHCP-CORE)</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-2 space-y-8">
                    {settingGroups.map((group, idx) => (
                        <div key={idx} className="space-y-4">
                            <div>
                                <h3 className="text-lg font-bold text-white">{group.title}</h3>
                                <p className="text-xs text-muted-foreground">{group.description}</p>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                {group.items.map((item, i) => (
                                    <button
                                        key={i}
                                        className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border/30 hover:border-primary/50 hover:bg-secondary/20 transition-all text-left group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                                                <item.icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-white">{item.label}</span>
                                                    {item.badge && <Badge className="text-[9px] h-4 px-1.5 bg-rose-500/10 text-rose-500 border-rose-500/20">{item.badge}</Badge>}
                                                </div>
                                                <p className="text-[10px] text-muted-foreground mt-0.5">{item.desc}</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-white transition-colors" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function UserCheck(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <polyline points="16 11 18 13 22 9" />
        </svg>
    )
}
