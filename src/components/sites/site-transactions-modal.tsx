'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, IndianRupee, Calendar as CalendarIcon, Briefcase, User, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { CustomDatePicker, CustomCombobox } from '@/components/ui/custom-inputs';

interface Payer {
    id: string;
    name: string;
}

interface SiteTransactionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    siteId: string;
    onSuccess: () => void;
}

export const SiteTransactionsModal: React.FC<SiteTransactionsModalProps> = ({ isOpen, onClose, siteId, onSuccess }) => {
    const [saving, setSaving] = useState(false);
    const [payers, setPayers] = useState<Payer[]>([]);
    const [formData, setFormData] = useState({
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: 'payment',
        payerId: '',
        paymentMode: 'cash',
        note: ''
    });

    useEffect(() => {
        if (isOpen) {
            fetchPayers();
        }
    }, [isOpen]);

    const fetchPayers = async () => {
        try {
            const res = await fetch('/api/payers');
            if (res.ok) {
                const data = await res.json();
                setPayers(data);
            }
        } catch (error) {
            console.error('Fetch Payers Error:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.amount || !formData.date) {
            toast.error('Please fill in required fields');
            return;
        }

        setSaving(true);
        try {
            const res = await fetch(`/api/sites/${siteId}/transactions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success('Site transaction recorded!');
                onSuccess();
                onClose();
                setFormData({
                    amount: '',
                    date: new Date().toISOString().split('T')[0],
                    category: 'payment',
                    payerId: '',
                    paymentMode: 'cash',
                    note: ''
                });
            } else {
                const data = await res.json();
                toast.error(data.message || 'Failed to record transaction');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setSaving(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
                    >
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                    <IndianRupee size={18} />
                                </div>
                                Record Site Income
                            </h2>
                            <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400 hover:text-slate-900 border border-transparent hover:border-slate-200">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-1.5 sm:col-span-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Amount (₹)</label>
                                    <div className="relative group">
                                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={18} />
                                        <input
                                            type="number"
                                            required
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:bg-white outline-none transition-all font-bold text-lg"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                <CustomDatePicker
                                    label="Date"
                                    value={formData.date}
                                    onChange={(val) => setFormData({ ...formData, date: val })}
                                />

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Category</label>
                                    <div className="relative group">
                                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={18} />
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:bg-white outline-none transition-all appearance-none cursor-pointer font-medium"
                                        >
                                            <option value="payment">Regular Payment</option>
                                            <option value="advance">Site Advance</option>
                                            <option value="settlement">Final Settlement</option>
                                            <option value="refund">Refund</option>
                                        </select>
                                    </div>
                                </div>

                                <CustomCombobox
                                    label="Payer (Person who paid)"
                                    options={payers}
                                    value={formData.payerId}
                                    onChange={(val) => setFormData({ ...formData, payerId: val })}
                                    placeholder="Select person..."
                                />

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Payment Mode</label>
                                    <div className="relative group">
                                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={18} />
                                        <select
                                            value={formData.paymentMode}
                                            onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:bg-white outline-none transition-all appearance-none cursor-pointer font-medium"
                                        >
                                            <option value="cash">Cash</option>
                                            <option value="upi">UPI / GPay</option>
                                            <option value="cheque">Cheque</option>
                                            <option value="bank_transfer">Bank Transfer</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1.5 sm:col-span-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Note (Optional)</label>
                                    <textarea
                                        value={formData.note}
                                        onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:bg-white outline-none transition-all font-medium min-h-[100px] resize-none"
                                        placeholder="Add details about the payment..."
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-900/10 disabled:opacity-50"
                            >
                                {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={20} />}
                                {saving ? 'Recording...' : 'Record Transaction'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
