'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Edit2, TrendingUp, DollarSign, Wallet } from 'lucide-react';
import Link from 'next/link';

interface Site {
    id: string;
    name: string;
    location: string | null;
    pricingModel: 'item_rate' | 'lump_sum' | 'cost_plus';
    rate: number | null;
    quantity: number | null;
    contractAmount: number | null;
    siteTransactions: { amount: number; type: string }[];
}

export default function SiteDashboardPage() {
    const params = useParams();
    const router = useRouter();
    const [site, setSite] = useState<Site | null>(null);
    const [loading, setLoading] = useState(true);

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
                alert('Site not found');
                router.push('/sites');
            }
        } catch (error) {
            console.error('Error fetching site:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
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
    } else {
        valueLabel = 'Cost Plus (Wages)';
        // TODO: Sum wages from attendance
    }

    // Transactions (received from client) - mocking simple sum for now if API doesn't return sum
    // Ideally we fetch transaction summary or calculate here if transactions are included
    // For now assuming siteTransactions is empty or we need to add a dedicated fetch for balance
    const totalReceived = site.siteTransactions?.reduce((sum, rx) => sum + rx.amount, 0) || 0;
    const balance = contractValue - totalReceived;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/sites"
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={20} className="text-slate-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{site.name}</h1>
                        <p className="text-slate-500 text-sm mt-1">
                            {site.location ? site.location : 'No location set'}
                        </p>
                    </div>
                </div>
                <Link
                    href={`/sites/${site.id}/edit`}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-200 transition-all"
                >
                    <Edit2 size={16} />
                    Edit Site
                </Link>
            </div>

            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                            <TrendingUp size={20} />
                        </div>
                        <span className="text-slate-500 font-bold text-xs uppercase tracking-wider">{valueLabel}</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                        ₹{contractValue.toLocaleString()}
                        {site.pricingModel === 'item_rate' && !site.quantity && <span className="text-sm font-normal text-slate-400 ml-2">(TBD)</span>}
                    </div>
                    {site.pricingModel === 'item_rate' && (
                        <div className="text-xs text-slate-400 mt-2">
                            Rate: ₹{site.rate}/unit • Area: {site.quantity || '?'}
                        </div>
                    )}
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <Wallet size={20} />
                        </div>
                        <span className="text-slate-500 font-bold text-xs uppercase tracking-wider">Received</span>
                    </div>
                    <div className="text-2xl font-bold text-emerald-600">
                        ₹{totalReceived.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-400 mt-2">
                        Advances from Client
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                            <DollarSign size={20} />
                        </div>
                        <span className="text-slate-500 font-bold text-xs uppercase tracking-wider">Pending Balance</span>
                    </div>
                    <div className="text-2xl font-bold text-orange-600">
                        ₹{balance.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-400 mt-2">
                        To be collected
                    </div>
                </div>
            </div>

            {/* Placeholder for Transaction List - Can be added later */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                <p className="text-slate-400 mb-4">Transaction history from client will appear here.</p>
                <div className="flex justify-center">
                    <button disabled className="px-4 py-2 bg-slate-100 text-slate-400 rounded-lg font-bold text-sm">
                        + Add Payment (Coming Soon)
                    </button>
                </div>
            </div>
        </div>
    );
}
