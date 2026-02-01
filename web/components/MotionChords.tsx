'use client';

import React, { useRef, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Edit3, Activity } from 'lucide-react';
import Image from 'next/image';

interface Chord {
    chord: string;
    start: number;
    end: number;
    confidence?: number;
}

interface MotionChordsProps {
    chords: Chord[];
    currentTime: number;
    onEdit?: () => void;
    onChordClick?: (index: number) => void;
}

const PLACEHOLDER_CHORDS: Chord[] = [
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
        if (displayChords.length === 0) return -1;
        if (currentTime <= 0) return 0;

        // Find the chord that contains the current time
        for (let i = 0; i < displayChords.length; i++) {
            const current = displayChords[i];
            const next = displayChords[i + 1];

            // If we're within this chord's duration (before next chord starts)
            if (currentTime >= current.start && (!next || currentTime < next.start)) {
                return i;
            }
        }

        // If currentTime is after all chords, stay on the last one
        if (currentTime >= displayChords[displayChords.length - 1].start) {
            return displayChords.length - 1;
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
        <div className="bg-white rounded-[4px] shadow-2xl p-8 lg:p-10 flex flex-col border border-[#1635fb]/10 transition-all hover:border-[#1635fb]/30 w-full overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <Image src="/uploaded_media_1769943593572.png" alt="Chords Icon" width={32} height={32} />
                    <h3 className="font-['Inter'] font-semibold text-[#1635fb] text-[26px] tracking-tight whitespace-nowrap">Chord Sync</h3>
                </div>
                <button
                    onClick={onEdit}
                    className="bg-[#1635fb] text-white rounded-[4px] px-4 py-2 flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest hover:bg-[#1024b0] transition-all shadow-md active:scale-95"
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
                        const confidence = c.confidence ?? 1.0;
                        const isLowConfidence = confidence < 0.7;

                        return (
                            <div
                                key={`${c.chord}-${i}`}
                                ref={isActive ? activeChordRef : null}
                                onClick={() => onEdit && onEdit()} // Open edit modal on click
                                className={cn(
                                    "flex-shrink-0 w-[120px] lg:w-[140px] h-[80px] lg:h-[90px] border rounded-[4px] flex flex-col items-center justify-center transition-all duration-300 cursor-pointer hover:scale-105",
                                    isActive ? "bg-[#ffe042] border-[#1635fb] scale-105 shadow-md z-10" : "bg-white",
                                    !isActive && isLowConfidence ? "border-dashed border-[#1635fb]/40 opacity-50" : "border-[#1635fb]",
                                    !isActive && !isLowConfidence ? "opacity-60" : ""
                                )}
                            >
                                <span className="text-[#1635fb] text-[32px] lg:text-[42px] font-black italic tracking-tighter leading-none">{c.chord}</span>
                                <span className="text-[#1635fb] text-[10px] lg:text-[12px] font-bold mt-1 opacity-80">
                                    {Math.floor(c.start / 60)}:{(c.start % 60).toFixed(0).padStart(2, '0')}
                                </span>
                                {isLowConfidence && (
                                    <span className="text-[8px] font-bold text-red-500 uppercase tracking-widest mt-1">Low Confidence</span>
                                )}
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
