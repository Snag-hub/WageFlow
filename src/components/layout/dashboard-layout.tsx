import { Navbar } from './navbar';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <Navbar />

                <main className="flex-1 relative overflow-y-auto focus:outline-none p-4 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
