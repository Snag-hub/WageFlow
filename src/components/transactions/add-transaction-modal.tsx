import { X, Save, IndianRupee } from 'lucide-react';
import { toast } from 'react-toastify';
import { CustomDatePicker, CustomCombobox } from '@/components/ui/custom-inputs';
import { useEffect, useState } from 'react';

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
    const [paymentMode, setPaymentMode] = useState('cash'); // cash, upi, cheque, bank_transfer
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [note, setNote] = useState('');

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            fetch('/api/employees')
                .then(res => res.json())
                .then(data => setEmployees(data))
                .catch(() => toast.error('Failed to load employees'))
                .finally(() => setLoading(false));
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!employeeId) return toast.error('Please select an employee');
        if (!amount || parseFloat(amount) <= 0) return toast.error('Please enter a valid amount');

        setSubmitting(true);

        try {
            const res = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    employeeId,
                    type,
                    amount: parseFloat(amount),
                    paymentMode,
                    date,
                    note
                })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to save');
            }

            toast.success(`${type === 'advance' ? 'Advance' : 'Payment'} recorded successfully`);
            setEmployeeId('');
            setAmount('');
            setNote('');
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.message || 'Error saving transaction');
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

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <CustomCombobox
                        label="Select Employee"
                        options={employees}
                        value={employeeId}
                        onChange={setEmployeeId}
                        placeholder="Search employee..."
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Type</label>
                            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
                                <button
                                    type="button"
                                    onClick={() => setType('advance')}
                                    className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-all ${type === 'advance'
                                        ? 'bg-red-600 text-white shadow-md'
                                        : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    ADVANCE
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setType('payment')}
                                    className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-all ${type === 'payment'
                                        ? 'bg-emerald-600 text-white shadow-md'
                                        : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    PAYMENT
                                </button>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Amount</label>
                            <div className="relative group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors font-bold text-sm">₹</div>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full pl-8 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition-all font-black text-slate-900 shadow-sm"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <CustomDatePicker
                            label="Transaction Date"
                            value={date}
                            onChange={setDate}
                        />

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Mode</label>
                            <select
                                value={paymentMode}
                                onChange={(e) => setPaymentMode(e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition-all text-sm font-medium text-slate-900 shadow-sm appearance-none"
                            >
                                <option value="cash">Cash</option>
                                <option value="upi">UPI / GPay</option>
                                <option value="bank_transfer">Bank Transfer</option>
                                <option value="cheque">Cheque</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Note (Optional)</label>
                        <textarea
                            rows={3}
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition-all text-sm font-medium text-slate-900 shadow-sm resize-none"
                            placeholder="Reason for transaction..."
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={submitting}
                            className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-white shadow-xl hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-2 ${type === 'advance'
                                ? 'bg-slate-900 hover:shadow-red-600/20'
                                : 'bg-slate-900 hover:shadow-emerald-600/20'
                                }`}
                        >
                            <Save size={18} />
                            {submitting ? 'PROCESSING...' : `CONFIRM ${type.toUpperCase()}`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
