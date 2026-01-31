import svgPaths from "./svg-g7me4smg8g";
import imgChatGptImage20120261502441 from "figma:asset/699c4cd3e3692fa2ad7ae926ac4934d9d8433b5c.png";

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
      <p className="css-ew64yg font-['Inter:Bold',sans-serif] font-bold leading-[21.77px] not-italic relative shrink-0 text-[#1635fb] text-[24.189px] tracking-[-1.1681px]">Tabula Rasa</p>
    </div>
  );
}

function Component2() {
  return (
    <div className="bg-[#1635fb] content-stretch flex gap-[7px] h-[45px] items-center justify-center px-[16px] py-[12px] relative rounded-[4px] shrink-0 w-[121px]" data-name="Component 3">
      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[26px] not-italic relative shrink-0 text-[16px] text-white tracking-[-0.3125px]">Share App</p>
    </div>
  );
}

function Header() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Header">
      <LogoContainer />
      <Component2 />
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
      <p className="css-ew64yg font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[#1635fb] text-[10px] tracking-[1.1172px] uppercase">Powered by Advanced Machine Learning</p>
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
      <div className="font-['Inter:Medium',sans-serif] font-medium leading-[64.8px] not-italic relative shrink-0 text-[#1635fb] text-[72px] tracking-[-3.477px] w-[382px]">
        <p className="css-4hzbpn mb-0">Master Your</p>
        <p className="css-4hzbpn">
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
      <p className="absolute css-4hzbpn font-['Inter:Medium',sans-serif] font-medium leading-[32px] left-0 not-italic text-[#1635fb] text-[24px] top-0 tracking-[-0.5297px] w-[438px]">Play along like you would be a member of the band!</p>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="h-[52px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute css-4hzbpn font-['Inter:Regular',sans-serif] font-normal leading-[26px] left-0 not-italic text-[#1635fb] text-[16px] top-[-0.5px] tracking-[-0.3125px] w-[419px]">Upload any MP3 and detect song name, separate stems, chords, tuning, and tabs instantly.</p>
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

function Label() {
  return (
    <div className="content-stretch flex h-[11.5px] items-start relative shrink-0 w-[134.484px]" data-name="Label">
      <p className="css-ew64yg font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[#1635fb] text-[10px] tracking-[0.6172px] uppercase">Song Hint (Optional)</p>
    </div>
  );
}

function Component() {
  return (
    <div className="bg-[#f7f7f7] content-stretch flex h-[46px] items-center overflow-clip px-[16px] py-[12px] relative rounded-[4px] shrink-0 w-[187.667px]" data-name="Component 1">
      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#4f61ce] text-[14px] tracking-[-0.1504px]">e.g. Wonderwall</p>
    </div>
  );
}

function SongHintContainer() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[8px] items-start min-h-px min-w-px relative" data-name="Song Hint Container">
      <Label />
      <Component />
    </div>
  );
}

function Label1() {
  return (
    <div className="content-stretch flex h-[11.5px] items-start relative shrink-0 w-[143.227px]" data-name="Label">
      <p className="css-ew64yg font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[#1635fb] text-[10px] tracking-[0.6172px] uppercase">Artist Hint (Optional)</p>
    </div>
  );
}

function Component3() {
  return (
    <div className="bg-[#f7f7f7] content-stretch flex h-[46px] items-center overflow-clip px-[16px] py-[12px] relative rounded-[4px] shrink-0 w-[187.667px]" data-name="Component 1">
      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#4f61ce] text-[14px] tracking-[-0.1504px]">e.g. Oasis</p>
    </div>
  );
}

function ArtistHintContainer() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[8px] items-start min-h-px min-w-px relative" data-name="Artist Hint Container">
      <Label1 />
      <Component3 />
    </div>
  );
}

function Label2() {
  return (
    <div className="content-stretch flex h-[11.5px] items-start relative shrink-0 w-[143.227px]" data-name="Label">
      <p className="css-ew64yg font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[#1635fb] text-[10px] tracking-[0.6172px] uppercase">Guitar Tuning (Optional)</p>
    </div>
  );
}

function Component4() {
  return (
    <div className="bg-[#f7f7f7] content-stretch flex h-[46px] items-center overflow-clip px-[16px] py-[12px] relative rounded-[4px] shrink-0 w-[187.667px]" data-name="Component 1">
      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#4f61ce] text-[14px] tracking-[-0.1504px]">e.g. E standard</p>
    </div>
  );
}

function GuitarTuningContainer() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[8px] items-start min-h-px min-w-px relative" data-name="Guitar Tuning Container">
      <Label2 />
      <Component4 />
    </div>
  );
}

function InputRow() {
  return (
    <div className="content-stretch flex gap-[16px] items-start relative shrink-0 w-full" data-name="Input Row">
      <SongHintContainer />
      <ArtistHintContainer />
      <GuitarTuningContainer />
    </div>
  );
}

function InputContainer() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start pb-[4px] relative shrink-0 w-full" data-name="Input Container">
      <InputRow />
      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[15px] not-italic relative shrink-0 text-[#1635fb] text-[12px] text-center tracking-[0.3672px]">Optional: Declaring tuning significantly improves AI tab accuracy.</p>
    </div>
  );
}

function Icon1() {
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

function Container1() {
  return (
    <div className="bg-[#1635fb] content-stretch flex items-center justify-center relative rounded-[16777200px] shrink-0 size-[64px]" data-name="Container">
      <Icon1 />
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0">
      <p className="css-ew64yg font-['Inter:Medium',sans-serif] font-medium leading-[64.8px] not-italic relative shrink-0 text-[#1635fb] text-[42px] tracking-[-3.477px]">Drop MP3 here</p>
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-center relative shrink-0">
      <Container1 />
      <Frame />
    </div>
  );
}

function Component1() {
  return (
    <div className="bg-[#f7f7f7] content-stretch flex flex-col h-[248px] items-center justify-center px-[16px] py-[12px] relative rounded-[4px] shrink-0 w-[595px]" data-name="Component 2">
      <Frame1 />
    </div>
  );
}

function DropZoneContainer() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="Drop Zone Container">
      <Component1 />
      <p className="css-4hzbpn font-['Inter:Regular',sans-serif] font-normal leading-[15px] min-w-full not-italic relative shrink-0 text-[#1635fb] text-[12px] tracking-[0.3672px] w-[min-content]">Supports .mp3 files up to 10MB</p>
    </div>
  );
}

function Component5() {
  return (
    <div className="bg-[#ffe042] h-[77px] relative rounded-[4px] shrink-0 w-[595px]" data-name="Component 6">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center px-[16px] py-[42px] relative size-full">
          <p className="css-ew64yg font-['Inter:Medium',sans-serif] font-medium leading-[32px] not-italic relative shrink-0 text-[#1635fb] text-[24px] text-center tracking-[-0.5297px]">Analyse Song</p>
        </div>
      </div>
    </div>
  );
}

function RightColumn() {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[24px] items-start p-[40px] relative rounded-[4px] shadow-[0px_293px_82px_0px_rgba(40,46,92,0),0px_187px_75px_0px_rgba(40,46,92,0),0px_105px_63px_0px_rgba(40,46,92,0.01),0px_47px_47px_0px_rgba(40,46,92,0.01),0px_12px_26px_0px_rgba(40,46,92,0.02)] shrink-0 w-[675px]" data-name="Right Column">
      <InputContainer />
      <DropZoneContainer />
      <Component5 />
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

export default function OpeningScreen() {
  return (
    <div className="bg-[#e8e8e8] relative size-full" data-name="opening screen">
      <div className="absolute bg-[#1635fb] h-[591px] left-0 top-[685px] w-[1440px]" data-name="Footer Background" />
      <div className="absolute h-[798px] left-[118px] top-[536px] w-[1198px]" data-name="ChatGPT Image 20. 1. 2026 15_02_44 1">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgChatGptImage20120261502441} />
      </div>
      <Container2 />
    </div>
  );
}