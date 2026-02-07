'use client';

import { useState, useEffect } from 'react';
import AttendanceSheet from '@/components/attendance/attendance-sheet';

export default function AttendancePage() {
    const [date, setDate] = useState<Date>(new Date());
    const [selectedSiteId, setSelectedSiteId] = useState<string>('');
    const [selectedPayerId, setSelectedPayerId] = useState<string>('');
    const [sites, setSites] = useState<{ id: string, name: string }[]>([]);
    const [payers, setPayers] = useState<{ id: string, name: string }[]>([]);

    // Fetch Sites & Payers on load
    useEffect(() => {
        Promise.all([
            fetch('/api/sites').then(res => res.json()),
            fetch('/api/payers').then(res => res.json())
        ]).then(([sitesData, payersData]) => {
            setSites(sitesData);
            setPayers(payersData);
            // Auto-select first site if available
            if (sitesData.length > 0) setSelectedSiteId(sitesData[0].id);
            if (payersData.length > 0) setSelectedPayerId(payersData[0].id);
        });
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">Daily Attendance</h1>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200 sticky top-4 z-10">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Select Date</label>
                    <input
                        type="date"
                        value={date.toISOString().split('T')[0]}
                        onChange={(e) => setDate(new Date(e.target.value))}
                        className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </div>

                <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Select Site</label>
                    <select
                        value={selectedSiteId}
                        onChange={(e) => setSelectedSiteId(e.target.value)}
                        className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                        <option value="">-- Choose Site --</option>
                        {sites.map(site => (
                            <option key={site.id} value={site.id}>{site.name}</option>
                        ))}
                    </select>
                </div>

                <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Select Payer</label>
                    <select
                        value={selectedPayerId}
                        onChange={(e) => setSelectedPayerId(e.target.value)}
                        className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                        <option value="">-- Choose Payer --</option>
                        {payers.map(payer => (
                            <option key={payer.id} value={payer.id}>{payer.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Sheet */}
            {selectedSiteId && selectedPayerId ? (
                <AttendanceSheet
                    key={`${date.toISOString()}-${selectedSiteId}-${selectedPayerId}`} // Force remount on change
                    date={date}
                    siteId={selectedSiteId}
                    payerId={selectedPayerId}
                    onSaveSuccess={() => { }} // Optional: Flash success or something
                />
            ) : (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <p className="text-slate-500">Please select a site to view the attendance sheet.</p>
                </div>
            )}
        </div>
    );
}
