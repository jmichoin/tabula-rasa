'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import ResultsDisplay from "@/components/ResultsDisplay";
import AnalysisLoading from "@/components/AnalysisLoading";

// Logo Component using uploaded image
function LogoContainer() {
  return (
    <div className="flex gap-[3px] items-center relative shrink-0">
      <Image src="/logo.png" alt="Tabula Rasa Logo" width={180} height={46} className="h-[36px] lg:h-[46.54px] w-auto" />
    </div>
  );
}

function ShareButton() {
  return (
    <button className="bg-[#1635fb] hover:bg-[#1024b0] transition-colors flex gap-[7px] h-[40px] lg:h-[45px] items-center justify-center px-[16px] py-[12px] relative rounded-[4px] shrink-0 w-fit cursor-pointer">
      <p className="font-['Inter'] font-normal leading-tight lg:leading-[26px] not-italic relative shrink-0 text-[14px] lg:text-[16px] text-white tracking-[-0.3125px]">
        Share App
      </p>
    </button>
  );
}

function Header() {
  return (
    <header className="flex items-center justify-between relative shrink-0 w-full mb-8 lg:mb-[64px]">
      <LogoContainer />
      <ShareButton />
    </header>
  );
}

function Icon() {
  return (
    <div className="relative shrink-0 size-[18px] bg-[#1635fb] rounded-full flex items-center justify-center">
      <img src="/star-icon.png" alt="Star" className="w-[10px] h-[10px]" />
    </div>
  );
}

function FeatureHeader() {
  return (
    <div className="flex gap-[8px] items-center relative shrink-0">
      <Icon />
      <p className="font-['Inter'] font-medium leading-[16px] not-italic relative shrink-0 text-[#1635fb] text-[10px] tracking-[1.1172px] uppercase">
        Powered by Advanced Machine Learning
      </p>
    </div>
  );
}

function FeatureDescription() {
  return (
    <div className="flex flex-col gap-[24px] items-start relative shrink-0 w-full">
      <div className="h-px bg-[#1635FB] w-full max-w-[423px]" />
      <div className="font-['Inter'] font-medium leading-[1.1] lg:leading-[64.8px] not-italic relative shrink-0 text-[#1635fb] text-[32px] md:text-[48px] lg:text-[72px] tracking-[-1px] lg:tracking-[-3.477px] w-full lg:w-[382px]">
        <p className="mb-0">Master Your</p>
        <p>
          Favorite
          {' '}
          <br className="hidden lg:block" />
          Songs
        </p>
      </div>
      <div className="h-px bg-[#1635FB] w-full max-w-[423px]" />
    </div>
  );
}

function FeatureContainer() {
  return (
    <div className="flex flex-col gap-[16px] items-start relative shrink-0 w-full lg:w-[423px]">
      <FeatureHeader />
      <FeatureDescription />
    </div>
  );
}

function Heading() {
  return (
    <div className="w-full lg:h-[64px] relative shrink-0">
      <p className="font-['Inter'] font-medium leading-tight lg:leading-[32px] not-italic text-[#1635fb] text-[20px] lg:text-[24px] tracking-[-0.5297px] w-full lg:w-[438px]">
        Play along like you would be a member of the band!
      </p>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="w-full lg:h-[52px] relative shrink-0">
      <p className="font-['Inter'] font-normal leading-relaxed lg:leading-[26px] not-italic text-[#1635fb] text-[15px] lg:text-[16px] tracking-[-0.3125px] w-full lg:w-[419px]">
        Upload any MP3 and detect song name, separate stems, chords, tuning, and tabs instantly.
      </p>
    </div>
  );
}

function TextStack() {
  return (
    <div className="flex flex-col gap-[16px] items-start relative shrink-0 w-full">
      <Heading />
      <Paragraph />
    </div>
  );
}

function LeftColumn() {
  return (
    <div className="flex flex-col gap-[34px] items-start relative shrink-0 w-full lg:w-auto lg:flex-1 max-w-[448px]">
      <FeatureContainer />
      <TextStack />
    </div>
  );
}

// Input Components
interface InputFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
}

function InputField({ label, placeholder, value, onChange }: InputFieldProps) {
  return (
    <div className="flex flex-col gap-[8px] items-start relative w-full lg:min-w-[160px] lg:flex-1">
      <div className="flex h-[11.5px] items-start relative shrink-0 w-full">
        <p className="font-['Inter'] font-medium leading-[16px] not-italic relative shrink-0 text-[#1635fb] text-[10px] tracking-[0.6172px] uppercase">
          {label}
        </p>
      </div>
      <input
        className="bg-[#f7f7f7] w-full h-[46px] flex items-center px-[16px] py-[12px] relative rounded-[4px] shrink-0 font-['Inter'] font-normal leading-[normal] text-[#1635fb] placeholder-[#4f61ce] text-[14px] tracking-[-0.1504px] outline-none border border-transparent focus:border-[#1635fb] transition-colors"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

interface InputRowProps {
  youtubeUrl: string;
  setYoutubeUrl: (val: string) => void;
  tuning: string;
  setTuning: (val: string) => void;
}

function InputRow({ youtubeUrl, setYoutubeUrl, tuning, setTuning }: InputRowProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-[16px] items-start relative shrink-0 w-full lg:flex-wrap xl:flex-nowrap">
      <InputField label="YouTube Link" placeholder="https://www.youtube.com/watch?v=..." value={youtubeUrl} onChange={setYoutubeUrl} />
      <InputField label="Guitar Tuning (Optional)" placeholder="e.g. E standard" value={tuning} onChange={setTuning} />
    </div>
  );
}

interface InputContainerProps {
  youtubeUrl: string;
  setYoutubeUrl: (val: string) => void;
  tuning: string;
  setTuning: (val: string) => void;
}

function InputContainer({ youtubeUrl, setYoutubeUrl, tuning, setTuning }: InputContainerProps) {
  return (
    <div className="flex flex-col gap-[8px] items-start pb-[4px] relative shrink-0 w-full">
      <InputRow youtubeUrl={youtubeUrl} setYoutubeUrl={setYoutubeUrl} tuning={tuning} setTuning={setTuning} />
      <p className="font-['Inter'] font-normal leading-[15px] not-italic relative shrink-0 text-[#1635fb] text-[12px] tracking-[0.3672px]">
        Optional: Declaring tuning significantly improves AI tab accuracy.
      </p>
    </div>
  );
}

// Drop Zone Components
function UploadIcon() {
  return (
    <div className="relative shrink-0 size-[32px]">
      <img src="/upload-icon.png" alt="Upload" className="w-full h-full" />
    </div>
  );
}

function UploadCircle() {
  return (
    <div className="bg-[#1635fb] flex items-center justify-center relative rounded-full shrink-0 size-[64px]">
      <UploadIcon />
    </div>
  );
}

function DropZoneContent() {
  return (
    <div className="flex flex-col gap-[16px] items-center relative shrink-0 pointer-events-none">
      <UploadCircle />
      <div className="flex flex-col items-center relative shrink-0">
        <p className="font-['Inter'] font-medium leading-none lg:leading-[64.8px] not-italic relative shrink-0 text-[#1635fb] text-[32px] lg:text-[42px] tracking-[-1px] lg:tracking-[-3.477px]">
          Drop MP3 here
        </p>
      </div>
    </div>
  );
}

interface DropZoneProps {
  onFileSelect: (file: File) => void;
}

function DropZone({ onFileSelect }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col gap-[8px] items-start relative shrink-0 w-full">
      <div
        className={`bg-[#f7f7f7] border-2 border-dashed ${isDragging ? 'border-[#1635fb] bg-[#eeeeee]' : 'border-transparent'} transition-colors cursor-pointer flex flex-col h-[200px] lg:h-[248px] items-center justify-center px-[16px] py-[12px] relative rounded-[4px] shrink-0 w-full`}
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".mp3"
          onChange={handleFileChange}
        />
        <DropZoneContent />
      </div>
      <p className="font-['Inter'] font-normal leading-[15px] min-w-full not-italic relative shrink-0 text-[#1635fb] text-[12px] tracking-[0.3672px] w-[min-content]">
        Supports .mp3 files up to 10MB
      </p>
    </div>
  );
}

// AnalyzeButton removed as it's no longer needed

interface RightColumnProps {
  youtubeUrl: string;
  setYoutubeUrl: (val: string) => void;
  tuning: string;
  setTuning: (val: string) => void;
  onFileSelect: (file: File) => void;
  onAnalyze: () => void;
  hasFile: boolean;
  uploading: boolean;
}

function RightColumn({ youtubeUrl, setYoutubeUrl, tuning, setTuning, onFileSelect, onAnalyze, uploading }: Omit<RightColumnProps, 'hasFile'>) {
  return (
    <div className="bg-white flex flex-col gap-[24px] items-start p-4 md:p-6 lg:p-[40px] relative rounded-[4px] shadow-xl shrink-0 w-full lg:w-auto lg:flex-[1.2] lg:min-w-[580px] max-w-[675px] z-10 transition-all">
      <InputContainer youtubeUrl={youtubeUrl} setYoutubeUrl={setYoutubeUrl} tuning={tuning} setTuning={setTuning} />
      <div className="w-full space-y-4">
        <DropZone onFileSelect={onFileSelect} />
        {youtubeUrl && (
          <button
            onClick={onAnalyze}
            disabled={uploading}
            className="w-full bg-[#1635fb] hover:bg-[#1024b0] text-white font-['Inter'] font-bold py-4 rounded-[4px] transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
          >
            Process YouTube Link
          </button>
        )}
      </div>
      {uploading && (
        <div className="w-full h-[77px] bg-[#ffe042]/50 rounded-[4px] flex items-center justify-center">
          <p className="font-['Inter'] font-medium text-[#1635fb] text-[20px] animate-pulse">Initializing AI Brain...</p>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [results, setResults] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [tuning, setTuning] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setYoutubeUrl(''); // Clear youtube URL if file is dropped
    handleAnalyze(selectedFile);
  };

  const handleAnalyze = async (selectedFile?: File) => {
    const fileToProcess = selectedFile || file;
    if (!fileToProcess && !youtubeUrl) {
      alert("Please upload an MP3 or provide a YouTube link.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    if (fileToProcess) {
      formData.append('file', fileToProcess);
    }
    if (youtubeUrl) {
      formData.append('youtubeUrl', youtubeUrl);
    }
    formData.append('tuning', tuning || 'Standard E');

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.data) {
        setResults(data.data);
        setUploading(false);
      } else {
        alert('Upload failed: ' + (data.message || 'Unknown error'));
        setUploading(false); // Reset on error so user can try again
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred during upload.');
      setUploading(false);
    }
  };

  if (results) {
    return (
      <div className="min-h-screen bg-[#e8e8e8] p-4 lg:p-8 flex flex-col items-center">
        <div className="w-full max-w-[1440px]">
          <ResultsDisplay data={results} />
        </div>
      </div>
    );
  }

  if (uploading) {
    return <AnalysisLoading />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#e8e8e8] overflow-x-hidden">
      {/* Absolute Backgrounds */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {/* Blue Stripe - Responsive Logic */}
        <div className="absolute bg-[#1635fb] min-h-[400px] lg:h-[591px] top-[1000px] lg:top-[685px] left-0 w-full flex flex-col justify-end">
          <div className="w-full h-full flex items-center justify-center overflow-hidden relative">
            <Image
              alt="Band playing instruments"
              fill
              className="object-cover"
              src="/band-illustration.png"
            />
          </div>
        </div>
      </div>

      {/* Main Responsive Container */}
      <div className="relative z-10 flex flex-col items-center w-full px-6 lg:px-0">
        <div className="w-full max-w-[1218px] flex flex-col pt-8 lg:pt-[46px]">
          <Header />

          <main className="flex flex-col lg:flex-row gap-12 lg:gap-[94px] justify-between items-start w-full mb-24 lg:mb-0">
            <LeftColumn />
            <RightColumn
              youtubeUrl={youtubeUrl}
              setYoutubeUrl={setYoutubeUrl}
              tuning={tuning}
              setTuning={setTuning}
              onFileSelect={handleFileSelect}
              onAnalyze={() => handleAnalyze()}
              uploading={uploading}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
