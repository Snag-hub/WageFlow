'use client';

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // 1. Check Standalone
        const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone ||
            document.referrer.includes('android-app://');
        setIsStandalone(isStandaloneMode);

        // 2. Check iOS
        const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(ios);

        // 3. Listen for Prompt
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
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

    // Don't show if app is already installed/standalone
    if (isStandalone) return null;

    // Only show if the browser fired the event (or if we want to show a subtle iOS hint, but standard PWA behavior is to hide)
    if (!showPrompt && !isIOS) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:w-96 z-50 bg-white p-4 rounded-2xl shadow-xl border border-slate-200 animate-in slide-in-from-bottom">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                        <Download className="text-slate-900" size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900">Install App</h3>
                        <p className="text-xs text-slate-500">
                            {isIOS ? 'Install for a better experience' : 'Quick access & offline mode'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setShowPrompt(false)}
                    className="text-slate-400 hover:text-slate-900"
                >
                    <X size={20} />
                </button>
            </div>

            {isIOS ? (
                <div className="mt-3 text-[11px] text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">
                    Tap the <strong>Share</strong> button <span className="inline-block align-middle"><Download size={10} /></span> and choose <strong>Add to Home Screen</strong>
                </div>
            ) : (
                <button
                    onClick={handleInstallClick}
                    className="w-full mt-4 bg-slate-900 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-md"
                >
                    Install Now
                </button>
            )}
        </div>
    );
}
