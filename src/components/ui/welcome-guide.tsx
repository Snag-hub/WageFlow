'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutGrid,
    Sparkles,
    Zap,
    ShieldCheck,
    ArrowRight,
    CheckCircle2,
    X
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { Logo } from './logo';

interface Step {
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
}

const steps: Step[] = [
    {
        title: "Welcome to WageFlow",
        description: "We've redesigned your dashboard to be cleaner, faster, and more app-like. No sidebars, no clutter—just your business at your fingertips.",
        icon: <Logo size={48} showBackground={true} />,
        color: "slate"
    },
    {
        title: "The Hub Architecture",
        description: "Your new Landing Page is now the central 'Hub'. Everything you need is organized in a high-definition grid for instant access.",
        icon: <LayoutGrid className="w-12 h-12 text-indigo-600" />,
        color: "indigo"
    },
    {
        title: "Smart Insights",
        description: "Stay ahead with real-time stats and an activity feed that keeps you informed about your workforce productivity and dues.",
        icon: <Sparkles className="w-12 h-12 text-amber-500" />,
        color: "amber"
    },
    {
        title: "Personalized for You",
        description: "Your company branding is now integrated into the UI. Click your profile icon to manage account details and security.",
        icon: <ShieldCheck className="w-12 h-12 text-emerald-600" />,
        color: "emerald"
    }
];

export function WelcomeGuide() {
    const { data: session, update } = useSession();
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleComplete();
        }
    };

    const handleComplete = async () => {
        setIsVisible(false);
        try {
            await fetch('/api/user', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hasSeenTutorial: true }),
            });
            // Update the local session state so it reflects in page.tsx immediately
            await update({ hasSeenTutorial: true });
        } catch (error) {
            console.error('Failed to update tutorial status:', error);
        }
    };

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative max-w-lg w-full bg-white rounded-[2rem] shadow-2xl shadow-slate-900/40 overflow-hidden"
                >
                    {/* Progress Bar */}
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100 flex">
                        {steps.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-full transition-all duration-500 ${idx <= currentStep ? 'bg-indigo-600' : 'bg-transparent'}`}
                                style={{ width: `${100 / steps.length}%` }}
                            />
                        ))}
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={handleComplete}
                        className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="p-10 pt-14 text-center">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex flex-col items-center"
                        >
                            <div className="mb-8 p-6 bg-slate-50 rounded-[2rem]">
                                {steps[currentStep].icon}
                            </div>

                            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">
                                {steps[currentStep].title}
                            </h2>

                            <p className="text-lg text-slate-500 font-medium leading-relaxed mb-10">
                                {steps[currentStep].description}
                            </p>
                        </motion.div>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleNext}
                                className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 group"
                            >
                                {currentStep === steps.length - 1 ? 'Get Started' : 'Next Step'}
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>

                            {currentStep < steps.length - 1 && (
                                <button
                                    onClick={handleComplete}
                                    className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors py-2"
                                >
                                    Skip integration tour
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
