'use client';

import { useState, useEffect } from 'react';
import { Save, CheckSquare, Square, Users } from 'lucide-react';

type Employee = {
    id: string;
    name: string;
    type: string;
    defaultWage: number;
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
    onSaveSuccess: () => void;
};

export default function AttendanceSheet({ date, siteId, onSaveSuccess }: Props) {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [records, setRecords] = useState<Record<string, AttendanceRecord>>({});
    const [workTypes, setWorkTypes] = useState<{ id: string, name: string }[]>([]);
    const [payers, setPayers] = useState<{ id: string, name: string }[]>([]);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [initialized, setInitialized] = useState(false);

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
                            workTypeId: '', // User must select
                            payerId: ''     // User must select
                        };
                    }
                });

                setRecords(newRecords);
                setInitialized(true);
            })
            .finally(() => setLoading(false));
    }, [date, siteId]);

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
                if (next[key].isPresent) { // Only apply to present (or all? usually present is safer)
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
                alert(`Please select Work Type and Payer for all present employees.`);
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

            alert('Attendance saved successfully!');
            onSaveSuccess();
        } catch (error) {
            console.error(error);
            alert('Error saving attendance');
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
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium uppercase text-xs">
                        <tr>
                            <th className="px-4 py-3 w-12">Status</th>
                            <th className="px-4 py-3">Employee</th>
                            <th className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                    Work Type
                                    <select
                                        className="text-xs border rounded px-1 py-0.5 font-normal normal-case"
                                        onChange={(e) => handleApplyAll('workTypeId', e.target.value)}
                                    >
                                        <option value="">Apply All...</option>
                                        {workTypes.map(wt => <option key={wt.id} value={wt.id}>{wt.name}</option>)}
                                    </select>
                                </div>
                            </th>
                            <th className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                    Payer
                                    <select
                                        className="text-xs border rounded px-1 py-0.5 font-normal normal-case"
                                        onChange={(e) => handleApplyAll('payerId', e.target.value)}
                                    >
                                        <option value="">Apply All...</option>
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
                                <tr key={emp.id} className={rec.isPresent ? 'bg-indigo-50/30' : 'hover:bg-slate-50'}>
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
                                                <option value="">Select...</option>
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
                                                <option value="">Select...</option>
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
        </div>
    );
}
