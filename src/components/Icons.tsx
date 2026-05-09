// Journey Forward — Healing Icon Set
// Thin line SVGs, 1.8px stroke, rounded caps, consistent style

interface IconProps { size?: number; color?: string; className?: string; }
const d = (size=24,color='currentColor',className='') => ({ width:size, height:size, viewBox:'0 0 24 24', fill:'none', stroke:color, strokeWidth:1.8, strokeLinecap:'round' as const, strokeLinejoin:'round' as const, className });

export const IconHome = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>
);
export const IconProgress = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
);
export const IconHeart = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
);
export const IconJournal = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/></svg>
);
export const IconProfile = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
export const IconShield = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
);
export const IconWind = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><path d="M9.59 4.59A2 2 0 1111 8H2m10.59 11.41A2 2 0 1113 16H2m15.73-8.27A2.5 2.5 0 1119.5 12H2"/></svg>
);
export const IconLeaf = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><path d="M2 22c1.25-1.25 2.5-3.5 3-5 0 0 4 1 8-3s3-8 3-8-4-1-8 3c-2 2-3 4-4 6"/><path d="M2 22l8-8"/></svg>
);
export const IconBrain = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><path d="M9.5 2A2.5 2.5 0 007 4.5v.5a3 3 0 00-3 3 3 3 0 00.5 1.64A3.5 3.5 0 004 12a3.5 3.5 0 002 3.15V17a3 3 0 006 0v-1.85A3.5 3.5 0 0014 12a3.5 3.5 0 00-.5-1.86A3 3 0 0014 8.5a3 3 0 00-2-2.83V5.5A2.5 2.5 0 009.5 2z"/><path d="M14.5 9H17l-2 3h2.5l-3 5"/></svg>
);
export const IconAnchor = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><circle cx="12" cy="5" r="3"/><line x1="12" y1="8" x2="12" y2="21"/><path d="M5 14H2a10 10 0 0020 0h-3"/></svg>
);
export const IconWave = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><path d="M2 12 Q5 6 8 12 Q11 18 14 12 Q17 6 20 12 Q21.5 15 22 12"/></svg>
);
export const IconChat = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="13.5" x2="13" y2="13.5"/></svg>
);
export const IconRun = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><circle cx="13" cy="4" r="1.8"/><path d="M9 8.5l-1.5 5 5 2 5-2-1.5-5"/><path d="M7.5 13.5l-2 5M18.5 13.5l2 5"/><path d="M11 10.5l2 3 2-3"/></svg>
);
export const IconMoon = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
);
export const IconMilestone = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><path d="M3 20l5-8 4 5 3-4 6 7H3z"/><circle cx="18" cy="6" r="2.5"/><path d="M18 3.5V2M18 9.5V11M14.5 6H13M23 6h-1.5"/></svg>
);
export const IconBody = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><path d="M12 2a2 2 0 100 4 2 2 0 000-4z"/><path d="M7 8h10l-1 7h-3v5h-2v-5H8L7 8z"/></svg>
);
export const IconPuzzle = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><path d="M19.5 12c0-.23-.01-.45-.03-.67l2.53-2-2-3.46-3.01 1.2a7 7 0 00-1.16-.67L15.5 3.5h-4l-.33 2.86a7 7 0 00-1.16.67L6.97 5.87l-2 3.46 2.53 2a7 7 0 000 1.34l-2.53 2 2 3.46 3.01-1.2c.36.25.75.47 1.16.67l.33 2.86h4l.33-2.86a7 7 0 001.16-.67l3.01 1.2 2-3.46-2.53-2c.02-.22.03-.44.03-.67z"/><circle cx="12" cy="12" r="2.5"/></svg>
);
export const IconCompass = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><circle cx="12" cy="12" r="9"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
);
export const IconCloud = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/></svg>
);
export const IconCoin = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><circle cx="12" cy="12" r="9"/><path d="M12 7v10M9.5 9.5h4a1.5 1.5 0 010 3h-3a1.5 1.5 0 000 3H15"/></svg>
);
export const IconFlame = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><path d="M8.5 14c0-4 3-6 3.5-10 3 2 5 5 5 9a6 6 0 01-12 0c0-1.5.5-3 1.5-4 .3 1.5 1 2.5 2 3z"/></svg>
);
export const IconCheck = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
);
export const IconTimer = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/></svg>
);
export const IconPhone = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.0 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
);
export const IconStar = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
);
export const IconTarget = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg>
);
export const IconMic = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
);
export const IconReset = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
);
export const IconShare = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
);
export const IconSettings = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/><circle cx="8" cy="6" r="2" fill="white"/><circle cx="16" cy="12" r="2" fill="white"/><circle cx="10" cy="18" r="2" fill="white"/></svg>
);
export const IconChevron = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><polyline points="9 18 15 12 9 6"/></svg>
);
export const IconWarning = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
);
export const IconSearch = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
);
export const IconFilter = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
);
export const IconHistory = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><polyline points="12 8 12 12 14 14"/><path d="M3.05 11a9 9 0 1 0 .5-4H1"/><polyline points="1 3 1 7 5 7"/></svg>
);
export const IconGratitude = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z" fill="currentColor" stroke="none" opacity="0.15"/><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
);
export const IconTrash = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
);

// ── Calm/peaceful icon set (mission tiles, meditations, mindfulness) ─────────
// All thin-line, single-stroke, designed to feel like a quiet illustration.

export const IconWalk = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><circle cx="13" cy="4" r="1.6"/><path d="M11 8.5l-1.5 6 4 1 4-1-1.5-6"/><path d="M8.5 14l-2 5M19.5 14l1.5 5"/></svg>
);
export const IconCup = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><path d="M5 8h12v6a4 4 0 01-4 4H9a4 4 0 01-4-4V8z"/><path d="M17 10h2a2 2 0 010 4h-2"/><path d="M9 5c0-1 .5-1.5 1-2M12 5c0-1 .5-1.5 1-2"/></svg>
);
export const IconSun = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
);
export const IconBook = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><path d="M4 19.5A2.5 2.5 0 016.5 17H20V3H6.5A2.5 2.5 0 004 5.5v14z"/><path d="M4 19.5A2.5 2.5 0 016.5 22H20"/></svg>
);
export const IconNote = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><path d="M9 17V5l10-2v12"/><circle cx="6" cy="17" r="3"/><circle cx="16" cy="15" r="3"/></svg>
);
export const IconSeedling = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><path d="M12 22V11"/><path d="M5 8c0-2 2-4 4-4s3 2 3 4c0 2-3 3-3 3s-2-1-4-3z"/><path d="M19 6c-2 0-4 2-4 4s3 3 3 3 1-3-1-5"/></svg>
);
export const IconTeapot = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><path d="M4 12h12a4 4 0 010 8H8a4 4 0 01-4-4v-4z"/><path d="M16 14h2a3 3 0 010 6h-2"/><path d="M9 8c0-1 .5-2 1-3M13 8c0-1 .5-2 1-3"/></svg>
);
export const IconCloudy = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><path d="M17.5 19a4.5 4.5 0 100-9c-.4-2.8-2.8-5-5.5-5a5.5 5.5 0 00-5.5 5.5c0 .4 0 .8.1 1.2A4 4 0 008 19h9.5z"/></svg>
);
export const IconBath = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><path d="M3 13h18v3a4 4 0 01-4 4H7a4 4 0 01-4-4v-3z"/><path d="M7 13V6a2 2 0 014 0M5 21l-1 1M19 21l1 1"/></svg>
);
export const IconClean = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><path d="M14 4l4 4-9 9-4-4z"/><path d="M5 13l-3 7 7-3"/></svg>
);
export const IconBalance = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><path d="M12 3v18M5 7l-3 7h6zM19 7l-3 7h6z"/><path d="M5 21h14"/></svg>
);
export const IconSparkles = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>
);
export const IconHands = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><path d="M8 11V5a2 2 0 014 0v6"/><path d="M16 11V5a2 2 0 00-4 0v6"/><path d="M5 11h14a0 0 0 010 0v3a5 5 0 01-5 5h-4a5 5 0 01-5-5v-3z"/></svg>
);
export const IconPalette = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><path d="M12 22a10 10 0 110-20 8 8 0 018 8 4 4 0 01-4 4h-2a2 2 0 00-2 2c0 1 1 2 1 3 0 1-1 3-1 3z"/><circle cx="7" cy="11" r="1"/><circle cx="9" cy="6" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="18" cy="9" r="1"/></svg>
);
export const IconGarden = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><path d="M12 22V14"/><path d="M12 14c-3 0-6-2-6-5 0-2 2-4 6-4s6 2 6 4c0 3-3 5-6 5z"/><path d="M3 22h18"/></svg>
);
export const IconBookmark = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
);
export const IconCalendar = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
);
export const IconHourglass = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><path d="M6 2h12M6 22h12M8 2v4l4 4 4-4V2M8 22v-4l4-4 4 4v4"/></svg>
);
export const IconFootprint = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><path d="M14 4c-1.5 0-3 2-3 5s.5 5 2 6 3-1 3-4-.5-7-2-7z"/><path d="M9 14c-1 0-2 1-2 3 0 1 1 2 2 2s2-1 2-2-1-3-2-3z"/></svg>
);
export const IconWaveHand = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><path d="M2 12c1-2 2-3 4-3M22 12c-1-2-2-3-4-3"/><path d="M8 9V5a2 2 0 014 0v4M12 9V4a2 2 0 014 0v6"/><path d="M16 10c0 4-2 8-7 8s-5-4-5-7"/></svg>
);
export const IconBubble = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
);
export const IconLaughter = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
);
export const IconLight = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><path d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12.5c.5.4 1 1 1 1.5v1h6v-1c0-.5.5-1.1 1-1.5A7 7 0 0012 2z"/></svg>
);
export const IconBell = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 01-3.4 0"/></svg>
);
export const IconTea = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><path d="M3 9h14v8a4 4 0 01-4 4H7a4 4 0 01-4-4V9z"/><path d="M17 11h2a3 3 0 010 6h-2"/><path d="M7 4l1 2M11 4l-1 2M14 4l1 2"/></svg>
);
export const IconAffirm = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/></svg>
);
export const IconShieldLock = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><circle cx="12" cy="11" r="1.5"/><path d="M12 12.5v3"/></svg>
);
export const IconWifiOff = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><path d="M2 6c2-2 5-3 8-3M22 6c-2-2-5-3-8-3M5 10c2-1 4-1.5 6-1.5M19 10c-2-1-4-1.5-6-1.5M9 14c1-.5 2-1 3-1s2 .5 3 1"/><circle cx="12" cy="18" r="1"/><line x1="3" y1="3" x2="21" y2="21"/></svg>
);
export const IconLock = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/></svg>
);
export const IconKey = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M16 5l3 3M14 7l3 3"/></svg>
);
export const IconCopy = ({size=24,color='currentColor',className=''}:IconProps) => (
  <svg {...d(size,color,className)}><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
);
