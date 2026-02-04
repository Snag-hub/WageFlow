'use client';

import { useState, useEffect } from 'react';
import {
    Briefcase,
    Plus,
    Trash2,
    CreditCard,
    Settings as SettingsIcon
} from 'lucide-react';

interface WorkType {
    id: string;
    name: string;
    _count: {
        attendance: number;
    };
}

interface Payer {
    id: string;
    name: string;
    contactInfo: string | null;
    _count: {
        attendance: number;
    };
}

export default function SettingsPage() {
    const [workTypes, setWorkTypes] = useState<WorkType[]>([]);
    const [payers, setPayers] = useState<Payer[]>([]);
    const [loading, setLoading] = useState(true);
    const [newWorkType, setNewWorkType] = useState('');
    const [newPayer, setNewPayer] = useState({ name: '', contactInfo: '' });
    const [addingWorkType, setAddingWorkType] = useState(false);
    const [addingPayer, setAddingPayer] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [workTypesRes, payersRes] = await Promise.all([
                fetch('/api/work-types'),
                fetch('/api/payers'),
            ]);

            const [workTypesData, payersData] = await Promise.all([
                workTypesRes.json(),
                payersRes.json(),
            ]);

            if (Array.isArray(workTypesData)) setWorkTypes(workTypesData);
            if (Array.isArray(payersData)) setPayers(payersData);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddWorkType = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newWorkType.trim()) return;

        setAddingWorkType(true);
        try {
            const res = await fetch('/api/work-types', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newWorkType }),
            });

            if (res.ok) {
                const data = await res.json();
                setWorkTypes([...workTypes, { ...data, _count: { attendance: 0 } }]);
                setNewWorkType('');
            } else {
                alert('Failed to add work type');
            }
        } catch (error) {
            console.error('Error adding work type:', error);
            alert('Failed to add work type');
        } finally {
            setAddingWorkType(false);
        }
    };

    const handleAddPayer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPayer.name.trim()) return;

        setAddingPayer(true);
        try {
            const res = await fetch('/api/payers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPayer),
            });

            if (res.ok) {
                const data = await res.json();
                setPayers([...payers, { ...data, _count: { attendance: 0 } }]);
                setNewPayer({ name: '', contactInfo: '' });
            } else {
                alert('Failed to add payer');
            }
        } catch (error) {
            console.error('Error adding payer:', error);
            alert('Failed to add payer');
        } finally {
            setAddingPayer(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <SettingsIcon size={28} />
                    Settings
                </h1>
                <p className="text-slate-500 text-sm mt-1">Manage work types, payers, and other master data.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Work Types Section */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Briefcase size={20} className="text-slate-600" />
                            Work Types
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">Job roles like Mason, Helper, Carpenter, etc.</p>
                    </div>

                    <div className="p-4">
                        <form onSubmit={handleAddWorkType} className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={newWorkType}
                                onChange={(e) => setNewWorkType(e.target.value)}
                                placeholder="e.g., Mason, Helper, Electrician"
                                className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                            />
                            <button
                                type="submit"
                                disabled={addingWorkType || !newWorkType.trim()}
                                className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <Plus size={16} />
                                Add
                            </button>
                        </form>

                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                            {loading ? (
                                <div className="text-center py-8">
                                    <div className="inline-block w-6 h-6 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
                                </div>
                            ) : workTypes.length === 0 ? (
                                <div className="text-center py-8 text-slate-400 text-sm">
                                    No work types yet. Add your first one above.
                                </div>
                            ) : (
                                workTypes.map((workType) => (
                                    <div
                                        key={workType.id}
                                        className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                                    >
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{workType.name}</p>
                                            <p className="text-xs text-slate-400">{workType._count.attendance} attendance records</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Payers Section */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <CreditCard size={20} className="text-slate-600" />
                            Payers / Clients
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">People or companies who pay for the work.</p>
                    </div>

                    <div className="p-4">
                        <form onSubmit={handleAddPayer} className="space-y-2 mb-4">
                            <input
                                type="text"
                                value={newPayer.name}
                                onChange={(e) => setNewPayer({ ...newPayer, name: e.target.value })}
                                placeholder="Payer name (e.g., ABC Construction)"
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                            />
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newPayer.contactInfo}
                                    onChange={(e) => setNewPayer({ ...newPayer, contactInfo: e.target.value })}
                                    placeholder="Contact (optional)"
                                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                                />
                                <button
                                    type="submit"
                                    disabled={addingPayer || !newPayer.name.trim()}
                                    className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    <Plus size={16} />
                                    Add
                                </button>
                            </div>
                        </form>

                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                            {loading ? (
                                <div className="text-center py-8">
                                    <div className="inline-block w-6 h-6 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
                                </div>
                            ) : payers.length === 0 ? (
                                <div className="text-center py-8 text-slate-400 text-sm">
                                    No payers yet. Add your first one above.
                                </div>
                            ) : (
                                payers.map((payer) => (
                                    <div
                                        key={payer.id}
                                        className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                                    >
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{payer.name}</p>
                                            {payer.contactInfo && (
                                                <p className="text-xs text-slate-500">{payer.contactInfo}</p>
                                            )}
                                            <p className="text-xs text-slate-400">{payer._count.attendance} attendance records</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
