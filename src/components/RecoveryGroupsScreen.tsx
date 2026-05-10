// Local directory of recovery groups. URLs are copy-only — users paste them
// into their browser themselves so the app never opens external resources.

import { useState } from 'react';
import { IconCopy, IconChevron } from './Icons';

interface Props { onBack: () => void }

interface Group {
  name: string;
  short: string;
  url: string;
  desc: string;
  approach: 'Twelve-step' | 'Secular' | 'Buddhist' | 'Christian' | 'Harm reduction' | 'Women-only';
  free: boolean;
}

const GROUPS: Group[] = [
  {
    name: 'Alcoholics Anonymous',
    short: 'AA',
    url: 'https://www.aa.org',
    approach: 'Twelve-step',
    free: true,
    desc: 'The original peer-support fellowship. In-person and online meetings worldwide. Spiritual but not religious — works with any faith or none. Sponsors guide newcomers through the 12 steps.',
  },
  {
    name: 'SMART Recovery',
    short: 'SMART',
    url: 'https://www.smartrecovery.org',
    approach: 'Secular',
    free: true,
    desc: 'Self-Management And Recovery Training. Science-based, secular alternative to AA — uses CBT, motivational interviewing and rational emotive behaviour techniques. No higher power required.',
  },
  {
    name: 'Recovery Dharma',
    short: 'Recovery Dharma',
    url: 'https://recoverydharma.org',
    approach: 'Buddhist',
    free: true,
    desc: 'A peer-led movement using Buddhist practices and principles to recover from any addiction. Free, secular alternative grounded in mindfulness, the Four Noble Truths and the Eightfold Path.',
  },
  {
    name: 'Refuge Recovery',
    short: 'Refuge',
    url: 'https://www.refugerecovery.org',
    approach: 'Buddhist',
    free: true,
    desc: 'A Buddhist-inspired path to recovery, founded by Noah Levine. Uses meditation, the Four Noble Truths and a 12-step-style programme adapted to Buddhist principles.',
  },
  {
    name: 'LifeRing Secular Recovery',
    short: 'LifeRing',
    url: 'https://lifering.org',
    approach: 'Secular',
    free: true,
    desc: 'Secular peer-support. Each person creates their own personal recovery program — no steps, no spiritual framework, no required beliefs. Strong online and in-person meetings.',
  },
  {
    name: 'Women for Sobriety',
    short: 'WFS',
    url: 'https://womenforsobriety.org',
    approach: 'Women-only',
    free: true,
    desc: 'A non-12-step program for women in recovery from addiction. Built around 13 affirmations focused on emotional growth, positive self-image and personal responsibility.',
  },
  {
    name: 'Secular Organizations for Sobriety',
    short: 'SOS',
    url: 'https://www.sossobriety.org',
    approach: 'Secular',
    free: true,
    desc: 'Self-empowerment through abstinence. Non-religious, peer-supported, free to attend. Emphasis on personal responsibility and rational thinking.',
  },
  {
    name: 'HAMS — Harm Reduction',
    short: 'HAMS',
    url: 'https://hams.cc',
    approach: 'Harm reduction',
    free: true,
    desc: 'Harm Reduction, Abstinence, and Moderation Support. Peer-led network for people who want to reduce their drinking, with abstinence as one of several valid goals.',
  },
  {
    name: 'Moderation Management',
    short: 'MM',
    url: 'https://moderation.org',
    approach: 'Harm reduction',
    free: true,
    desc: 'For people whose drinking is becoming a problem but who are not yet alcohol-dependent. Tools for cutting down rather than full abstinence.',
  },
  {
    name: 'Celebrate Recovery',
    short: 'CR',
    url: 'https://www.celebraterecovery.com',
    approach: 'Christian',
    free: true,
    desc: 'A Christ-centred recovery program for any "hurt, habit or hang-up" — including alcohol. Hosted by churches; uses 8 principles tied to the Beatitudes.',
  },
  {
    name: 'In The Rooms',
    short: 'ITR',
    url: 'https://www.intherooms.com',
    approach: 'Twelve-step',
    free: true,
    desc: 'Online community with daily live recovery meetings spanning AA, NA, Al-Anon, and many other fellowships. Useful when you cannot get to an in-person meeting.',
  },
  {
    name: 'Reddit r/stopdrinking',
    short: 'r/stopdrinking',
    url: 'https://www.reddit.com/r/stopdrinking',
    approach: 'Secular',
    free: true,
    desc: 'A large, active, anonymous online community of people getting and staying sober. Daily check-ins, sober milestones and unconditional support — no programme required.',
  },
];

const APPROACHES: ('All' | Group['approach'])[] = ['All', 'Twelve-step', 'Secular', 'Buddhist', 'Christian', 'Harm reduction', 'Women-only'];

export default function RecoveryGroupsScreen({ onBack }: Props) {
  const [filter, setFilter] = useState<typeof APPROACHES[number]>('All');
  const [copied, setCopied] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function copyUrl(url: string) {
    let success = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        success = true;
      }
    } catch (e) {
      console.error('[recovery-groups] clipboard failed, falling back:', e);
    }
    if (!success) {
      // Fallback for older WebView contexts
      try {
        const ta = document.createElement('textarea');
        ta.value = url;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        success = true;
      } catch (e) {
        console.error('[recovery-groups] textarea fallback failed:', e);
      }
    }
    if (success) {
      setCopied(url);
      window.setTimeout(() => setCopied(null), 1800);
    }
  }

  const visible = filter === 'All' ? GROUPS : GROUPS.filter(g => g.approach === filter);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="flex items-center px-4 py-4 bg-white border-b border-slate-100 flex-shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
        </button>
        <h1 className="text-slate-800 font-bold text-lg ml-2">Recovery Groups</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 pb-24">
        <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4 text-teal-800 text-xs leading-relaxed">
          <p className="font-semibold mb-1">A directory, not a link list.</p>
          <p>None of these names tap-open. To stay private, copy the address you want and paste it into your browser yourself — nothing in this app talks to any of these organisations.</p>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto -mx-5 px-5 pb-1 [&::-webkit-scrollbar]:hidden">
          {APPROACHES.map(a => (
            <button key={a} onClick={() => setFilter(a)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold ${filter === a ? 'bg-teal-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>
              {a}
            </button>
          ))}
        </div>

        {/* Groups */}
        <div className="space-y-3">
          {visible.map(g => (
            <div key={g.short} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <button onClick={() => setExpanded(expanded === g.short ? null : g.short)}
                className="w-full px-4 py-4 text-left flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-slate-800 font-semibold text-sm">{g.name}</span>
                    <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{g.approach}</span>
                    {g.free && <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">Free</span>}
                  </div>
                  <div className={`text-slate-500 text-xs leading-relaxed ${expanded === g.short ? '' : 'line-clamp-2'}`}>{g.desc}</div>
                </div>
                <div className={`text-slate-400 transition-transform mt-1 flex-shrink-0 ${expanded === g.short ? 'rotate-90' : ''}`}>
                  <IconChevron size={18} color="#94a3b8"/>
                </div>
              </button>
              {expanded === g.short && (
                <div className="px-4 pb-4 border-t border-slate-50">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-3 mb-1">Address (copy & paste)</div>
                  <div className="flex items-stretch gap-2">
                    <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 text-xs font-mono break-all overflow-hidden">{g.url}</div>
                    <button onClick={() => copyUrl(g.url)}
                      className={`px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${copied === g.url ? 'bg-emerald-500 text-white' : 'bg-teal-600 text-white'}`}>
                      <IconCopy size={14} color="white"/>
                      <span>{copied === g.url ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center text-slate-400 text-xs italic pt-2">
          Recovery isn't one-size-fits-all. Try a few; stay with what helps.
        </div>
      </div>
    </div>
  );
}
