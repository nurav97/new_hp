import {
    LayoutDashboard,
    Users,
    Stethoscope,
    Microscope,
    Calendar,
    ClipboardList,
    FileText,
    Search,
    Bell,
    Settings,
    LogOut,
    Menu,
    X,
    Dna,
    ShieldCheck,
    CreditCard,
    Activity
} from "lucide-react";

export type NavItem = {
    title: string;
    href: string;
    icon: any;
    roles?: string[];
};

export const dashboardNavItems: NavItem[] = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Patients",
        href: "/patients",
        icon: Users,
    },
    {
        title: "Triage Queue",
        href: "/triage",
        icon: Activity,
        roles: ["ADMIN", "DOCTOR", "NURSE"],
    },
    {
        title: "Appointments",
        href: "/appointments",
        icon: Calendar,
    },
    {
        title: "Treatment Plans",
        href: "/treatment-plans",
        icon: Stethoscope,
        roles: ["ADMIN", "DOCTOR", "SPECIALIST"],
    },
    {
        title: "Lab Results",
        href: "/labs",
        icon: Microscope,
    },
    {
        title: "Reports",
        href: "/reports",
        icon: FileText,
    },
    {
        title: "Billing",
        href: "/billing",
        icon: CreditCard,
        roles: ["ADMIN", "BILLING"],
    },
    {
        title: "Compliance",
        href: "/compliance",
        icon: ShieldCheck,
        roles: ["ADMIN", "COMPLIANCE"],
    },
];

export const footerNavItems: NavItem[] = [
    {
        title: "Settings",
        href: "/settings",
        icon: Settings,
    },
];
