import LedgerView from '@/components/reports/ledger-view';

export default function ReportsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
                <p className="text-slate-500">Financial summaries and ledgers.</p>
            </div>

            <LedgerView />
        </div>
    );
}
