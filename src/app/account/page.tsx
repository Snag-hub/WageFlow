'use client';

import { useSession, signOut } from 'next-auth/react';
import { User, Mail, Building2, LogOut, ShieldCheck } from 'lucide-react';

export default function AccountPage() {
    const { data: session } = useSession();

    if (!session || !session.user) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    const { user } = session;

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Account Settings</h1>
                <p className="text-slate-500 text-sm mt-1">Manage your profile and account security.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    {/* Profile Card */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-slate-100 flex flex-col sm:flex-row items-center gap-6">
                            <div className="w-24 h-24 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-3xl font-bold">
                                {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                            </div>
                            <div className="text-center sm:text-left">
                                <h2 className="text-2xl font-bold text-slate-900">{user.name || 'User'}</h2>
                                <p className="text-slate-500">{user.email}</p>
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full mt-2 border border-indigo-100 uppercase tracking-wider">
                                    <ShieldCheck size={14} />
                                    {user.role || 'Member'}
                                </div>
                            </div>
                        </div>

                        <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <Mail size={14} />
                                    Email Address
                                </p>
                                <p className="text-slate-900 font-medium">{user.email}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <Building2 size={14} />
                                    Company Name
                                </p>
                                <p className="text-slate-900 font-medium">{user.companyName || 'N/A'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <User size={14} />
                                    Company ID
                                </p>
                                <p className="text-xs font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100 w-fit">
                                    {user.companyId || 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Security Info */}
                    <div className="bg-slate-900 rounded-3xl p-8 text-white">
                        <h3 className="text-lg font-bold mb-2">Account Security</h3>
                        <p className="text-slate-400 text-sm mb-6">
                            Your account is secured with standard encryption. No sensitive password data is ever shown here.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <div className="bg-white/10 px-4 py-2 rounded-xl text-sm font-medium border border-white/10">
                                TFA: Disabled
                            </div>
                            <div className="bg-white/10 px-4 py-2 rounded-xl text-sm font-medium border border-white/10 text-green-400">
                                Session Active
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Logout Actions */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
                        <h3 className="font-bold text-slate-900">Session Controls</h3>
                        <p className="text-sm text-slate-500">
                            Log out of your current session on this device.
                        </p>
                        <button
                            onClick={() => signOut({ callbackUrl: '/auth/login' })}
                            className="flex items-center justify-center gap-2 w-full py-3 bg-red-50 text-red-600 font-bold rounded-2xl hover:bg-red-100 transition-all border border-red-100"
                        >
                            <LogOut size={18} />
                            Log Out
                        </button>
                    </div>

                    <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200">
                        <h3 className="font-bold mb-2">Need Help?</h3>
                        <p className="text-sm text-indigo-100 mb-4 text-pretty">
                            If you're having issues with your account or company data, please contact support.
                        </p>
                        <button className="w-full py-2.5 bg-white text-indigo-600 font-bold rounded-xl text-sm hover:bg-indigo-50 transition-colors">
                            Contact Support
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
