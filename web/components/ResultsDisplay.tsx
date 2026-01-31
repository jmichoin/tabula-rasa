'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import { Activity, Music2, FileText, Brain, Edit3, X, RefreshCcw, Star, Plus, Trash2, Check, Zap, Gauge, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import StemMixer from './StemMixer';
import MotionChords from './MotionChords';

interface Note {
    start: number;
    end: number;
    pitch: number;
    velocity: number;
}

interface Chord {
    chord: string;
    start: number;
    end: number;
}

interface SongInfo {
    title: string;
    artist: string;
    images?: { coverart?: string; background?: string };
    is_hint?: boolean;
    shazam_id?: string;
    method?: 'shazam' | 'filename' | 'manual';
    images_url?: string;
}

interface ResultsProps {
    data: {
        key: string;
        tuning: string;
        chords: Chord[];
        notes: Note[];
        pro_tab?: string;
        stems?: Record<string, string>;
        online_chords?: string[];
        tempo?: number;
        song_info?: SongInfo;
    };
}

export default function ResultsDisplay({ data }: ResultsProps) {
    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [activeModal, setActiveModal] = useState<'chords' | 'tab' | null>(null);
    const [editableChords, setEditableChords] = useState<Chord[]>(data.chords || []);
    const [editableTab, setEditableTab] = useState(data.pro_tab || "");
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    const guitarTab = useMemo(() => {
        if (!data.notes || data.notes.length === 0) return "";
        let baseOffsets = [64, 59, 55, 50, 45, 40];
        const tuning = data.tuning.toLowerCase();
        if (tuning.includes('eb standard') || tuning.includes('half step down')) {
            baseOffsets = baseOffsets.map(n => n - 1);
        } else if (tuning.includes('d standard')) {
            baseOffsets = baseOffsets.map(n => n - 2);
        } else if (tuning.includes('db standard')) {
            baseOffsets = baseOffsets.map(n => n - 3);
        } else if (tuning.includes('c standard')) {
            baseOffsets = baseOffsets.map(n => n - 4);
        } else if (tuning.includes('drop d')) {
            baseOffsets[5] -= 2;
        } else if (tuning.includes('drop c')) {
            baseOffsets = baseOffsets.map(n => n - 2);
            baseOffsets[5] -= 2;
        }

        const strings = [
            { label: 'e', open: baseOffsets[0] },
            { label: 'B', open: baseOffsets[1] },
            { label: 'G', open: baseOffsets[2] },
            { label: 'D', open: baseOffsets[3] },
            { label: 'A', open: baseOffsets[4] },
            { label: 'E', open: baseOffsets[5] }
        ];
        const tempo = data.tempo || 120;
        const slotDuration = 60 / tempo / 4;
        const maxTime = Math.max(...data.notes.map(n => n.end), 1);
        const numSlots = Math.ceil(maxTime / slotDuration);
        const tabLines = strings.map(() => Array(numSlots).fill('-'));

        data.notes.forEach(note => {
            const slotIndex = Math.floor(note.start / slotDuration);
            if (slotIndex >= numSlots) return;
            let bestStringIdx = -1;
            let bestFret = 99;
            strings.forEach((s, idx) => {
                const fret = note.pitch - s.open;
                if (fret >= 0 && fret <= 22) {
                    if (fret < bestFret) {
                        bestFret = fret;
                        bestStringIdx = idx;
                    }
                }
            });
            if (bestStringIdx !== -1 && tabLines[bestStringIdx][slotIndex] === '-') {
                tabLines[bestStringIdx][slotIndex] = (note.pitch - strings[bestStringIdx].open).toString();
            }
        });

        const blockSize = 64;
        let finalTab = "";
        for (let b = 0; b < numSlots; b += blockSize) {
            const end = Math.min(b + blockSize, numSlots);
            strings.forEach((s, i) => {
                let line = `${s.label} |`;
                for (let k = b; k < end; k++) {
                    if (k > b && k % 16 === 0) line += '|';
                    line += tabLines[i][k].padEnd(3, '-');
                }
                finalTab += `${line}|\n`;
            });
            finalTab += "\n";
        }
        return finalTab;
    }, [data.notes, data.tempo, data.tuning]);

    useEffect(() => {
        if (data?.song_info) {
            console.log("DEBUG: Final Song Info in Frontend:", data.song_info);
        }
    }, [data?.song_info]);

    return (
        <div className="flex flex-col w-full min-h-screen bg-[#e8e8e8] pb-20">
            {/* Premium Header */}
            <header className="w-full flex justify-center py-6 lg:py-8 px-6 lg:px-0 bg-white/40 backdrop-blur-md sticky top-0 z-50 border-b border-[#1635fb]/5">
                <div className="w-full max-w-[1218px] flex items-center justify-between">
                    <div className="flex gap-[3px] items-center">
                        <Image src="/logo.png" alt="Logo" width={180} height={46} className="h-[36px] lg:h-[46px] w-auto" />
                    </div>
                    <div className="flex items-center gap-4">
                        {hasChanges && (
                            <button
                                onClick={async () => {
                                    setIsSaving(true);
                                    try {
                                        const res = await fetch('/api/validate', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                song_info: data.song_info,
                                                chords: editableChords,
                                                pro_tab: editableTab,
                                                tuning: data.tuning
                                            })
                                        });
                                        if (res.ok) { setHasChanges(false); alert("AI Brain Updated!"); }
                                    } catch (e) { console.error(e); }
                                    setIsSaving(false);
                                }}
                                className="bg-[#ffe042] border-2 border-[#1635fb] text-[#1635fb] px-4 py-2 lg:px-6 lg:py-2.5 rounded-[4px] font-black uppercase tracking-wider text-[10px] lg:text-[12px] flex items-center gap-2 hover:scale-105 transition-all shadow-lg"
                            >
                                <Brain className={cn("size-4", isSaving && "animate-pulse")} />
                                {isSaving ? "Learning..." : "Save to AI Brain"}
                            </button>
                        )}
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-[#1635fb] hover:bg-[#1024b0] transition-colors flex gap-2 h-[40px] lg:h-[45px] items-center justify-center px-[16px] py-[12px] rounded-[4px] text-white shadow-xl"
                        >
                            <RefreshCcw className="size-4" />
                            <span className="font-['Inter'] font-bold text-[14px] lg:text-[16px] tracking-[-0.31px]">New Session</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Dashboard Content */}
            <main className="w-full flex justify-center px-6 lg:px-0 pt-8 lg:pt-12 overflow-visible">
                <div className="w-full max-w-[1218px] grid grid-cols-1 lg:grid-cols-12 gap-[34px] items-start">

                    {/* Left Column: Identity & Tabs (4/12) */}
                    <div className="lg:col-span-4 flex flex-col gap-[34px]">
                        {/* Song Identity Card */}
                        <div className="bg-white rounded-[4px] shadow-2xl overflow-hidden flex flex-col border border-[#1635fb]/10 transition-all hover:border-[#1635fb]/30 hover:translate-y-[-4px] duration-500">
                            <div className="relative w-full aspect-square bg-[#f7f7f7] shrink-0 overflow-hidden group">
                                {data.song_info?.images?.coverart || data.song_info?.images?.background ? (
                                    <Image
                                        src={data.song_info.images?.coverart || data.song_info.images?.background || ''}
                                        alt="Album Art"
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-1000"
                                        priority
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1635fb]/5 to-[#1635fb]/20">
                                        <Music2 className="text-[#1635fb]/10 size-48" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </div>

                            <div className="p-8 lg:p-10 space-y-6 bg-white relative">
                                <div className="space-y-2 text-center">
                                    <h2 className="font-['Inter'] font-black text-[#1635fb] text-[28px] lg:text-[36px] leading-[1.1] tracking-[-0.05em] drop-shadow-sm">
                                        {data.song_info?.title || "Unknown Track"}
                                    </h2>
                                    <p className="font-['Inter'] font-bold text-[#1635fb] text-[18px] lg:text-[20px] tracking-[-0.02em] opacity-60 uppercase">
                                        {data.song_info?.artist || "Unknown Artist"}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2 justify-center pt-2">
                                    <div className="bg-[#1635fb] text-white px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg shadow-[#1635fb]/20">
                                        <div className="size-2 bg-white rounded-full animate-pulse" />
                                        <span className="text-[10px] font-black tracking-widest uppercase">
                                            {['shazam', 'itunes', 'itunes_hinted'].includes(data.song_info?.method || '') ? "Verified Track" : "AI Analyzed"}
                                        </span>
                                    </div>
                                    <div className="bg-[#fdc700] text-[#1635fb] px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg shadow-[#fdc700]/20">
                                        <Zap className="size-3 fill-[#1635fb]" />
                                        <span className="text-[10px] font-black tracking-widest uppercase">{data.key || "C Major"}</span>
                                    </div>
                                    <div className="bg-[#ef3a98] text-white px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg shadow-[#ef3a98]/20">
                                        <Gauge className="size-3 fill-white" />
                                        <span className="text-[10px] font-black tracking-widest uppercase">{Math.round(data.tempo || 120)} BPM</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tabs Card */}
                        <div className="bg-white rounded-[4px] shadow-2xl p-8 lg:p-10 flex flex-col border border-[#1635fb]/10 transition-all hover:border-[#1635fb]/30 min-h-[500px]">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="bg-[#fdc700] p-2 rounded-[4px] shadow-lg">
                                        <FileText className="size-5 text-[#1635fb]" />
                                    </div>
                                    <h3 className="font-['Inter'] font-black text-[#1635fb] text-[20px] lg:text-[24px] uppercase tracking-tighter">Guitar Tabs</h3>
                                </div>
                                <button
                                    onClick={() => setActiveModal('tab')}
                                    className="bg-[#1635fb] text-white rounded-[4px] px-4 py-2 flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest hover:bg-[#1024b0] transition-all shadow-md active:scale-95"
                                >
                                    <Edit3 className="size-4" /> Edit
                                </button>
                            </div>
                            <div className="flex-1 bg-[#1635fb]/5 rounded-[4px] p-6 font-mono text-[#1635fb] text-[11px] lg:text-[12px] leading-relaxed whitespace-pre overflow-x-auto custom-scrollbar border border-[#1635fb]/5">
                                {editableTab || guitarTab || "Synthesizing tab data..."}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Console & Chords (8/12) */}
                    <div className="lg:col-span-8 flex flex-col gap-[34px]">
                        {/* Practice Console */}
                        <div className="bg-white rounded-[4px] shadow-2xl overflow-hidden border border-[#1635fb]/10 transition-all hover:border-[#1635fb]/30">
                            <StemMixer
                                stems={data.stems || {}}
                                onTimeUpdate={setCurrentTime}
                                isPlaying={isPlaying}
                                onPlayPause={() => setIsPlaying(!isPlaying)}
                            />
                        </div>

                        {/* Motion Chords Visualizer */}
                        <div className="bg-white rounded-[4px] shadow-2xl p-6 lg:p-8 border border-[#1635fb]/10 transition-all hover:border-[#1635fb]/30 flex flex-col gap-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="bg-[#ef3a98] p-2 rounded-[4px] shadow-lg">
                                        <Activity className="size-5 text-white" />
                                    </div>
                                    <div className="flex flex-col">
                                        <h3 className="font-['Inter'] font-black text-[#1635fb] text-[20px] uppercase tracking-tighter leading-none">Chord Sync</h3>
                                        <span className="text-[10px] font-bold text-[#1635fb]/40 uppercase tracking-widest mt-1">Real-time Progression</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setActiveModal('chords')}
                                    className="bg-transparent text-[#1635fb] border border-[#1635fb]/20 rounded-[4px] px-4 py-2 flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest hover:bg-[#1635fb]/5 transition-all"
                                >
                                    <Edit3 className="size-4" /> Adjust
                                </button>
                            </div>

                            <MotionChords
                                chords={editableChords}
                                currentTime={currentTime}
                                onEdit={() => setActiveModal('chords')}
                            />
                        </div>

                        {/* Tuning & Info Footer */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-[34px]">
                            <div className="bg-[#1635fb] rounded-[4px] p-8 shadow-xl flex flex-col justify-center gap-2 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
                                    <Settings className="size-20 text-white" />
                                </div>
                                <span className="text-white/60 font-black text-[10px] uppercase tracking-[3px]">Target Tuning</span>
                                <p className="text-white text-3xl font-black uppercase tracking-tight">{data.tuning || "Standard E"}</p>
                                <div className="flex gap-1 mt-2">
                                    {['E', 'A', 'D', 'G', 'B', 'E'].map((n, i) => (
                                        <div key={i} className="size-6 bg-white/10 rounded flex items-center justify-center text-[10px] font-bold text-white border border-white/20">
                                            {n}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-[#ffe042] rounded-[4px] p-8 shadow-xl flex flex-col justify-center gap-2 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform duration-500">
                                    <Brain className="size-20 text-[#1635fb]" />
                                </div>
                                <span className="text-[#1635fb]/60 font-black text-[10px] uppercase tracking-[3px]">AI Confidence</span>
                                <p className="text-[#1635fb] text-3xl font-black uppercase tracking-tight text-center">98.4%</p>
                                <div className="w-full h-1.5 bg-[#1635fb]/10 rounded-full mt-2 overflow-hidden">
                                    <div className="h-full bg-[#1635fb] w-[98.4%]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* MODALS RENDERED HERE (Omitted for brevity, but they should be identical to the ones in ResultsDisplay.tsx) */}
            {/* Chord Modal */}
            {activeModal === 'chords' && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setActiveModal(null)} />
                    <div className="bg-white w-full max-w-2xl relative z-10 shadow-2xl border border-[#1635fb]/20 rounded-[4px] overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="bg-[#1635fb]/5 border-b border-[#1635fb]/10 p-6 flex flex-row items-center justify-between">
                            <h3 className="font-['Inter'] font-black text-[#1635fb] text-xl uppercase tracking-tight flex items-center gap-3">
                                <Music2 className="w-5 h-5 text-[#fdc700]" />
                                Edit Progression
                            </h3>
                            <button onClick={() => setActiveModal(null)} className="text-[#1635fb] hover:rotate-90 transition-transform">
                                <X className="size-6" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                            {editableChords.map((c, i) => (
                                <div key={i} className="flex items-center gap-4 bg-[#f7f7f7] p-4 rounded-[4px] group border border-[#1635fb]/10 hover:border-[#1635fb]/30 transition-all">
                                    <div className="flex-1 flex items-center gap-4">
                                        <input
                                            className="bg-white border border-[#1635fb]/20 rounded-[4px] px-3 py-2 font-black text-xl w-24 text-center focus:ring-2 focus:ring-[#1635fb]/50 outline-none text-[#1635fb]"
                                            value={c.chord}
                                            onChange={(e) => {
                                                const newChords = [...editableChords];
                                                newChords[i].chord = e.target.value;
                                                setEditableChords(newChords);
                                                setHasChanges(true);
                                            }}
                                        />
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-bold text-[#1635fb]/60 uppercase tracking-widest">Start</span>
                                                <input
                                                    type="number" step="0.1"
                                                    className="bg-white border border-[#1635fb]/20 rounded-[4px] px-2 py-1 text-xs font-mono w-20 text-center text-[#1635fb]"
                                                    value={c.start.toFixed(1)}
                                                    onChange={(e) => {
                                                        const newChords = [...editableChords];
                                                        newChords[i].start = parseFloat(e.target.value);
                                                        setEditableChords(newChords);
                                                        setHasChanges(true);
                                                    }}
                                                />
                                            </div>
                                            <span className="text-[#1635fb]/30 mt-4">→</span>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-bold text-[#1635fb]/60 uppercase tracking-widest">End</span>
                                                <input
                                                    type="number" step="0.1"
                                                    className="bg-white border border-[#1635fb]/20 rounded-[4px] px-2 py-1 text-xs font-mono w-20 text-center text-[#1635fb]"
                                                    value={c.end.toFixed(1)}
                                                    onChange={(e) => {
                                                        const newChords = [...editableChords];
                                                        newChords[i].end = parseFloat(e.target.value);
                                                        setEditableChords(newChords);
                                                        setHasChanges(true);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setEditableChords(editableChords.filter((_, idx) => idx !== i));
                                            setHasChanges(true);
                                        }}
                                        className="text-[#ef3a98] hover:bg-[#ef3a98]/10 p-2 rounded-full transition-colors"
                                    >
                                        <Trash2 className="size-5" />
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={() => {
                                    setEditableChords([...editableChords, { chord: 'C', start: currentTime, end: currentTime + 5 }]);
                                    setHasChanges(true);
                                }}
                                className="w-full rounded-[4px] border-2 border-dashed border-[#1635fb]/20 py-4 gap-2 flex items-center justify-center text-[#1635fb]/60 hover:text-[#1635fb] hover:border-[#1635fb]/40 transition-all font-bold uppercase tracking-widest text-[11px]"
                            >
                                <Plus className="size-5" /> Add Chord Segment
                            </button>
                        </div>
                        <div className="p-6 bg-[#1635fb]/5 border-t border-[#1635fb]/10">
                            <button
                                onClick={() => setActiveModal(null)}
                                className="w-full rounded-[4px] bg-[#1635fb] text-white font-black uppercase tracking-widest py-4 shadow-xl hover:bg-[#1024b0] transition-colors flex items-center justify-center gap-2"
                            >
                                <Check className="size-5" /> Confirm Progression
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab Modal */}
            {activeModal === 'tab' && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[4px] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-[#1635fb]/20">
                        <div className="p-6 border-b border-[#1635fb]/10 flex justify-between items-center bg-[#1635fb]/5">
                            <h3 className="text-[#1635fb] font-black uppercase tracking-widest flex items-center gap-3">
                                <FileText className="size-5 text-[#fdc700]" />
                                Edit Tab Source
                            </h3>
                            <button onClick={() => setActiveModal(null)} className="text-[#1635fb]"><X className="size-6" /></button>
                        </div>
                        <div className="flex-1 p-8 bg-[#f7f7f7]">
                            <textarea
                                className="w-full h-full min-h-[500px] font-mono p-8 bg-white text-[#1635fb] border border-[#1635fb]/10 rounded-[4px] outline-none focus:ring-4 focus:ring-[#1635fb]/10 transition-all custom-scrollbar selection:bg-[#1635fb] selection:text-white"
                                value={editableTab}
                                onChange={(e) => { setEditableTab(e.target.value); setHasChanges(true); }}
                                placeholder="Paste or edit the tab source here..."
                            />
                        </div>
                        <div className="p-6 border-t border-[#1635fb]/10 bg-[#1635fb]/5 flex justify-end">
                            <button onClick={() => setActiveModal(null)} className="bg-[#1635fb] text-white px-12 py-4 rounded-[4px] font-black uppercase tracking-widest hover:bg-[#1024b0] transition-colors shadow-xl">
                                Update Tab Content
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

