'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Users,
    Plus,
    Search,
    MoreVertical,
    Phone,
    Briefcase,
    ChevronRight,
    Filter,
    Edit,
    Trash2,
    Loader2
} from 'lucide-react';
import Link from 'next/link';

interface Employee {
    id: string;
    name: string;
    phone: string | null;
    type: string;
    defaultWage: number;
    isActive: boolean;
}

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const res = await fetch('/api/employees');
            const data = await res.json();
            if (Array.isArray(data)) {
                setEmployees(data);
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string, name: string) => {
        e.stopPropagation();
        if (!confirm(`Are you sure you want to delete ${name}? This will also delete their attendance records.`)) {
            return;
        }

        setDeletingId(id);
        try {
            const res = await fetch(`/api/employees/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setEmployees(employees.filter(emp => emp.id !== id));
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to delete employee');
            }
        } catch (error) {
            console.error('Delete Error:', error);
            alert('An error occurred while deleting');
        } finally {
            setDeletingId(null);
        }
    };

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.phone && emp.phone.includes(searchTerm))
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Employees</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage your workforce and their wage settings.</p>
                </div>
                <Link
                    href="/employees/new"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all shadow-md shadow-slate-900/10"
                >
                    <Plus size={18} />
                    Add Employee
                </Link>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                        />
                    </div>
                    <button className="inline-flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-white hover:text-slate-900 transition-all">
                        <Filter size={18} />
                        Filters
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                <th className="px-6 py-4">Employee</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Wage Setting</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-6 py-8 h-16 bg-slate-50/20"></td>
                                    </tr>
                                ))
                            ) : filteredEmployees.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Users className="text-slate-300" size={48} />
                                            <p className="text-slate-500 font-medium">No employees found</p>
                                            <Link href="/employees/new" className="text-slate-900 text-sm font-bold hover:underline">
                                                Add your first employee
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredEmployees.map((employee) => (
                                    <tr
                                        key={employee.id}
                                        onClick={() => router.push(`/employees/${employee.id}`)}
                                        className="group hover:bg-slate-50 transition-colors cursor-pointer"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-900/5 flex items-center justify-center text-slate-700 font-bold border border-slate-200">
                                                    {employee.name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">{employee.name}</p>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <Briefcase size={12} className="text-slate-400" />
                                                        <p className="text-xs text-slate-500 capitalize">{employee.type} Wage</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${employee.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                {employee.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-semibold text-slate-900">₹{employee.defaultWage}</p>
                                            <p className="text-xs text-slate-400">Default rate</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            {employee.phone ? (
                                                <div className="flex items-center gap-2 text-slate-600">
                                                    <Phone size={14} />
                                                    <span className="text-sm font-medium">{employee.phone}</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400">No contact info</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 px-1">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.push(`/employees/${employee.id}`);
                                                    }}
                                                    className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all"
                                                    title="Edit Employee"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={(e) => handleDelete(e, employee.id, employee.name)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 transition-all"
                                                    disabled={deletingId === employee.id}
                                                    title="Delete Employee"
                                                >
                                                    {deletingId === employee.id ? (
                                                        <Loader2 size={18} className="animate-spin" />
                                                    ) : (
                                                        <Trash2 size={18} />
                                                    )}
                                                </button>
                                                <ChevronRight className="ml-1 text-slate-300 group-hover:translate-x-1 transition-transform" size={18} />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
