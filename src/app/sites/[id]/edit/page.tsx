'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, CreditCard, Plus, X, Check, Loader2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-toastify';

interface Site {
    id: string;
    name: string;
    location: string | null;
    clientId: string | null;
    client?: { name: string } | null;
    pricingModel: string;
    includesMaterial: boolean;
    rate: number | null;
    quantity: number | null;
    contractAmount: number | null;
    notes: string | null;
    payerId: string | null;
}

export default function EditSitePage() {
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [payers, setPayers] = useState<{ id: string, name: string }[]>([]);
    const [clients, setClients] = useState<{ id: string, name: string }[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        pricingModel: 'item_rate',
        includesMaterial: false,
        rate: '',
        quantity: '',
        contractAmount: '',
        notes: '',
        payerId: '',
        clientId: ''
    });

    // Quick Add Payer State
    const [showQuickAdd, setShowQuickAdd] = useState(false);
    const [newPayerName, setNewPayerName] = useState('');
    const [isCreatingPayer, setIsCreatingPayer] = useState(false);

    // Quick Add Client State
    const [showQuickAddClient, setShowQuickAddClient] = useState(false);
    const [newClientName, setNewClientName] = useState('');
    const [isCreatingClient, setIsCreatingClient] = useState(false);

    const handleQuickAddClient = async () => {
        if (!newClientName.trim()) return;
        setIsCreatingClient(true);
        try {
            const res = await fetch('/api/clients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newClientName }),
            });
            if (res.ok) {
                const newClient = await res.json();
                setClients(prev => [...prev, newClient]);
                setFormData(prev => ({ ...prev, clientId: newClient.id }));
                setShowQuickAddClient(false);
                setNewClientName('');
            } else {
                alert('Failed to add client');
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsCreatingClient(false);
        }
    };

    const handleQuickAddPayer = async () => {
        if (!newPayerName.trim()) return;
        setIsCreatingPayer(true);
        try {
            const res = await fetch('/api/payers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newPayerName }),
            });
            if (res.ok) {
                const newPayer = await res.json();
                setPayers(prev => [...prev, newPayer]);
                setFormData(prev => ({ ...prev, payerId: newPayer.id }));
                setShowQuickAdd(false);
                setNewPayerName('');
            } else {
                alert('Failed to adding client');
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsCreatingPayer(false);
        }
    };

    useEffect(() => {
        Promise.all([
            fetchSite(),
            fetch('/api/payers').then(res => res.json()),
            fetch('/api/clients').then(res => res.json())
        ]).then(([_, payersData, clientsData]) => {
            if (Array.isArray(payersData)) setPayers(payersData);
            if (Array.isArray(clientsData)) setClients(clientsData);
        }).catch(err => console.error('Initialization error:', err));
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
                    notes: data.notes || '',
                    payerId: data.payerId || '',
                    clientId: data.clientId || ''
                });
            } else {
                toast.error('Site not found');
                router.push('/sites');
            }
        } catch (error) {
            console.error('Error fetching site:', error);
            toast.error('Failed to load site');
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
                toast.success('Site updated successfully');
                router.push(`/sites/${params.id}`);
                router.refresh();
            } else {
                const data = await res.json();
                toast.error(data.message || 'Failed to update site');
            }
        } catch (error) {
            console.error('Error updating site:', error);
            toast.error('An error occurred');
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 outline-none transition-all placeholder:text-slate-300"
                                placeholder="e.g. Skyline Residency"
                            />
                        </div>

                        {/* Client (Site Owner) */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-bold text-slate-900">Site Owner (Client)</label>
                                {!showQuickAddClient && (
                                    <button
                                        type="button"
                                        onClick={() => setShowQuickAddClient(true)}
                                        className="text-[10px] font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-lg flex items-center gap-1 transition-all"
                                    >
                                        <Plus size={12} />
                                        Quick Add
                                    </button>
                                )}
                            </div>
                            {showQuickAddClient ? (
                                <div className="flex items-center gap-2 animate-in slide-in-from-top-2 duration-300">
                                    <input
                                        type="text"
                                        value={newClientName}
                                        onChange={(e) => setNewClientName(e.target.value)}
                                        placeholder="Enter Client Name..."
                                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={handleQuickAddClient}
                                        disabled={isCreatingClient || !newClientName.trim()}
                                        className="p-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-50"
                                    >
                                        {isCreatingClient ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setShowQuickAddClient(false); setNewClientName(''); }}
                                        className="p-2 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-slate-900"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <div className="relative">
                                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <select
                                        value={formData.clientId}
                                        onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 outline-none hover:border-slate-300 transition-colors"
                                    >
                                        <option value="">-- Select Client --</option>
                                        {clients.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
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
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-bold text-slate-900">Billing Entity (Payer)</label>
                                    {!showQuickAdd && (
                                        <button
                                            type="button"
                                            onClick={() => setShowQuickAdd(true)}
                                            className="text-[10px] font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-lg flex items-center gap-1 transition-all"
                                        >
                                            <Plus size={12} />
                                            Quick Add
                                        </button>
                                    )}
                                </div>
                                {showQuickAdd ? (
                                    <div className="flex items-center gap-2 animate-in slide-in-from-top-2 duration-300">
                                        <input
                                            type="text"
                                            value={newPayerName}
                                            onChange={(e) => setNewPayerName(e.target.value)}
                                            placeholder="Enter Payer Name..."
                                            className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                                            autoFocus
                                        />
                                        <button
                                            type="button"
                                            onClick={handleQuickAddPayer}
                                            disabled={isCreatingPayer || !newPayerName.trim()}
                                            className="p-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-50"
                                        >
                                            {isCreatingPayer ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { setShowQuickAdd(false); setNewPayerName(''); }}
                                            className="p-2 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-slate-900"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <select
                                            value={formData.payerId}
                                            onChange={(e) => setFormData({ ...formData, payerId: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 outline-none hover:border-slate-300 transition-colors"
                                        >
                                            <option value="">-- Select Payer --</option>
                                            {payers.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <p className="text-[10px] text-slate-400 mt-1 font-medium">The entity responsible for processing payments.</p>
                            </div>

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
                        </div>

                        <div className="flex items-center mb-6">
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

                    <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-100">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-[2] inline-flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all shadow-md shadow-slate-900/10 disabled:opacity-50 disabled:cursor-not-allowed"
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
                        <button
                            type="button"
                            onClick={async () => {
                                if (confirm('Are you sure you want to delete this site? All data will be permanently removed.')) {
                                    setSaving(true);
                                    try {
                                        const res = await fetch(`/api/sites/${params.id}`, { method: 'DELETE' });
                                        if (res.ok) {
                                            router.push('/sites');
                                            router.refresh();
                                        } else {
                                            const data = await res.json();
                                            alert(data.message || 'Failed to delete site');
                                        }
                                    } catch (err) {
                                        alert('An error occurred while deleting');
                                    } finally {
                                        setSaving(false);
                                    }
                                }
                            }}
                            className="flex-1 py-3 bg-red-50 text-red-600 text-sm font-bold rounded-xl hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                        >
                            <Trash2 size={18} />
                            Delete
                        </button>
                        <Link
                            href={`/sites/${params.id}`}
                            className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-all text-center flex items-center justify-center"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
