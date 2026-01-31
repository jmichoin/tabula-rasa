'use client';

import React, { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Volume2, Play, Pause } from 'lucide-react';

interface StemMixerProps {
    stems: Record<string, string>;
    onTimeUpdate?: (time: number) => void;
    isPlaying: boolean;
    onPlayPause: () => void;
}

function DrumIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 10C5 7.79086 8.13401 6 12 6C15.866 6 19 7.79086 19 10M5 10C5 12.2091 8.13401 14 12 14C15.866 14 19 12.2091 19 10M5 10V16C5 18.2091 8.13401 20 12 20C15.866 20 19 18.2091 19 16V10M12 10V6M7 4L11 7M17 4L13 7" stroke="#FDC700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function BassIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="5" y="4" width="14" height="16" rx="2" stroke="#FDC700" strokeWidth="2" />
            <circle cx="12" cy="14" r="3" stroke="#FDC700" strokeWidth="2" />
            <rect x="11" y="7" width="2" height="2" fill="#FDC700" stroke="#FDC700" strokeWidth="1" />
        </svg>
    );
}

function GuitarIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 13V15.5C7 16.8807 5.88071 18 4.5 18C3.11929 18 2 16.8807 2 15.5C2 14.1193 3.11929 13 4.5 13H7ZM7 13V5L17 4V12M17 12V14.5C17 15.8807 15.8807 17 14.5 17C13.1193 17 12 15.8807 12 14.5C12 13.1193 13.1193 12 14.5 12H17ZM7 9L17 8" stroke="#FDC700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function VocalsIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="14" cy="10" r="4" stroke="#FDC700" strokeWidth="2" />
            <path d="M11.5 13L7 20M9 16L12 19M11.5 13C11 12.5 10 13 9 14M8 17C7 18 6 19 5 21" stroke="#FDC700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export default function StemMixer({ stems = {}, onTimeUpdate, isPlaying, onPlayPause }: StemMixerProps) {
    const [mutes, setMutes] = useState<Record<string, boolean>>({
        vocals: false, bass: false, guitar: false, drums: false
    });
    const [volumes, setVolumes] = useState<Record<string, number>>({
        vocals: 1, bass: 1, guitar: 1, drums: 1
    });

    const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});

    const displayStems = Object.keys(stems).length > 0 ? stems : {};

    const masterStem = stems.vocals ? 'vocals' : (stems.guitar ? 'guitar' : Object.keys(stems)[0] || 'vocals');

    // Effect to handle play/pause sync across all stems
    useEffect(() => {
        Object.entries(audioRefs.current).forEach(([name, audio]) => {
            if (audio && stems[name]) {
                if (isPlaying) {
                    const master = audioRefs.current[masterStem];
                    // Sync time only if significantly out of sync or just starting
                    if (master && name !== masterStem && Math.abs(audio.currentTime - master.currentTime) > 0.1) {
                        audio.currentTime = master.currentTime;
                    }
                    audio.play().catch(console.error);
                } else {
                    audio.pause();
                }
            }
        });
    }, [isPlaying, masterStem, stems]);

    const handleVolumeChange = (name: string, value: number) => {
        setVolumes(prev => ({ ...prev, [name]: value }));
        if (audioRefs.current[name]) {
            audioRefs.current[name]!.volume = value;
        }
    };

    const toggleMute = (name: string) => {
        const newMute = !mutes[name];
        setMutes(prev => ({ ...prev, [name]: newMute }));
        if (audioRefs.current[name]) {
            audioRefs.current[name]!.muted = newMute;
        }
    };

    const getIcon = (name: string) => {
        const lower = name.toLowerCase();
        if (lower.includes('drum')) return <DrumIcon />;
        if (lower.includes('bass')) return <BassIcon />;
        if (lower.includes('guitar')) return <GuitarIcon />;
        if (lower.includes('vocal')) return <VocalsIcon />;
        return <GuitarIcon />;
    };

    if (Object.keys(displayStems).length === 0) return null;

    return (
        <div id="practice-console" className="bg-white rounded-[4px] p-4 lg:p-6 shadow-sm w-full h-full flex flex-col border border-[#1635fb]/10">
            <div className="flex items-center justify-between mb-4 lg:mb-6">
                <div className="flex items-center gap-2 lg:gap-3">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#fdc700] shrink-0">
                        <path d="M11 5L6 9H2V15H6L11 19V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M15.54 8.46C16.4774 9.39764 17.004 10.6692 17.004 11.995C17.004 13.3208 16.4774 14.5924 15.54 15.53" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M19.07 4.93C20.9447 6.80528 21.9979 9.34836 21.9979 12C21.9979 14.6516 20.9447 17.1947 19.07 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <h2 className="font-['Inter'] font-semibold text-[#1635fb] text-[16px] lg:text-[20px] tracking-tight whitespace-nowrap">Practice Console</h2>
                </div>
                <button
                    onClick={onPlayPause}
                    className="group bg-[#ffe042] hover:bg-[#ffd600] active:scale-95 rounded-[4px] px-6 lg:px-10 h-[40px] lg:h-[48px] flex items-center gap-2 lg:gap-3 transition-all shrink-0 shadow-[0_4px_0_0_#d9b300] hover:shadow-[0_2px_0_0_#d9b300] hover:translate-y-[2px]"
                >
                    {isPlaying ? (
                        <Pause className="size-4 lg:size-5 fill-[#1635fb] text-[#1635fb] stroke-0" />
                    ) : (
                        <Play className="size-4 lg:size-5 fill-[#1635fb] text-[#1635fb] stroke-0" />
                    )}
                    <span className="font-['Inter'] font-black text-[#1635fb] text-[13px] lg:text-[16px] uppercase tracking-[1.5px] whitespace-nowrap">
                        {isPlaying ? 'Stop Session' : 'Play Session'}
                    </span>
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 lg:gap-3 w-full flex-1 min-h-0">
                {Object.entries(displayStems).map(([name, url]) => (
                    <div key={name} className="border border-[#1635fb]/20 rounded-[4px] p-3 lg:p-5 flex flex-col items-center justify-between gap-3 lg:gap-4 min-w-0 bg-white shadow-sm hover:border-[#1635fb]/40 transition-colors">
                        <audio
                            ref={el => { audioRefs.current[name] = el; }}
                            src={url}
                            loop
                            onTimeUpdate={name === masterStem ? (e) => onTimeUpdate?.(e.currentTarget.currentTime) : undefined}
                        />
                        <div className="bg-[#1635fb] rounded-full size-[36px] lg:size-[48px] flex items-center justify-center shrink-0">
                            {getIcon(name)}
                        </div>
                        <span className="font-['Inter'] font-bold text-[#1635fb] text-[9px] lg:text-[11px] tracking-[1px] lg:tracking-[2px] uppercase truncate w-full text-center">{name}</span>

                        <div className="w-full space-y-2 lg:space-y-3">
                            <div className="flex justify-between items-center text-[#1635fb] text-[9px] lg:text-[10px] font-bold opacity-60">
                                <Volume2 className="size-3 lg:size-4" strokeWidth={3} />
                                <span>{Math.round(volumes[name] * 100)}%</span>
                            </div>
                            <div className="relative h-1 lg:h-1.5 bg-[#27272a]/10 rounded-full">
                                <div className="absolute left-0 top-0 h-full bg-[#1635fb] rounded-full" style={{ width: `${volumes[name] * 100}%` }} />
                                <input
                                    type="range" min="0" max="1" step="0.01"
                                    value={volumes[name]}
                                    onChange={(e) => handleVolumeChange(name, parseFloat(e.target.value))}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                />
                                <div className="absolute size-3 lg:size-4 bg-[#1635fb] rounded-full -top-1 lg:-top-1.5 border-2 border-white shadow-md pointer-events-none" style={{ left: `calc(${volumes[name] * 100}% - 8px)` }} />
                            </div>
                        </div>

                        <button
                            onClick={() => toggleMute(name)}
                            className={cn(
                                "w-full h-[32px] lg:h-[36px] rounded-[4px] font-['Inter'] font-bold text-[11px] lg:text-[12px] uppercase tracking-wide transition-all border truncate shadow-sm",
                                !mutes[name]
                                    ? "bg-[#ffe042] border-[#ffe042] text-[#1635fb]"
                                    : "bg-white border-[#1635fb]/20 text-[#1635fb]/60"
                            )}
                        >
                            {!mutes[name] ? 'On Air' : 'Muted'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
