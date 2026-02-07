'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronDown, Search, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// --- CustomDatePicker ---
interface DatePickerProps {
    value: string;
    onChange: (date: string) => void;
    label?: string;
    className?: string;
    placeholder?: string;
}

export const CustomDatePicker: React.FC<DatePickerProps> = ({ value, onChange, label, className, placeholder }) => {
    return (
        <div className={cn("space-y-1.5", className)}>
            {label && <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">{label}</label>}
            <div className="relative group">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={18} />
                <input
                    type="date"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition-all cursor-pointer font-medium text-slate-900 shadow-sm hover:border-slate-300"
                    placeholder={placeholder}
                />
            </div>
        </div>
    );
};

// --- CustomCombobox ---
interface Option {
    id: string;
    name: string;
}

interface ComboboxProps {
    options: Option[];
    value: string;
    onChange: (id: string) => void;
    label?: string;
    placeholder?: string;
    className?: string;
    error?: string;
}

export const CustomCombobox: React.FC<ComboboxProps> = ({ options, value, onChange, label, placeholder = "Select option...", className, error }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.id === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = options.filter(opt =>
        opt.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className={cn("space-y-1.5 relative", className)} ref={containerRef}>
            {label && <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">{label}</label>}

            <div
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center justify-between w-full px-4 py-3 bg-white border rounded-xl transition-all cursor-pointer shadow-sm group",
                    isOpen ? "border-slate-900 ring-2 ring-slate-900/5 shadow-md" : "border-slate-200 hover:border-slate-300",
                    error ? "border-red-500 bg-red-50" : ""
                )}
            >
                <span className={cn("text-sm font-medium", !selectedOption ? "text-slate-400" : "text-slate-900")}>
                    {selectedOption ? selectedOption.name : placeholder}
                </span>
                <ChevronDown className={cn("text-slate-400 transition-transform duration-200", isOpen ? "rotate-180 text-slate-900" : "group-hover:text-slate-600")} size={18} />
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 4, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute z-50 w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden"
                    >
                        <div className="p-2 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
                            <Search className="text-slate-400" size={14} />
                            <input
                                type="text"
                                autoFocus
                                placeholder="Search..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-transparent border-none outline-none text-sm font-medium text-slate-900 placeholder:text-slate-400"
                            />
                        </div>

                        <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((opt) => (
                                    <div
                                        key={opt.id}
                                        onClick={() => {
                                            onChange(opt.id);
                                            setIsOpen(false);
                                            setSearch('');
                                        }}
                                        className={cn(
                                            "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                                            value === opt.id ? "bg-slate-900 text-white" : "hover:bg-slate-100 text-slate-700"
                                        )}
                                    >
                                        <span>{opt.name}</span>
                                        {value === opt.id && <Check size={14} className="text-white" />}
                                    </div>
                                ))
                            ) : (
                                <div className="p-4 text-center text-slate-400 text-xs italic">
                                    No matching options
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
