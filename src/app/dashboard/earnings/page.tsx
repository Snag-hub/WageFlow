'use client';

import React, { useState, useEffect } from 'react';
import {
    Calendar as CalendarIcon,
    ArrowLeft,
    TrendingUp,
    TrendingDown,
    Wallet,
    ChevronRight,
    Filter,
    Activity,
    IndianRupee,
    Briefcase,
    Users
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { CustomDatePicker } from '@/components/ui/custom-inputs';

interface FinanceSummary {
    totalIncome: number;
    totalExpense: number;
    netProfit: number;
    incomeTransactions: any[];
    expenseTransactions: any[];
}

export default function EarningsDashboardPage() {
    const today = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(today.getMonth() - 1);

    const [fromDate, setFromDate] = useState(oneMonthAgo.toISOString().split('T')[0]);
    const [toDate, setToDate] = useState(today.toISOString().split('T')[0]);
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState<FinanceSummary | null>(null);

    useEffect(() => {
        fetchEarnings();
    }, [fromDate, toDate]);

    const fetchEarnings = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/dashboard/earnings?from=${fromDate}&to=${toDate}`);
            if (res.ok) {
                const data = await res.json();
                setSummary(data);
            } else {
                toast.error('Failed to fetch financial data');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xl shadow-slate-900/20">
                            <TrendingUp size={24} />
                        </div>
                        Financial Dashboard
                    </h1>
                    <p className="text-slate-500 font-medium mt-2 ml-1">Real-time overview of company earnings and expenses.</p>
                </div>

                <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
                    <CustomDatePicker
                        value={fromDate}
                        onChange={setFromDate}
                        className="w-40"
                    />
                    <div className="w-6 h-px bg-slate-200 mt-6" />
                    <CustomDatePicker
                        value={toDate}
                        onChange={setToDate}
                        className="w-40"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                    <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
                    <p className="text-slate-400 font-bold animate-pulse uppercase tracking-widest text-xs">Analyzing Financials...</p>
                </div>
            ) : summary ? (
                <>
                    {/* Big Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm group hover:shadow-xl hover:shadow-emerald-600/5 transition-all relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/30 rounded-bl-[120px] transition-all group-hover:bg-emerald-50" />
                            <div className="relative">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20">
                                        <IndianRupee size={24} />
                                    </div>
                                    <span className="text-slate-400 font-black text-xs uppercase tracking-widest">Total Income</span>
                                </div>
                                <div className="text-4xl font-black text-slate-900 tracking-tighter">
                                    ₹{summary.totalIncome.toLocaleString()}
                                </div>
                                <p className="text-emerald-600 text-xs font-bold mt-2 flex items-center gap-1">
                                    <TrendingUp size={12} /> Positive Cashflow
                                </p>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm group hover:shadow-xl hover:shadow-red-600/5 transition-all relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-50/30 rounded-bl-[120px] transition-all group-hover:bg-red-50" />
                            <div className="relative">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/20">
                                        <TrendingDown size={24} />
                                    </div>
                                    <span className="text-slate-400 font-black text-xs uppercase tracking-widest">Total Expenses</span>
                                </div>
                                <div className="text-4xl font-black text-slate-900 tracking-tighter">
                                    ₹{summary.totalExpense.toLocaleString()}
                                </div>
                                <p className="text-red-600 text-xs font-bold mt-2 flex items-center gap-1">
                                    <TrendingDown size={12} /> Wages & Advances
                                </p>
                            </div>
                        </div>

                        <div className="bg-slate-900 p-8 rounded-[32px] shadow-2xl shadow-slate-900/20 group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-[120px]" />
                            <div className="relative text-white">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center backdrop-blur-md">
                                        <Activity size={24} />
                                    </div>
                                    <span className="text-slate-400 font-black text-xs uppercase tracking-widest">Net Profit</span>
                                </div>
                                <div className="text-4xl font-black tracking-tighter">
                                    ₹{summary.netProfit.toLocaleString()}
                                </div>
                                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                                    <span className="text-[10px] text-white/40 font-bold uppercase">Efficiency</span>
                                    <span className="text-xs font-black text-emerald-400">
                                        {summary.totalIncome > 0 ? ((summary.netProfit / summary.totalIncome) * 100).toFixed(1) : 0}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Feed */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Income Records */}
                        <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-emerald-50/10">
                                <h2 className="text-lg font-black text-slate-900 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                        <Wallet size={20} />
                                    </div>
                                    Client Payments
                                </h2>
                                <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-100/50 px-3 py-1 rounded-full">Income</span>
                            </div>
                            <div className="divide-y divide-slate-50 flex-1 overflow-y-auto max-h-[500px]">
                                {summary.incomeTransactions.length === 0 ? (
                                    <div className="p-12 text-center text-slate-400 font-medium italic">No income in this period</div>
                                ) : (
                                    summary.incomeTransactions.map((tx: any) => (
                                        <div key={tx.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex flex-col items-center justify-center text-slate-400 group-hover:bg-white border border-transparent group-hover:border-slate-100 transition-all">
                                                    <span className="text-[9px] font-black uppercase">{new Date(tx.date).toLocaleDateString(undefined, { month: 'short' })}</span>
                                                    <span className="text-lg font-black text-slate-900">{new Date(tx.date).getDate()}</span>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">{tx.site?.name || 'General'}</p>
                                                    <p className="text-xs text-slate-500 font-medium">{tx.payer?.name || 'Direct Payment'} • {tx.category}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-black text-emerald-600">+₹{tx.amount.toLocaleString()}</p>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">{tx.paymentMode}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Expense Records */}
                        <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-red-50/10">
                                <h2 className="text-lg font-black text-slate-900 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                                        <Activity size={20} />
                                    </div>
                                    Staff Payments
                                </h2>
                                <span className="text-[10px] font-black uppercase text-red-600 bg-red-100/50 px-3 py-1 rounded-full">Expenses</span>
                            </div>
                            <div className="divide-y divide-slate-50 flex-1 overflow-y-auto max-h-[500px]">
                                {summary.expenseTransactions.length === 0 ? (
                                    <div className="p-12 text-center text-slate-400 font-medium italic">No expenses in this period</div>
                                ) : (
                                    summary.expenseTransactions.map((tx: any) => (
                                        <div key={tx.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex flex-col items-center justify-center text-slate-400 group-hover:bg-white border border-transparent group-hover:border-slate-100 transition-all">
                                                    <span className="text-[9px] font-black uppercase">{new Date(tx.date).toLocaleDateString(undefined, { month: 'short' })}</span>
                                                    <span className="text-lg font-black text-slate-900">{new Date(tx.date).getDate()}</span>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">{tx.employee?.name}</p>
                                                    <p className="text-xs text-slate-500 font-medium capitalize">{tx.type.replace('_', ' ')} • {tx.site?.name || 'Office'}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-black text-red-600">-₹{tx.amount.toLocaleString()}</p>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">{tx.paymentMode || 'Cash'}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </>
            ) : null}
        </div>
    );
}
