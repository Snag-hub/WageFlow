'use client';

import { useState, useEffect } from 'react';
import { Plus, Filter } from 'lucide-react';
import TransactionList from '@/components/transactions/transaction-list';
import AddTransactionModal from '@/components/transactions/add-transaction-modal';

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchTransactions = () => {
        setLoading(true);
        fetch('/api/transactions?limit=100')
            .then(res => res.json())
            .then(data => setTransactions(data))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Financial Transactions</h1>
                    <p className="text-slate-500 text-sm">Record advances and payments</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 hover:shadow-xl transition-all"
                >
                    <Plus size={20} />
                    <span className="hidden sm:inline">Add Record</span>
                </button>
            </div>

            {/* Stats Summary (Optional, simple version) */}
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Advances</div>
                    <div className="text-2xl font-bold text-red-600">
                        ₹{transactions
                            .filter((t: any) => t.type === 'advance')
                            .reduce((sum, t: any) => sum + t.amount, 0)
                            .toLocaleString()}
                    </div>
                </div>
                <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Payments</div>
                    <div className="text-2xl font-bold text-green-600">
                        ₹{transactions
                            .filter((t: any) => t.type === 'payment')
                            .reduce((sum, t: any) => sum + t.amount, 0)
                            .toLocaleString()}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-slate-500">Loading records...</p>
                </div>
            ) : (
                <TransactionList transactions={transactions} />
            )}

            <AddTransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchTransactions}
            />
        </div>
    );
}
