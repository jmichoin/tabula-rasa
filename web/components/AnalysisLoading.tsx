'use client';

import React, { useState, useEffect } from 'react';
import { Music2, Radio, Zap, Layout, Settings, FileText } from 'lucide-react';

const ILLUSTRATIONS = [
    "Object 10.png", "Object 2-1.png", "Object 2-2.png", "Object 2-3.png", "Object 2.png",
    "Object 3-1.png", "Object 3-2.png", "Object 3.png", "Object 4-1.png", "Object 4.png",
    "Object 5-1.png", "Object 5.png", "Object 6-1.png", "Object 6.png", "Object 7-1.png",
    "Object 7.png", "Object 8-1.png", "Object 8.png", "Object 9-1.png", "Object 9.png",
    "Object-1.png", "Object-2.png", "Object-3.png", "Object-4.png", "Object-5.png",
    "Object-6.png", "Object.png"
];

const ANALYZING_MESSAGES = [
    { text: "Initializing analysis engine...", icon: Settings },
    { text: "Identifying song characteristics...", icon: Music2 },
    { text: "Separating vocal layers...", icon: Radio },
    { text: "Isolating drum and percussion stems...", icon: Zap },
    { text: "Extracting bass frequencies...", icon: Zap },
    { text: "Analyzing guitar harmonic content...", icon: Music2 },
    { text: "Estimating guitar tuning...", icon: Settings },
    { text: "Detecting chord progressions...", icon: Layout },
    { text: "Generating precise guitar tabs...", icon: FileText },
    { text: "Learning performance nuances...", icon: Zap },
    { text: "Finalizing AI brain processing...", icon: Layout },
    { text: "Synchronizing results for playback...", icon: Settings }
];

export default function AnalysisLoading() {
    const [currentIllu, setCurrentIllu] = useState(0);
    const [currentMsg, setCurrentMsg] = useState(0);
    const [fade, setFade] = useState(true);
    const [timeLeft, setTimeLeft] = useState(180); // 3 minutes estimate

    useEffect(() => {
        const illuInterval = setInterval(() => {
            setFade(false);
            setTimeout(() => {
                setCurrentIllu((prev) => (prev + 1) % ILLUSTRATIONS.length);
                setFade(true);
            }, 300);
        }, 3000);

        const msgInterval = setInterval(() => {
            setCurrentMsg((prev) => (prev + 1) % ANALYZING_MESSAGES.length);
        }, 4000);

        const timerInterval = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => {
            clearInterval(illuInterval);
            clearInterval(msgInterval);
            clearInterval(timerInterval);
        };
    }, []);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const MsgIcon = ANALYZING_MESSAGES[currentMsg].icon;

    return (
        <div className="flex flex-col w-full min-h-screen bg-[#e8e8e8] overflow-hidden relative">
            {/* Header Skeleton */}
            <header className="w-full flex justify-center py-6 lg:py-8 px-6 lg:px-0">
                <div className="w-full max-w-[1218px] flex items-center justify-between">
                    <div className="h-[46px] w-[180px] bg-white/60 rounded animate-pulse" />
                    <div className="h-[45px] w-[140px] bg-white/60 rounded animate-pulse" />
                </div>
            </header>

            {/* Main Content Skeleton Simulation */}
            <main className="w-full flex justify-center px-6 lg:px-0 pb-20">
                <div className="w-full max-w-[1218px] grid grid-cols-1 lg:grid-cols-[410px_minmax(0,1fr)] gap-[34px] items-start">

                    {/* Song Card Skeleton */}
                    <div className="h-[400px] flex flex-col bg-white/40 rounded-[4px] border border-white/20 animate-pulse overflow-hidden">
                        <div className="h-[220px] bg-white/30" />
                        <div className="p-6 space-y-4">
                            <div className="h-4 w-24 bg-white/30 rounded" />
                            <div className="h-10 w-48 bg-white/30 rounded" />
                            <div className="h-6 w-32 bg-white/30 rounded" />
                        </div>
                    </div>

                    {/* Console Skeleton */}
                    <div className="h-[400px] bg-white/40 rounded-[4px] border border-white/20 animate-pulse p-6 lg:p-8 flex flex-col gap-6">
                        <div className="flex justify-between items-center">
                            <div className="h-8 w-40 bg-white/30 rounded" />
                            <div className="h-10 w-32 bg-white/30 rounded" />
                        </div>
                        <div className="grid grid-cols-4 gap-4 flex-1">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="border border-white/20 rounded-md bg-white/20" />
                            ))}
                        </div>
                    </div>

                    {/* Tabs Card Skeleton */}
                    <div className="lg:row-start-2 h-[410px] bg-white/40 rounded-[4px] border border-white/20 animate-pulse p-8 space-y-6">
                        <div className="flex justify-between">
                            <div className="h-6 w-20 bg-white/30 rounded" />
                            <div className="h-8 w-16 bg-white/30 rounded" />
                        </div>
                        <div className="space-y-2">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="h-3 w-full bg-white/20 rounded" />
                            ))}
                        </div>
                    </div>

                    {/* Chords Skeleton */}
                    <div className="lg:row-start-2 h-[410px] bg-white/40 rounded-[4px] border border-white/20 animate-pulse p-8 flex flex-col gap-8">
                        <div className="h-8 w-32 bg-white/30 rounded" />
                        <div className="h-32 bg-white/20 rounded-md" />
                        <div className="h-2 w-full bg-white/20 rounded-full" />
                    </div>
                </div>
            </main>

            {/* Analysis Overlay Window */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/10 backdrop-blur-[2px]">
                <div className="bg-white rounded-lg shadow-2xl border-4 border-[#1635fb] p-8 max-w-lg w-full flex flex-col items-center gap-8 animate-in zoom-in duration-500">

                    {/* Illustration Window */}
                    <div className="relative w-full aspect-square bg-[#f7f7f7] rounded-md overflow-hidden flex items-center justify-center p-4">
                        <img
                            src={`/illustrations/${ILLUSTRATIONS[currentIllu]}`}
                            alt="Analysis Illustration"
                            className={`max-w-full max-h-full object-contain transition-all duration-500 transform ${fade ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-95 rotate-6'}`}
                        />
                    </div>

                    {/* Status Message & Timer */}
                    <div className="flex flex-col items-center gap-4 text-center w-full">
                        <div className="flex flex-col items-center gap-1">
                            <div className="flex items-center gap-3 text-[#1635fb]">
                                <MsgIcon className="size-6 animate-bounce" />
                                <h3 className="font-['Inter'] font-black text-2xl uppercase tracking-tight">
                                    Analyzing Song
                                </h3>
                            </div>
                            <p className="text-[#1635fb] font-bold text-sm tracking-widest opacity-60">
                                ESTIMATED REMAINING: {formatTime(timeLeft)}
                            </p>
                        </div>

                        <div className="h-8 flex flex-col items-center justify-center">
                            <p className="font-['Inter'] font-semibold text-[#1635fb] opacity-80 animate-in slide-in-from-bottom duration-500">
                                {ANALYZING_MESSAGES[currentMsg].text}
                            </p>
                        </div>
                    </div>

                    {/* Fun Progress Bar */}
                    <div className="w-full bg-[#1635fb]/10 h-3 rounded-full overflow-hidden">
                        <div className="h-full bg-[#1635fb] animate-[progress_180s_linear_infinite] shadow-[0_0_10px_#1635fb]" />
                    </div>

                    <style jsx>{`
                        @keyframes progress {
                            0% { width: 0%; }
                            100% { width: 100%; }
                        }
                    `}</style>
                </div>
            </div>
        </div>
    );
}
