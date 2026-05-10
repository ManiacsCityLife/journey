// Tabbed Journal screen — combines Write/History, Affirmations, Vision Board, Daily Zen.
// All four tabs are designed to be useful for early sobriety: prompts focus on
// recovery, affirmations are sobriety-specific, the vision board helps visualise
// the future, and Daily Zen is a tiny morning/evening ritual.

import { useState, useEffect, useMemo, useRef } from 'react';
import type { JournalEntry, GratitudeEntry, VisionBoard, VisionSection, VisionItem, AffirmationFavorite } from '../types';
import { startListening, stopListening, isListening as speechIsListening } from '../utils/speech';
import { speak, stopSpeaking } from '../utils/tts';
import { pickImage } from '../utils/image';

type Tab = 'journal' | 'affirmations' | 'vision' | 'zen';

interface JournalScreenProps {
  username: string;
  journal: JournalEntry[];
  saveJournal: (entries: JournalEntry[]) => void;
  gratitude: GratitudeEntry[];
  addGratitude: (entry: GratitudeEntry) => void;
  visionBoards: VisionBoard[];
  saveVisionBoards: (boards: VisionBoard[]) => void;
  affirmationFavs: AffirmationFavorite[];
  saveAffirmationFavs: (favs: AffirmationFavorite[]) => void;
  soberDays: number;
}

// ── Daily prompts (rotates by day-of-year) ────────────────────────────────────
const PROMPTS = [
  "What's one craving you survived recently — and what helped?",
  "Write a letter to the version of you from a year ago.",
  "What does sobriety taste, sound and feel like today?",
  "What's one small thing you're proud of today?",
  "What would your future sober self thank you for right now?",
  "Name a trigger you noticed today. How did you respond?",
  "What does freedom from alcohol look like for you?",
  "Who in your life makes sobriety feel possible? Why?",
  "What's one fear about sobriety that turned out to be untrue?",
  "Describe a moment today where you felt fully present.",
  "What's the hardest part of recovery this week — and the easiest?",
  "What lie did alcohol used to tell you that you no longer believe?",
  "Describe a sober memory from this week you'll want to remember.",
  "What's one thing you're learning about yourself in sobriety?",
  "What feeling were you avoiding when you used to drink?",
  "What's a healthy 'reward' you can give yourself this week?",
  "Write about a person, place, or thing you've reclaimed since quitting.",
  "What does a perfect sober day look like, hour by hour?",
  "Name three things in your body that feel different sober.",
  "What's one tiny goal you can commit to for tomorrow?",
  "If your sobriety could speak, what would it say to you today?",
  "What does it mean to 'be present' for the people you love?",
  "What's a trigger you're getting better at handling? How?",
  "What boundary do you need to hold this week?",
  "Describe one moment of peace you experienced today.",
  "What are you ready to forgive yourself for?",
  "What's a story about your past that no longer defines you?",
  "What does your morning look like sober vs how it used to look?",
  "Name three people who deserve the sober version of you.",
  "What would you regret most if you drank today?",
  "What's one habit you've built since getting sober?",
  "What does 'enough' mean to you right now?",
  "Write about a time you chose discomfort over a drink. What did you learn?",
  "What's a piece of advice you'd give someone on day 1?",
  "What are you hopeful about today — even slightly?",
  "What does self-compassion look like in your life this week?",
  "What's one thing you want to say to your support people?",
  "Where do you feel resistance in your life — and what's it teaching you?",
  "What would change if you treated yourself like a friend today?",
  "Name one thing you're letting go of, today.",
];

function getDailyPrompt(): string {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return PROMPTS[dayOfYear % PROMPTS.length];
}

// ── Sobriety affirmations (curated, no generic fluff) ─────────────────────────
const AFFIRMATIONS: { id: string; text: string; cat: string }[] = [
  // Sobriety
  { id: 'sob1', cat: 'Sobriety', text: "I am free from alcohol — and freedom feels like me." },
  { id: 'sob2', cat: 'Sobriety', text: "Every sober breath is a quiet victory." },
  { id: 'sob3', cat: 'Sobriety', text: "I am building a life I do not need to escape from." },
  { id: 'sob4', cat: 'Sobriety', text: "Today, I choose clarity over numbness." },
  { id: 'sob5', cat: 'Sobriety', text: "I am the calm that the drink only pretended to give me." },
  { id: 'sob6', cat: 'Sobriety', text: "My sobriety is the most loving thing I do for myself." },
  { id: 'sob7', cat: 'Sobriety', text: "I am rewriting the story alcohol tried to write for me." },
  { id: 'sob8', cat: 'Sobriety', text: "I do not need a drink to feel okay — I never really did." },

  // Strength
  { id: 'str1', cat: 'Strength', text: "I have survived 100% of my hardest moments — that is proof, not luck." },
  { id: 'str2', cat: 'Strength', text: "I am stronger than the craving, and the craving will pass." },
  { id: 'str3', cat: 'Strength', text: "I do hard things. That is who I am now." },
  { id: 'str4', cat: 'Strength', text: "My discomfort is temporary. My choices are permanent." },
  { id: 'str5', cat: 'Strength', text: "I can do anything for the next ten minutes." },
  { id: 'str6', cat: 'Strength', text: "What I am building cannot be taken from me." },
  { id: 'str7', cat: 'Strength', text: "I am a person who keeps promises to myself." },
  { id: 'str8', cat: 'Strength', text: "Pressure is making me, not breaking me." },

  // Self-worth
  { id: 'sw1', cat: 'Self-worth', text: "I am worthy of the life sobriety opens up." },
  { id: 'sw2', cat: 'Self-worth', text: "I deserve a clear mind and a soft heart." },
  { id: 'sw3', cat: 'Self-worth', text: "I am allowed to like the person I am becoming." },
  { id: 'sw4', cat: 'Self-worth', text: "I am enough, exactly as I am, today." },
  { id: 'sw5', cat: 'Self-worth', text: "My worth is not measured by my hardest day." },
  { id: 'sw6', cat: 'Self-worth', text: "I belong here, in the life I am building." },
  { id: 'sw7', cat: 'Self-worth', text: "I treat myself with the kindness I'd give a friend." },

  // Healing
  { id: 'h1', cat: 'Healing', text: "My brain and body are healing every minute I stay sober." },
  { id: 'h2', cat: 'Healing', text: "I am gently letting go of who I was, to make room for who I am becoming." },
  { id: 'h3', cat: 'Healing', text: "I do not have to earn my own forgiveness — it is mine." },
  { id: 'h4', cat: 'Healing', text: "My past is information, not identity." },
  { id: 'h5', cat: 'Healing', text: "I am safe in this moment. I am safe in my body." },
  { id: 'h6', cat: 'Healing', text: "Healing is not linear, and I am still healing." },
  { id: 'h7', cat: 'Healing', text: "I am learning to feel what I used to numb — and I can handle it." },

  // Hope
  { id: 'hp1', cat: 'Hope', text: "The best chapters of my life have not been written yet." },
  { id: 'hp2', cat: 'Hope', text: "What's coming is better than what's gone." },
  { id: 'hp3', cat: 'Hope', text: "I am one decision away from a different day." },
  { id: 'hp4', cat: 'Hope', text: "I'm not where I want to be, but I am no longer where I was." },
  { id: 'hp5', cat: 'Hope', text: "Tomorrow will thank me for today." },
  { id: 'hp6', cat: 'Hope', text: "Every sober day is an investment in the person I'll be in a year." },

  // Calm
  { id: 'c1', cat: 'Calm', text: "I am the safe place I used to look for in a glass." },
  { id: 'c2', cat: 'Calm', text: "I can breathe through this. I have before." },
  { id: 'c3', cat: 'Calm', text: "Anxiety is loud, but it is not in charge." },
  { id: 'c4', cat: 'Calm', text: "I do not need to fix everything today." },
  { id: 'c5', cat: 'Calm', text: "Stillness is something I am allowed to have." },
  { id: 'c6', cat: 'Calm', text: "This feeling is a wave. I am the shore." },

  // Pride
  { id: 'p1', cat: 'Pride', text: "I am proud of the quiet work nobody sees." },
  { id: 'p2', cat: 'Pride', text: "I did not give up on myself — and I am not going to." },
  { id: 'p3', cat: 'Pride', text: "Every craving I outlast is a story I get to keep." },
  { id: 'p4', cat: 'Pride', text: "I am the proof that change is possible." },
  { id: 'p5', cat: 'Pride', text: "My recovery is the bravest thing I have ever done." },

  // Letting go
  { id: 'l1', cat: 'Letting go', text: "I am releasing what I cannot control today." },
  { id: 'l2', cat: 'Letting go', text: "Old shame does not get to drive my new life." },
  { id: 'l3', cat: 'Letting go', text: "I am free to outgrow who I used to be." },
  { id: 'l4', cat: 'Letting go', text: "I can put down the weight of yesterday." },
  { id: 'l5', cat: 'Letting go', text: "I no longer audition for people who didn't choose me." },

  // Connection
  { id: 'co1', cat: 'Connection', text: "I am not alone in this — and I do not have to do it alone." },
  { id: 'co2', cat: 'Connection', text: "The people who love me deserve the sober me." },
  { id: 'co3', cat: 'Connection', text: "Asking for help is a strength, not a weakness." },
  { id: 'co4', cat: 'Connection', text: "I am present today — and presence is a gift to everyone around me." },
];

const AFF_CATEGORIES = ['All', 'Sobriety', 'Strength', 'Self-worth', 'Healing', 'Hope', 'Calm', 'Pride', 'Letting go', 'Connection'];

// Vision Board palette for new sections
const SECTION_COLORS = ['bg-rose-100', 'bg-violet-100', 'bg-amber-100', 'bg-emerald-100', 'bg-sky-100', 'bg-orange-100', 'bg-pink-100', 'bg-indigo-100'];
const SUGGESTED_BOARD_NAMES = [
  'Sobriety',
  'My Year of Strength',
  'Becoming My Best Self',
  'Living Free',
  'The Life I\'m Building',
  'Health & Healing',
  'Family & Future',
];

// ── Helpers ──────────────────────────────────────────────────────────────────
function uid(prefix = '') { return prefix + Math.random().toString(36).slice(2, 10) + Date.now().toString(36); }

function todayStr(): string { return new Date().toISOString().split('T')[0]; }

function calcStreak(entries: JournalEntry[]): number {
  if (!entries.length) return 0;
  const dates = new Set(entries.map(e => e.date.split('T')[0]));
  let streak = 0;
  let cursor = new Date();
  while (dates.has(cursor.toISOString().split('T')[0])) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function lastSevenDays(): { date: string; label: string }[] {
  const out: { date: string; label: string }[] = [];
  const labels = ['S','M','T','W','T','F','S'];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push({ date: d.toISOString().split('T')[0], label: labels[d.getDay()] });
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
export default function JournalScreen(props: JournalScreenProps) {
  const [tab, setTab] = useState<Tab>('journal');

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="flex-1 overflow-y-auto pb-32">
        {tab === 'journal' && <JournalTab {...props} />}
        {tab === 'affirmations' && <AffirmationsTab {...props} />}
        {tab === 'vision' && <VisionTab {...props} />}
        {tab === 'zen' && <ZenTab {...props} />}
      </div>
      <TabBar active={tab} onChange={setTab} />
    </div>
  );
}

function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  // Sits above the global app nav (which is ~64px). We position with bottom-16.
  const items: { id: Tab; label: string; icon: string }[] = [
    { id: 'journal',      label: 'Journal',     icon: '📓' },
    { id: 'affirmations', label: 'Affirm',      icon: '💗' },
    { id: 'zen',          label: 'Daily Zen',   icon: '🌿' },
    { id: 'vision',       label: 'Vision',      icon: '✨' },
  ];
  return (
    <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-slate-200 px-2 py-1.5 flex justify-around z-30 shadow-[0_-2px_8px_rgba(0,0,0,0.04)]">
      {items.map(it => (
        <button key={it.id} onClick={() => onChange(it.id)}
          className={`flex flex-col items-center px-3 py-1.5 rounded-xl transition-all ${active === it.id ? 'bg-teal-50' : ''}`}>
          <span className="text-base leading-none">{it.icon}</span>
          <span className={`text-[10px] mt-0.5 font-semibold ${active === it.id ? 'text-teal-700' : 'text-slate-500'}`}>{it.label}</span>
        </button>
      ))}
    </div>
  );
}

// ─── JOURNAL TAB ─────────────────────────────────────────────────────────────
function JournalTab({ username, journal, saveJournal }: JournalScreenProps) {
  const [showWrite, setShowWrite] = useState(false);
  const [editing, setEditing] = useState<JournalEntry | null>(null);
  const [search, setSearch] = useState('');

  const streak = useMemo(() => calcStreak(journal), [journal]);
  const week = useMemo(() => lastSevenDays(), []);
  const datesWithEntries = useMemo(
    () => new Set(journal.map(e => e.date.split('T')[0])),
    [journal]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return journal;
    return journal.filter(e => e.text.toLowerCase().includes(q));
  }, [journal, search]);

  const grouped = useMemo(() => {
    const groups: Record<string, JournalEntry[]> = {};
    for (const e of filtered) {
      const d = e.date.split('T')[0];
      (groups[d] = groups[d] || []).push(e);
    }
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  function startNew() {
    setEditing(null);
    setShowWrite(true);
  }
  function startEdit(e: JournalEntry) {
    setEditing(e);
    setShowWrite(true);
  }
  function handleSave(text: string, mood: 1|2|3|4|5) {
    if (!text.trim()) { setShowWrite(false); return; }
    if (editing) {
      const next = journal.map(e => e.id === editing.id ? { ...e, text: text.trim(), mood } : e);
      saveJournal(next);
    } else {
      const e: JournalEntry = {
        id: uid('j_'),
        date: new Date().toISOString(),
        text: text.trim(),
        mood,
        tags: [],
      };
      saveJournal([e, ...journal]);
    }
    setShowWrite(false);
  }
  function handleDelete(id: string) {
    saveJournal(journal.filter(e => e.id !== id));
  }

  if (showWrite) {
    return <JournalWriter
      username={username}
      initial={editing}
      onSave={handleSave}
      onCancel={() => setShowWrite(false)}
    />;
  }

  return (
    <div className="px-5 pt-6 pb-6">
      <h1 className="text-3xl font-serif font-bold text-slate-800 mb-1">{username}'s Journal</h1>
      <p className="text-slate-400 text-sm mb-5">Pause. Notice. Write it down.</p>

      {/* Search */}
      <div className="relative mb-4">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder={`Search in ${journal.length} ${journal.length === 1 ? 'entry' : 'entries'}`}
          className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border border-slate-200 text-sm text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-teal-500"/>
      </div>

      {/* Streak card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm mb-4 flex items-center gap-4">
        <div className="text-center pr-4 border-r border-slate-100">
          <div className="text-3xl font-bold text-teal-600 leading-none">{streak}</div>
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Streak</div>
        </div>
        <div className="flex-1 grid grid-cols-7 gap-1">
          {week.map((w, i) => {
            const has = datesWithEntries.has(w.date);
            const isToday = w.date === todayStr();
            return (
              <div key={i} className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                  has ? (isToday ? 'bg-teal-500 text-white' : 'bg-teal-100 text-teal-700')
                      : 'bg-slate-100 text-slate-300'
                } ${isToday ? 'ring-2 ring-teal-300 ring-offset-1' : ''}`}>
                  {has ? '✓' : ''}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 font-semibold">{w.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Today's prompt card (only if no entry today) */}
      {!datesWithEntries.has(todayStr()) && !search && (
        <button onClick={startNew}
          className="w-full text-left bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100 rounded-2xl p-5 mb-4 active:scale-[0.99] transition-transform shadow-sm">
          <div className="text-[10px] font-bold text-teal-600 uppercase tracking-wider mb-2">Today's Prompt</div>
          <p className="text-slate-800 font-serif text-lg leading-snug mb-3">{getDailyPrompt()}</p>
          <span className="inline-flex items-center gap-1 text-teal-700 font-semibold text-sm">Write about it →</span>
        </button>
      )}

      {/* Entries */}
      {grouped.length === 0 ? (
        search ? (
          <div className="text-center py-10 text-slate-400 text-sm">No entries match "{search}"</div>
        ) : (
          <div className="text-center py-10">
            <div className="text-5xl mb-3">📓</div>
            <p className="text-slate-500 text-sm mb-1">Your journal is empty.</p>
            <p className="text-slate-400 text-xs">Tap "Write Entry" to begin.</p>
          </div>
        )
      ) : (
        <div className="space-y-5">
          {grouped.map(([date, entries]) => (
            <div key={date}>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
                {formatDateGroup(date)}
              </div>
              <div className="space-y-2">
                {entries.map(e => (
                  <EntryCard key={e.id} entry={e} onClick={() => startEdit(e)} onDelete={() => handleDelete(e.id)}/>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Write Entry button */}
      <button onClick={startNew}
        className="fixed bottom-32 right-5 z-20 bg-teal-600 text-white font-semibold rounded-full pl-5 pr-6 py-3.5 shadow-lg shadow-teal-500/30 flex items-center gap-2 active:scale-95 transition-transform">
        <span className="text-lg">✏️</span>
        <span>Write Entry</span>
      </button>
    </div>
  );
}

function formatDateGroup(date: string): string {
  const d = new Date(date + 'T00:00');
  const today = new Date(); today.setHours(0,0,0,0);
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
  if (d.getTime() === today.getTime()) return 'Today';
  if (d.getTime() === yesterday.getTime()) return 'Yesterday';
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

function EntryCard({ entry, onClick, onDelete }: { entry: JournalEntry; onClick: () => void; onDelete: () => void }) {
  const moodEmoji = ['😢','😟','😐','🙂','😊'];
  const time = new Date(entry.date).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const [confirmDel, setConfirmDel] = useState(false);
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
      <button onClick={onClick} className="w-full text-left">
        <div className="flex justify-between items-center mb-2">
          <div className="text-slate-400 text-xs">{time}</div>
          <div className="text-base">{moodEmoji[entry.mood - 1]}</div>
        </div>
        <p className="text-slate-700 text-sm leading-relaxed line-clamp-4 whitespace-pre-wrap">{entry.text}</p>
      </button>
      <div className="flex justify-end mt-2">
        {confirmDel ? (
          <div className="flex gap-2 items-center">
            <span className="text-xs text-rose-500">Delete?</span>
            <button onClick={() => setConfirmDel(false)} className="text-xs text-slate-500 px-2 py-1 rounded">Cancel</button>
            <button onClick={onDelete} className="text-xs text-white bg-rose-500 px-2 py-1 rounded">Yes</button>
          </div>
        ) : (
          <button onClick={() => setConfirmDel(true)} className="text-xs text-slate-400 hover:text-rose-500 px-2 py-1">Delete</button>
        )}
      </div>
    </div>
  );
}

// ─── JOURNAL WRITER ──────────────────────────────────────────────────────────
function JournalWriter({ username, initial, onSave, onCancel }: {
  username: string;
  initial: JournalEntry | null;
  onSave: (text: string, mood: 1|2|3|4|5) => void;
  onCancel: () => void;
}) {
  const [text, setText] = useState(initial?.text || '');
  const [mood, setMood] = useState<1|2|3|4|5>(initial?.mood || 3);
  const [recording, setRecording] = useState(false);
  const [recSeconds, setRecSeconds] = useState(0);
  const [showMicDisclosure, setShowMicDisclosure] = useState(false);
  const recTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const moodEmoji = ['😢','😟','😐','🙂','😊'];
  const moodLabels = ['Awful','Low','Okay','Good','Great'];
  const prompt = getDailyPrompt();

  // Cleanup on unmount
  useEffect(() => () => {
    stopListening();
    if (recTimerRef.current) clearInterval(recTimerRef.current);
  }, []);

  // Begins recording — actually requests permission and starts the recogniser.
  async function beginRecording() {
    setRecSeconds(0);
    recTimerRef.current = setInterval(() => setRecSeconds(s => s + 1), 1000);
    const ok = await startListening(
      partial => setText(partial),
      final => setText(final),
      () => {
        setRecording(false);
        if (recTimerRef.current) { clearInterval(recTimerRef.current); recTimerRef.current = null; }
      },
      { initialText: text }
    );
    if (ok) setRecording(true);
    else {
      if (recTimerRef.current) { clearInterval(recTimerRef.current); recTimerRef.current = null; }
      alert('Voice recording is not available on this device.');
    }
  }

  // Mic-button handler — gates the first-ever start with a disclosure modal
  // so we satisfy Google Play's "prominent disclosure" rule for sensitive
  // permissions. After the user accepts once, subsequent taps go straight
  // through.
  async function toggleRecord() {
    if (recording) {
      await stopListening();
      return;
    }
    const { storageGet } = await import('../utils/storage');
    const seen = await storageGet('micDisclosureSeen');
    if (seen) {
      await beginRecording();
    } else {
      setShowMicDisclosure(true);
    }
  }

  async function acceptMicDisclosure() {
    const { storageSet } = await import('../utils/storage');
    await storageSet('micDisclosureSeen', '1');
    setShowMicDisclosure(false);
    await beginRecording();
  }

  function fmtTime(s: number) {
    return `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;
  }

  return (
    <div className="px-5 pt-5 pb-6 max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-3">
        <button onClick={onCancel} className="text-slate-500 -ml-2 p-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
        </button>
        <div className="text-sm text-slate-500">{initial ? 'Edit entry' : new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</div>
        <button onClick={() => onSave(text, mood)}
          disabled={!text.trim()}
          className="text-teal-600 disabled:text-slate-300 font-bold text-sm px-3 py-2">Save</button>
      </div>

      <div className="text-2xl font-serif font-bold text-slate-800 mb-1">{username}'s Journal</div>

      {!initial && (
        <div className="bg-teal-50 border border-teal-100 rounded-xl p-3 my-3 text-teal-800 text-sm italic font-serif">
          "{prompt}"
        </div>
      )}

      {/* Mood */}
      <div className="my-4">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">How are you feeling?</div>
        <div className="flex justify-between">
          {([1,2,3,4,5] as const).map(m => (
            <button key={m} onClick={() => setMood(m)}
              className={`flex flex-col items-center p-2 rounded-xl transition-all ${mood === m ? 'bg-teal-100 scale-110' : 'opacity-50'}`}>
              <span className="text-2xl">{moodEmoji[m-1]}</span>
              <span className={`text-[10px] mt-1 font-semibold ${mood === m ? 'text-teal-700' : 'text-slate-400'}`}>{moodLabels[m-1]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Text area */}
      <textarea autoFocus value={text} onChange={e => setText(e.target.value)}
        placeholder="What's on your mind today?"
        rows={12}
        className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-4 text-slate-800 placeholder-slate-400 text-base leading-relaxed resize-none outline-none focus:ring-2 focus:ring-teal-500"/>

      {/* Voice recording */}
      <div className="mt-4">
        {recording && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 mb-3 flex items-center gap-3">
            <div className="relative w-3 h-3">
              <div className="absolute inset-0 rounded-full bg-rose-500"/>
              <div className="absolute inset-0 rounded-full bg-rose-400 animate-ping"/>
            </div>
            <div className="flex-1">
              <div className="text-rose-700 text-sm font-semibold">Listening…</div>
              <div className="text-rose-500 text-xs">Speak naturally — I'm transcribing as you go.</div>
            </div>
            <div className="text-rose-700 font-mono font-bold text-sm tabular-nums">{fmtTime(recSeconds)}</div>
          </div>
        )}
        <button onClick={toggleRecord}
          className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-semibold text-sm transition-all ${
            recording ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' : 'bg-white text-slate-700 border border-slate-200'
          }`}>
          <span className="text-xl">{recording ? '⏹' : '🎤'}</span>
          <span>{recording ? 'Stop recording' : 'Voice entry'}</span>
        </button>
        <p className="text-center text-slate-400 text-xs mt-2">
          {recording ? 'Tap stop when you\'re done — keeps listening through pauses.' : 'Tap to dictate — speak as long as you like.'}
        </p>
      </div>

      {/* Microphone disclosure (Google Play prominent-disclosure requirement) */}
      {showMicDisclosure && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-5">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-xl">
            <div className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-2xl">🎤</div>
                <h3 className="text-slate-800 font-bold text-base">Microphone access</h3>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                Voice journaling uses your phone's microphone <strong>only while you're recording</strong>.
              </p>
              <ul className="text-slate-600 text-xs leading-relaxed space-y-1.5 pl-4 list-disc">
                <li>Speech is converted to text by your phone's built-in recognition engine.</li>
                <li>Audio is <strong>not recorded or saved</strong> — only the recognised text appears in your entry.</li>
                <li>Nothing is uploaded. Everything stays on your device.</li>
              </ul>
              <p className="text-slate-500 text-xs italic">
                After you tap Allow, Android will show its own permission prompt.
              </p>
            </div>
            <div className="grid grid-cols-2 border-t border-slate-100">
              <button onClick={() => setShowMicDisclosure(false)}
                className="py-3.5 text-slate-600 font-semibold text-sm border-r border-slate-100">
                Not now
              </button>
              <button onClick={acceptMicDisclosure}
                className="py-3.5 text-teal-600 font-semibold text-sm">
                Allow microphone
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── AFFIRMATIONS TAB ────────────────────────────────────────────────────────
function AffirmationsTab({ affirmationFavs, saveAffirmationFavs }: JournalScreenProps) {
  const [category, setCategory] = useState<string>('All');
  const [showFavs, setShowFavs] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [customText, setCustomText] = useState('');
  const [showAddCustom, setShowAddCustom] = useState(false);

  const dayIdx = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const dailyAff = AFFIRMATIONS[dayIdx % AFFIRMATIONS.length];

  const favIds = useMemo(() => new Set(affirmationFavs.map(f => f.id)), [affirmationFavs]);

  const visible = useMemo(() => {
    if (showFavs) {
      // Show favourites — both curated + custom
      return affirmationFavs.map(f => ({ id: f.id, text: f.text, cat: f.category || 'Custom' }));
    }
    if (category === 'All') return AFFIRMATIONS;
    return AFFIRMATIONS.filter(a => a.cat === category);
  }, [category, showFavs, affirmationFavs]);

  function toggleFav(a: { id: string; text: string; cat: string }) {
    if (favIds.has(a.id)) {
      saveAffirmationFavs(affirmationFavs.filter(f => f.id !== a.id));
    } else {
      const next: AffirmationFavorite = {
        id: a.id, text: a.text, category: a.cat, addedAt: Date.now(),
      };
      saveAffirmationFavs([next, ...affirmationFavs]);
    }
  }

  async function speakAff(id: string, text: string) {
    if (speakingId === id) {
      stopSpeaking();
      setSpeakingId(null);
      return;
    }
    stopSpeaking();
    setSpeakingId(id);
    await speak(text);
    setSpeakingId(null);
  }

  function addCustom() {
    if (!customText.trim()) return;
    const id = uid('custom_');
    const next: AffirmationFavorite = {
      id, text: customText.trim(), category: 'Custom', custom: true, addedAt: Date.now(),
    };
    saveAffirmationFavs([next, ...affirmationFavs]);
    setCustomText('');
    setShowAddCustom(false);
  }

  // Cleanup TTS on unmount
  useEffect(() => () => { stopSpeaking(); }, []);

  return (
    <div className="px-5 pt-6 pb-6">
      <div className="flex justify-between items-start mb-1">
        <h1 className="text-3xl font-serif font-bold text-slate-800">Affirmations</h1>
        <button onClick={() => setShowAddCustom(true)} className="text-teal-600 text-sm font-semibold flex items-center gap-1 mt-2">+ Add Yours</button>
      </div>
      <p className="text-slate-400 text-sm mb-4">Words to repeat until you believe them.</p>

      {/* Daily affirmation card */}
      <div className="bg-gradient-to-br from-violet-100 via-pink-100 to-amber-100 rounded-3xl p-6 mb-5 shadow-sm">
        <div className="text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2 opacity-70">Today's Affirmation</div>
        <p className="text-slate-800 font-serif text-xl leading-snug mb-4">"{dailyAff.text}"</p>
        <div className="flex gap-3">
          <button onClick={() => speakAff(dailyAff.id, dailyAff.text)}
            className="flex-1 py-2.5 rounded-xl bg-white/70 backdrop-blur text-slate-800 text-sm font-semibold flex items-center justify-center gap-2">
            <span>{speakingId === dailyAff.id ? '⏹' : '🔊'}</span>
            <span>{speakingId === dailyAff.id ? 'Stop' : 'Read aloud'}</span>
          </button>
          <button onClick={() => toggleFav(dailyAff)}
            className="px-4 py-2.5 rounded-xl bg-white/70 backdrop-blur text-slate-800 text-sm font-semibold flex items-center gap-2">
            <span>{favIds.has(dailyAff.id) ? '❤️' : '🤍'}</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto -mx-5 px-5 pb-1 [&::-webkit-scrollbar]:hidden">
        <button onClick={() => setShowFavs(true)}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 ${showFavs ? 'bg-rose-500 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>
          ❤️ Favourites <span className="opacity-70">({affirmationFavs.length})</span>
        </button>
        {AFF_CATEGORIES.map(c => (
          <button key={c} onClick={() => { setCategory(c); setShowFavs(false); }}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold ${
              !showFavs && category === c ? 'bg-teal-600 text-white' : 'bg-white border border-slate-200 text-slate-600'
            }`}>{c}</button>
        ))}
      </div>

      {/* Add custom modal */}
      {showAddCustom && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center px-4" onClick={() => setShowAddCustom(false)}>
          <div className="bg-white rounded-t-3xl sm:rounded-3xl p-5 w-full max-w-sm space-y-3" onClick={e => e.stopPropagation()}>
            <div className="text-slate-800 font-bold text-lg">Add your own affirmation</div>
            <textarea autoFocus value={customText} onChange={e => setCustomText(e.target.value)}
              placeholder="e.g. I am stronger than my hardest day."
              rows={3}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500"/>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setShowAddCustom(false)} className="py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm">Cancel</button>
              <button onClick={addCustom} disabled={!customText.trim()} className="py-3 rounded-xl bg-teal-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-sm">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {visible.length === 0 ? (
        <div className="text-center py-10 text-slate-400 text-sm">
          {showFavs ? 'No favourites yet. Tap the heart on any affirmation to save it here.' : 'No affirmations.'}
        </div>
      ) : (
        <div className="space-y-2">
          {visible.map(a => (
            <div key={a.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-start gap-3">
              <p className="flex-1 text-slate-700 font-serif text-base leading-snug">"{a.text}"</p>
              <div className="flex flex-col gap-1.5 flex-shrink-0">
                <button onClick={() => speakAff(a.id, a.text)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm ${speakingId === a.id ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {speakingId === a.id ? '⏹' : '🔊'}
                </button>
                <button onClick={() => toggleFav(a)}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm bg-slate-100">
                  {favIds.has(a.id) ? '❤️' : '🤍'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── VISION BOARD TAB ────────────────────────────────────────────────────────
function VisionTab({ username, visionBoards, saveVisionBoards }: JournalScreenProps) {
  const [activeBoardId, setActiveBoardId] = useState<string | null>(visionBoards[0]?.id ?? null);
  const [showCreate, setShowCreate] = useState(false);
  const [showBoardMenu, setShowBoardMenu] = useState(false);

  const activeBoard = visionBoards.find(b => b.id === activeBoardId) || null;

  function createBoard(name: string) {
    const board: VisionBoard = {
      id: uid('vb_'),
      name: name.trim() || `Vision ${visionBoards.length + 1}`,
      createdAt: Date.now(),
      sections: [{
        id: uid('vs_'),
        title: 'My Vision',
        color: SECTION_COLORS[0],
        items: [],
      }],
    };
    const next = [board, ...visionBoards];
    saveVisionBoards(next);
    setActiveBoardId(board.id);
    setShowCreate(false);
  }

  function updateBoard(updated: VisionBoard) {
    saveVisionBoards(visionBoards.map(b => b.id === updated.id ? updated : b));
  }

  function deleteBoard(id: string) {
    const next = visionBoards.filter(b => b.id !== id);
    saveVisionBoards(next);
    setActiveBoardId(next[0]?.id ?? null);
    setShowBoardMenu(false);
  }

  // Empty state
  if (visionBoards.length === 0) {
    return <>
      <div className="px-5 pt-6 pb-6">
        <h1 className="text-3xl font-serif font-bold text-slate-800 mb-1">Vision Board</h1>
        <p className="text-slate-400 text-sm mb-8">A picture of the life you're building.</p>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mt-6">
          <div className="bg-gradient-to-br from-amber-100 via-rose-100 to-violet-100 h-44 flex items-center justify-center text-7xl">🏔️</div>
          <div className="p-6 text-center">
            <h2 className="text-slate-800 font-bold text-xl mb-2">Manifest your goals</h2>
            <p className="text-slate-500 text-sm mb-5">Add photos, words, and reminders of the future you're working toward — and revisit them when motivation runs low.</p>
            <button onClick={() => setShowCreate(true)}
              className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-rose-500 text-white text-2xl shadow-lg shadow-rose-500/30 active:scale-95 transition-transform">→</button>
          </div>
        </div>

        <details className="mt-5 bg-white rounded-2xl border border-slate-200 px-4 py-3">
          <summary className="font-semibold text-slate-700 text-sm cursor-pointer flex items-center gap-2">
            <span className="text-slate-400">?</span>
            What is a Vision Board?
          </summary>
          <p className="text-slate-500 text-xs mt-3 leading-relaxed">
            A vision board is a collection of images and words that represent the life you want.
            For someone in recovery, it's a tool for keeping the future you're fighting for visible —
            so when a craving hits, you have something concrete to fight <em>for</em>, not just away from.
            Add photos of people, places, and milestones that matter to you.
          </p>
        </details>
      </div>

      {showCreate && <CreateBoardModal username={username} onCreate={createBoard} onCancel={() => setShowCreate(false)}/>}
    </>;
  }

  if (!activeBoard) return null;

  return (
    <div className="px-5 pt-6 pb-6">
      {/* Header with board switcher */}
      <button onClick={() => setShowBoardMenu(true)} className="flex items-center gap-2 mb-1">
        <h1 className="text-3xl font-serif font-bold text-slate-800">{activeBoard.name}</h1>
        <span className="text-slate-400 text-xl">⌄</span>
      </button>
      <p className="text-slate-400 text-sm mb-1">
        Created {new Date(activeBoard.createdAt).toLocaleDateString()} · {activeBoard.sections.reduce((s, sec) => s + sec.items.length, 0)} photos
      </p>

      <div className="flex items-center gap-2 mb-4 mt-3">
        <button onClick={() => setShowCreate(true)}
          className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-semibold">+ New board</button>
      </div>

      {/* Sections */}
      <div className="space-y-5">
        {activeBoard.sections.map((sec, idx) => (
          <SectionView key={sec.id} board={activeBoard} section={sec} sectionIndex={idx} updateBoard={updateBoard}/>
        ))}
      </div>

      {/* Add section button */}
      <button onClick={() => {
        const next = { ...activeBoard, sections: [...activeBoard.sections, {
          id: uid('vs_'),
          title: `Section ${activeBoard.sections.length + 1}`,
          color: SECTION_COLORS[activeBoard.sections.length % SECTION_COLORS.length],
          items: [],
        }] };
        updateBoard(next);
      }} className="mt-4 w-full py-3 rounded-2xl border-2 border-dashed border-slate-300 text-slate-500 text-sm font-semibold">+ Add Section</button>

      {/* Board switcher modal */}
      {showBoardMenu && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center px-4" onClick={() => setShowBoardMenu(false)}>
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-slate-100">
              <div className="text-slate-800 font-bold text-lg">Your boards</div>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {visionBoards.map(b => (
                <div key={b.id} className="flex items-center px-5 py-3 border-b border-slate-50">
                  <button onClick={() => { setActiveBoardId(b.id); setShowBoardMenu(false); }} className="flex-1 text-left">
                    <div className={`text-sm font-semibold ${b.id === activeBoardId ? 'text-teal-600' : 'text-slate-700'}`}>{b.name}</div>
                    <div className="text-slate-400 text-xs">{b.sections.reduce((s, sec) => s + sec.items.length, 0)} photos</div>
                  </button>
                  {visionBoards.length > 1 && (
                    <button onClick={() => { if (confirm(`Delete "${b.name}"?`)) deleteBoard(b.id); }}
                      className="text-slate-400 text-xs ml-3 hover:text-rose-500 px-2 py-1">Delete</button>
                  )}
                </div>
              ))}
            </div>
            <button onClick={() => { setShowBoardMenu(false); setShowCreate(true); }}
              className="w-full py-4 text-teal-600 font-bold text-sm border-t border-slate-100">+ New Board</button>
          </div>
        </div>
      )}

      {showCreate && <CreateBoardModal username={username} onCreate={createBoard} onCancel={() => setShowCreate(false)}/>}
    </div>
  );
}

function CreateBoardModal({ username, onCreate, onCancel }: {
  username: string;
  onCreate: (name: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState('');
  const year = new Date().getFullYear();
  const suggestions = [
    `Vision Board ${year}`,
    `${username}'s Vision ${year}`,
    ...SUGGESTED_BOARD_NAMES,
  ];
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex flex-col px-5 py-8" onClick={onCancel}>
      <div className="flex-1 max-w-md mx-auto w-full bg-white rounded-3xl p-6 overflow-y-auto" onClick={e => e.stopPropagation()}>
        <button onClick={onCancel} className="text-slate-500 mb-3 -ml-2 p-2">←</button>
        <h2 className="text-2xl font-bold text-slate-800 mb-1">Hello, {username}! 👋</h2>
        <p className="text-slate-700 text-base mb-5">Let's give your vision board a name.</p>
        <input autoFocus value={name} onChange={e => setName(e.target.value)}
          placeholder="Your vision board name"
          className="w-full bg-white border-2 border-rose-300 rounded-xl px-4 py-3 text-base outline-none focus:ring-2 focus:ring-rose-200 mb-4"/>
        <div className="text-slate-400 text-sm mb-3">or pick one from below</div>
        <div className="flex flex-wrap gap-2 mb-6">
          {suggestions.map(s => (
            <button key={s} onClick={() => setName(s)}
              className={`px-4 py-2 rounded-xl text-sm border ${name === s ? 'bg-rose-100 border-rose-300 text-rose-700' : 'bg-white border-slate-200 text-slate-600'}`}>
              {s}
            </button>
          ))}
        </div>
        <button onClick={() => onCreate(name || `Vision Board ${year}`)}
          className="w-full py-4 rounded-2xl bg-rose-500 text-white font-bold text-base shadow-lg shadow-rose-500/30">Continue</button>
      </div>
    </div>
  );
}

function SectionView({ board, section, sectionIndex, updateBoard }: {
  board: VisionBoard; section: VisionSection; sectionIndex: number;
  updateBoard: (b: VisionBoard) => void;
}) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(section.title);
  const [adding, setAdding] = useState(false);
  const [viewerItem, setViewerItem] = useState<VisionItem | null>(null);
  const [showSectionMenu, setShowSectionMenu] = useState(false);

  function commitTitle() {
    const next = { ...board, sections: board.sections.map(s => s.id === section.id ? { ...s, title: titleDraft.trim() || s.title } : s) };
    updateBoard(next);
    setEditingTitle(false);
  }

  function deleteSection() {
    if (board.sections.length === 1) {
      alert('A vision board needs at least one section.');
      return;
    }
    if (!confirm(`Delete "${section.title}" and its ${section.items.length} photos?`)) return;
    updateBoard({ ...board, sections: board.sections.filter(s => s.id !== section.id) });
  }

  async function addPhoto() {
    if (adding) return;
    setAdding(true);
    try {
      const dataUrl = await pickImage();
      if (!dataUrl) return;
      const item: VisionItem = { id: uid('vi_'), image: dataUrl, createdAt: Date.now() };
      const next = { ...board, sections: board.sections.map(s => s.id === section.id ? { ...s, items: [...s.items, item] } : s) };
      updateBoard(next);
    } finally {
      setAdding(false);
    }
  }

  function removeItem(itemId: string) {
    const next = { ...board, sections: board.sections.map(s => s.id === section.id ? { ...s, items: s.items.filter(i => i.id !== itemId) } : s) };
    updateBoard(next);
    setViewerItem(null);
  }

  function updateCaption(itemId: string, caption: string) {
    const next = { ...board, sections: board.sections.map(s => s.id === section.id ? { ...s, items: s.items.map(i => i.id === itemId ? { ...i, caption } : i) } : s) };
    updateBoard(next);
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className={`${section.color} px-4 py-3 flex items-center justify-between`}>
        {editingTitle ? (
          <input autoFocus value={titleDraft} onChange={e => setTitleDraft(e.target.value)}
            onBlur={commitTitle} onKeyDown={e => e.key === 'Enter' && commitTitle()}
            className="bg-white/60 backdrop-blur rounded px-2 py-1 text-slate-800 font-bold text-sm flex-1 mr-2 outline-none"/>
        ) : (
          <button onClick={() => { setTitleDraft(section.title); setEditingTitle(true); }} className="font-bold text-slate-800 text-sm">
            {section.title}
          </button>
        )}
        <button onClick={() => setShowSectionMenu(v => !v)} className="text-slate-700 px-2 text-lg leading-none">⋯</button>
      </div>
      {showSectionMenu && (
        <div className="bg-slate-50 border-b border-slate-100 flex">
          <button onClick={() => { setShowSectionMenu(false); setTitleDraft(section.title); setEditingTitle(true); }}
            className="flex-1 py-2 text-xs text-slate-600 font-semibold">Rename</button>
          <button onClick={() => { setShowSectionMenu(false); deleteSection(); }}
            className="flex-1 py-2 text-xs text-rose-600 font-semibold border-l border-slate-200">Delete</button>
        </div>
      )}
      <div className="p-3">
        <div className="grid grid-cols-3 gap-2">
          {section.items.map(item => (
            <button key={item.id} onClick={() => setViewerItem(item)}
              className="aspect-square rounded-xl overflow-hidden bg-slate-100 active:scale-95 transition-transform">
              <img src={item.image} alt="" className="w-full h-full object-cover"/>
            </button>
          ))}
          {/* Add slot */}
          <button onClick={addPhoto} disabled={adding}
            className={`aspect-square rounded-xl ${SECTION_COLORS[(sectionIndex + section.items.length) % SECTION_COLORS.length]} flex items-center justify-center text-white text-3xl active:scale-95 transition-transform`}>
            {adding ? <span className="animate-pulse text-sm font-semibold text-slate-700">...</span> : '+'}
          </button>
        </div>
      </div>

      {viewerItem && (
        <ItemViewer item={viewerItem} onClose={() => setViewerItem(null)}
          onDelete={() => removeItem(viewerItem.id)}
          onUpdateCaption={c => updateCaption(viewerItem.id, c)}/>
      )}
    </div>
  );
}

function ItemViewer({ item, onClose, onDelete, onUpdateCaption }: {
  item: VisionItem;
  onClose: () => void;
  onDelete: () => void;
  onUpdateCaption: (c: string) => void;
}) {
  const [caption, setCaption] = useState(item.caption || '');
  const [editing, setEditing] = useState(!item.caption);
  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col" onClick={onClose}>
      <div className="flex justify-between items-center px-5 py-4">
        <button onClick={onClose} className="text-white text-3xl">×</button>
        <button onClick={e => { e.stopPropagation(); if (confirm('Delete this photo?')) onDelete(); }}
          className="text-rose-300 text-sm font-semibold">Delete</button>
      </div>
      <div className="flex-1 flex items-center justify-center px-5" onClick={e => e.stopPropagation()}>
        <img src={item.image} alt="" className="max-w-full max-h-full rounded-2xl"/>
      </div>
      <div className="px-5 py-5" onClick={e => e.stopPropagation()}>
        {editing ? (
          <div>
            <input autoFocus value={caption} onChange={e => setCaption(e.target.value)}
              placeholder="Add a caption (e.g. 'My family at the beach')"
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 text-sm outline-none"/>
            <div className="flex justify-end gap-3 mt-3">
              <button onClick={() => { setCaption(item.caption || ''); setEditing(false); }} className="text-white/70 text-sm">Cancel</button>
              <button onClick={() => { onUpdateCaption(caption); setEditing(false); }}
                className="bg-white text-slate-800 font-semibold text-sm px-4 py-2 rounded-lg">Save</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="w-full text-left text-white text-base p-3">
            {item.caption || <span className="text-white/50 italic">Add caption</span>}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── DAILY ZEN TAB ───────────────────────────────────────────────────────────
function ZenTab({ username, gratitude, addGratitude, soberDays }: JournalScreenProps) {
  const today = todayStr();
  const [gratitude1, setGratitude1] = useState('');
  const [gratitude2, setGratitude2] = useState('');
  const [gratitude3, setGratitude3] = useState('');
  const [intention, setIntention] = useState('');
  const [savedToday, setSavedToday] = useState(false);

  // Find today's saved gratitude (if any)
  const todayGratitude = useMemo(() => gratitude.find(g => g.date === today), [gratitude, today]);

  useEffect(() => {
    if (todayGratitude && !savedToday) {
      // Pre-populate fields if user already saved today (so they can re-edit)
      const lines = todayGratitude.text.split('\n').filter(l => l.trim());
      setGratitude1(lines[0] || '');
      setGratitude2(lines[1] || '');
      setGratitude3(lines[2] || '');
    }
  }, [todayGratitude, savedToday]);

  function saveZen() {
    const lines = [gratitude1, gratitude2, gratitude3].filter(l => l.trim());
    if (!lines.length && !intention.trim()) return;
    const text = lines.join('\n');
    addGratitude({ id: uid('g_'), date: today, text });
    setSavedToday(true);
  }

  // Pick one curated zen quote per day
  const ZEN = [
    { quote: "The cave you fear to enter holds the treasure you seek.", who: "Joseph Campbell" },
    { quote: "Between stimulus and response there is a space. In that space is our power to choose.", who: "Viktor Frankl" },
    { quote: "What you resist, persists. What you accept, transforms.", who: "Carl Jung" },
    { quote: "The wound is the place where the light enters you.", who: "Rumi" },
    { quote: "You cannot stop the waves, but you can learn to surf.", who: "Jon Kabat-Zinn" },
    { quote: "Recovery is not for people who need it. It's for people who want it.", who: "Anonymous" },
    { quote: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", who: "Aristotle" },
    { quote: "Almost everything will work again if you unplug it for a few minutes — including you.", who: "Anne Lamott" },
    { quote: "The best time to plant a tree was 20 years ago. The second best time is now.", who: "Chinese proverb" },
    { quote: "Sobriety is the greatest gift I have ever given myself.", who: "Rob Lowe" },
    { quote: "You don't have to see the whole staircase, just take the first step.", who: "Martin Luther King Jr." },
    { quote: "Ring the bells that still can ring. Forget your perfect offering. There is a crack in everything. That's how the light gets in.", who: "Leonard Cohen" },
    { quote: "Healing doesn't mean the damage never existed. It means the damage no longer controls our lives.", who: "Akshay Dubey" },
    { quote: "What we plant in the soil of contemplation, we shall reap in the harvest of action.", who: "Meister Eckhart" },
    { quote: "Above all, be the heroine of your life, not the victim.", who: "Nora Ephron" },
  ];
  const dayIdx = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const zen = ZEN[dayIdx % ZEN.length];

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 5) return 'Good night';
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div className="px-5 pt-6 pb-6">
      <h1 className="text-3xl font-serif font-bold text-slate-800 mb-1">{greeting}, {username}</h1>
      <p className="text-slate-400 text-sm mb-5">{soberDays > 0 ? `Day ${soberDays} of your sobriety.` : 'Welcome to your daily ritual.'}</p>

      {/* Today's quote */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-3xl p-6 mb-5">
        <div className="text-3xl mb-3">🌿</div>
        <p className="text-slate-800 font-serif italic text-lg leading-snug mb-3">"{zen.quote}"</p>
        <p className="text-slate-500 text-xs font-semibold">— {zen.who}</p>
      </div>

      {/* Gratitude */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 mb-5">
        <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">Three Good Things</div>
        <h2 className="text-slate-800 font-bold text-lg mb-3">What are you grateful for today?</h2>
        {[
          { val: gratitude1, set: setGratitude1, ph: 'Something simple — a coffee, a hug, a song' },
          { val: gratitude2, set: setGratitude2, ph: 'Someone in your life' },
          { val: gratitude3, set: setGratitude3, ph: 'Something you survived or accomplished' },
        ].map((g, i) => (
          <div key={i} className="flex items-start gap-3 mb-3">
            <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-sm font-bold flex-shrink-0">{i+1}</div>
            <input value={g.val} onChange={e => g.set(e.target.value)} placeholder={g.ph}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-amber-400"/>
          </div>
        ))}
        <button onClick={saveZen}
          disabled={!gratitude1.trim() && !gratitude2.trim() && !gratitude3.trim()}
          className={`w-full mt-2 py-3 rounded-xl font-semibold text-sm ${
            savedToday ? 'bg-emerald-500 text-white' : 'bg-amber-500 disabled:bg-slate-200 disabled:text-slate-400 text-white'
          }`}>
          {savedToday ? '✓ Saved for today' : (todayGratitude ? 'Update today\'s gratitude' : 'Save')}
        </button>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <a href="#breathing-pause" onClick={e => { e.preventDefault(); /* hint to use breathing tool */ }}
          className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <div className="text-2xl mb-2">🌬️</div>
          <div className="text-slate-800 font-semibold text-sm mb-1">Pause to breathe</div>
          <div className="text-slate-500 text-xs">Use the Breathing tool in your toolkit.</div>
        </a>
        <a href="#daily-mission" onClick={e => e.preventDefault()}
          className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <div className="text-2xl mb-2">🎯</div>
          <div className="text-slate-800 font-semibold text-sm mb-1">Today's mission</div>
          <div className="text-slate-500 text-xs">Open the Home screen for your daily mission.</div>
        </a>
      </div>
    </div>
  );
}
