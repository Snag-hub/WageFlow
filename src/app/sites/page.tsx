'use client';

import { useState, useEffect } from 'react';
import {
    MapPin,
    Plus,
    Search,
    MoreVertical,
    Edit2,
    Trash2,
    Building2
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Site {
    id: string;
    name: string;
    location: string | null;
    _count: {
        attendance: number;
    };
}

export default function SitesPage() {
    const [sites, setSites] = useState<Site[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => {
        fetchSites();
    }, []);

    const fetchSites = async () => {
        try {
            const res = await fetch('/api/sites');
            const data = await res.json();
            if (Array.isArray(data)) {
                setSites(data);
            }
        } catch (error) {
            console.error('Error fetching sites:', error);
        } finally {
            setLoading(false);
        }
    };

    const router = useRouter();

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this site?')) return;

        try {
            const res = await fetch(`/api/sites/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setSites(sites.filter(site => site.id !== id));
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to delete site');
            }
        } catch (error) {
            console.error('Error deleting site:', error);
            alert('Failed to delete site');
        }
    };

    const filteredSites = sites.filter(site =>
        site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (site.location && site.location.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sites</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage your work locations and project sites.</p>
                </div>
                <Link
                    href="/sites/new"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all shadow-md shadow-slate-900/10"
                >
                    <Plus size={18} />
                    Add Site
                </Link>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search sites by name or location..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
                        </div>
                    ) : filteredSites.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="flex flex-col items-center gap-2">
                                <Building2 className="text-slate-300" size={48} />
                                <p className="text-slate-500 font-medium">
                                    {searchTerm ? 'No sites found' : 'No sites yet'}
                                </p>
                                {!searchTerm && (
                                    <Link href="/sites/new" className="text-slate-900 text-sm font-bold hover:underline">
                                        Add your first site
                                    </Link>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                            {filteredSites.map((site) => (
                                <div
                                    key={site.id}
                                    onClick={() => router.push(`/sites/${site.id}`)}
                                    className="p-6 border border-slate-200 rounded-2xl hover:shadow-md transition-all group bg-white cursor-pointer"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
                                            <MapPin className="text-indigo-600" size={24} />
                                        </div>
                                        <div className="flex gap-1">
                                            <Link
                                                href={`/sites/${site.id}`}
                                                onClick={(e) => e.stopPropagation()}
                                                className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all"
                                            >
                                                <Edit2 size={16} />
                                            </Link>
                                            <button
                                                onClick={(e) => handleDelete(e, site.id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-bold text-slate-900 mb-1">{site.name}</h3>
                                    {site.location && (
                                        <p className="text-sm text-slate-500 mb-3 line-clamp-2">{site.location}</p>
                                    )}

                                    <div className="pt-3 border-t border-slate-100">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-400 font-medium">Attendance Records</span>
                                            <span className="text-slate-900 font-bold">{site._count.attendance}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
