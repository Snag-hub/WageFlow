'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { SiteTransactionsModal } from '@/components/sites/site-transactions-modal';
import {
    ArrowLeft,
    Edit2,
    TrendingUp,
    DollarSign,
    Wallet,
    IndianRupee
} from 'lucide-react';
import Link from 'next/link';

interface Site {
    id: string;
    name: string;
    location: string | null;
    clientId: string | null;
    client?: { name: string } | null;
    pricingModel: 'item_rate' | 'lump_sum' | 'cost_plus';
    rate: number | null;
    quantity: number | null;
    contractAmount: number | null;
    siteTransactions: {
        id: string;
        amount: number;
        date: string;
        category: string;
        paymentMode: string;
        note?: string;
        payer?: { name: string };
    }[];
}

export default function SiteDashboardPage() {
    const params = useParams();
    const router = useRouter();
    const [site, setSite] = useState<Site | null>(null);
    const [loading, setLoading] = useState(true);
    const [isTransModalOpen, setIsTransModalOpen] = useState(false);

    useEffect(() => {
        fetchSite();
    }, []);

    const fetchSite = async () => {
        try {
            const res = await fetch(`/api/sites/${params.id}`);
            if (res.ok) {
                const data = await res.json();
                setSite(data);
            } else {
                toast.error('Site not found');
                router.push('/sites');
            }
        } catch (error) {
            console.error('Error fetching site:', error);
            toast.error('Failed to load site data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!site) return null;

    // Calculate Financials
    let contractValue = 0;
    let valueLabel = 'Contract Value';

    if (site.pricingModel === 'item_rate') {
        if (site.rate && site.quantity) {
            contractValue = site.rate * site.quantity;
        } else {
            valueLabel = 'Est. Value (Rate Set)';
        }
    } else if (site.pricingModel === 'lump_sum') {
        contractValue = site.contractAmount || 0;
    }

    const totalIncome = site.siteTransactions?.reduce((sum, rx) => sum + rx.amount, 0) || 0;
    const balance = contractValue - totalIncome;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/sites"
                        className="p-2.5 bg-white border border-slate-200 text-slate-500 hover:text-slate-900 rounded-xl transition-all shadow-sm"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{site.name}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            {site.location && (
                                <p className="text-slate-500 text-sm font-medium flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                    {site.location}
                                </p>
                            )}
                            {site.client?.name && (
                                <p className="text-slate-500 text-sm font-medium flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                    Client: {site.client.name}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsTransModalOpen(true)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
                    >
                        <IndianRupee size={16} />
                        Record Income
                    </button>
                    <Link
                        href={`/sites/${site.id}/edit`}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <Edit2 size={16} />
                        Settings
                    </Link>
                </div>
            </div>

            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-bl-[100px] -mr-4 -mt-4 transition-all group-hover:bg-blue-50" />
                    <div className="relative">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                                <TrendingUp size={20} />
                            </div>
                            <span className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">{valueLabel}</span>
                        </div>
                        <div className="text-3xl font-black text-slate-900 tracking-tight">
                            ₹{contractValue.toLocaleString()}
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                            <span className="text-xs text-slate-400 font-bold uppercase">Pricing</span>
                            <span className="text-xs text-slate-900 font-black capitalize bg-slate-100 px-2 py-1 rounded-lg">{site.pricingModel.replace('_', ' ')}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50/50 rounded-bl-[100px] -mr-4 -mt-4 transition-all group-hover:bg-emerald-50" />
                    <div className="relative">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                <Wallet size={20} />
                            </div>
                            <span className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">Total Income</span>
                        </div>
                        <div className="text-3xl font-black text-emerald-600 tracking-tight">
                            ₹{totalIncome.toLocaleString()}
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                            <span className="text-xs text-slate-400 font-bold uppercase">Payments</span>
                            <span className="text-xs text-emerald-700 font-black bg-emerald-50 px-2 py-1 rounded-lg">{site.siteTransactions?.length || 0} received</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50/50 rounded-bl-[100px] -mr-4 -mt-4 transition-all group-hover:bg-orange-50" />
                    <div className="relative">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600">
                                <DollarSign size={20} />
                            </div>
                            <span className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">Outstanding</span>
                        </div>
                        <div className="text-3xl font-black text-orange-600 tracking-tight">
                            ₹{balance.toLocaleString()}
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                            <span className="text-xs text-slate-400 font-bold uppercase">Status</span>
                            <span className={cn(
                                "text-xs font-black px-2 py-1 rounded-lg",
                                balance > 0 ? "text-orange-700 bg-orange-50" : "text-emerald-700 bg-emerald-50"
                            )}>
                                {balance > 0 ? 'Pending Collection' : 'Settled'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Income Feed */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <IndianRupee size={18} />
                        </div>
                        Transaction History
                    </h2>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                        Payments from Client
                    </span>
                </div>

                <div className="divide-y divide-slate-100">
                    {site.siteTransactions?.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 text-slate-200">
                                <IndianRupee size={32} />
                            </div>
                            <p className="text-slate-400 font-medium italic">No income records yet.</p>
                            <button
                                onClick={() => setIsTransModalOpen(true)}
                                className="mt-4 text-emerald-600 font-bold text-sm hover:underline"
                            >
                                + Add first payment
                            </button>
                        </div>
                    ) : (
                        site.siteTransactions?.map((tx: any) => (
                            <div key={tx.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex flex-col items-center justify-center shadow-sm group-hover:border-slate-200 transition-all">
                                        <span className="text-[10px] font-black text-slate-400 uppercase leading-none">
                                            {new Date(tx.date).toLocaleDateString(undefined, { month: 'short' })}
                                        </span>
                                        <span className="text-lg font-black text-slate-900 leading-none mt-1">
                                            {new Date(tx.date).getDate()}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 flex items-center gap-2">
                                            <span className="capitalize">{tx.category}</span>
                                            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md uppercase tracking-wider">{tx.paymentMode}</span>
                                        </p>
                                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                                            {tx.payer?.name ? `Paid by: ${tx.payer.name}` : 'Generic Client Payment'}
                                            {tx.note && ` • ${tx.note}`}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-black text-emerald-600">
                                        +₹{tx.amount.toLocaleString()}
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Income</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal */}
            <SiteTransactionsModal
                isOpen={isTransModalOpen}
                onClose={() => setIsTransModalOpen(false)}
                siteId={site.id}
                onSuccess={fetchSite}
            />
        </div>
    );
}

// Simple internal component to avoid external dep if not needed, but clsx is usually installed
function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
