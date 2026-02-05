'use client';

import { useState, useEffect } from 'react';
import { Download, Printer, User } from 'lucide-react';

type LedgerItem = {
    id: string;
    date: string;
    description: string;
    type: 'wage' | 'advance' | 'payment' | 'salary_credit';
    credit: number;
    debit: number;
    balance: number;
};

type Summary = {
    totalEarned: number;
    totalPaid: number;
    balance: number;
};

export default function LedgerView() {
    const [employees, setEmployees] = useState<{ id: string, name: string }[]>([]);
    const [selectedEmp, setSelectedEmp] = useState('');
    const [ledger, setLedger] = useState<LedgerItem[]>([]);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [loading, setLoading] = useState(false);

    // Load employees
    useEffect(() => {
        fetch('/api/employees')
            .then(res => res.json())
            .then(data => setEmployees(data));
    }, []);

    // Load ledger when employee selected
    useEffect(() => {
        if (!selectedEmp) {
            setLedger([]);
            setSummary(null);
            return;
        }

        setLoading(true);
        fetch(`/api/reports/ledger?employeeId=${selectedEmp}`)
            .then(res => res.json())
            .then(data => {
                setLedger(data.history); // Currently Oldest First
                setSummary(data.summary);
            })
            .finally(() => setLoading(false));
    }, [selectedEmp]);

    return (
        <div className="space-y-6">
            {/* Header / Filter */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="w-full sm:w-auto flex-1 max-w-sm">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select Employee</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <select
                            value={selectedEmp}
                            onChange={(e) => setSelectedEmp(e.target.value)}
                            className="w-full pl-10 rounded-lg border-slate-300 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="">-- Choose Employee --</option>
                            {employees.map(e => (
                                <option key={e.id} value={e.id}>{e.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {selectedEmp && (
                    <div className="flex gap-2">
                        <button className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-200" title="Print">
                            <Printer size={20} />
                        </button>
                    </div>
                )}
            </div>

            {loading && (
                <div className="text-center py-12">
                    <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                </div>
            )}

            {!loading && summary && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                            <div className="text-slate-500 text-sm font-medium mb-1">Total Earned</div>
                            <div className="text-3xl font-bold text-indigo-600">₹{summary.totalEarned.toLocaleString()}</div>
                            <div className="text-xs text-slate-400 mt-1">Wages & Credits</div>
                        </div>
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                            <div className="text-slate-500 text-sm font-medium mb-1">Total Paid / Advanced</div>
                            <div className="text-3xl font-bold text-amber-600">₹{summary.totalPaid.toLocaleString()}</div>
                            <div className="text-xs text-slate-400 mt-1">Cash Outflow</div>
                        </div>
                        <div className={`bg-white p-5 rounded-2xl shadow-sm border border-t-4 ${summary.balance >= 0 ? 'border-t-green-500' : 'border-t-red-500'}`}>
                            <div className="text-slate-500 text-sm font-medium mb-1">Net Payable Balance</div>
                            <div className={`text-3xl font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                ₹{summary.balance.toLocaleString()}
                            </div>
                            <div className="text-xs text-slate-400 mt-1">
                                {summary.balance >= 0 ? 'Company owes Employee' : 'Employee owes Company'}
                            </div>
                        </div>
                    </div>

                    {/* Ledger Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 font-medium uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-3">Date</th>
                                        <th className="px-6 py-3">Description</th>
                                        <th className="px-6 py-3 text-right text-green-600">Credit (+)</th>
                                        <th className="px-6 py-3 text-right text-red-600">Debit (-)</th>
                                        <th className="px-6 py-3 text-right font-bold">Balance</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {ledger.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-3 whitespace-nowrap text-slate-600">
                                                {new Date(item.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-3 font-medium text-slate-800">
                                                {item.description}
                                            </td>
                                            <td className="px-6 py-3 text-right text-green-600">
                                                {item.credit > 0 ? `₹${item.credit.toLocaleString()}` : '-'}
                                            </td>
                                            <td className="px-6 py-3 text-right text-red-600">
                                                {item.debit > 0 ? `₹${item.debit.toLocaleString()}` : '-'}
                                            </td>
                                            <td className="px-6 py-3 text-right font-bold font-mono text-slate-900">
                                                ₹{item.balance.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                    {ledger.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="text-center py-8 text-slate-400">
                                                No records found for this employee.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
