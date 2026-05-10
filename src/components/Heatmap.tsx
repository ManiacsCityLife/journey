import { useMemo, useState } from 'react';
import BackButton from './BackButton';
import type { DailyHeatmapEntry } from '../types';

interface HeatmapProps {
  data: DailyHeatmapEntry[];
  soberDate: string;
  onBack: () => void;
}

function getHeatColor(cravings: number, thoughts: number): string {
  const total = cravings + thoughts;
  if (total === 0) return '#1e293b';
  if (total <= 2) return '#365314';
  if (total <= 5) return '#d97706';
  if (total <= 9) return '#ea580c';
  return '#dc2626';
}

function getDaysBack(n: number): string[] {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

function getWeekLabel(weeksAgo: number): string {
  if (weeksAgo === 0) return 'This week';
  if (weeksAgo === 1) return 'Last week';
  return `${weeksAgo}w ago`;
}

const DAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
type Range = 30 | 90 | 365;

export default function Heatmap({ data, soberDate, onBack }: HeatmapProps) {
  const [range, setRange] = useState<Range>(90);

  const dataMap = useMemo(() => {
    const map: Record<string, DailyHeatmapEntry> = {};
    data.forEach(d => { map[d.date] = d; });
    return map;
  }, [data]);

  const days = useMemo(() => getDaysBack(range), [range]);

  const totalCravings = useMemo(() => days.reduce((s, d) => s + (dataMap[d]?.cravings || 0), 0), [days, dataMap]);
  const totalThoughts  = useMemo(() => days.reduce((s, d) => s + (dataMap[d]?.thoughts  || 0), 0), [days, dataMap]);
  const cleanDays      = useMemo(() => days.filter(d => !dataMap[d] || (dataMap[d].cravings + dataMap[d].thoughts) === 0).length, [days, dataMap]);
  const allData        = useMemo(() => days.map(d => dataMap[d]).filter(Boolean), [days, dataMap]);
  const worstDay       = useMemo(() => [...allData].sort((a, b) => (b.cravings + b.thoughts) - (a.cravings + a.thoughts))[0], [allData]);
  const soberDateStr   = soberDate?.split('T')[0];
  const todayStr       = new Date().toISOString().split('T')[0];

  // ── Align days into proper Sun-aligned week rows, newest week first ──────────
  const alignedWeeks = useMemo(() => {
    if (days.length === 0) return [];
    const firstDate = new Date(days[0]);
    const firstDow  = firstDate.getDay(); // 0=Sun … 6=Sat
    // Pad front with nulls so index 0 = Sunday of that week
    const padded: (string | null)[] = [...Array(firstDow).fill(null), ...days];
    const w: (string | null)[][] = [];
    for (let i = 0; i < padded.length; i += 7) w.push(padded.slice(i, i + 7));
    // Reverse: current week first (top row)
    return w.reverse();
  }, [days]);

  // ── Month groups for year view ───────────────────────────────────────────────
  const monthGroups = useMemo(() => {
    const groups: Record<string, string[]> = {};
    days.forEach(d => {
      const key = d.substring(0, 7);
      if (!groups[key]) groups[key] = [];
      groups[key].push(d);
    });
    return groups;
  }, [days]);

  const cellSize = range === 365 ? 20 : 26;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-800">
        <BackButton onClick={onBack} className="text-slate-400" />
        <div className="flex-1">
          <div className="text-white font-semibold">Activity Heatmap</div>
          <div className="text-slate-400 text-xs">Cravings & thoughts logged</div>
        </div>
        <div className="flex gap-1 bg-slate-800 rounded-xl p-1">
          {([30, 90, 365] as Range[]).map(r => (
            <button key={r} onClick={() => setRange(r)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${range === r ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>
              {r === 365 ? '1Y' : r === 90 ? '90D' : '30D'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-900 rounded-xl p-3 border border-slate-700 text-center">
            <div className="text-2xl font-bold text-indigo-400">{totalCravings}</div>
            <div className="text-slate-400 text-xs mt-1">Cravings</div>
          </div>
          <div className="bg-slate-900 rounded-xl p-3 border border-slate-700 text-center">
            <div className="text-2xl font-bold text-violet-400">{totalThoughts}</div>
            <div className="text-slate-400 text-xs mt-1">Thoughts</div>
          </div>
          <div className="bg-slate-900 rounded-xl p-3 border border-slate-700 text-center">
            <div className="text-2xl font-bold text-green-400">{cleanDays}</div>
            <div className="text-slate-400 text-xs mt-1">Clear days</div>
          </div>
        </div>

        {/* Main heatmap card */}
        <div className="bg-slate-900 rounded-2xl p-4 border border-slate-700">
          <div className="text-white font-semibold text-sm mb-4">
            {range === 365 ? 'Full Year Overview' : range === 90 ? '90-Day Overview' : '30-Day Overview'}
          </div>

          {/* ── YEAR VIEW: month rows (unchanged) ───────────────────────────── */}
          {range === 365 && (
            <div className="space-y-1.5">
              {Object.entries(monthGroups).map(([month, monthDays]) => {
                const [, mo] = month.split('-');
                const total = monthDays.reduce((s, d) => s + (dataMap[d]?.cravings || 0) + (dataMap[d]?.thoughts || 0), 0);
                return (
                  <div key={month} className="flex items-center gap-2">
                    <div className="w-7 text-slate-500 text-xs flex-shrink-0">{MONTH_NAMES[parseInt(mo) - 1]}</div>
                    <div className="flex gap-0.5 flex-wrap flex-1">
                      {monthDays.map(date => {
                        const entry     = dataMap[date];
                        const t         = entry ? entry.cravings + entry.thoughts : 0;
                        const isStart   = date === soberDateStr;
                        const isToday   = date === todayStr;
                        return (
                          <div key={date} className="relative group" style={{ width: cellSize, height: cellSize }}>
                            <div
                              className={`w-full h-full rounded-sm ${isStart ? 'ring-2 ring-indigo-400' : ''} ${isToday ? 'ring-1 ring-white/40' : ''}`}
                              style={{ backgroundColor: getHeatColor(entry?.cravings || 0, entry?.thoughts || 0) }}
                            />
                            {t > 0 && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-white/70 font-bold" style={{ fontSize: 7 }}>{t}</span>
                              </div>
                            )}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-slate-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-10 border border-slate-600">
                              {date} — {entry ? `${entry.cravings} cravings, ${entry.thoughts} thoughts` : 'Clear day ✓'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className={`text-xs w-6 text-right flex-shrink-0 ${total > 0 ? 'text-orange-400' : 'text-green-600'}`}>
                      {total > 0 ? total : '✓'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── 30/90 VIEW: week rows, current week on TOP ──────────────────── */}
          {range !== 365 && (
            <>
              {/* Day-of-week column headers */}
              <div className="flex items-center gap-1 mb-2 ml-16">
                {DAY_HEADERS.map((d, i) => (
                  <div key={i} className="text-center text-slate-600 text-xs font-medium" style={{ width: cellSize }}>
                    {d.charAt(0)}
                  </div>
                ))}
              </div>

              {/* Week rows — current week first */}
              <div className="space-y-1">
                {alignedWeeks.map((week, wi) => {
                  const weeksAgo   = wi;
                  const weekLabel  = getWeekLabel(weeksAgo);
                  // Count total for this week (for the row badge)
                  const weekTotal  = week.reduce((s, d) => d ? s + (dataMap[d]?.cravings || 0) + (dataMap[d]?.thoughts || 0) : s, 0);

                  return (
                    <div key={wi} className="flex items-center gap-1">
                      {/* Week label */}
                      <div className="w-14 text-slate-600 text-xs text-right pr-2 flex-shrink-0 leading-tight">
                        {weekLabel}
                      </div>

                      {/* Day cells */}
                      {week.map((date, di) => {
                        if (!date) {
                          // Padding cell
                          return <div key={di} style={{ width: cellSize, height: cellSize }} />;
                        }
                        const entry   = dataMap[date];
                        const total   = entry ? entry.cravings + entry.thoughts : 0;
                        const isStart = date === soberDateStr;
                        const isToday = date === todayStr;
                        return (
                          <div key={di} className="relative group" style={{ width: cellSize, height: cellSize }}>
                            <div
                              className={`w-full h-full rounded-md transition-transform hover:scale-110
                                ${isStart  ? 'ring-2 ring-indigo-400' : ''}
                                ${isToday  ? 'ring-2 ring-white/50'   : ''}`}
                              style={{ backgroundColor: getHeatColor(entry?.cravings || 0, entry?.thoughts || 0) }}
                            />
                            {total > 0 && (
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className="text-white/80 font-bold" style={{ fontSize: 9 }}>{total}</span>
                              </div>
                            )}
                            {isToday && (
                              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full pointer-events-none" />
                            )}
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-800 text-white text-xs rounded-lg px-2.5 py-1.5 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-20 border border-slate-600 shadow-lg">
                              <div className="font-semibold text-slate-300 mb-0.5">{date}</div>
                              {entry
                                ? <><div>{entry.cravings} craving{entry.cravings !== 1 ? 's' : ''}</div><div>{entry.thoughts} thought{entry.thoughts !== 1 ? 's' : ''}</div></>
                                : <div className="text-green-400">Clear day ✓</div>}
                            </div>
                          </div>
                        );
                      })}

                      {/* Row total badge */}
                      <div className={`ml-1 text-xs font-semibold w-5 text-center ${weekTotal > 0 ? 'text-orange-400' : 'text-slate-700'}`}>
                        {weekTotal > 0 ? weekTotal : '·'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Legend */}
          <div className="flex items-center gap-2 mt-5">
            <span className="text-slate-500 text-xs">Clear</span>
            {['#1e293b','#365314','#d97706','#ea580c','#dc2626'].map((c, i) => (
              <div key={i} className="w-4 h-4 rounded-sm" style={{ backgroundColor: c }} />
            ))}
            <span className="text-slate-500 text-xs">High</span>
          </div>
        </div>

        {/* Monthly summary */}
        <div className="bg-slate-900 rounded-2xl p-4 border border-slate-700">
          <div className="text-white font-semibold text-sm mb-4">Monthly Summary</div>
          <div className="space-y-3">
            {Object.entries(monthGroups).map(([month, monthDays]) => {
              const mc         = monthDays.reduce((s, d) => s + (dataMap[d]?.cravings || 0), 0);
              const mt         = monthDays.reduce((s, d) => s + (dataMap[d]?.thoughts  || 0), 0);
              const cleanCount = monthDays.filter(d => !dataMap[d] || (dataMap[d].cravings + dataMap[d].thoughts) === 0).length;
              const [, mo]     = month.split('-');
              return (
                <div key={month}>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 text-slate-400 text-xs">{MONTH_NAMES[parseInt(mo) - 1]}</div>
                    <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                        style={{ width: `${Math.min(((mc + mt) / 30) * 100, 100)}%` }} />
                    </div>
                    <div className="text-slate-400 text-xs w-24 text-right">{mc}c / {mt}t · {cleanCount} clear</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hardest day */}
        {worstDay && (
          <div className="bg-slate-900 rounded-2xl p-4 border border-slate-700">
            <div className="text-slate-400 text-xs uppercase tracking-wider mb-2">Hardest Day</div>
            <div className="text-white font-semibold">{worstDay.date}</div>
            <div className="text-slate-400 text-sm">{worstDay.cravings} cravings, {worstDay.thoughts} thoughts</div>
            <div className="text-indigo-400 text-xs mt-1">You got through it. Every single one.</div>
          </div>
        )}

      </div>
    </div>
  );
}
