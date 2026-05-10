// Crisis Lines & Safety Information
//
// Design choices:
//  - Phone numbers use <a href="tel:…"> — dialling doesn't transmit data, it's
//    safety-critical, and one tap is the right UX in a crisis.
//  - Website URLs are copy-only (same policy as RecoveryGroupsScreen) to
//    preserve referrer privacy.
//  - Content is organised by region with collapsible headers so the list
//    stays readable without scrolling past irrelevant entries.
import { useState } from 'react';
import { IconCopy, IconChevron, IconPhone, IconShield } from './Icons';

interface Props { onBack: () => void }

interface CrisisLine {
  name: string;
  /** Dialable string — may contain spaces for display, stripped for tel: */
  number: string;
  /** Whether this line can be dialled (false for SMS-only / text lines) */
  dialable?: boolean;
  desc: string;
  url?: string;
  hours?: string;
}

interface Region {
  region: string;
  flag: string;
  lines: CrisisLine[];
}

const CRISIS_DATA: Region[] = [
  {
    region: 'International / US',
    flag: '🌐',
    lines: [
      {
        name: '988 Suicide & Crisis Lifeline',
        number: '988',
        desc: 'Call or text 988. Free, confidential support for mental health, substance use, and suicidal thoughts. Connects to a local crisis centre.',
        url: 'https://988lifeline.org',
        hours: '24 / 7',
      },
      {
        name: 'SAMHSA National Helpline',
        number: '1-800-662-4357',
        desc: 'Substance Abuse and Mental Health Services Administration. Free, confidential treatment referral and information for substance use disorders.',
        url: 'https://www.samhsa.gov/find-help/national-helpline',
        hours: '24 / 7',
      },
      {
        name: 'Crisis Text Line',
        number: '741741',
        dialable: false,
        desc: 'Text HOME to 741741. Free, confidential text-based crisis support. No call needed.',
        hours: '24 / 7',
      },
    ],
  },
  {
    region: 'United Kingdom & Ireland',
    flag: '🇬🇧',
    lines: [
      {
        name: 'Samaritans',
        number: '116 123',
        desc: 'Free, confidential listening service for anyone in emotional distress or at risk of suicide. No judgment, no advice pushed.',
        url: 'https://www.samaritans.org',
        hours: '24 / 7',
      },
      {
        name: 'Drinkline (UK)',
        number: '0300 123 1110',
        desc: 'Free national alcohol helpline for anyone worried about their own drinking or someone else\'s.',
        hours: 'Mon–Fri 9 am–8 pm  ·  Wkd 11 am–4 pm',
      },
      {
        name: 'Talk to Frank',
        number: '0300 123 6600',
        desc: 'Free, non-judgmental information and support for drugs and alcohol — including advice on safe tapering.',
        url: 'https://www.talktofrank.com',
        hours: '24 / 7',
      },
      {
        name: 'Drinkline Ireland',
        number: '1800 459 459',
        desc: 'Free, confidential support for people concerned about their drinking (Republic of Ireland).',
        url: 'https://www.drinkaware.ie',
        hours: 'Office hours',
      },
    ],
  },
  {
    region: 'South Africa',
    flag: '🇿🇦',
    lines: [
      {
        name: 'SADAG Crisis Line',
        number: '0800 456 789',
        desc: 'South African Depression and Anxiety Group. Free, confidential crisis counselling and referrals.',
        url: 'https://www.sadag.org',
        hours: '24 / 7',
      },
      {
        name: 'SADAG Substance Abuse',
        number: '0800 12 13 14',
        desc: 'Dedicated line for substance abuse support and treatment referrals.',
        url: 'https://www.sadag.org',
        hours: '24 / 7',
      },
      {
        name: 'SANCA National',
        number: '011 892 3829',
        desc: 'South African National Council on Alcoholism and Drug Dependence — treatment referrals, counselling, rehabilitation support.',
        url: 'https://sanca.org.za',
        hours: 'Office hours',
      },
      {
        name: 'AA South Africa',
        number: '011 683 3939',
        desc: 'Alcoholics Anonymous General Service — meeting finder and peer fellowship.',
        hours: 'Office hours',
      },
    ],
  },
  {
    region: 'Australia',
    flag: '🇦🇺',
    lines: [
      {
        name: 'Lifeline',
        number: '13 11 14',
        desc: 'Crisis support and suicide prevention — call or chat online. Trained volunteer crisis supporters.',
        url: 'https://www.lifeline.org.au',
        hours: '24 / 7',
      },
      {
        name: 'Beyond Blue',
        number: '1300 22 4636',
        desc: 'Mental health support — anxiety, depression, alcohol use, crisis. Phone and online chat.',
        url: 'https://www.beyondblue.org.au',
        hours: '24 / 7',
      },
      {
        name: 'Alcohol & Drug Info',
        number: '1800 250 015',
        desc: 'Free, confidential alcohol and drug information, counselling, and referrals to local services.',
        hours: '24 / 7',
      },
    ],
  },
  {
    region: 'Canada',
    flag: '🇨🇦',
    lines: [
      {
        name: 'Crisis Services Canada',
        number: '1-833-456-4566',
        desc: 'Nationwide crisis support — call or text (text 45645 between 4 pm and midnight ET). Mental health and substance use.',
        url: 'https://www.crisisservicescanada.ca',
        hours: '24 / 7',
      },
      {
        name: 'CAMH Helpline',
        number: '1-800-463-2338',
        desc: 'Centre for Addiction and Mental Health — treatment referrals and information across Canada.',
        url: 'https://www.camh.ca',
        hours: 'Office hours',
      },
    ],
  },
  {
    region: 'New Zealand',
    flag: '🇳🇿',
    lines: [
      {
        name: 'Need to Talk?',
        number: '1737',
        desc: 'Free call or text 1737 to speak with a trained counsellor — any time, any reason.',
        hours: '24 / 7',
      },
      {
        name: 'Alcohol Drug Helpline',
        number: '0800 787 797',
        desc: 'Free, confidential support and information for any concerns about alcohol or drug use.',
        url: 'https://alcoholdrughelp.org.nz',
        hours: '24 / 7',
      },
    ],
  },
  {
    region: 'Europe',
    flag: '🇪🇺',
    lines: [
      {
        name: 'European Crisis Helplines',
        number: '112',
        desc: 'Emergency services number across EU — call 112 if you or someone else is in immediate physical danger.',
        hours: '24 / 7',
      },
      {
        name: 'Befrienders Worldwide',
        number: 'Directory only',
        dialable: false,
        desc: 'Global network of emotional support helplines. Visit their directory to find your country\'s number.',
        url: 'https://www.befrienders.org',
        hours: 'Varies by country',
      },
    ],
  },
];

export default function CrisisScreen({ onBack }: Props) {
  const [expanded, setExpanded] = useState<string>('International / US');
  const [copied, setCopied] = useState<string | null>(null);

  async function copyText(text: string) {
    let ok = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        ok = true;
      }
    } catch { /* fall through */ }
    if (!ok) {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        ok = true;
      } catch { /* silent */ }
    }
    if (ok) {
      setCopied(text);
      window.setTimeout(() => setCopied(null), 1800);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="flex items-center px-4 py-4 bg-white border-b border-slate-100 flex-shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 className="text-slate-800 font-bold text-lg ml-2">Crisis Lines</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-24">

        {/* Emergency callout */}
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
            <IconPhone size={18} color="#e11d48"/>
          </div>
          <div>
            <p className="text-rose-800 font-semibold text-sm">Immediate danger?</p>
            <p className="text-rose-700 text-xs leading-relaxed mt-0.5">
              Call your local emergency number — <strong>911</strong> (US) · <strong>999</strong> (UK) · <strong>000</strong> (AU) · <strong>112</strong> (EU/SA) — for any life-threatening situation.
            </p>
          </div>
        </div>

        {/* Withdrawal warning */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <IconShield size={18} color="#d97706"/>
          </div>
          <div>
            <p className="text-amber-900 font-semibold text-sm">Alcohol withdrawal warning</p>
            <p className="text-amber-800 text-xs leading-relaxed mt-1">
              If you have been drinking heavily every day and stop suddenly, withdrawal can cause shaking, sweating, anxiety — and in some cases, <strong>seizures or delirium tremens</strong> (a medical emergency).
            </p>
            <p className="text-amber-800 text-xs leading-relaxed mt-1.5">
              If you experience confusion, hallucinations, or severe shaking after stopping, seek medical attention <strong>immediately</strong>. You are not weak for needing help — this is a physical response.
            </p>
          </div>
        </div>

        {/* Privacy note */}
        <div className="bg-teal-50 border border-teal-100 rounded-2xl p-3 text-teal-800 text-xs leading-relaxed">
          <span className="font-semibold">Tap the call button</span> to dial directly from your phone. Website addresses are shown as copy-only — nothing in this app contacts any of these organisations on your behalf.
        </div>

        {/* Regions */}
        {CRISIS_DATA.map(region => (
          <div key={region.region} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Region header */}
            <button
              onClick={() => setExpanded(expanded === region.region ? '' : region.region)}
              className="w-full px-4 py-3.5 flex items-center gap-3 text-left"
            >
              <span className="text-xl leading-none">{region.flag}</span>
              <span className="flex-1 font-semibold text-slate-800 text-sm">{region.region}</span>
              <div className={`text-slate-400 transition-transform ${expanded === region.region ? 'rotate-90' : ''}`}>
                <IconChevron size={18} color="#94a3b8"/>
              </div>
            </button>

            {/* Lines */}
            {expanded === region.region && (
              <div className="border-t border-slate-50 divide-y divide-slate-50">
                {region.lines.map(line => (
                  <div key={line.name} className="px-4 py-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-slate-800 font-semibold text-sm">{line.name}</p>
                        {line.hours && (
                          <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-full">{line.hours}</span>
                        )}
                      </div>
                    </div>

                    <p className="text-slate-500 text-xs leading-relaxed">{line.desc}</p>

                    {/* Number row */}
                    <div className="flex items-stretch gap-2">
                      <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 text-xs font-mono">
                        {line.number}
                      </div>
                      {line.dialable !== false && (
                        <a href={`tel:${line.number.replace(/[\s\-()]/g, '')}`}
                          className="px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-rose-500 text-white">
                          <IconPhone size={13} color="white"/>
                          <span>Call</span>
                        </a>
                      )}
                      <button onClick={() => copyText(line.number)}
                        className={`px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${copied === line.number ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-700'}`}>
                        <IconCopy size={13} color={copied === line.number ? 'white' : '#475569'}/>
                        <span>{copied === line.number ? '✓' : 'Copy'}</span>
                      </button>
                    </div>

                    {/* URL copy row */}
                    {line.url && (
                      <div className="flex items-stretch gap-2">
                        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-500 text-[10px] font-mono truncate">
                          {line.url}
                        </div>
                        <button onClick={() => copyText(line.url!)}
                          className={`px-3 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors ${copied === line.url ? 'bg-emerald-500 text-white' : 'bg-teal-600 text-white'}`}>
                          <IconCopy size={12} color="white"/>
                          <span>{copied === line.url ? '✓' : 'URL'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        <p className="text-center text-slate-400 text-xs italic pt-2 pb-4">
          Reaching out takes courage. You've already taken the first step.
        </p>
      </div>
    </div>
  );
}
