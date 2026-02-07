import React from 'react';

interface LogoProps {
    className?: string;
    size?: number;
    showBackground?: boolean;
}

export function Logo({ className = "", size = 40, showBackground = true }: LogoProps) {
    return (
        <div
            className={`relative flex items-center justify-center shrink-0 ${className}`}
            style={{ width: size, height: size }}
        >
            {showBackground && (
                <div className="absolute inset-0 bg-slate-900 rounded-[30%] shadow-lg shadow-slate-900/20" />
            )}
            <svg
                viewBox="0 0 200 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="relative z-10 w-[60%] h-[60%]"
            >
                <path
                    d="M40 130V70L100 120L160 70V130"
                    stroke="white"
                    strokeWidth="24"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <circle cx="100" cy="45" r="16" fill="#6366f1" />
            </svg>
        </div>
    );
}
