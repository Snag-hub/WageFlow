'use client';

import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
};

export default function AddTransactionModal({ isOpen, onClose, onSuccess }: Props) {
    const [employees, setEmployees] = useState<{ id: string, name: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [employeeId, setEmployeeId] = useState('');
    const [type, setType] = useState('advance'); // advance, payment
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [note, setNote] = useState('');

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            fetch('/api/employees')
                .then(res => res.json())
                .then(data => setEmployees(data))
                .finally(() => setLoading(false));
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    employeeId,
                    type,
                    amount,
                    date,
                    note
                })
            });

            if (!res.ok) throw new Error('Failed to save');

            setEmployeeId('');
            setAmount('');
            setNote('');
            onSuccess();
            onClose();
        } catch (error) {
            alert('Error saving transaction');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h2 className="text-lg font-bold text-slate-900">Add Transaction</h2>
                    <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Employee</label>
                        <select
                            required
                            value={employeeId}
                            onChange={(e) => setEmployeeId(e.target.value)}
                            className="w-full rounded-xl border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                        >
                            <option value="">Select Employee...</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                            <div className="flex bg-slate-100 p-1 rounded-xl">
                                <button
                                    type="button"
                                    onClick={() => setType('advance')}
                                    className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all ${type === 'advance'
                                            ? 'bg-white text-red-600 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    Advance
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setType('payment')}
                                    className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all ${type === 'payment'
                                            ? 'bg-white text-green-600 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    Payment
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
                            <input
                                type="number"
                                required
                                min="1"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full rounded-xl border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                        <input
                            type="date"
                            required
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full rounded-xl border-slate-200 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Note (Optional)</label>
                        <textarea
                            rows={3}
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="w-full rounded-xl border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                            placeholder="Reason for advance..."
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={submitting}
                            className={`w-full py-3 rounded-xl font-bold text-white shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 ${type === 'advance' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                                }`}
                        >
                            <Save size={18} />
                            {submitting ? 'Saving...' : type === 'advance' ? 'Record Advance' : 'Record Payment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
