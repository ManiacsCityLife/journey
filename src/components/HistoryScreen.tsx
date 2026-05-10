import { useState, useMemo } from 'react';
import type { CravingLog, ThoughtLog, ActivityLog, SleepLog, JournalEntry, GratitudeEntry } from '../types';
import { IconChevron, IconWave, IconChat, IconRun, IconMoon, IconJournal, IconGratitude, IconSearch, IconTrash } from './Icons';

type FilterType = 'all'|'cravings'|'thoughts'|'exercise'|'sleep'|'journal'|'gratitude';

interface HistoryEntry {
  id: string;
  type: FilterType;
  date: string;       // YYYY-MM-DD for grouping
  timestamp: string;  // ISO or date string for sorting
  title: string;
  detail: string;
  extra?: string;
}

interface Props {
  cravings: CravingLog[];
  thoughts: ThoughtLog[];
  activities: ActivityLog[];
  sleep: SleepLog[];
  journal: JournalEntry[];
  gratitude: GratitudeEntry[];
  onBack: () => void;
  onDelete: (type: 'craving'|'thought'|'activity'|'sleep'|'journal'|'gratitude', id: string) => void;
}

const INTENSITY_LABEL: Record<number,string> = {1:'Mild',2:'Mild',3:'Low',4:'Low',5:'Moderate',6:'Moderate',7:'Strong',8:'Strong',9:'Consuming',10:'Consuming'};
const THOUGHT_LABEL: Record<string,string> = {'Brief':'Brief','Mild':'Mild','Moderate':'Moderate','Strong':'Strong','Consuming':'Consuming'};

function extractIntensityLabel(text: string): string {
  const known = ['Consuming','Strong','Moderate','Mild','Brief'];
  for (const k of known) if (text.startsWith(k)) return k;
  return '';
}

export default function HistoryScreen({ cravings, thoughts, activities, sleep, journal, gratitude, onBack, onDelete }: Props) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string|null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{id:string;type:any;label:string}|null>(null);

  // Build unified entry list
  const allEntries = useMemo((): HistoryEntry[] => {
    const entries: HistoryEntry[] = [];

    cravings.forEach(c => {
      const label = INTENSITY_LABEL[c.intensity] || 'Craving';
      entries.push({
        id: c.id, type: 'cravings',
        date: c.timestamp.split('T')[0],
        timestamp: c.timestamp,
        title: `Craving — ${label} intensity (${c.intensity}/10)`,
        detail: [c.trigger && `Trigger: ${c.trigger}`, c.duration && `Duration: ${c.duration} min`].filter(Boolean).join(' · '),
        extra: c.overcome ? 'Overcame it ✓' : '',
      });
    });

    thoughts.forEach(t => {
      const intensityLabel = extractIntensityLabel(t.text);
      entries.push({
        id: t.id, type: 'thoughts',
        date: t.timestamp.split('T')[0],
        timestamp: t.timestamp,
        title: `Thought — ${intensityLabel || 'logged'}`,
        detail: t.text,
      });
    });

    activities.forEach(a => {
      // Compose a friendly detail line from the structured fields. Falls back
      // to the raw activity string for legacy entries that still have
      // duration/distance baked into the activity field.
      const parts = [a.activity];
      if (typeof a.duration === 'number') parts.push(`${a.duration} min`);
      if (typeof a.distance === 'number' && a.unit) parts.push(`${a.distance} ${a.unit}`);
      if (a.notes) parts.push(a.notes);
      entries.push({
        id: a.id, type: 'exercise',
        date: a.timestamp.split('T')[0],
        timestamp: a.timestamp,
        title: `Exercise`,
        detail: parts.join(' · '),
      });
    });

    sleep.forEach((s, idx) => {
      const hrs = Math.floor(s.hours);
      const mins = Math.round((s.hours - hrs) * 60);
      entries.push({
        id: s.id || `sleep_legacy_${s.date}_${idx}`,
        type: 'sleep',
        date: s.date,
        timestamp: s.date + 'T00:00:00',
        title: `Sleep — ${hrs}h${mins>0?` ${mins}m`:''} · Quality ${s.quality}/5`,
        detail: `${s.quality === 5 ? 'Excellent' : s.quality === 4 ? 'Good' : s.quality === 3 ? 'Fair' : s.quality === 2 ? 'Poor' : 'Very poor'} sleep`,
      });
    });

    journal.forEach(j => {
      entries.push({
        id: j.id, type: 'journal',
        date: j.date.split('T')[0],
        timestamp: j.date,
        title: 'Journal entry',
        detail: j.text?.slice(0, 120) + (j.text?.length > 120 ? '...' : ''),
      });
    });

    gratitude.forEach(g => {
      entries.push({
        id: g.id, type: 'gratitude',
        date: g.date,
        timestamp: g.date + 'T00:01:00',
        title: 'Gratitude',
        detail: g.text,
      });
    });

    return entries.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [cravings, thoughts, activities, sleep, journal, gratitude]);

  // Filter + search
  const filtered = useMemo(() => {
    let list = filter === 'all' ? allEntries : allEntries.filter(e => e.type === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(e => e.title.toLowerCase().includes(q) || e.detail.toLowerCase().includes(q));
    }
    return list;
  }, [allEntries, filter, search]);

  // Counts per type
  const counts = useMemo(() => {
    const c: Record<FilterType, number> = { all:allEntries.length, cravings:0, thoughts:0, exercise:0, sleep:0, journal:0, gratitude:0 };
    allEntries.forEach(e => { c[e.type] = (c[e.type]||0)+1; });
    return c;
  }, [allEntries]);

  // Group by date
  const grouped = useMemo(() => {
    const map: Record<string, HistoryEntry[]> = {};
    filtered.forEach(e => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    return Object.entries(map).sort((a,b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  // Last 7 days stats
  const last7 = useMemo(() => {
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate()-7);
    const cutoffStr = cutoff.toISOString().split('T')[0];
    const recent = allEntries.filter(e => e.date >= cutoffStr);
    return {
      cravings: recent.filter(e=>e.type==='cravings').length,
      thoughts: recent.filter(e=>e.type==='thoughts').length,
      journal: recent.filter(e=>e.type==='journal').length,
      exercise: recent.filter(e=>e.type==='exercise').length,
    };
  }, [allEntries]);

  function formatDate(dateStr: string) {
    const d = new Date(dateStr + 'T12:00:00');
    const today = new Date(); today.setHours(12,0,0,0);
    const yesterday = new Date(today); yesterday.setDate(today.getDate()-1);
    if (dateStr === today.toISOString().split('T')[0]) return 'Today';
    if (dateStr === yesterday.toISOString().split('T')[0]) return 'Yesterday';
    return d.toLocaleDateString('en-ZA',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  }

  function formatTime(ts: string) {
    try {
      return new Date(ts).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
    } catch { return ''; }
  }

  function getIcon(type: FilterType) {
    if (type==='cravings') return <IconWave size={16} color="#e11d48"/>;
    if (type==='thoughts') return <IconChat size={16} color="#0284c7"/>;
    if (type==='exercise') return <IconRun size={16} color="#059669"/>;
    if (type==='sleep')    return <IconMoon size={16} color="#4f46e5"/>;
    if (type==='journal')  return <IconJournal size={16} color="#d97706"/>;
    if (type==='gratitude') return <IconGratitude size={16} color="#e11d48"/>;
    return null;
  }

  function getBg(type: FilterType) {
    if (type==='cravings') return 'bg-red-50';
    if (type==='thoughts') return 'bg-sky-50';
    if (type==='exercise') return 'bg-emerald-50';
    if (type==='sleep')    return 'bg-indigo-50';
    if (type==='journal')  return 'bg-amber-50';
    if (type==='gratitude') return 'bg-pink-50';
    return 'bg-slate-50';
  }

  function getDeleteType(type: FilterType): 'craving'|'thought'|'activity'|'sleep'|'journal'|'gratitude' {
    if (type==='cravings') return 'craving';
    if (type==='thoughts') return 'thought';
    if (type==='exercise') return 'activity';
    return type as any;
  }

  // Check if a new month starts at this date group
  function isNewMonth(dateStr: string, prevDateStr: string|null) {
    if (!prevDateStr) return false;
    return dateStr.slice(0,7) !== prevDateStr.slice(0,7);
  }

  const FILTERS: {key:FilterType;label:string}[] = [
    {key:'all',label:'All'},
    {key:'cravings',label:'Cravings'},
    {key:'thoughts',label:'Thoughts'},
    {key:'exercise',label:'Exercise'},
    {key:'sleep',label:'Sleep'},
    {key:'journal',label:'Journal'},
    {key:'gratitude',label:'Gratitude'},
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 py-4 flex items-center gap-3">
        <button onClick={onBack} className="w-8 h-8 flex items-center justify-center">
          <IconChevron size={20} color="#94a3b8" className="rotate-180"/>
        </button>
        <div>
          <div className="text-slate-800 font-bold">My History</div>
          <div className="text-slate-400 text-xs">{allEntries.length} total entries</div>
        </div>
      </div>

      {/* Last 7 days stat strip */}
      <div className="bg-white border-b border-slate-100 px-4 py-3">
        <div className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-2">Last 7 days</div>
        <div className="flex gap-3">
          {[
            {label:'Cravings',val:last7.cravings,color:'text-red-500'},
            {label:'Thoughts',val:last7.thoughts,color:'text-sky-500'},
            {label:'Journal',val:last7.journal,color:'text-amber-500'},
            {label:'Exercise',val:last7.exercise,color:'text-emerald-500'},
          ].map(s => (
            <div key={s.label} className="flex-1 text-center">
              <div className={`text-lg font-bold ${s.color}`}>{s.val}</div>
              <div className="text-slate-400 text-xs">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Search bar */}
      <div className="bg-white border-b border-slate-100 px-4 py-2">
        <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100">
          <IconSearch size={16} color="#94a3b8"/>
          <input
            value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Search entries..."
            className="flex-1 bg-transparent text-slate-700 text-sm outline-none placeholder-slate-400"
          />
          {search && <button onClick={()=>setSearch('')} className="text-slate-400 text-sm w-4 h-4 flex items-center justify-center">✕</button>}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="bg-white border-b border-slate-100 overflow-x-auto">
        <div className="flex px-4 gap-1 py-2 min-w-max">
          {FILTERS.map(f => (
            <button key={f.key} onClick={()=>setFilter(f.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                filter===f.key ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
              {f.label}{counts[f.key]>0 ? ` (${counts[f.key]})` : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Entry list */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {grouped.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">📋</div>
            <div className="text-slate-500 font-medium text-sm">{search ? 'No entries match your search' : 'No entries yet'}</div>
            <div className="text-slate-400 text-xs mt-1">{search ? 'Try different keywords' : 'Start logging cravings, thoughts, and activities'}</div>
          </div>
        ) : (
          <div className="space-y-1">
            {grouped.map(([dateStr, entries], groupIdx) => {
              const prevDate = groupIdx > 0 ? grouped[groupIdx-1][0] : null;
              const showMonthDivider = isNewMonth(dateStr, prevDate);
              return (
                <div key={dateStr}>
                  {/* Monthly divider */}
                  {showMonthDivider && (
                    <div className="flex items-center gap-3 my-4">
                      <div className="flex-1 h-px bg-slate-200"/>
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                        {new Date(dateStr+' 12:00').toLocaleDateString('en',{month:'long',year:'numeric'})}
                      </span>
                      <div className="flex-1 h-px bg-slate-200"/>
                    </div>
                  )}

                  {/* Date header */}
                  <div className="flex items-center justify-between px-1 pt-3 pb-1.5">
                    <span className="text-sm font-bold text-slate-700">{formatDate(dateStr)}</span>
                    <span className="text-xs text-slate-400">{entries.length} {entries.length===1?'entry':'entries'}</span>
                  </div>

                  {/* Entries for this date */}
                  <div className="space-y-1.5">
                    {entries.map(entry => {
                      const isExpanded = expanded === entry.id;
                      return (
                        <div key={entry.id}
                          className={`bg-white rounded-2xl border border-slate-100 overflow-hidden transition-all ${isExpanded ? 'shadow-sm' : ''}`}>
                          <button
                            className="w-full text-left px-4 py-3 flex items-start gap-3"
                            onClick={()=>setExpanded(isExpanded ? null : entry.id)}>
                            <div className={`w-8 h-8 rounded-xl ${getBg(entry.type)} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                              {getIcon(entry.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-slate-800 text-sm font-semibold leading-snug">{entry.title}</div>
                              {entry.detail && (
                                <div className={`text-slate-500 text-xs mt-0.5 leading-relaxed ${isExpanded ? '' : 'line-clamp-1'}`}>
                                  {entry.detail}
                                </div>
                              )}
                              {entry.extra && isExpanded && (
                                <div className="text-teal-600 text-xs mt-1 font-medium">{entry.extra}</div>
                              )}
                            </div>
                            <div className="text-slate-400 text-xs flex-shrink-0 mt-0.5">{formatTime(entry.timestamp)}</div>
                          </button>

                          {/* Expanded delete action */}
                          {isExpanded && (
                            <div className="border-t border-slate-50 px-4 py-2.5 flex justify-end">
                              <button
                                onClick={()=>setConfirmDelete({id:entry.id, type:getDeleteType(entry.type), label:entry.title})}
                                className="flex items-center gap-1.5 text-xs text-red-400 font-medium py-1 px-3 rounded-lg bg-red-50">
                                <IconTrash size={12} color="#f87171"/>
                                Delete entry
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            <div className="h-8"/>
          </div>
        )}
      </div>

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-end z-50" onClick={()=>setConfirmDelete(null)}>
          <div className="bg-white rounded-t-3xl p-6 w-full border-t border-slate-100" onClick={e=>e.stopPropagation()}>
            <div className="text-slate-800 font-bold text-base mb-1">Delete this entry?</div>
            <div className="text-slate-500 text-sm mb-5">{confirmDelete.label}</div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={()=>setConfirmDelete(null)}
                className="py-3.5 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm">Cancel</button>
              <button onClick={()=>{onDelete(confirmDelete.type,confirmDelete.id);setConfirmDelete(null);setExpanded(null);}}
                className="py-3.5 rounded-xl bg-red-500 text-white font-semibold text-sm">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
