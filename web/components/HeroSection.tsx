import { Sparkles } from "lucide-react";

export default function HeroSection() {
    return (
        <section className="flex flex-col items-start justify-center text-left py-10 px-0 space-y-6">
            {/* Top Label - Figma Design */}
            <div className="inline-flex items-center space-x-2 px-0 mb-2">
                <div className="flex h-3 w-3 rounded-full bg-primary items-center justify-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
                </div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-[0.15em]">
                    POWERED BY ADVANCED MACHINE LEARNING
                </span>
            </div>

            {/* Headline - Exact Figma Typography */}
            <h1 className="text-[64px] font-black leading-[1.1] text-primary" style={{ fontFamily: 'Inter, sans-serif' }}>
                Master Your<br />
                Favorite<br />
                Songs
            </h1>

            {/* Blue underline */}
            <div className="w-full max-w-[380px] h-[2px] bg-primary"></div>

            {/* Subline Hierarchy - Exact Figma Copy */}
            <div className="space-y-4 max-w-[380px]">
                <p className="text-[18px] font-bold text-primary leading-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Play along like you would be a member of the band!
                </p>

                <p className="text-[14px] text-primary leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Upload any MP3 and detect song name, separate stems, chords, tuning, and tabs instantly.
                </p>
            </div>
        </section>
    );
}
