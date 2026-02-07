'use client';

import { useState, useEffect } from 'react';
import { Save, CheckSquare, Square, Users, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';

type Employee = {
    id: string;
    name: string;
    type: string;
    defaultWage: number;
    defaultWorkTypeId?: string;
};

type AttendanceRecord = {
    id?: string;
    employeeId: string;
    isPresent: boolean;
    wage: number;
    workTypeId: string;
    payerId: string;
};

type Props = {
    date: Date;
    siteId: string;
    payerId: string;
    onSaveSuccess: () => void;
};

export default function AttendanceSheet({ date, siteId, payerId, onSaveSuccess }: Props) {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [records, setRecords] = useState<Record<string, AttendanceRecord>>({});
    const [workTypes, setWorkTypes] = useState<{ id: string, name: string }[]>([]);
    const [payers, setPayers] = useState<{ id: string, name: string }[]>([]);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [initialized, setInitialized] = useState(false);

    // Quick Add State
    const [showAddModal, setShowAddModal] = useState<'workType' | null>(null);
    const [newItemName, setNewItemName] = useState('');
    const [addingItem, setAddingItem] = useState(false);

    const handleQuickAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemName.trim() || !showAddModal) return;

        setAddingItem(true);
        const endpoint = '/api/work-types';

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newItemName })
            });

            if (res.ok) {
                const data = await res.json();
                setWorkTypes(prev => [...prev, data]);
                setShowAddModal(null);
                setNewItemName('');
            } else {
                toast.error('Failed to add item');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error adding item');
        } finally {
            setAddingItem(false);
        }
    };

    // Fetch dependent data (Work Types, Payers)
    useEffect(() => {
        Promise.all([
            fetch('/api/work-types').then(res => res.json()),
            fetch('/api/payers').then(res => res.json())
        ]).then(([dataWorkTypes, dataPayers]) => {
            setWorkTypes(dataWorkTypes);
            setPayers(dataPayers);
        });
    }, []);

    // Fetch Employees & Existing Attendance for Date/Site
    useEffect(() => {
        if (!siteId || !date) return;

        setLoading(true);
        const dateStr = date.toISOString().split('T')[0];

        fetch(`/api/attendance?date=${dateStr}&siteId=${siteId}`)
            .then(res => res.json())
            .then(data => {
                setEmployees(data.employees);

                const newRecords: Record<string, AttendanceRecord> = {};

                // Initialize records for all employees
                data.employees.forEach((emp: Employee) => {
                    const existing = data.attendance.find((a: any) => a.employeeId === emp.id);

                    if (existing) {
                        newRecords[emp.id] = {
                            employeeId: emp.id,
                            isPresent: true,
                            wage: existing.wage,
                            workTypeId: existing.workTypeId,
                            payerId: existing.payerId,
                            id: existing.id
                        };
                    } else {
                        // Default state for new entry
                        newRecords[emp.id] = {
                            employeeId: emp.id,
                            isPresent: false,
                            wage: emp.defaultWage,
                            workTypeId: emp.defaultWorkTypeId || '',
                            payerId: payerId
                        };
                    }
                });

                setRecords(newRecords);
                setInitialized(true);
            })
            .finally(() => setLoading(false));
    }, [date, siteId, payerId]);

    const updateRecord = (empId: string, field: keyof AttendanceRecord, value: any) => {
        setRecords(prev => ({
            ...prev,
            [empId]: { ...prev[empId], [field]: value }
        }));
    };

    const togglePresence = (empId: string) => {
        setRecords(prev => {
            const current = prev[empId];
            return {
                ...prev,
                [empId]: { ...current, isPresent: !current.isPresent }
            };
        });
    };

    const handleApplyAll = (field: 'workTypeId' | 'payerId', value: string) => {
        if (!value) return;
        setRecords(prev => {
            const next = { ...prev };
            Object.keys(next).forEach(key => {
                if (next[key].isPresent) {
                    next[key] = { ...next[key], [field]: value };
                }
            });
            return next;
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Find records marked present but missing data
            const invalidRecs = Object.values(records)
                .filter(r => r.isPresent && (!r.workTypeId || !r.payerId));

            if (invalidRecs.length > 0) {
                toast.warning(`Please select Work Type and Payer for all present employees.`);
                setSaving(false);
                return;
            }

            const payload = {
                date: date.toISOString(),
                siteId,
                records: Object.values(records).map(r => ({
                    employeeId: r.employeeId,
                    isPresent: r.isPresent,
                    wage: r.wage,
                    workTypeId: r.workTypeId,
                    payerId: r.payerId
                }))
            };

            const res = await fetch('/api/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Failed to save');

            toast.success('Attendance saved successfully!');
            onSaveSuccess();
        } catch (error) {
            console.error(error);
            toast.error('Error saving attendance');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading sheet...</div>;
    if (!initialized) return <div className="p-8 text-center text-slate-500">Select a Site and Date to begin.</div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                    <Users size={18} className="text-slate-400" />
                    <span className="font-semibold text-slate-700">{employees.length} Employees</span>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                    <Save size={18} />
                    {saving ? 'Saving...' : 'Save Attendance'}
                </button>

                <button
                    onClick={async () => {
                        if (confirm('Are you sure you want to CLEAR ALL records for this site and date? This cannot be undone.')) {
                            setSaving(true);
                            try {
                                const dateStr = date.toISOString().split('T')[0];
                                const res = await fetch(`/api/attendance?date=${dateStr}&siteId=${siteId}`, {
                                    method: 'DELETE'
                                });
                                if (res.ok) {
                                    alert('Attendance cleared successfully!');
                                    // Reset local records to absent
                                    const resetRecs = { ...records };
                                    Object.keys(resetRecs).forEach(key => {
                                        resetRecs[key] = { ...resetRecs[key], isPresent: false };
                                    });
                                    setRecords(resetRecs);
                                } else {
                                    const data = await res.json();
                                    alert(data.message || 'Failed to clear attendance');
                                }
                            } catch (err) {
                                console.error(err);
                                alert('Error clearing attendance');
                            } finally {
                                setSaving(false);
                            }
                        }
                    }}
                    disabled={saving}
                    className="flex items-center gap-2 bg-red-50 text-red-600 px-6 py-2 rounded-lg font-medium hover:bg-red-100 disabled:opacity-50 transition-colors"
                >
                    <Trash2 size={18} />
                    Clear Sheet
                </button>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium uppercase text-xs">
                        <tr>
                            <th className="px-4 py-3 w-12">Status</th>
                            <th className="px-4 py-3">Employee</th>
                            <th className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                    Work Type / Role
                                    <button
                                        onClick={() => setShowAddModal('workType')}
                                        className="text-indigo-600 hover:bg-indigo-50 rounded p-0.5"
                                        title="Add New Work Type"
                                    >
                                        <Plus size={14} />
                                    </button>
                                    <select
                                        className="text-xs border rounded px-1 py-0.5 font-normal normal-case ml-auto"
                                        onChange={(e) => handleApplyAll('workTypeId', e.target.value)}
                                    >
                                        <option value="">Apply All Roles...</option>
                                        {workTypes.map(wt => <option key={wt.id} value={wt.id}>{wt.name}</option>)}
                                    </select>
                                </div>
                            </th>
                            <th className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                    Payer
                                    <select
                                        className="text-xs border rounded px-1 py-0.5 font-normal normal-case ml-auto"
                                        onChange={(e) => handleApplyAll('payerId', e.target.value)}
                                    >
                                        <option value="">Apply All Payers...</option>
                                        {payers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                            </th>
                            <th className="px-4 py-3 w-32">Wage (₹)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {employees.map(emp => {
                            const rec = records[emp.id];
                            if (!rec) return null;

                            return (
                                <tr key={emp.id} className={rec.isPresent ? 'bg-indigo-50' : 'hover:bg-slate-50'}>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => togglePresence(emp.id)}
                                            className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${rec.isPresent
                                                ? 'bg-indigo-600 text-white'
                                                : 'border-2 border-slate-300 text-transparent hover:border-slate-400'
                                                }`}
                                        >
                                            <CheckSquare size={16} />
                                        </button>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-slate-900">{emp.name}</div>
                                        <div className="text-xs text-slate-500 capitalize">{emp.type}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {rec.isPresent && (
                                            <select
                                                value={rec.workTypeId}
                                                onChange={(e) => updateRecord(emp.id, 'workTypeId', e.target.value)}
                                                className="w-full border-slate-200 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            >
                                                <option value="">Select Role...</option>
                                                {workTypes.map(wt => (
                                                    <option key={wt.id} value={wt.id}>{wt.name}</option>
                                                ))}
                                            </select>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {rec.isPresent && (
                                            <select
                                                value={rec.payerId}
                                                onChange={(e) => updateRecord(emp.id, 'payerId', e.target.value)}
                                                className="w-full border-slate-200 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            >
                                                <option value="">Select Payer...</option>
                                                {payers.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                ))}
                                            </select>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {rec.isPresent && (
                                            <input
                                                type="number"
                                                value={rec.wage}
                                                onChange={(e) => updateRecord(emp.id, 'wage', parseFloat(e.target.value))}
                                                className="w-full border-slate-200 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3 p-4 bg-slate-50">
                {/* Mobile Bulk Actions */}
                <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 mb-4 text-center">
                    <div className="text-xs font-bold text-slate-500 uppercase mb-2">Role Actions</div>
                    <div className="flex gap-3">
                        <select
                            className="text-xs border-slate-200 rounded px-2 py-1.5 w-full"
                            onChange={(e) => handleApplyAll('workTypeId', e.target.value)}
                        >
                            <option value="">Apply Role to All...</option>
                            {workTypes.map(wt => <option key={wt.id} value={wt.id}>{wt.name}</option>)}
                        </select>
                        <select
                            className="text-xs border-slate-200 rounded px-2 py-1.5 w-full"
                            onChange={(e) => handleApplyAll('payerId', e.target.value)}
                        >
                            <option value="">Apply Payer to All...</option>
                            {payers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <button onClick={() => setShowAddModal('workType')} className="text-indigo-600 border border-indigo-100 rounded px-3 py-1 bg-indigo-50 flex items-center gap-1 font-bold text-xs whitespace-nowrap">
                            <Plus size={14} /> NEW
                        </button>
                    </div>
                </div>

                {employees.map(emp => {
                    const rec = records[emp.id];
                    if (!rec) return null;

                    return (
                        <div
                            key={emp.id}
                            onClick={(e) => {
                                // Prevent toggle if clicking internal inputs
                                if ((e.target as HTMLElement).tagName === 'SELECT' || (e.target as HTMLElement).tagName === 'INPUT') return;
                                togglePresence(emp.id);
                            }}
                            className={`p-4 rounded-xl border transition-all duration-200 relative overflow-hidden ${rec.isPresent
                                ? 'bg-white border-indigo-600 shadow-md ring-1 ring-indigo-600'
                                : 'bg-slate-100/50 border-slate-200 opacity-80'
                                }`}
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-colors ${rec.isPresent ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-400'
                                    }`}>
                                    {emp.name.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <div className={`font-semibold ${rec.isPresent ? 'text-slate-900' : 'text-slate-500'}`}>
                                        {emp.name}
                                    </div>
                                    <div className="text-xs text-slate-500 capitalize">{emp.type} • ₹{emp.defaultWage}/day</div>
                                </div>
                                {rec.isPresent && (
                                    <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white">
                                        <CheckSquare size={14} />
                                    </div>
                                )}
                            </div>

                            {/* Expanded Details when Present */}
                            {rec.isPresent && (
                                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 animate-in slide-in-from-top-2 fade-in">
                                    <div className="col-span-1">
                                        <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Role</label>
                                        <select
                                            value={rec.workTypeId}
                                            onChange={(e) => updateRecord(emp.id, 'workTypeId', e.target.value)}
                                            className="w-full text-sm border-slate-200 rounded-lg py-1.5 focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            <option value="">Select Role...</option>
                                            {workTypes.map(wt => <option key={wt.id} value={wt.id}>{wt.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-span-1">
                                        <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Payer</label>
                                        <select
                                            value={rec.payerId}
                                            onChange={(e) => updateRecord(emp.id, 'payerId', e.target.value)}
                                            className="w-full text-sm border-slate-200 rounded-lg py-1.5 focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            <option value="">Select Payer...</option>
                                            {payers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <input
                                            type="number"
                                            value={rec.wage}
                                            onChange={(e) => updateRecord(emp.id, 'wage', parseFloat(e.target.value))}
                                            className="w-full text-sm border-slate-200 rounded-lg py-1.5 font-mono focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Quick Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm animate-in zoom-in-95">
                        <h3 className="text-lg font-bold mb-4">Add Work Type</h3>
                        <form onSubmit={handleQuickAdd}>
                            <input
                                autoFocus
                                type="text"
                                className="w-full border-slate-200 rounded-xl mb-4 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Enter Role Name"
                                value={newItemName}
                                onChange={(e) => setNewItemName(e.target.value)}
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => { setShowAddModal(null); setNewItemName(''); }}
                                    className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!newItemName.trim() || addingItem}
                                    className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {addingItem ? 'Adding...' : 'Add'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
