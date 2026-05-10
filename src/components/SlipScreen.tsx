// Records a slip without erasing the user's previous progress.
// Copy stays gentle — no "relapse" / "failed" / "broke". Reflection
// prompts are optional.

import { useState } from 'react';
import { IconChevron, IconHeart, IconBookmark } from './Icons';

interface Props {
  /** Current sober date (ISO) — used to compute the streak being saved */
  currentSoberDate: string;
  /** Called with the slip data on confirm */
  onConfirm: (data: {
    timestamp: string;
    trigger?: string;
    triggerTags?: string[];
    feeling?: string;
    reflection?: string;
  }) => Promise<void>;
  onCancel: () => void;
}

type Step = 'intro' | 'when' | 'trigger' | 'feeling' | 'reflection' | 'confirm';

const STEPS: Step[] = ['intro', 'when', 'trigger', 'feeling', 'reflection', 'confirm'];

const TRIGGER_TAGS = [
  'Stress', 'Loneliness', 'Boredom', 'Anger', 'Exhaustion',
  'Social pressure', 'Celebration', 'Anxiety', 'Sadness',
  'Habit / autopilot', 'A specific person', 'A specific place',
];

const FEELING_TAGS = [
  'Numb', 'Relieved', 'Guilty', 'Disappointed', 'Indifferent',
  'Sad', 'Angry with myself', 'Confused', 'Tired', 'Empty',
];

function daysBetween(a: string, b: string): number {
  const ams = new Date(a).getTime();
  const bms = new Date(b).getTime();
  if (!isFinite(ams) || !isFinite(bms)) return 0;
  return Math.max(0, Math.floor((bms - ams) / 86400000));
}

export default function SlipScreen({ currentSoberDate, onConfirm, onCancel }: Props) {
  const [step, setStep] = useState<Step>('intro');
  const [timestamp, setTimestamp] = useState(() => new Date().toISOString().slice(0, 16));
  const [trigger, setTrigger] = useState('');
  const [triggerTags, setTriggerTags] = useState<string[]>([]);
  const [feeling, setFeeling] = useState('');
  const [reflection, setReflection] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const stepIdx = STEPS.indexOf(step);
  const previousStreak = daysBetween(currentSoberDate, timestamp);

  function next() {
    const i = STEPS.indexOf(step);
    if (i < STEPS.length - 1) setStep(STEPS[i + 1]);
  }
  function back() {
    const i = STEPS.indexOf(step);
    if (i > 0) setStep(STEPS[i - 1]);
    else onCancel();
  }
  function toggleTag(tag: string) {
    setTriggerTags(t => t.includes(tag) ? t.filter(x => x !== tag) : [...t, tag]);
  }

  async function commit() {
    if (submitting) return;
    setSubmitting(true);
    try {
      await onConfirm({
        timestamp: new Date(timestamp).toISOString(),
        trigger: trigger.trim() || undefined,
        triggerTags: triggerTags.length ? triggerTags : undefined,
        feeling: feeling.trim() || undefined,
        reflection: reflection.trim() || undefined,
      });
    } catch (e) {
      console.error('[slip] confirm failed:', e);
      setSubmitting(false);
    }
  }

  // ── Shell ───────────────────────────────────────────────────────────────
  const Header = () => (
    <header className="flex items-center px-4 py-4 bg-white border-b border-slate-100 flex-shrink-0">
      <button onClick={back} className="p-2 -ml-2 text-slate-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
      </button>
      <div className="flex-1 flex justify-center gap-1.5">
        {STEPS.slice(1).map((_, i) => (
          <div key={i} className={`h-1 rounded-full transition-all ${i === stepIdx - 1 ? 'w-6 bg-teal-500' : i < stepIdx - 1 ? 'w-1 bg-teal-300' : 'w-1 bg-slate-200'}`}/>
        ))}
      </div>
      <div className="w-10"/>
    </header>
  );

  // ── Intro ───────────────────────────────────────────────────────────────
  if (step === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 flex flex-col px-6 py-8">
        <button onClick={onCancel} className="self-start text-slate-500 -ml-2 p-2 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
        <div className="flex-1 max-w-sm mx-auto w-full flex flex-col justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 mx-auto mb-6">
            <IconHeart size={36}/>
          </div>
          <h1 className="text-slate-900 text-2xl font-serif font-bold mb-3">It's okay.</h1>
          <p className="text-slate-700 text-base leading-relaxed mb-3">A slip is part of recovery for most people. It is not the end of your journey — it's a chapter in it.</p>
          <p className="text-slate-500 text-sm leading-relaxed mb-8">
            Let's record what happened. Your previous {previousStreak === 1 ? 'day' : `${previousStreak} days`} of sobriety stays with you. Every day you've already done is yours forever — nobody can take it away.
          </p>
          <div className="bg-white border border-slate-100 rounded-2xl p-4 text-left mb-3">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">What happens now</div>
            <ul className="text-sm text-slate-700 space-y-2">
              <li className="flex items-start gap-2"><span className="text-teal-600 mt-0.5">·</span><span>Your journal, vision board, reasons and history all stay.</span></li>
              <li className="flex items-start gap-2"><span className="text-teal-600 mt-0.5">·</span><span>Your previous streak becomes part of your <em>best streak</em> and <em>lifetime sober days</em>.</span></li>
              <li className="flex items-start gap-2"><span className="text-teal-600 mt-0.5">·</span><span>Your counter restarts from the moment you choose.</span></li>
              <li className="flex items-start gap-2"><span className="text-teal-600 mt-0.5">·</span><span>You'll be asked a few gentle questions to understand the slip — all optional.</span></li>
            </ul>
          </div>
        </div>
        <div className="space-y-2">
          <button onClick={next}
            className="w-full max-w-sm mx-auto py-4 rounded-2xl bg-teal-600 text-white font-semibold text-base shadow-md shadow-teal-500/20 active:scale-[0.98] transition-transform">
            Continue
          </button>
          <button onClick={onCancel}
            className="w-full max-w-sm mx-auto py-3 text-slate-500 text-sm font-medium">
            Not yet — go back
          </button>
        </div>
      </div>
    );
  }

  // ── When ────────────────────────────────────────────────────────────────
  if (step === 'when') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header/>
        <div className="flex-1 px-6 pt-8 pb-4 max-w-sm mx-auto w-full">
          <h2 className="text-slate-900 text-2xl font-serif font-bold mb-2">When did it happen?</h2>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">Pick the time as best you remember. Your counter will restart from this moment.</p>
          <input type="datetime-local" value={timestamp} onChange={e => setTimestamp(e.target.value)}
            max={new Date().toISOString().slice(0, 16)}
            className="w-full bg-white border border-slate-200 text-slate-800 rounded-2xl px-4 py-4 text-base outline-none focus:ring-2 focus:ring-teal-500 mb-3"/>
          <button onClick={() => setTimestamp(new Date().toISOString().slice(0, 16))}
            className="text-teal-600 text-sm font-semibold mb-6">Use right now ↗</button>

          {previousStreak >= 0 && (
            <div className="bg-white border border-slate-100 rounded-2xl p-4 mt-4">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">This means…</div>
              <p className="text-slate-700 text-sm">Your previous streak of <span className="font-bold text-teal-700">{previousStreak} {previousStreak === 1 ? 'day' : 'days'}</span> will be saved as part of your story.</p>
            </div>
          )}
        </div>
        <div className="px-6 pb-8">
          <button onClick={next}
            className="w-full max-w-sm mx-auto py-4 rounded-2xl bg-teal-600 text-white font-semibold text-base shadow-md shadow-teal-500/20 active:scale-[0.98] transition-transform">
            Continue
          </button>
        </div>
      </div>
    );
  }

  // ── Trigger ─────────────────────────────────────────────────────────────
  if (step === 'trigger') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header/>
        <div className="flex-1 px-6 pt-8 pb-4 max-w-sm mx-auto w-full">
          <h2 className="text-slate-900 text-2xl font-serif font-bold mb-2">What was happening?</h2>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">Naming the trigger takes some of its power. Tap any that apply — or skip if you're not sure.</p>
          <div className="flex flex-wrap gap-2 mb-5">
            {TRIGGER_TAGS.map(t => (
              <button key={t} onClick={() => toggleTag(t)}
                className={`px-3 py-2 rounded-full text-xs font-semibold transition-all ${
                  triggerTags.includes(t) ? 'bg-teal-600 text-white' : 'bg-white border border-slate-200 text-slate-600'
                }`}>
                {t}
              </button>
            ))}
          </div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Anything else? (optional)</label>
          <textarea value={trigger} onChange={e => setTrigger(e.target.value)}
            rows={3}
            placeholder="e.g. Friday after a hard week, an old friend offered me a beer..."
            className="w-full bg-white border border-slate-200 text-slate-800 placeholder-slate-400 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500 resize-none"/>
        </div>
        <div className="px-6 pb-8 space-y-2">
          <button onClick={next}
            className="w-full max-w-sm mx-auto py-4 rounded-2xl bg-teal-600 text-white font-semibold text-base shadow-md shadow-teal-500/20 active:scale-[0.98] transition-transform">
            Continue
          </button>
          <button onClick={next}
            className="w-full max-w-sm mx-auto py-3 text-slate-500 text-sm font-medium">Skip</button>
        </div>
      </div>
    );
  }

  // ── Feeling ─────────────────────────────────────────────────────────────
  if (step === 'feeling') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header/>
        <div className="flex-1 px-6 pt-8 pb-4 max-w-sm mx-auto w-full">
          <h2 className="text-slate-900 text-2xl font-serif font-bold mb-2">How are you feeling now?</h2>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">No right or wrong answer. Just notice what's there.</p>
          <div className="flex flex-wrap gap-2 mb-5">
            {FEELING_TAGS.map(t => (
              <button key={t} onClick={() => setFeeling(feeling === t ? '' : t)}
                className={`px-3 py-2 rounded-full text-xs font-semibold transition-all ${
                  feeling === t ? 'bg-teal-600 text-white' : 'bg-white border border-slate-200 text-slate-600'
                }`}>
                {t}
              </button>
            ))}
          </div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Or in your own words (optional)</label>
          <textarea value={feeling.length && !FEELING_TAGS.includes(feeling) ? feeling : ''}
            onChange={e => setFeeling(e.target.value)}
            rows={3}
            placeholder="e.g. relieved at first, then heavy..."
            className="w-full bg-white border border-slate-200 text-slate-800 placeholder-slate-400 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500 resize-none"/>
        </div>
        <div className="px-6 pb-8 space-y-2">
          <button onClick={next}
            className="w-full max-w-sm mx-auto py-4 rounded-2xl bg-teal-600 text-white font-semibold text-base shadow-md shadow-teal-500/20 active:scale-[0.98] transition-transform">
            Continue
          </button>
          <button onClick={next}
            className="w-full max-w-sm mx-auto py-3 text-slate-500 text-sm font-medium">Skip</button>
        </div>
      </div>
    );
  }

  // ── Reflection ──────────────────────────────────────────────────────────
  if (step === 'reflection') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header/>
        <div className="flex-1 px-6 pt-8 pb-4 max-w-sm mx-auto w-full">
          <h2 className="text-slate-900 text-2xl font-serif font-bold mb-2">A note for next time</h2>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">If a similar moment happens again, what would you want yourself to do? You can read this back from your slip log later.</p>
          <textarea autoFocus value={reflection} onChange={e => setReflection(e.target.value)}
            rows={8}
            placeholder="e.g. Next time when work stress hits, I'll text my brother before I go anywhere near a bar. I'll keep cold non-alcoholic options in the fridge..."
            className="w-full bg-white border border-slate-200 text-slate-800 placeholder-slate-400 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500 resize-none mb-4"/>
          <div className="bg-teal-50 border border-teal-100 rounded-xl p-3 text-teal-800 text-xs leading-relaxed flex items-start gap-2">
            <IconBookmark size={14} color="#0d9488" className="flex-shrink-0 mt-0.5"/>
            <span>This becomes part of your slip log so future you can learn from this moment.</span>
          </div>
        </div>
        <div className="px-6 pb-8 space-y-2">
          <button onClick={next}
            className="w-full max-w-sm mx-auto py-4 rounded-2xl bg-teal-600 text-white font-semibold text-base shadow-md shadow-teal-500/20 active:scale-[0.98] transition-transform">
            Continue
          </button>
          <button onClick={next}
            className="w-full max-w-sm mx-auto py-3 text-slate-500 text-sm font-medium">Skip</button>
        </div>
      </div>
    );
  }

  // ── Confirm ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header/>
      <div className="flex-1 px-6 pt-8 pb-4 max-w-sm mx-auto w-full">
        <h2 className="text-slate-900 text-2xl font-serif font-bold mb-2">Ready?</h2>
        <p className="text-slate-500 text-sm mb-6 leading-relaxed">When you tap below, your sober counter will restart from the time you chose. Everything else stays.</p>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 mb-3 space-y-3">
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Saved as part of your story</div>
            <div className="text-slate-800 font-serif text-2xl font-light mt-1">{previousStreak} {previousStreak === 1 ? 'day' : 'days'} of sobriety</div>
            <div className="text-slate-500 text-xs mt-1">Yours forever — counted toward your best streak and lifetime sober days.</div>
          </div>
          {(triggerTags.length > 0 || trigger.trim()) && (
            <div className="pt-3 border-t border-slate-100">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Trigger</div>
              <div className="flex flex-wrap gap-1.5 mb-1">
                {triggerTags.map(t => (
                  <span key={t} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{t}</span>
                ))}
              </div>
              {trigger.trim() && <div className="text-slate-700 text-sm">{trigger}</div>}
            </div>
          )}
          {feeling.trim() && (
            <div className="pt-3 border-t border-slate-100">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Feeling</div>
              <div className="text-slate-700 text-sm">{feeling}</div>
            </div>
          )}
          {reflection.trim() && (
            <div className="pt-3 border-t border-slate-100">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">For next time</div>
              <div className="text-slate-700 text-sm leading-relaxed">{reflection}</div>
            </div>
          )}
        </div>

        <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4">
          <div className="text-teal-800 text-sm font-semibold mb-1">Your counter will restart from</div>
          <div className="text-teal-700 text-sm">{new Date(timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</div>
        </div>
      </div>

      <div className="px-6 pb-8 space-y-2">
        <button onClick={commit} disabled={submitting}
          className="w-full max-w-sm mx-auto py-4 rounded-2xl bg-teal-600 disabled:bg-slate-300 text-white font-semibold text-base shadow-md shadow-teal-500/20 active:scale-[0.98] transition-transform">
          {submitting ? 'Saving…' : 'Save and restart counter'}
        </button>
        <button onClick={back}
          className="w-full max-w-sm mx-auto py-3 text-slate-500 text-sm font-medium">Go back</button>
      </div>
    </div>
  );
}

// ── Slip Log Screen ─────────────────────────────────────────────────────────
// A read-only history of past slips with their reflections. Each entry is
// expandable and can be deleted (e.g. mistakenly recorded).

interface LogProps {
  slips: import('../types').Slip[];
  onBack: () => void;
  onDelete: (id: string) => void;
  onUpdateReflection: (id: string, reflection: string) => void;
}

export function SlipLogScreen({ slips, onBack, onDelete, onUpdateReflection }: LogProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editingReflection, setEditingReflection] = useState<string | null>(null);
  const [reflectionDraft, setReflectionDraft] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="flex items-center px-4 py-4 bg-white border-b border-slate-100 flex-shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
        </button>
        <h1 className="text-slate-800 font-bold text-lg ml-2">Slip Log</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3 pb-24">
        <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4 text-teal-800 text-xs leading-relaxed">
          <p className="font-semibold mb-1">Your learning record.</p>
          <p>Each entry is a moment, a trigger, and a note from your past self to your future self. Read them when something feels familiar.</p>
        </div>

        {slips.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm italic">No slips logged. Keep going.</div>
        ) : (
          slips.map(s => (
            <div key={s.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <button onClick={() => setExpanded(expanded === s.id ? null : s.id)}
                className="w-full px-4 py-3 text-left flex items-center gap-3">
                <div className="flex-1">
                  <div className="text-slate-800 font-semibold text-sm">{new Date(s.timestamp).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</div>
                  <div className="text-slate-500 text-xs">After a {s.previousStreakDays}-day streak</div>
                </div>
                <div className={`text-slate-400 transition-transform ${expanded === s.id ? 'rotate-90' : ''}`}>
                  <IconChevron size={16} color="#94a3b8"/>
                </div>
              </button>
              {expanded === s.id && (
                <div className="px-4 pb-4 border-t border-slate-50 space-y-3 pt-3">
                  {s.triggerTags && s.triggerTags.length > 0 && (
                    <div>
                      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Triggers</div>
                      <div className="flex flex-wrap gap-1.5">
                        {s.triggerTags.map(t => (
                          <span key={t} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {s.trigger && (
                    <div>
                      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">What was happening</div>
                      <div className="text-slate-700 text-sm">{s.trigger}</div>
                    </div>
                  )}
                  {s.feeling && (
                    <div>
                      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Feeling</div>
                      <div className="text-slate-700 text-sm">{s.feeling}</div>
                    </div>
                  )}
                  {editingReflection === s.id ? (
                    <div>
                      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Note for next time</div>
                      <textarea value={reflectionDraft} onChange={e => setReflectionDraft(e.target.value)}
                        rows={4} autoFocus
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500 resize-none"/>
                      <div className="flex gap-2 mt-2 justify-end">
                        <button onClick={() => setEditingReflection(null)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold">Cancel</button>
                        <button onClick={() => { onUpdateReflection(s.id, reflectionDraft); setEditingReflection(null); }}
                          className="px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-semibold">Save</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                        <span>Note for next time</span>
                        <button onClick={() => { setReflectionDraft(s.reflection || ''); setEditingReflection(s.id); }}
                          className="text-teal-600 normal-case tracking-normal text-xs font-semibold">Edit</button>
                      </div>
                      {s.reflection ? (
                        <div className="text-slate-700 text-sm leading-relaxed bg-amber-50 border border-amber-100 rounded-xl p-3 italic">"{s.reflection}"</div>
                      ) : (
                        <div className="text-slate-400 text-sm italic">No note added.</div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-end pt-1">
                    {confirmDelete === s.id ? (
                      <div className="flex gap-2 items-center">
                        <span className="text-xs text-rose-500">Delete this entry?</span>
                        <button onClick={() => setConfirmDelete(null)}
                          className="text-xs text-slate-500 px-2 py-1">Cancel</button>
                        <button onClick={() => { onDelete(s.id); setConfirmDelete(null); }}
                          className="text-xs text-white bg-rose-500 px-2 py-1 rounded">Delete</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDelete(s.id)}
                        className="text-xs text-slate-400 hover:text-rose-500 px-2 py-1">Delete entry</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
