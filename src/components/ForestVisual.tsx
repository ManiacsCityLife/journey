import React, { useState, useEffect } from 'react';

// ── Forest Visual ──────────────────────────────────────────────────────────────
export function getForestStage(soberDate: string): number {
  if (!soberDate) return 0;
  const hours = Math.max(0, (Date.now() - new Date(soberDate).getTime()) / 3600000);
  // First 24h: every 6h → stages 0–3
  if (hours < 6)   return 0;
  if (hours < 12)  return 1;
  if (hours < 18)  return 2;
  if (hours < 24)  return 3;
  // Day 1–7: every 12h → stages 4–15
  if (hours < 36)  return 4;
  if (hours < 48)  return 5;
  if (hours < 60)  return 6;
  if (hours < 72)  return 7;
  if (hours < 84)  return 8;
  if (hours < 96)  return 9;
  if (hours < 108) return 10;
  if (hours < 120) return 11;
  if (hours < 132) return 12;
  if (hours < 144) return 13;
  if (hours < 156) return 14;
  if (hours < 168) return 15;
  // Day 7–30: every 24h → stages 16–38
  const days = hours / 24;
  if (days < 30) return 15 + Math.floor(days - 7) + 1;
  // Day 30+: every 14 days → stages 39+
  return 39 + Math.floor((days - 30) / 14);
}

export function getForestInfo(stage: number) {
  if (stage === 0)  return { label: 'A seed is planted',      sky1: '#e2e8f0', sky2: '#f8fafc', ground: '#94a3b8' };
  if (stage <= 3)   return { label: 'First shoots appear',    sky1: '#dcfce7', sky2: '#f0fdf4', ground: '#86efac' };
  if (stage <= 7)   return { label: 'Roots taking hold',      sky1: '#bbf7d0', sky2: '#dcfce7', ground: '#4ade80' };
  if (stage <= 11)  return { label: 'Growing steadily',       sky1: '#a7f3d0', sky2: '#d1fae5', ground: '#34d399' };
  if (stage <= 15)  return { label: 'One week strong',        sky1: '#6ee7b7', sky2: '#a7f3d0', ground: '#10b981' };
  if (stage <= 20)  return { label: 'A grove is forming',     sky1: '#5eead4', sky2: '#99f6e4', ground: '#14b8a6' };
  if (stage <= 26)  return { label: 'Trees reaching high',    sky1: '#2dd4bf', sky2: '#5eead4', ground: '#0d9488' };
  if (stage <= 32)  return { label: 'A forest is growing',    sky1: '#34d399', sky2: '#6ee7b7', ground: '#059669' };
  if (stage <= 38)  return { label: 'A thriving forest',      sky1: '#10b981', sky2: '#34d399', ground: '#047857' };
  if (stage <= 45)  return { label: 'An ancient forest',      sky1: '#059669', sky2: '#10b981', ground: '#065f46' };
  return              { label: 'A forest eternal',            sky1: '#047857', sky2: '#059669', ground: '#064e3b' };
}

function ForestVisual({ soberDate }: { soberDate: string }) {
  const [stage, setStage] = useState(() => getForestStage(soberDate));

  // Recalculate every 10 minutes so early-stage users see changes
  useEffect(() => {
    const id = setInterval(() => setStage(getForestStage(soberDate)), 10 * 60 * 1000);
    return () => clearInterval(id);
  }, [soberDate]);

  const info = getForestInfo(stage);

  // ── Tree shapes ─────────────────────────────────────────────────────────────
  // Rounded canopy tree (layered ellipses for a natural look)
  function RoundTree(x: number, h: number, w: number, c1: string, c2: string, k: string) {
    const trunkH = Math.max(8, h * 0.18);
    const trunkY = 200 - trunkH;
    const canopyY = 200 - h;
    return (
      <g key={k}>
        {/* trunk */}
        <rect x={x - 3} y={trunkY} width={6} height={trunkH + 2} fill="#92400e" rx={2}/>
        {/* canopy layers — bottom wider, top narrower */}
        <ellipse cx={x} cy={canopyY + h * 0.55} rx={w * 0.52} ry={h * 0.28} fill={c2}/>
        <ellipse cx={x} cy={canopyY + h * 0.38} rx={w * 0.46} ry={h * 0.26} fill={c1}/>
        <ellipse cx={x} cy={canopyY + h * 0.20} rx={w * 0.34} ry={h * 0.22} fill={c2}/>
        <ellipse cx={x} cy={canopyY + h * 0.06} rx={w * 0.22} ry={h * 0.16} fill={c1}/>
      </g>
    );
  }

  // Tiny seedling
  function Seedling(x: number, h: number, k: string) {
    return (
      <g key={k}>
        <line x1={x} y1={202} x2={x} y2={202 - h} stroke="#15803d" strokeWidth={1.5}/>
        <ellipse cx={x - 4} cy={202 - h * 0.55} rx={5} ry={3} fill="#22c55e" transform={`rotate(-35 ${x-4} ${202 - h * 0.55})`}/>
        <ellipse cx={x + 4} cy={202 - h * 0.55} rx={5} ry={3} fill="#16a34a" transform={`rotate(35 ${x+4} ${202 - h * 0.55})`}/>
        {h > 14 && <ellipse cx={x} cy={202 - h * 0.9} rx={4} ry={3} fill="#4ade80"/>}
      </g>
    );
  }

  // Sprout (just a stem + tiny leaves)
  function Sprout(x: number, h: number, k: string) {
    return (
      <g key={k}>
        <line x1={x} y1={204} x2={x} y2={204 - h} stroke="#16a34a" strokeWidth={2}/>
        <ellipse cx={x} cy={204 - h} rx={3} ry={3} fill="#4ade80"/>
      </g>
    );
  }

  // ── Build scene based on stage ──────────────────────────────────────────────
  const els: React.ReactElement[] = [];

  if (stage === 0) {
    // Just a seed
    els.push(<ellipse key="seed" cx={160} cy={202} rx={6} ry={4} fill="#a16207"/>);
    els.push(<ellipse key="soil" cx={160} cy={204} rx={10} ry={3} fill="#78350f" opacity={0.5}/>);

  } else if (stage === 1) {
    // Single tiny sprout
    els.push(Sprout(160, 12, 'a'));

  } else if (stage === 2) {
    // Two sprouts
    els.push(Sprout(150, 14, 'a'));
    els.push(Sprout(170, 16, 'b'));

  } else if (stage === 3) {
    // Three sprouts, middle taller
    els.push(Sprout(140, 13, 'a'));
    els.push(Sprout(160, 20, 'b'));
    els.push(Sprout(178, 14, 'c'));

  } else if (stage <= 5) {
    // Seedlings emerging (stages 4–5: day 1–2)
    const h = 14 + (stage - 4) * 4;
    els.push(Seedling(135, h, 'a'));
    els.push(Seedling(160, h + 5, 'b'));
    els.push(Seedling(183, h, 'c'));

  } else if (stage <= 7) {
    // Seedlings taller + one tiny tree center (stages 6–7: day 2–3)
    const grow = (stage - 6) * 6;
    els.push(Seedling(120, 20, 'a'));
    els.push(RoundTree(160, 28 + grow, 20 + grow, '#16a34a', '#15803d', 'b'));
    els.push(Seedling(198, 18, 'c'));

  } else if (stage <= 9) {
    // One small tree + seedlings (stages 8–9: day 3–4)
    const grow = (stage - 8) * 8;
    els.push(Seedling(110, 18, 'a'));
    els.push(Seedling(138, 22, 'b'));
    els.push(RoundTree(165, 42 + grow, 28 + grow, '#15803d', '#16a34a', 'c'));
    els.push(Seedling(195, 20, 'd'));

  } else if (stage <= 11) {
    // Two small trees (stages 10–11: day 4–5)
    const grow = (stage - 10) * 10;
    els.push(Seedling(100, 20, 'a'));
    els.push(RoundTree(140, 45 + grow, 30, '#166534', '#15803d', 'b'));
    els.push(RoundTree(182, 52 + grow, 34, '#16a34a', '#14532d', 'c'));
    els.push(Seedling(218, 18, 'd'));

  } else if (stage <= 13) {
    // Three trees, varying sizes (stages 12–13: day 5–6)
    const grow = (stage - 12) * 8;
    els.push(RoundTree(115, 42 + grow, 28, '#14532d', '#166534', 'a'));
    els.push(RoundTree(158, 60 + grow, 38, '#15803d', '#16a34a', 'b'));
    els.push(RoundTree(200, 46 + grow, 30, '#166534', '#15803d', 'c'));

  } else if (stage <= 15) {
    // Four trees — end of first week (stages 14–15)
    const grow = (stage - 14) * 8;
    els.push(RoundTree(95,  44 + grow, 28, '#14532d', '#166534', 'a'));
    els.push(RoundTree(138, 62 + grow, 38, '#15803d', '#16a34a', 'b'));
    els.push(RoundTree(178, 68 + grow, 40, '#16a34a', '#15803d', 'c'));
    els.push(RoundTree(218, 48 + grow, 30, '#166534', '#14532d', 'd'));

  } else {
    // Stages 16+: progressively more/taller trees
    // Map stage to a growth factor
    const maxStage = 50;
    const t = Math.min((stage - 16) / (maxStage - 16), 1); // 0 → 1

    // Number of trees grows from 4 to 10
    const numTrees = Math.round(4 + t * 6);
    // Tree heights grow with t
    const baseH = 55 + t * 75;
    const baseW = 36 + t * 26;

    // Evenly distribute trees across viewbox (30–290)
    const positions = Array.from({ length: numTrees }, (_, i) => {
      const spread = 30 + (260 / (numTrees - 1)) * i;
      // Add slight randomness based on index to avoid uniform look
      const jitter = ((i * 37 + stage * 13) % 20) - 10;
      return Math.max(25, Math.min(295, spread + jitter));
    });

    const colors = [
      ['#14532d', '#166534'],
      ['#15803d', '#16a34a'],
      ['#16a34a', '#15803d'],
      ['#166534', '#14532d'],
      ['#14532d', '#15803d'],
      ['#15803d', '#166534'],
      ['#16a34a', '#14532d'],
      ['#166534', '#15803d'],
      ['#14532d', '#16a34a'],
      ['#16a34a', '#166534'],
    ];

    positions.forEach((x, i) => {
      // Vary height and width per tree using index
      const hMult = 0.7 + ((i * 7 + stage) % 10) * 0.05;
      const wMult = 0.75 + ((i * 11 + stage) % 8) * 0.04;
      const [c1, c2] = colors[i % colors.length];
      els.push(RoundTree(x, baseH * hMult, baseW * wMult, c1, c2, `t${i}`));
    });
  }

  // Sun appears from stage 8 onwards, gets brighter
  const sunOpacity = stage >= 8 ? Math.min(0.9, 0.3 + (stage - 8) * 0.04) : 0;

  // Stage label for early stages, time label for later
  let timeLabel = '';
  if (stage === 0) timeLabel = 'Just started';
  else if (stage <= 3) { const h = [6,12,18][stage-1]; timeLabel = `${h} hours`; }
  else if (stage <= 15) {
    const hrs = [24,36,48,60,72,84,96,108,120,132,144,156][stage-4];
    const d = Math.floor(hrs/24), rem = hrs % 24;
    timeLabel = rem ? `${d}d ${rem}h` : `${d} day${d>1?'s':''}`;
  } else if (stage <= 38) {
    const days = 7 + (stage - 16) + 1;
    timeLabel = `${days} days`;
  } else {
    const days = 30 + (stage - 39) * 14;
    timeLabel = days >= 365 ? `${Math.floor(days/365)}yr ${Math.floor((days%365)/30)}mo` :
                days >= 30  ? `${Math.floor(days/30)}mo` : `${days}d`;
  }

  return (
    <div className="rounded-3xl border border-slate-100 overflow-hidden shadow-sm relative"
      style={{ background: `linear-gradient(to bottom, ${info.sky1}, ${info.sky2})` }}>
      <svg viewBox="0 0 320 212" width="100%" height="170" preserveAspectRatio="xMidYMax meet">
        {/* Sun */}
        {sunOpacity > 0 && (
          <circle cx={270} cy={30} r={22} fill="#fde68a" opacity={sunOpacity}/>
        )}
        {/* Ground */}
        <rect x={0} y={200} width={320} height={12} fill={info.ground}/>
        {/* Trees / seedlings */}
        {els}
      </svg>
      <div className="absolute bottom-2 left-0 right-0 flex justify-between items-end px-3">
        <span className="text-xs font-semibold text-white/80 drop-shadow">{info.label}</span>
        <span className="text-xs text-white/60 drop-shadow">{timeLabel}</span>
      </div>
    </div>
  );
}

export default ForestVisual;
