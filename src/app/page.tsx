'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  MapPin,
  TrendingUp,
  AlertCircle,
  Activity,
  Calendar,
  IndianRupee,
  LayoutDashboard
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  employees: number;
  sites: number;
  attendanceRate: number;
  pendingDues: number;
  recentAttendance: any[];
}

export default function Home() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/dashboard/stats');
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const statCards = [
    {
      name: 'Total Employees',
      value: loading ? '...' : stats?.employees.toString() || '0',
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      description: 'Registered workers'
    },
    {
      name: 'Active Sites',
      value: loading ? '...' : stats?.sites.toString() || '0',
      icon: MapPin,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      description: 'Current locations'
    },
    {
      name: 'Attendance Rate',
      value: loading ? '...' : `${stats?.attendanceRate || 0}%`,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      description: 'Last 7 days'
    },
    {
      name: 'Pending Dues',
      value: loading ? '...' : `₹${stats?.pendingDues.toLocaleString() || 0}`,
      icon: AlertCircle,
      color: 'text-red-600',
      bg: 'bg-red-50',
      description: 'Unpaid advances/wages'
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Overview</h1>
          <p className="text-slate-500 text-sm mt-1">Welcome back. Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 shadow-sm flex items-center gap-2">
            <Calendar size={16} className="text-slate-400" />
            {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.name}
            className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{stat.name}</p>
                <div className="flex items-baseline gap-1 mt-2">
                  <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                </div>
              </div>
              <div className={`${stat.bg} p-3 rounded-2xl group-hover:scale-110 transition-transform`}>
                <stat.icon className={stat.color} size={24} />
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-400 font-medium">{stat.description}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Activity className="text-slate-400" size={20} />
              Recent Attendance
            </h2>
            <Link href="/attendance" className="text-sm font-bold text-slate-900 hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-1">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="h-16 w-full bg-slate-50 rounded-xl animate-pulse" />
              ))
            ) : !stats?.recentAttendance || stats.recentAttendance.length === 0 ? (
              <div className="py-12 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="text-slate-300" size={32} />
                </div>
                <p className="text-slate-500 font-medium">No attendance records yet.</p>
                <Link href="/attendance" className="mt-2 text-slate-900 text-sm font-bold hover:underline">
                  Mark today's attendance
                </Link>
              </div>
            ) : (
              stats.recentAttendance.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center text-sm font-bold">
                      {record.employeeName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{record.employeeName}</p>
                      <p className="text-xs text-slate-500">{record.siteName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${record.status === 'Present' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}>
                      {record.status}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">{record.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <LayoutDashboard className="text-slate-400" size={20} />
            Quick Actions
          </h2>
          <div className="space-y-3 flex-1">
            <Link
              href="/attendance"
              className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-white transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calendar size={20} />
              </div>
              <span className="text-sm font-bold text-slate-700">Mark Attendance</span>
            </Link>

            <Link
              href="/employees/new"
              className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-white transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users size={20} />
              </div>
              <span className="text-sm font-bold text-slate-700">Add New Employee</span>
            </Link>

            <Link
              href="/transactions"
              className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-white transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <IndianRupee size={20} />
              </div>
              <span className="text-sm font-bold text-slate-700">Record Advance</span>
            </Link>
          </div>

          <div className="mt-6 p-4 bg-slate-900 rounded-2xl text-white">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Support</p>
            <p className="text-sm font-medium mt-2">Need help with onboarding?</p>
            <button className="mt-4 w-full py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all">
              Schedule training
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
