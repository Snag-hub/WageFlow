'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    User,
    Phone,
    IndianRupee,
    Briefcase,
    Save,
    Loader2,
    AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function NewEmployeePage() {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        type: 'daily',
        defaultWage: '',
        defaultWorkTypeId: '',
    });
    const [workTypes, setWorkTypes] = useState<{ id: string, name: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        fetch('/api/work-types')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setWorkTypes(data);
            })
            .catch(err => console.error('Error fetching work types:', err));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/employees', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to create employee');
            }

            router.push('/employees');
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/employees"
                        className="p-2 text-slate-500 hover:text-slate-900 bg-white border border-slate-200 rounded-xl transition-all"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Add New Employee</h1>
                        <p className="text-slate-500 text-sm">Fill in the details for the new staff member.</p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100">
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
                                placeholder="e.g. Rahul Sharma"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Phone Number (Optional)</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                                placeholder="e.g. +91 9876543210"
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
                                placeholder="e.g. 500"
                            />
                        </div>
                        <p className="text-xs text-slate-400 ml-1">This will be used as the default for attendance entries.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Default Role / Work Type</label>
                        <div className="relative">
                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <select
                                value={formData.defaultWorkTypeId}
                                onChange={(e) => setFormData({ ...formData, defaultWorkTypeId: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition-all appearance-none cursor-pointer"
                            >
                                <option value="">-- Select Work Type --</option>
                                {workTypes.map(wt => (
                                    <option key={wt.id} value={wt.id}>{wt.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row gap-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        {loading ? 'Saving...' : 'Save Employee'}
                    </button>
                    <Link
                        href="/employees"
                        className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center"
                    >
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}
