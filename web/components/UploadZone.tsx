'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadZoneProps {
    onUploadComplete?: (data: any) => void;
}

export default function UploadZone({ onUploadComplete }: UploadZoneProps) {
    const [file, setFile] = useState<File | null>(null);
    const [songName, setSongName] = useState('');
    const [artist, setArtist] = useState('');
    const [tuning, setTuning] = useState('');
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleUpload = async (fileToUpload: File) => {
        setUploading(true);
        setStatus('idle');
        setMessage('');

        const formData = new FormData();
        formData.append('file', fileToUpload);
        formData.append('songName', songName || 'Unknown');
        formData.append('artist', artist || 'Unknown');
        formData.append('tuning', tuning || 'Standard E');

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                setStatus('success');
                setMessage('Song Identified & Processed!');
                console.log('Upload success:', data);
                if (onUploadComplete && data.data) {
                    setTimeout(() => onUploadComplete(data.data), 1000);
                }
            } else {
                setStatus('error');
                setMessage(data.message || 'Upload failed');
            }
        } catch (error) {
            console.error(error);
            setStatus('error');
            setMessage('An error occurred during upload.');
        } finally {
            setUploading(false);
        }
    };

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const selectedFile = acceptedFiles[0];
        if (selectedFile) {
            setFile(selectedFile);
            handleUpload(selectedFile);
        }
    }, [songName, artist, tuning]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'audio/mpeg': ['.mp3'],
        },
        maxFiles: 1,
        disabled: uploading,
    });

    return (
        <div className="w-full max-w-[595px] mx-auto space-y-6 bg-white rounded-[4px] p-8 shadow-lg">
            {/* Input Fields in 3 Columns - Figma Design */}
            <div className="grid grid-cols-3 gap-4">
                {/* Song Hint */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-primary uppercase tracking-[0.15em]">
                        SONG HINT (OPTIONAL)
                    </label>
                    <input
                        type="text"
                        value={songName}
                        onChange={(e) => setSongName(e.target.value)}
                        placeholder="e.g. Wonderwall"
                        className="w-full px-3 py-2 bg-secondary text-primary text-[14px] rounded-[4px] border border-transparent focus:border-primary focus:outline-none transition-colors"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                </div>

                {/* Artist Hint */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-primary uppercase tracking-[0.15em]">
                        ARTIST HINT (OPTIONAL)
                    </label>
                    <input
                        type="text"
                        value={artist}
                        onChange={(e) => setArtist(e.target.value)}
                        placeholder="e.g. Oasis"
                        className="w-full px-3 py-2 bg-secondary text-primary text-[14px] rounded-[4px] border border-transparent focus:border-primary focus:outline-none transition-colors"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                </div>

                {/* Guitar Tuning */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-primary uppercase tracking-[0.15em]">
                        GUITAR TUNING (OPTIONAL)
                    </label>
                    <input
                        type="text"
                        value={tuning}
                        onChange={(e) => setTuning(e.target.value)}
                        placeholder="e.g. E standard"
                        className="w-full px-3 py-2 bg-secondary text-primary text-[14px] rounded-[4px] border border-transparent focus:border-primary focus:outline-none transition-colors"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                </div>
            </div>

            {/* Helper Text */}
            <p className="text-[10px] text-primary/60 italic text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
                Optional: Declaring tuning significantly improves AI tab accuracy.
            </p>

            {/* Drop Zone - Figma Design */}
            <div className="space-y-4">
                <div
                    {...getRootProps()}
                    className={cn(
                        "relative flex flex-col items-center justify-center w-full h-[248px] rounded-[4px] border-2 border-dashed transition-all cursor-pointer",
                        isDragActive
                            ? "border-primary bg-primary/5"
                            : "border-muted-foreground/25 bg-secondary",
                        uploading && "opacity-50 cursor-not-allowed"
                    )}
                >
                    <input {...getInputProps()} />

                    {/* Icon */}
                    <div className={cn(
                        "flex items-center justify-center w-16 h-16 rounded-full bg-primary mb-4 transition-transform",
                        (isDragActive || uploading) && "scale-110"
                    )}>
                        {uploading ? (
                            <Loader2 className="w-8 h-8 text-white animate-spin" />
                        ) : (
                            <UploadCloud className="w-8 h-8 text-white" />
                        )}
                    </div>

                    {/* Text */}
                    <div className="text-center px-6 space-y-2">
                        <p className="text-[24px] font-medium text-primary" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {uploading ? "Identifying & Analyzing..." :
                                status === 'success' ? "Analysis Complete" :
                                    status === 'error' ? "Upload failed" :
                                        isDragActive ? "Drop the beat here!" :
                                            file ? file.name : "Drop MP3 here"}
                        </p>
                        <p className="text-[14px] text-primary/70" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {uploading
                                ? "The system is now evaluating your song."
                                : (message || (isDragActive
                                    ? "Let go to analyze..."
                                    : "Auto-recognition starts upon upload"))}
                        </p>
                    </div>
                </div>

                <p className="text-[12px] text-center text-primary" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Supports .mp3 files up to 10MB
                </p>
            </div>

            {/* Analyse Song Button - Figma Design */}
            <button
                onClick={() => file && handleUpload(file)}
                disabled={!file || uploading}
                className={cn(
                    "w-full h-[77px] rounded-[4px] text-[24px] font-medium text-primary transition-all",
                    "flex items-center justify-center",
                    file && !uploading
                        ? "bg-accent hover:bg-accent/90 cursor-pointer"
                        : "bg-accent/50 cursor-not-allowed"
                )}
                style={{ fontFamily: 'Inter, sans-serif' }}
            >
                Analyse Song
            </button>
        </div>
    );
}
