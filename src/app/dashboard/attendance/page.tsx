'use client';

import { useState, useEffect } from 'react';
import AttendanceSheet from '@/components/attendance/attendance-sheet';

export default function AttendancePage() {
    const [date, setDate] = useState<Date>(new Date());
    const [selectedSiteId, setSelectedSiteId] = useState<string>('');
    const [sites, setSites] = useState<{ id: string, name: string }[]>([]);

    // Fetch Sites on load
    useEffect(() => {
        fetch('/api/sites')
            .then(res => res.json())
            .then(data => {
                setSites(data);
                // Auto-select first site if available
                if (data.length > 0) setSelectedSiteId(data[0].id);
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
            </div>

            {/* Sheet */}
            {selectedSiteId ? (
                <AttendanceSheet
                    key={`${date.toISOString()}-${selectedSiteId}`} // Force remount on change
                    date={date}
                    siteId={selectedSiteId}
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
