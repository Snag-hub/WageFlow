'use client';

import { useState, useEffect, useRef } from 'react';
import { Download, Printer, User, FileText, Loader2, TrendingUp, Wallet, IndianRupee } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

type LedgerItem = {
    id: string;
    date: string;
    description: string;
    type: 'wage' | 'advance' | 'payment' | 'salary_credit';
    credit: number;
    debit: number;
    balance: number;
};

type Summary = {
    totalEarned: number;
    totalPaid: number;
    balance: number;
};

export default function LedgerView() {
    const [employees, setEmployees] = useState<{ id: string, name: string }[]>([]);
    const [selectedEmp, setSelectedEmp] = useState('');
    const [empDetails, setEmpDetails] = useState<{ name: string, phone?: string, type?: string, defaultWage?: number } | null>(null);
    const [companyName, setCompanyName] = useState('');
    const [ledger, setLedger] = useState<LedgerItem[]>([]);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const reportRef = useRef<HTMLDivElement>(null);

    // Load employees
    useEffect(() => {
        fetch('/api/employees')
            .then(res => res.json())
            .then(data => setEmployees(data));
    }, []);

    // Load ledger when employee selected
    useEffect(() => {
        if (!selectedEmp) {
            setLedger([]);
            setSummary(null);
            setEmpDetails(null);
            return;
        }

        setLoading(true);
        fetch(`/api/reports/ledger?employeeId=${selectedEmp}`)
            .then(res => res.json())
            .then(data => {
                setLedger(data.history);
                setSummary(data.summary);
                setEmpDetails(data.employee);
                setCompanyName(data.company?.name || 'My Company');
            })
            .finally(() => setLoading(false));
    }, [selectedEmp]);

    const handleDownloadPDF = async () => {
        if (!reportRef.current || !summary) return;

        setDownloading(true);
        // Ensure we are at the top to avoid offset clipping
        window.scrollTo(0, 0);

        try {
            const element = reportRef.current;
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                width: 1024, // Force a consistent width for HQ capture
                onclone: (clonedDoc) => {
                    const el = clonedDoc.getElementById('printable-report');
                    if (el) {
                        el.style.display = 'block';
                        el.style.width = '1024px'; // Enforce fixed width in clone
                        el.style.padding = '40px';
                        el.style.margin = '0';

                        // Add professional footer
                        const footer = clonedDoc.createElement('div');
                        footer.innerHTML = `
                            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 2px solid #f1f5f9; padding-top: 20px; margin-top: 40px;">
                                <div style="color: #94a3b8; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em;">
                                    Professional Report Generated via WageFlow CRM
                                </div>
                                <div style="color: #cbd5e1; font-size: 10px; font-weight: 600;">
                                    Page 1 of 1
                                </div>
                            </div>
                        `;
                        el.appendChild(footer);

                        const style = clonedDoc.createElement('style');
                        style.innerHTML = `
                            * { 
                                color: #0f172a !important; 
                                border-color: #e2e8f0 !important;
                                -webkit-font-smoothing: antialiased;
                            }
                            #printable-report {
                                background-color: white !important;
                                width: 1024px !important;
                                box-sizing: border-box !important;
                            }
                            .summary-grid {
                                display: grid !important;
                                grid-template-columns: repeat(3, 1fr) !important;
                                gap: 16px !important;
                                margin-bottom: 24px !important;
                            }
                            table { width: 100% !important; border-collapse: collapse !important; }
                            th { background-color: #f8fafc !important; color: #64748b !important; font-weight: 700 !important; text-transform: uppercase !important; font-size: 10px !important; padding: 12px 16px !important; border-bottom: 2px solid #e2e8f0 !important; }
                            td { padding: 12px 16px !important; border-bottom: 1px solid #f1f5f9 !important; font-size: 11px !important; }
                            .font-bold { font-weight: 800 !important; }
                            .text-indigo-600 { color: #4f46e5 !important; }
                            .text-amber-600 { color: #d97706 !important; }
                            .text-green-600 { color: #16a34a !important; }
                            .text-red-600 { color: #dc2626 !important; }
                        `;
                        clonedDoc.head.appendChild(style);
                    }
                }
            });

            const imgData = canvas.toDataURL('image/png', 1.0);
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: 'a4',
                hotfixes: ['px_scaling']
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            // Calculate ratio to fit A4
            const imgProps = pdf.getImageProperties(imgData);
            const ratio = pdfWidth / imgProps.width;
            const finalImgHeight = imgProps.height * ratio;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, finalImgHeight);

            pdf.save(`${empDetails?.name || 'Employee'}_Ledger_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error: any) {
            console.error('PDF Generation Error:', error);
            alert(`Failed to generate PDF: ${error.message || 'Unknown error'}. Please try again.`);
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header / Filter */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 no-print transition-all">
                <div className="flex-1 max-w-sm">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Select Employee</label>
                    <div className="relative group">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                        <select
                            value={selectedEmp}
                            onChange={(e) => setSelectedEmp(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all outline-none text-sm font-semibold text-slate-900 appearance-none cursor-pointer"
                        >
                            <option value="">Choose an employee...</option>
                            {employees.map(e => (
                                <option key={e.id} value={e.id}>{e.name}</option>
                            ))}
                        </select>
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>
                </div>

                {selectedEmp && (
                    <div className="flex gap-2">
                        <button
                            onClick={handleDownloadPDF}
                            disabled={downloading}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 active:scale-95 transition-all shadow-lg shadow-slate-900/10 disabled:opacity-50"
                        >
                            {downloading ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <Download size={18} strokeWidth={2.5} />
                            )}
                            <span className="font-bold text-sm tracking-tight">
                                {downloading ? 'Capturing...' : 'Download Statement'}
                            </span>
                        </button>
                    </div>
                )}
            </div>

            <div ref={reportRef} id="printable-report" className="bg-white p-10">
                {/* Print Header */}
                <div className="mb-6 border-b pb-4 border-slate-200 pt-2">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 m-0">Employee Ledger</h1>
                            <div className="mt-2 text-slate-600">
                                <p className="text-xl font-bold text-slate-800 m-0">{empDetails?.name}</p>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm">
                                    {empDetails?.phone && (
                                        <p className="m-0">Phone: <span className="font-medium">{empDetails.phone}</span></p>
                                    )}
                                    <p className="m-0 uppercase tracking-tight">Type: <span className="font-medium">{empDetails?.type}</span></p>
                                    <p className="m-0">Base Wage: <span className="font-medium">₹{empDetails?.defaultWage?.toLocaleString()}</span></p>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-bold text-indigo-600 m-0 uppercase tracking-tighter">{companyName}</p>
                            <p className="text-[10px] text-slate-400 mt-1">
                                Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                            </p>
                            <p className="text-[10px] font-bold text-slate-300 uppercase mt-1">WageFlow CRM Report</p>
                        </div>
                    </div>
                </div>

                {loading && (
                    <div className="text-center py-12">
                        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    </div>
                )}

                {!loading && summary && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 summary-grid">
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 print:border-slate-200 transition-all hover:shadow-md">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600 print:hidden">
                                        <TrendingUp size={16} />
                                    </div>
                                    <div className="text-slate-500 text-[11px] font-black uppercase tracking-widest print:text-slate-700">Earnings</div>
                                </div>
                                <div className="text-3xl font-black text-slate-900 tabular-nums">₹{summary.totalEarned.toLocaleString()}</div>
                                <div className="text-[10px] text-slate-400 mt-1.5 font-bold uppercase tracking-tight print:text-slate-600">Total Wages & Credits</div>
                            </div>

                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 print:border-slate-200 transition-all hover:shadow-md">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-amber-50 rounded-xl text-amber-600 print:hidden">
                                        <Wallet size={16} />
                                    </div>
                                    <div className="text-slate-500 text-[11px] font-black uppercase tracking-widest print:text-slate-700">Paid</div>
                                </div>
                                <div className="text-3xl font-black text-slate-900 tabular-nums">₹{summary.totalPaid.toLocaleString()}</div>
                                <div className="text-[10px] text-slate-400 mt-1.5 font-bold uppercase tracking-tight print:text-slate-600">Total Cash Outflow</div>
                            </div>

                            <div className={`bg-white p-6 rounded-3xl shadow-sm border-2 transition-all hover:shadow-md sm:col-span-2 lg:col-span-1 ${summary.balance >= 0 ? 'border-emerald-500/20 bg-emerald-50/10' : 'border-red-500/20 bg-red-50/10'}`}>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`p-2 rounded-xl print:hidden ${summary.balance >= 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                        <IndianRupee size={16} />
                                    </div>
                                    <div className="text-slate-500 text-[11px] font-black uppercase tracking-widest print:text-slate-700">Net Balance</div>
                                </div>
                                <div className={`text-3xl font-black tabular-nums ${summary.balance >= 0 ? 'text-emerald-600' : 'text-red-600'} print:text-black`}>
                                    ₹{summary.balance.toLocaleString()}
                                </div>
                                <div className={`text-[10px] mt-1.5 font-bold uppercase tracking-tight ${summary.balance >= 0 ? 'text-emerald-500' : 'text-red-500'} print:text-slate-600`}>
                                    {summary.balance >= 0 ? 'Company owes Employee' : 'Employee owes Company'}
                                </div>
                            </div>
                        </div>

                        {/* Ledger Table */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 print:border-slate-300 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left border-collapse">
                                    <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-widest print:bg-slate-50 print:text-slate-900 border-b-2 border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4">Date</th>
                                            <th className="px-6 py-4">Description</th>
                                            <th className="px-6 py-4 text-right">Credit (+)</th>
                                            <th className="px-6 py-4 text-right">Debit (-)</th>
                                            <th className="px-6 py-4 text-right">Balance</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 print:divide-slate-300">
                                        {ledger.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-3 whitespace-nowrap text-slate-600 print:text-black print:border-slate-300">
                                                    {new Date(item.date).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-3 font-medium text-slate-800 print:text-black print:border-slate-300">
                                                    {item.description}
                                                </td>
                                                <td className="px-6 py-3 text-right text-green-600 print:text-black print:border-slate-300">
                                                    {item.credit > 0 ? `₹${item.credit.toLocaleString()}` : '-'}
                                                </td>
                                                <td className="px-6 py-3 text-right text-red-600 print:text-black print:border-slate-300">
                                                    {item.debit > 0 ? `₹${item.debit.toLocaleString()}` : '-'}
                                                </td>
                                                <td className="px-6 py-3 text-right font-bold font-mono text-slate-900 print:text-black print:border-slate-300">
                                                    ₹{item.balance.toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                        {ledger.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="text-center py-8 text-slate-400">
                                                    No records found for this employee.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
