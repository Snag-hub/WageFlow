'use client';

import { useState, useEffect, useRef } from 'react';
import { Download, Printer, User, FileText, Loader2 } from 'lucide-react';
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
                onclone: (clonedDoc) => {
                    const el = clonedDoc.getElementById('printable-report');
                    if (el) {
                        el.style.display = 'block';
                        el.style.padding = '60px';

                        // Add professional footer
                        const footer = clonedDoc.createElement('div');
                        footer.innerHTML = `
                            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 2px solid #f1f5f9; padding-top: 20px; margin-top: 40px;">
                                <div style="color: #94a3b8; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em;">
                                    Professional Report Generated via WageFlow CRM
                                </div>
                            </div>
                        `;
                        el.appendChild(footer);

                        const style = clonedDoc.createElement('style');
                        style.innerHTML = `
                            * { 
                                color: #0f172a !important; 
                                border-color: #cbd5e1 !important;
                                -webkit-font-smoothing: antialiased;
                            }
                            #printable-report {
                                margin: 0 !important;
                                padding: 60px !important;
                                position: relative;
                            }
                            #printable-report > * {
                                position: relative;
                                z-index: 10;
                            }
                            .text-indigo-600 { color: #4338ca !important; }
                            .text-amber-600 { color: #b45309 !important; }
                            .text-green-600 { color: #15803d !important; }
                            .text-red-600 { color: #b91c1c !important; }
                            .bg-slate-50 { background-color: #f8fafc !important; }
                            .bg-slate-100 { background-color: #f1f5f9 !important; }
                        `;
                        clonedDoc.head.appendChild(style);
                    }
                }
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [canvas.width / 2, canvas.height / 2]
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, (canvas.height / 2 * pdfWidth) / (canvas.width / 2));

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
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 no-print">
                <div className="w-full sm:w-auto flex-1 max-w-sm">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select Employee</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <select
                            value={selectedEmp}
                            onChange={(e) => setSelectedEmp(e.target.value)}
                            className="w-full pl-10 rounded-lg border-slate-300 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="">-- Choose Employee --</option>
                            {employees.map(e => (
                                <option key={e.id} value={e.id}>{e.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {selectedEmp && (
                    <div className="flex gap-2 no-print">
                        <button
                            onClick={handleDownloadPDF}
                            disabled={downloading}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all shadow-sm disabled:opacity-50"
                        >
                            {downloading ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <FileText size={18} />
                            )}
                            <span className="font-bold text-sm">
                                {downloading ? 'Generating...' : 'Download PDF'}
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 print:border-slate-300">
                                <div className="text-slate-500 text-sm font-medium mb-1 print:text-slate-700">Total Earned</div>
                                <div className="text-3xl font-bold text-indigo-600 print:text-black">₹{summary.totalEarned.toLocaleString()}</div>
                                <div className="text-xs text-slate-400 mt-1 print:text-slate-600">Wages & Credits</div>
                            </div>
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 print:border-slate-300">
                                <div className="text-slate-500 text-sm font-medium mb-1 print:text-slate-700">Total Paid / Advanced</div>
                                <div className="text-3xl font-bold text-amber-600 print:text-black">₹{summary.totalPaid.toLocaleString()}</div>
                                <div className="text-xs text-slate-400 mt-1 print:text-slate-600">Cash Outflow</div>
                            </div>
                            <div className={`bg-white p-5 rounded-2xl shadow-sm border border-t-4 print:border-slate-300 ${summary.balance >= 0 ? 'border-t-green-500' : 'border-t-red-500'}`}>
                                <div className="text-slate-500 text-sm font-medium mb-1 print:text-slate-700">Net Payable Balance</div>
                                <div className={`text-3xl font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'} print:text-black`}>
                                    ₹{summary.balance.toLocaleString()}
                                </div>
                                <div className="text-xs text-slate-400 mt-1 print:text-slate-600">
                                    {summary.balance >= 0 ? 'Company owes Employee' : 'Employee owes Company'}
                                </div>
                            </div>
                        </div>

                        {/* Ledger Table */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 print:border-slate-300 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left border-collapse">
                                    <thead className="bg-slate-50 text-slate-500 font-medium uppercase text-xs print:bg-slate-100 print:text-black">
                                        <tr>
                                            <th className="px-6 py-3 print:border-slate-300">Date</th>
                                            <th className="px-6 py-3 print:border-slate-300">Description</th>
                                            <th className="px-6 py-3 text-right text-green-600 print:text-black print:border-slate-300">Credit (+)</th>
                                            <th className="px-6 py-3 text-right text-red-600 print:text-black print:border-slate-300">Debit (-)</th>
                                            <th className="px-6 py-3 text-right font-bold print:border-slate-300">Balance</th>
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
