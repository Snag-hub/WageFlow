'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, User, Phone, IndianRupee, Briefcase, Save, Loader2, AlertCircle, Trash2, Wallet } from 'lucide-react';
import Link from 'next/link';

interface Employee {
    id: string;
    name: string;
    phone: string | null;
    type: string;
    defaultWage: number;
    attendance: any[];
    transactions: any[];
    _count: {
        attendance: number;
        transactions: number;
    };
}

export default function EmployeeDashboardPage() {
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'profile'>('overview');
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        type: 'daily',
        defaultWage: '',
    });

    useEffect(() => {
        fetchEmployee();
    }, []);

    const fetchEmployee = async () => {
        try {
            const res = await fetch(`/api/employees/${params.id}`);
            if (res.ok) {
                const data: Employee = await res.json();
                setEmployee(data);
                setFormData({
                    name: data.name,
                    phone: data.phone || '',
                    type: data.type,
                    defaultWage: data.defaultWage.toString(),
                });
            } else {
                setError('Employee not found');
            }
        } catch (err) {
            console.error(err);
            setError('Failed to load employee details');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            const res = await fetch(`/api/employees/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    defaultWage: parseFloat(formData.defaultWage) || 0
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to update employee');
            }

            // After update, refresh data and maybe switch tab or stay
            await fetchEmployee();
            setActiveTab('overview');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-slate-900" size={32} />
            </div>
        );
    }

    if (error && !employee) {
        return (
            <div className="p-8 text-center border border-slate-200 rounded-2xl bg-white shadow-sm">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-4">
                    <AlertCircle size={32} />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Error</h2>
                <p className="text-slate-500 mb-6">{error}</p>
                <Link href="/employees" className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold">
                    Go Back
                </Link>
            </div>
        );
    }

    // Calculations for Stats
    const totalEarnings = employee?.attendance.reduce((sum, a) => sum + (a.wage || 0), 0) || 0;
    const totalAdvances = employee?.transactions
        .filter(t => t.type === 'advance')
        .reduce((sum, t) => sum + t.amount, 0) || 0;
    const totalPayments = employee?.transactions
        .filter(t => t.type === 'payment')
        .reduce((sum, t) => sum + t.amount, 0) || 0;
    const netBalance = totalEarnings - (totalAdvances - totalPayments);

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/employees"
                        className="p-2 text-slate-500 hover:text-slate-900 bg-white border border-slate-200 rounded-xl transition-all"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{employee?.name}</h1>
                        <p className="text-slate-500 text-sm font-medium">{employee?.type === 'daily' ? 'Daily Wage' : 'Fixed Salary'} Worker</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${activeTab === 'profile' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                        Edit Profile
                    </button>
                </div>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <IndianRupee size={20} />
                        </div>
                        <span className="text-slate-500 font-bold text-xs uppercase tracking-wider">Net Balance</span>
                    </div>
                    <div className={`text-2xl font-bold ${netBalance > 0 ? 'text-emerald-600' : netBalance < 0 ? 'text-red-600' : 'text-slate-900'}`}>
                        ₹{netBalance.toLocaleString()}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">Earnings minus advances</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                            <Briefcase size={20} />
                        </div>
                        <span className="text-slate-500 font-bold text-xs uppercase tracking-wider">Total Attendance</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                        {employee?._count.attendance} <span className="text-sm font-normal text-slate-400 ml-1">Days</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">Total registered work days</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                            <Phone size={20} />
                        </div>
                        <span className="text-slate-500 font-bold text-xs uppercase tracking-wider">Contact</span>
                    </div>
                    <div className="text-lg font-bold text-slate-900">
                        {employee?.phone || 'No phone'}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">Personal mobile number</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-6 py-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'overview' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                    Overview
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`px-6 py-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'history' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                    History
                </button>
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`px-6 py-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'profile' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                    Profile
                </button>
            </div>

            {/* Tab Content */}
            <div className="min-h-[300px]">
                {activeTab === 'overview' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
                            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 text-slate-300">
                                <User size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Welcome to {employee?.name}'s Hub</h3>
                            <p className="text-slate-500 max-w-sm mx-auto text-sm">
                                View attendance logs, advance history, and manage profile information all in one place.
                            </p>
                            <div className="mt-8 flex flex-wrap justify-center gap-3">
                                <button
                                    onClick={() => setActiveTab('history')}
                                    className="px-6 py-2 bg-slate-900 text-white font-bold rounded-xl text-sm shadow-md shadow-slate-900/10"
                                >
                                    View History
                                </button>
                                <Link
                                    href="/attendance"
                                    className="px-6 py-2 bg-white border border-slate-200 text-slate-900 font-bold rounded-xl text-sm hover:bg-slate-50"
                                >
                                    Mark Attendance
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {/* Summary of History */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                        <Briefcase size={16} className="text-indigo-600" />
                                        Recent Attendance
                                    </h3>
                                    <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">Last 10</span>
                                </div>
                                <div className="divide-y divide-slate-50">
                                    {employee?.attendance.length === 0 ? (
                                        <p className="p-8 text-center text-slate-400 text-xs italic">No attendance records yet.</p>
                                    ) : (
                                        employee?.attendance.map((a: any) => (
                                            <div key={a.id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">{new Date(a.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</p>
                                                    <p className="text-[10px] text-slate-500 font-medium">{a.site.name}</p>
                                                </div>
                                                <div className="text-right font-mono font-bold text-indigo-600 text-sm">
                                                    ₹{a.wage}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                        <Wallet size={16} className="text-orange-600" />
                                        Recent Transactions
                                    </h3>
                                    <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">Last 10</span>
                                </div>
                                <div className="divide-y divide-slate-50">
                                    {employee?.transactions.length === 0 ? (
                                        <p className="p-8 text-center text-slate-400 text-xs italic">No transaction records yet.</p>
                                    ) : (
                                        employee?.transactions.map((t: any) => (
                                            <div key={t.id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">{new Date(t.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</p>
                                                    <p className="text-[10px] text-slate-500 font-medium capitalize">{t.type}</p>
                                                </div>
                                                <div className={`text-right font-mono font-bold text-sm ${t.type === 'advance' ? 'text-red-600' : 'text-green-600'}`}>
                                                    {t.type === 'advance' ? '-' : '+'}₹{t.amount}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'profile' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {error && (
                            <div className="flex items-center gap-3 p-4 mb-6 bg-red-50 text-red-700 rounded-2xl border border-red-100">
                                <AlertCircle size={20} />
                                <p className="text-sm font-medium">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Employee Type</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="daily">Daily Wage</option>
                                            <option value="salary">Fixed Salary</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Default Wage / Salary (₹)</label>
                                    <div className="relative">
                                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="number"
                                            required
                                            value={formData.defaultWage}
                                            onChange={(e) => setFormData({ ...formData, defaultWage: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex flex-col sm:flex-row gap-4">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-[2] py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
                                >
                                    {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                    {saving ? 'Updating...' : 'Update Profile'}
                                </button>
                                <button
                                    type="button"
                                    onClick={async () => {
                                        if (confirm('Are you sure you want to delete this employee? This will permanently remove all related logs.')) {
                                            setSaving(true);
                                            try {
                                                const res = await fetch(`/api/employees/${params.id}`, { method: 'DELETE' });
                                                if (res.ok) {
                                                    router.push('/employees');
                                                    router.refresh();
                                                } else {
                                                    const data = await res.json();
                                                    setError(data.message || 'Failed to delete');
                                                }
                                            } catch (err) {
                                                setError('An error occurred');
                                            } finally {
                                                setSaving(false);
                                            }
                                        }
                                    }}
                                    className="flex-1 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                                >
                                    <Trash2 size={20} />
                                    Delete
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
