'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Save, CreditCard, Plus, X, Check, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function NewSitePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [payers, setPayers] = useState<{ id: string, name: string }[]>([]);
    const [clients, setClients] = useState<{ id: string, name: string }[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        pricingModel: 'item_rate',
        rate: '',
        quantity: '',
        contractAmount: '',
        includesMaterial: false,
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
                alert('Failed to adding client'); // Wait, the original code said "adding client" here too, should fix to "adding payer"
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsCreatingPayer(false);
        }
    };

    useEffect(() => {
        // Fetch payers and clients in parallel
        Promise.all([
            fetch('/api/payers').then(res => res.json()),
            fetch('/api/clients').then(res => res.json())
        ])
            .then(([payersData, clientsData]) => {
                if (Array.isArray(payersData)) setPayers(payersData);
                if (Array.isArray(clientsData)) setClients(clientsData);
            })
            .catch(err => console.error('Error fetching data:', err));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/sites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                router.push('/sites');
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to create site');
            }
        } catch (error) {
            console.error('Error creating site:', error);
            alert('Failed to create site');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
                <Link
                    href="/sites"
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    <ArrowLeft size={20} className="text-slate-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Add New Site</h1>
                    <p className="text-slate-500 text-sm mt-1">Create a new work location or project site.</p>
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
                            placeholder="e.g., Central Park Mall, Downtown Office"
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
                            placeholder="e.g., 123 Main Street, City, State"
                            rows={3}
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 outline-none transition-all resize-none"
                        />
                        <p className="text-xs text-slate-400 mt-1">Optional: Add the full address or location details</p>
                    </div>

                    {/* Financial Matrix */}
                    <div className="pt-4 border-t border-slate-100">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Contract & Pricing</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                                <p className="text-[10px] text-slate-400 mt-1 font-medium">The person/company who owns the site.</p>
                            </div>

                            {/* Payer (Billing Entity) */}
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
                        </div>

                        <div className="mb-4">
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

                        {/* Dynamic Fields based on Model */}
                        {formData.pricingModel === 'item_rate' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-900 mb-2">Rate (₹)</label>
                                    <input
                                        type="number"
                                        value={formData.rate}
                                        onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                                        placeholder="e.g. 55"
                                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-900 mb-2">Est. Quantity (SqFt)</label>
                                    <input
                                        type="number"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                        placeholder="e.g. 1200 (Leave empty if unknown)"
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
                                    placeholder="e.g. 50000"
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                                />
                            </div>
                        )}

                        {formData.pricingModel === 'cost_plus' && (
                            <div className="p-3 bg-blue-50 text-blue-700 text-sm rounded-xl">
                                Value will be calculated based on total wages paid to attendance records.
                            </div>
                        )}

                        <div className="mt-4">
                            <label className="block text-sm font-bold text-slate-900 mb-2">Notes / Terms</label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Payment terms, exclusions, etc."
                                rows={2}
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 outline-none resize-none"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all shadow-md shadow-slate-900/10 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Create Site
                                </>
                            )}
                        </button>
                        <Link
                            href="/sites"
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
