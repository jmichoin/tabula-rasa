import React, { useState, useRef } from "react";
import svgPaths from "./imports/svg-g7me4smg8g";
import imgChatGptImage20120261502441 from "figma:asset/699c4cd3e3692fa2ad7ae926ac4934d9d8433b5c.png";

// --- Components ---

function Logo() {
  return (
    <div className="relative shrink-0 size-[46.54px]" data-name="Logo">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 46.5403 46.5403">
        <g id="Logo">
          <circle cx="23.2702" cy="23.2701" fill="var(--fill-0, #FFE042)" id="Ellipse 6" r="19" transform="rotate(15 23.2702 23.2701)" />
          <path d={svgPaths.p3024b200} fill="var(--fill-0, #1635FB)" id="Ellipse 2 (Stroke)" />
          <path d={svgPaths.p2eb1ed00} fill="var(--fill-0, #1635FB)" id="Vector 9 (Stroke)" />
          <path d={svgPaths.p1698ab00} fill="var(--fill-0, #1635FB)" id="Vector 10 (Stroke)" />
        </g>
      </svg>
    </div>
  );
}

function LogoContainer() {
  return (
    <div className="content-stretch flex gap-[3px] items-center relative shrink-0" data-name="Logo Container">
      <Logo />
      <p className="font-['Inter'] font-bold leading-[21.77px] not-italic relative shrink-0 text-[#1635fb] text-[24.189px] tracking-[-1.1681px]">Tabula Rasa</p>
    </div>
  );
}

function ShareButton() {
  return (
    <button className="bg-[#1635fb] hover:bg-[#1024b0] transition-colors content-stretch flex gap-[7px] h-[45px] items-center justify-center px-[16px] py-[12px] relative rounded-[4px] shrink-0 w-[121px] cursor-pointer" data-name="Component 3">
      <p className="font-['Inter'] font-normal leading-[26px] not-italic relative shrink-0 text-[16px] text-white tracking-[-0.3125px]">Share App</p>
    </button>
  );
}

function Header() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Header">
      <LogoContainer />
      <ShareButton />
    </div>
  );
}

function Icon() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Icon">
          <rect fill="var(--fill-0, #1635FB)" height="18" rx="9" width="18" />
          <path d={svgPaths.p4563680} id="Vector" stroke="var(--stroke-0, #FFE042)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function FeatureHeader() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Feature Header">
      <Icon />
      <p className="font-['Inter'] font-medium leading-[16px] not-italic relative shrink-0 text-[#1635fb] text-[10px] tracking-[1.1172px] uppercase">Powered by Advanced Machine Learning</p>
    </div>
  );
}

function FeatureDescription() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full" data-name="Feature Description">
      <div className="h-0 relative shrink-0 w-full">
        <div className="absolute inset-[-1px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 423 1">
            <line id="Line 2" stroke="var(--stroke-0, #1635FB)" x2="423" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
      <div className="font-['Inter'] font-medium leading-[64.8px] not-italic relative shrink-0 text-[#1635fb] text-[72px] tracking-[-3.477px] w-[382px]">
        <p className="mb-0">Master Your</p>
        <p className="">
          Favorite
          <br aria-hidden="true" />
          Songs
        </p>
      </div>
      <div className="h-0 relative shrink-0 w-full">
        <div className="absolute inset-[-1px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 423 1">
            <line id="Line 2" stroke="var(--stroke-0, #1635FB)" x2="423" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function FeatureContainer() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-[423px]" data-name="Feature Container">
      <FeatureHeader />
      <FeatureDescription />
    </div>
  );
}

function Heading() {
  return (
    <div className="h-[64px] relative shrink-0 w-full" data-name="Heading 2">
      <p className="absolute font-['Inter'] font-medium leading-[32px] left-0 not-italic text-[#1635fb] text-[24px] top-0 tracking-[-0.5297px] w-[438px]">Play along like you would be a member of the band!</p>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="h-[52px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter'] font-normal leading-[26px] left-0 not-italic text-[#1635fb] text-[16px] top-[-0.5px] tracking-[-0.3125px] w-[419px]">Upload any MP3 and detect song name, separate stems, chords, tuning, and tabs instantly.</p>
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] h-[132px] items-start relative shrink-0 w-full" data-name="Container">
      <Heading />
      <Paragraph />
    </div>
  );
}

function LeftColumn() {
  return (
    <div className="content-stretch flex flex-col gap-[34px] items-start relative shrink-0 w-[448px]" data-name="Left Column">
      <FeatureContainer />
      <Container />
    </div>
  );
}

// --- Inputs ---

function InputField({ label, placeholder, value, onChange }: { label: string, placeholder: string, value: string, onChange: (val: string) => void }) {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[8px] items-start min-h-px min-w-px relative">
      <div className="content-stretch flex h-[11.5px] items-start relative shrink-0 w-full">
        <p className="font-['Inter'] font-medium leading-[16px] not-italic relative shrink-0 text-[#1635fb] text-[10px] tracking-[0.6172px] uppercase">{label}</p>
      </div>
      <input
        className="bg-[#f7f7f7] w-full content-stretch flex h-[46px] items-center px-[16px] py-[12px] relative rounded-[4px] shrink-0 font-['Inter'] font-normal leading-[normal] text-[#1635fb] placeholder-[#4f61ce] text-[14px] tracking-[-0.1504px] outline-none border border-transparent focus:border-[#1635fb] transition-colors"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function InputRow() {
  const [song, setSong] = useState("");
  const [artist, setArtist] = useState("");
  const [tuning, setTuning] = useState("");

  return (
    <div className="content-stretch flex gap-[16px] items-start relative shrink-0 w-full" data-name="Input Row">
      <InputField label="Song Hint (Optional)" placeholder="e.g. Wonderwall" value={song} onChange={setSong} />
      <InputField label="Artist Hint (Optional)" placeholder="e.g. Oasis" value={artist} onChange={setArtist} />
      <InputField label="Guitar Tuning (Optional)" placeholder="e.g. E standard" value={tuning} onChange={setTuning} />
    </div>
  );
}

function InputContainer() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start pb-[4px] relative shrink-0 w-full" data-name="Input Container">
      <InputRow />
      <p className="font-['Inter'] font-normal leading-[15px] not-italic relative shrink-0 text-[#1635fb] text-[12px] text-center tracking-[0.3672px]">Optional: Declaring tuning significantly improves AI tab accuracy.</p>
    </div>
  );
}

// --- Drop Zone ---

function UploadIcon() {
  return (
    <div className="relative shrink-0 size-[32px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="Icon">
          <path d="M16 17.3333V28" id="Vector" stroke="var(--stroke-0, #FFFE00)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
          <path d={svgPaths.p1d6aa80} id="Vector_2" stroke="var(--stroke-0, #FFFE00)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
          <path d={svgPaths.p35d74e00} id="Vector_3" stroke="var(--stroke-0, #FFFE00)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
        </g>
      </svg>
    </div>
  );
}

function UploadCircle() {
  return (
    <div className="bg-[#1635fb] content-stretch flex items-center justify-center relative rounded-full shrink-0 size-[64px]" data-name="Container">
      <UploadIcon />
    </div>
  );
}

function DropZoneContent() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-center relative shrink-0 pointer-events-none">
      <UploadCircle />
      <div className="content-stretch flex flex-col items-center relative shrink-0">
        <p className="font-['Inter'] font-medium leading-[64.8px] not-italic relative shrink-0 text-[#1635fb] text-[42px] tracking-[-3.477px]">Drop MP3 here</p>
      </div>
    </div>
  );
}

function DropZone() {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    // Handle files here if needed
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      console.log("Dropped files:", e.dataTransfer.files);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      console.log("Selected files:", e.target.files);
    }
  };

  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="Drop Zone Container">
      <div 
        className={`bg-[#f7f7f7] border-2 border-dashed ${isDragging ? 'border-[#1635fb] bg-[#eeeeee]' : 'border-transparent'} transition-colors cursor-pointer content-stretch flex flex-col h-[248px] items-center justify-center px-[16px] py-[12px] relative rounded-[4px] shrink-0 w-[595px]`}
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        data-name="Component 2"
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
      <p className="font-['Inter'] font-normal leading-[15px] min-w-full not-italic relative shrink-0 text-[#1635fb] text-[12px] tracking-[0.3672px] w-[min-content]">Supports .mp3 files up to 10MB</p>
    </div>
  );
}

function AnalyzeButton() {
  return (
    <button className="bg-[#ffe042] hover:bg-[#ffe566] transition-colors h-[77px] relative rounded-[4px] shrink-0 w-[595px] cursor-pointer" data-name="Component 6">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center px-[16px] py-[42px] relative size-full">
          <p className="font-['Inter'] font-medium leading-[32px] not-italic relative shrink-0 text-[#1635fb] text-[24px] text-center tracking-[-0.5297px]">Analyse Song</p>
        </div>
      </div>
    </button>
  );
}

function RightColumn() {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[24px] items-start p-[40px] relative rounded-[4px] shadow-[0px_293px_82px_0px_rgba(40,46,92,0),0px_187px_75px_0px_rgba(40,46,92,0),0px_105px_63px_0px_rgba(40,46,92,0.01),0px_47px_47px_0px_rgba(40,46,92,0.01),0px_12px_26px_0px_rgba(40,46,92,0.02)] shrink-0 w-[675px]" data-name="Right Column">
      <InputContainer />
      <DropZone />
      <AnalyzeButton />
    </div>
  );
}

function MainContent() {
  return (
    <div className="content-stretch flex gap-[94px] items-start relative shrink-0 w-full" data-name="Main Content">
      <LeftColumn />
      <RightColumn />
    </div>
  );
}

function Container2() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[64px] items-start left-[114px] top-[46px] w-[1218px]" data-name="Container">
      <Header />
      <MainContent />
    </div>
  );
}

export default function App() {
  return (
    <div className="flex justify-center min-h-screen bg-[#e8e8e8] overflow-x-auto">
      <div className="bg-[#e8e8e8] relative w-[1440px] h-[1024px] shrink-0" data-name="opening screen">
        {/* Footer Background */}
        <div className="absolute bg-[#1635fb] h-[591px] left-0 top-[685px] w-[1440px]" data-name="Footer Background" />
        
        {/* Band Image */}
        <div className="absolute h-[798px] left-[118px] top-[536px] w-[1198px]" data-name="ChatGPT Image">
          <img alt="Band playing instruments" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgChatGptImage20120261502441} />
        </div>

        {/* Main Content Container */}
        <Container2 />
      </div>
    </div>
  );
}
