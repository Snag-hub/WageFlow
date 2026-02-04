'use strict';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    MapPin,
    ClipboardList,
    Wallet,
    BarChart3,
    Settings,
    X
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Employees', href: '/employees', icon: Users },
    { name: 'Sites', href: '/sites', icon: MapPin },
    { name: 'Attendance', href: '/attendance', icon: ClipboardList },
    { name: 'Transactions', href: '/transactions', icon: Wallet },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={cn(
                    "fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity duration-300",
                    isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            {/* Sidebar Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between h-16 px-6 border-b border-slate-100">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center overflow-hidden">
                                <img src="/logo.png" alt="WageFlow" className="w-full h-full object-cover" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-slate-900">WageFlow</span>
                        </Link>
                        <button
                            onClick={onClose}
                            className="p-2 -mr-2 text-slate-500 lg:hidden hover:text-slate-900"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200",
                                        isActive
                                            ? "bg-slate-900 text-white shadow-md shadow-slate-900/20"
                                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                    )}
                                    onClick={() => {
                                        if (window.innerWidth < 1024) onClose();
                                    }}
                                >
                                    <item.icon size={20} className={cn(isActive ? "text-white" : "text-slate-400")} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="p-4 border-t border-slate-100">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/50">
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center border border-slate-300">
                                <Users size={16} className="text-slate-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-900 truncate">Admin User</p>
                                <p className="text-xs text-slate-500 truncate">Company ID: 123</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
