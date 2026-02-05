'use client';

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [debugLog, setDebugLog] = useState<string>('Init...');

    useEffect(() => {
        // 1. Check Standalone
        const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone ||
            document.referrer.includes('android-app://');
        setIsStandalone(isStandaloneMode);

        // 2. Check iOS
        const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(ios);

        // 3. Service Worker Check
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistration().then(reg => {
                setDebugLog(prev => prev + ` | SW: ${reg ? 'Found' : 'Missing'}`);
                if (reg) console.log('SW Registration:', reg);
            });
        } else {
            setDebugLog(prev => prev + ' | SW: Not Supported');
        }

        // 4. Listen for Prompt
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowPrompt(true);
            setDebugLog(prev => prev + ' | Prompt: FIRED');
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

    if (isStandalone) return null;

    return (
        <>
            {/* DEBUG OVERLAY - Remove after fixing */}
            <div className="fixed top-16 right-2 z-[9999] bg-black/90 text-white text-[10px] p-2 rounded max-w-[200px] break-words pointer-events-none">
                DEBUG: {debugLog} | iOS: {String(isIOS)}
            </div>

            {/* Custom Install Button (Always Visible for testing) */}
            {!isStandalone && (
                <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:w-96 z-50 bg-white p-4 rounded-2xl shadow-xl border border-slate-200 animate-in slide-in-from-bottom">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                                <Download className="text-slate-900" size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">Install App</h3>
                                <p className="text-xs text-slate-500">
                                    {deferredPrompt ? 'Quick access & offline' : 'Tap 3 dots -> Add to Home Screen'}
                                </p>
                            </div>
                        </div>
                        {deferredPrompt && (
                            <button
                                onClick={() => setShowPrompt(false)}
                                className="text-slate-400 hover:text-slate-900"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>

                    {deferredPrompt ? (
                        <button
                            onClick={handleInstallClick}
                            className="w-full mt-4 bg-slate-900 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-md"
                        >
                            Install Now
                        </button>
                    ) : (
                        <div className="mt-3 text-[11px] text-amber-600 bg-amber-50 p-2 rounded border border-amber-100">
                            Browser didn't trigger install yet. {isIOS ? 'Use Share -> Add to Home Screen' : 'Use Chrome Menu -> Install App'}
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
