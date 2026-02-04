'use client';

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Check if running in standalone mode
        const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone ||
            document.referrer.includes('android-app://');

        setIsStandalone(isStandaloneMode);

        // Check if iOS
        const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(ios);

        // Listen for beforeinstallprompt
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setShowPrompt(false);
        }
    };

    if (isStandalone) return null; // Don't show if already installed

    // iOS Instruction
    if (isIOS && !isStandalone) {
        return (
            <div className="fixed bottom-4 left-4 right-4 z-50 bg-slate-900 text-white p-4 rounded-2xl shadow-xl border border-slate-700 animate-in slide-in-from-bottom flex flex-col gap-2">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/10 p-2 rounded-lg">
                            <Download size={24} />
                        </div>
                        <div>
                            <p className="font-bold text-sm">Install WageFlow</p>
                            <p className="text-xs text-slate-400">Add to home screen for the best experience</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowPrompt(false)} // Just hide it locally
                        className="text-slate-400 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="text-xs text-slate-400 border-t border-white/10 pt-2 mt-1">
                    Tap <span className="inline-block px-1.5 py-0.5 bg-slate-800 rounded mx-1">Share</span> then <span className="inline-block px-1.5 py-0.5 bg-slate-800 rounded mx-1">Add to Home Screen</span>
                </div>
            </div>
        );
    }

    // Android / Desktop Install Prompt
    if (showPrompt) {
        return (
            <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:w-96 z-50 bg-white p-4 rounded-2xl shadow-xl border border-slate-200 animate-in slide-in-from-bottom">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="Logo" className="w-12 h-12 rounded-xl object-cover bg-slate-50" />
                        <div>
                            <h3 className="font-bold text-slate-900">Install App</h3>
                            <p className="text-xs text-slate-500">Install WageFlow for offline access and better performance.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowPrompt(false)}
                        className="text-slate-400 hover:text-slate-900 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
                <button
                    onClick={handleInstallClick}
                    className="w-full mt-4 bg-slate-900 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-md shadow-slate-900/10"
                >
                    Install Now
                </button>
            </div>
        );
    }

    return null;
}
