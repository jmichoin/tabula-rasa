'use client';

import React, { useRef, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Edit3 } from 'lucide-react';

interface Chord {
    chord: string;
    start: number;
    end: number;
}

interface MotionChordsProps {
    chords: Chord[];
    currentTime: number;
    onEdit?: () => void;
}

const PLACEHOLDER_CHORDS = [
    { chord: 'A', start: 0, end: 1 },
    { chord: 'A', start: 1, end: 2 },
    { chord: 'Am', start: 2, end: 3 },
    { chord: 'Em', start: 3, end: 4 },
    { chord: 'D7', start: 4, end: 5 },
    { chord: 'D', start: 5, end: 6 }
];

export default function MotionChords({ chords = [], currentTime, onEdit }: MotionChordsProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const activeChordRef = useRef<HTMLDivElement>(null);

    const displayChords = chords.length > 0 ? chords : PLACEHOLDER_CHORDS;

    const activeIndex = useMemo(() => {
        if (currentTime <= 0) return 0;
        for (let i = 0; i < displayChords.length; i++) {
            const current = displayChords[i];
            const next = displayChords[i + 1];
            if (currentTime >= current.start && (!next || currentTime < next.start)) {
                return i;
            }
        }
        return -1;
    }, [displayChords, currentTime]);

    useEffect(() => {
        if (activeChordRef.current && scrollRef.current) {
            // Scroll to center the active chord within the container
            const container = scrollRef.current;
            const item = activeChordRef.current;
            const scrollPos = item.offsetLeft - (container.offsetWidth / 2) + (item.offsetWidth / 2);
            container.scrollTo({ left: scrollPos, behavior: 'smooth' });
        }
    }, [activeIndex]);

    const totalDuration = displayChords.length > 0 ? displayChords[displayChords.length - 1].end : 1;
    const progressPercent = Math.min((currentTime / totalDuration) * 100, 100);

    return (
        <div className="bg-white rounded-[4px] p-6 lg:p-10 shadow-sm w-full overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-6">
                    <div className="flex items-center gap-3">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#fdc700] shrink-0">
                            <path d="M12 20V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M18 20V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M6 20V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <h2 className="font-['Inter'] font-medium text-[#1635fb] text-[20px] lg:text-[28px] tracking-tight whitespace-nowrap">Chords</h2>
                    </div>
                    <div className="flex items-center gap-2 lg:gap-4">
                        <span className="text-[#1635fb] text-[9px] font-bold tracking-[0.5px] uppercase leading-none opacity-60 whitespace-nowrap">AUTOMATIC CHORD SYNC</span>
                    </div>
                </div>
                <button
                    onClick={onEdit}
                    className="bg-[#1635fb] hover:bg-[#1024b0] text-white rounded-[4px] px-4 lg:px-6 h-[40px] lg:h-[45px] flex items-center gap-2 text-[14px] lg:text-[16px] transition-colors shrink-0"
                >
                    <Edit3 className="size-4" /> Edit
                </button>
            </div>

            {/* Chord Slider - Constrained to 100% parent width */}
            <div className="relative mb-8 overflow-hidden h-[120px] bg-[#f7f7f7] rounded-[4px] border border-[#f0f0f0]">
                <div
                    ref={scrollRef}
                    className="flex gap-4 overflow-x-auto scrollbar-hide py-4 px-[150px] lg:px-[30%]"
                    style={{ scrollBehavior: 'smooth' }}
                >
                    {displayChords.map((c, i) => {
                        const isActive = i === activeIndex;
                        return (
                            <div
                                key={`${c.chord}-${i}`}
                                ref={isActive ? activeChordRef : null}
                                className={cn(
                                    "flex-shrink-0 w-[120px] lg:w-[140px] h-[80px] lg:h-[90px] border border-[#1635fb] rounded-[4px] flex flex-col items-center justify-center transition-all duration-300",
                                    isActive ? "bg-[#ffe042] border-[#1635fb] scale-105 shadow-md z-10" : "bg-white opacity-60"
                                )}
                            >
                                <span className="text-[#1635fb] text-[32px] lg:text-[42px] font-black italic tracking-tighter leading-none">{c.chord}</span>
                                <span className="text-[#1635fb] text-[10px] lg:text-[12px] font-bold mt-1 opacity-80">
                                    {Math.floor(c.start / 60)}:{(c.start % 60).toFixed(0).padStart(2, '0')}
                                </span>
                            </div>
                        );
                    })}
                    {/* Padding at the end to allow for centering */}
                    <div className="flex-shrink-0 w-[50%]" />
                </div>

                {/* Visual center indicator (optional but helpful for 'compact' feel) */}
                <div className="absolute left-1/2 top-4 bottom-4 w-px border-l border-dashed border-[#1635fb]/10 pointer-events-none" />
            </div>

            {/* Progress Bar Layer - Matching the container width */}
            <div className="relative h-1.5 bg-[#e8e8e8] rounded-full w-full overflow-hidden">
                <div
                    className="absolute left-0 top-0 h-full bg-[#1635fb] transition-all duration-100 ease-linear"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>
        </div>
    );
}
