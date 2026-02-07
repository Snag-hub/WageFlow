'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Bell, Search, LayoutGrid } from 'lucide-react';
import { Logo } from '@/components/ui/logo';

export function Navbar() {
    const { data: session } = useSession();

    return (
        <header className="sticky top-0 z-30 flex items-center h-16 px-4 bg-white/80 backdrop-blur-md border-b border-slate-200 lg:px-8">
            {/* Logo / Home Hub Link */}
            <div className="flex items-center gap-4">
                <Link href="/" className="flex items-center gap-2 group">
                    <Logo size={36} className="group-hover:scale-110 transition-transform" />
                    <span className="hidden sm:block text-lg font-black tracking-tighter text-slate-900 leading-none">WageFlow</span>
                </Link>

                <div className="hidden lg:block w-px h-6 bg-slate-200 mx-2" />

                <Link
                    href="/"
                    className="hidden lg:flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg hover:bg-slate-100"
                >
                    <LayoutGrid size={16} />
                    Hub
                </Link>
            </div>

            <div className="flex-1 flex justify-center px-4">
                <div className="relative max-w-sm w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="Search records..."
                        className="w-full pl-10 pr-4 py-1.5 bg-slate-100/50 border-transparent border focus:border-slate-200 rounded-xl text-sm focus:ring-0 focus:bg-white transition-all shadow-inner"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 lg:gap-4">
                <button className="relative p-2 text-slate-500 hover:text-slate-900 transition-colors rounded-xl hover:bg-slate-100 group">
                    <Bell size={18} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white group-hover:scale-125 transition-transform" />
                </button>

                <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block" />

                <Link
                    href="/account"
                    className="flex items-center gap-2 p-1 pl-1 pr-1 sm:pr-2 rounded-xl hover:bg-slate-100 transition-all group"
                >
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-indigo-600/20 group-hover:scale-110 transition-transform">
                        {session?.user?.companyName?.charAt(0) || session?.user?.name?.charAt(0) || 'WF'}
                    </div>
                    <div className="hidden sm:flex flex-col items-start leading-none gap-1">
                        <span className="text-[11px] font-black text-slate-900 uppercase tracking-tighter truncate max-w-[80px]">
                            {session?.user?.name || 'Administrator'}
                        </span>
                    </div>
                </Link>
            </div>
        </header>
    );
}
