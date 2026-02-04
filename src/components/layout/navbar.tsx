'use client';

import { Menu, Bell, Search } from 'lucide-react';

interface NavbarProps {
    onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
    return (
        <header className="sticky top-0 z-30 flex items-center h-16 px-4 bg-white/80 backdrop-blur-md border-b border-slate-200 lg:px-6">
            <button
                onClick={onMenuClick}
                className="p-2 -ml-2 text-slate-500 lg:hidden hover:text-slate-900 transition-colors"
            >
                <Menu size={24} />
            </button>

            <div className="flex-1 px-4 lg:px-0">
                <div className="relative max-w-md w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-100/50 border-none rounded-xl text-sm focus:ring-2 focus:ring-slate-900 transition-all"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 lg:gap-4">
                <button className="relative p-2 text-slate-500 hover:text-slate-900 transition-colors rounded-xl hover:bg-slate-100">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                </button>

                <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block" />

                <button className="flex items-center gap-2 p-1 pl-1 pr-2 rounded-xl hover:bg-slate-100 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                        A
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-slate-700 truncate max-w-[100px]">Admin</span>
                </button>
            </div>
        </header>
    );
}
