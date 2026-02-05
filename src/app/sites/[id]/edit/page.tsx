'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

interface Site {
    id: string;
    name: string;
    location: string | null;
    pricingModel: string;
    includesMaterial: boolean;
    rate: number | null;
    quantity: number | null;
    contractAmount: number | null;
    notes: string | null;
}

export default function EditSitePage() {
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        pricingModel: 'item_rate',
        includesMaterial: false,
        rate: '',
        quantity: '',
        contractAmount: '',
        notes: ''
    });

    useEffect(() => {
        fetchSite();
    }, []);

    const fetchSite = async () => {
        try {
            const res = await fetch(`/api/sites/${params.id}`);
            if (res.ok) {
                const data: Site = await res.json();
                setFormData({
                    name: data.name,
                    location: data.location || '',
                    pricingModel: data.pricingModel || 'item_rate',
                    includesMaterial: data.includesMaterial || false,
                    rate: data.rate ? data.rate.toString() : '',
                    quantity: data.quantity ? data.quantity.toString() : '',
                    contractAmount: data.contractAmount ? data.contractAmount.toString() : '',
                    notes: data.notes || ''
                });
            } else {
                alert('Site not found');
                router.push('/sites');
            }
        } catch (error) {
            console.error('Error fetching site:', error);
            alert('Failed to load site');
            router.push('/sites');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch(`/api/sites/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    rate: formData.rate ? parseFloat(formData.rate) : null,
                    quantity: formData.quantity ? parseFloat(formData.quantity) : null,
                    contractAmount: formData.contractAmount ? parseFloat(formData.contractAmount) : null,
                }),
            });

            if (res.ok) {
                // Return to Dashboard or List? Usually Dashboard now.
                // But initially lets go to list or keep it simple.
                // User said "edit site is old only", so creating this new path fixes it.
                // We should probably redirect to the Site Dashboard [id] eventually.
                router.push(`/sites/${params.id}`);
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to update site');
            }
        } catch (error) {
            console.error('Error updating site:', error);
            alert('Failed to update site');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
                <Link
                    href={`/sites/${params.id}`}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    <ArrowLeft size={20} className="text-slate-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Edit Site</h1>
                    <p className="text-slate-500 text-sm mt-1">Update site information and contract details.</p>
                </div>
            </div>

            <div className="max-w-2xl">
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-bold text-slate-900 mb-2">
                            Site Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="name"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label htmlFor="location" className="block text-sm font-bold text-slate-900 mb-2">
                            Location / Address
                        </label>
                        <textarea
                            id="location"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 outline-none transition-all resize-none"
                        />
                    </div>

                    {/* Financial Matrix */}
                    <div className="pt-4 border-t border-slate-100">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Contract & Pricing</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-900 mb-2">Pricing Model</label>
                                <select
                                    value={formData.pricingModel}
                                    onChange={(e) => setFormData({ ...formData, pricingModel: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                                >
                                    <option value="item_rate">Item Rate (Per SqFt/Unit)</option>
                                    <option value="lump_sum">Lump Sum (Fixed Price)</option>
                                    <option value="cost_plus">Cost Plus (Daily Wage)</option>
                                </select>
                            </div>

                            <div className="flex items-center pt-8">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.includesMaterial}
                                        onChange={(e) => setFormData({ ...formData, includesMaterial: e.target.checked })}
                                        className="w-5 h-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                                    />
                                    <span className="text-sm font-medium text-slate-700">Includes Material?</span>
                                </label>
                            </div>
                        </div>

                        {formData.pricingModel === 'item_rate' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-900 mb-2">Rate (₹)</label>
                                    <input
                                        type="number"
                                        value={formData.rate}
                                        onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-900 mb-2">Est. Quantity (SqFt)</label>
                                    <input
                                        type="number"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                                    />
                                </div>
                            </div>
                        )}

                        {formData.pricingModel === 'lump_sum' && (
                            <div>
                                <label className="block text-sm font-bold text-slate-900 mb-2">Fixed Contract Amount (₹)</label>
                                <input
                                    type="number"
                                    value={formData.contractAmount}
                                    onChange={(e) => setFormData({ ...formData, contractAmount: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                                />
                            </div>
                        )}

                        {formData.pricingModel === 'cost_plus' && (
                            <div className="p-3 bg-blue-50 text-blue-700 text-sm rounded-xl">
                                Value will be calculated based on total wages paid.
                            </div>
                        )}

                        <div className="mt-4">
                            <label className="block text-sm font-bold text-slate-900 mb-2">Notes / Terms</label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                rows={2}
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 outline-none resize-none"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all shadow-md shadow-slate-900/10 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Save Changes
                                </>
                            )}
                        </button>
                        <Link
                            href={`/sites/${params.id}`}
                            className="px-4 py-2.5 border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-all"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
