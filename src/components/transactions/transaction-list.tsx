'use client';

import { ArrowUpRight, ArrowDownLeft, Calendar, User, Trash2 } from 'lucide-react';

type Transaction = {
    id: string;
    date: string;
    amount: number;
    type: string;
    note: string;
    employeeName: string;
};

export default function TransactionList({
    transactions,
    onDeleteSuccess
}: {
    transactions: Transaction[],
    onDeleteSuccess: () => void
}) {
    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this transaction?')) return;

        try {
            const res = await fetch(`/api/transactions?id=${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                onDeleteSuccess();
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to delete transaction');
            }
        } catch (error) {
            console.error('Error deleting transaction:', error);
            alert('Failed to delete transaction');
        }
    };
    if (transactions.length === 0) {
        return (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <p className="text-slate-500">No transactions found.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium uppercase text-xs">
                        <tr>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Employee</th>
                            <th className="px-6 py-3">Type</th>
                            <th className="px-6 py-3">Note</th>
                            <th className="px-6 py-3 text-right">Amount</th>
                            <th className="px-6 py-3 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {transactions.map((t) => (
                            <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-3 whitespace-nowrap text-slate-500">
                                    {new Date(t.date).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-3 font-medium text-slate-900">
                                    {t.employeeName}
                                </td>
                                <td className="px-6 py-3">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${t.type === 'advance'
                                        ? 'bg-red-50 text-red-700 border border-red-100'
                                        : 'bg-green-50 text-green-700 border border-green-100'
                                        }`}>
                                        {t.type === 'advance' ? <ArrowUpRight size={12} /> : <ArrowDownLeft size={12} />}
                                        {t.type}
                                    </span>
                                </td>
                                <td className="px-6 py-3 text-slate-500 max-w-xs truncate">
                                    {t.note || '-'}
                                </td>
                                <td className={`px-6 py-3 text-right font-mono font-medium ${t.type === 'advance' ? 'text-red-600' : 'text-green-600'
                                    }`}>
                                    {t.type === 'advance' ? '-' : '+'}₹{t.amount.toLocaleString()}
                                </td>
                                <td className="px-6 py-3 text-right">
                                    <button
                                        onClick={() => handleDelete(t.id)}
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                        title="Delete Transaction"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View (Hidden on Desktop) */}
            <div className="md:hidden">
                {/* Already handled by overflow-x-auto on table, but specific card view could be better. 
                     For simplicity/speed, table scroll is often acceptable for admin dashboards, 
                     but let's do a quick card loop for mobile to match the "Simple" request.
                 */}
            </div>
        </div>
    );
}
