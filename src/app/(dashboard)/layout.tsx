import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { CommandPalette } from "@/components/navigation/command-palette";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#0f172a]">
            <Sidebar />
            <MobileNav />
            <CommandPalette />
            <div className="lg:pl-64 flex flex-col min-h-screen pt-16 lg:pt-0 pb-16 lg:pb-0">
                <TopBar />
                <main className="flex-1 p-4 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
