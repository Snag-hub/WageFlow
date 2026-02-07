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
  LayoutDashboard,
  ClipboardList,
  Wallet,
  BarChart3,
  Settings,
  LayoutGrid
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { WelcomeGuide } from '@/components/ui/welcome-guide';

interface DashboardStats {
  employees: number;
  sites: number;
  attendanceRate: number;
  pendingDues: number;
  recentAttendance: any[];
}

const mainNavItems = [
  { name: 'Employees', href: '/employees', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
  { name: 'Sites', href: '/sites', icon: MapPin, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { name: 'Attendance', href: '/attendance', icon: ClipboardList, color: 'text-amber-500', bg: 'bg-amber-50' },
  { name: 'Transactions', href: '/transactions', icon: Wallet, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { name: 'Reports', href: '/reports', icon: BarChart3, color: 'text-purple-500', bg: 'bg-purple-50' },
  { name: 'Settings', href: '/settings', icon: Settings, color: 'text-slate-500', bg: 'bg-slate-50' },
];

export default function Home() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats>({
    employees: 0,
    sites: 0,
    attendanceRate: 0,
    pendingDues: 0,
    recentAttendance: [],
  });
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  // Trigger tutorial if not seen
  const showTutorial = session?.user && !session.user.hasSeenTutorial;

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
    },
    {
      name: 'Active Sites',
      value: loading ? '...' : stats?.sites.toString() || '0',
      icon: MapPin,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      name: 'Attendance Rate',
      value: loading ? '...' : `${stats?.attendanceRate || 0}%`,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      name: 'Pending Dues',
      value: loading ? '...' : `₹${stats?.pendingDues.toLocaleString() || 0}`,
      icon: AlertCircle,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Header */}
      <div className="text-center pt-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 border border-slate-200/50">
          <Activity size={12} className="text-indigo-500" />
          Live System Status
        </div>
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-3">
          WageFlow <span className="text-indigo-600">Hub</span>
        </h1>
        <p className="text-slate-500 font-medium max-w-lg mx-auto">
          Central management console for your workforce, attendance, and financial records.
        </p>
      </div>

      {/* Main Navigation Grid (The HUB) */}
      <section>
        <div className="flex items-center justify-between mb-6 px-2">
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
            <LayoutGrid size={16} />
            Command Center
          </h2>
          <div className="h-px bg-slate-200 flex-1 ml-6 opacity-50" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {mainNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center p-6 bg-white rounded-[2rem] border-2 border-slate-50 hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 group relative overflow-hidden aspect-square text-center shadow-sm"
            >
              <div className={cn(
                "mb-4 p-4 rounded-2xl transition-all duration-300 group-hover:scale-110 shadow-sm",
                item.bg, item.color
              )}>
                <item.icon size={28} strokeWidth={2.5} />
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-900 group-hover:text-indigo-600">
                {item.name}
              </span>

              {/* Interaction Shine */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </Link>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Statistics Column */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
              <TrendingUp size={16} />
              Insights
            </h2>
            <div className="h-px bg-slate-200 flex-1 ml-6 opacity-50" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {statCards.map((stat) => (
              <div
                key={stat.name}
                className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-3">{stat.name}</p>
                    <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
                  </div>
                  <div className={`${stat.bg} p-3 rounded-2xl group-hover:scale-110 transition-transform shadow-sm`}>
                    <stat.icon className={stat.color} size={20} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white overflow-hidden relative group">
            <div className="relative z-10">
              <p className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] mb-2">Power User Tip</p>
              <h3 className="text-xl font-bold mb-4">Export detailed monthly LEDGER reports directly from the Reports section.</h3>
              <Link href="/reports" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-colors shadow-lg shadow-white/10">
                Go to Reports
                <BarChart3 size={14} />
              </Link>
            </div>
            {/* Decorative background element */}
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-500" />
          </div>
        </div>

        {/* Activity Column */}
        <div className="space-y-8">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
              <Activity size={16} />
              Activity
            </h2>
            <div className="h-px bg-slate-200 flex-1 ml-6 opacity-50" />
          </div>

          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm min-h-[400px]">
            <div className="space-y-4">
              {loading ? (
                [1, 2, 3, 4].map(i => (
                  <div key={i} className="h-14 w-full bg-slate-50 rounded-2xl animate-pulse" />
                ))
              ) : !stats?.recentAttendance || stats.recentAttendance.length === 0 ? (
                <div className="py-20 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <Calendar className="text-slate-200" size={32} />
                  </div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No Recent Logs</p>
                </div>
              ) : (
                stats.recentAttendance.slice(0, 6).map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent group">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center text-[10px] font-black group-hover:scale-110 transition-transform">
                        {record.employeeName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-slate-900 truncate">{record.employeeName}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase truncate">{record.siteName}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`inline-flex px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${record.status === 'Present' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                        }`}>
                        {record.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <Link
              href="/attendance"
              className="mt-8 flex items-center justify-center w-full py-4 bg-slate-50 hover:bg-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-slate-900 transition-all border border-dashed border-slate-200"
            >
              Browse Attendance logs
            </Link>
          </div>
        </div>
      </div>
      {showTutorial && <WelcomeGuide />}
    </div>
  );
}
