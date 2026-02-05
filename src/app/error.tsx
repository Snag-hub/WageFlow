'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Unhandled Error:', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-8 text-center animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="text-red-600" size={40} />
                </div>

                <h1 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h1>
                <p className="text-slate-500 mb-8">
                    We encountered an unexpected error. Don't worry, your data is safe.
                </p>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => reset()}
                        className="flex items-center justify-center gap-2 w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
                    >
                        <RefreshCcw size={18} />
                        Try Again
                    </button>

                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 w-full py-3 bg-white text-slate-900 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all"
                    >
                        <Home size={18} />
                        Go to Dashboard
                    </Link>
                </div>

                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-8 pt-6 border-t border-slate-100 text-left">
                        <p className="text-xs font-mono text-red-500 bg-red-50 p-3 rounded-lg overflow-auto max-h-40">
                            {error.message}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
