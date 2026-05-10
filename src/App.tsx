import { useState, useEffect, useRef, useMemo } from 'react';
import { useAppData } from './hooks/useAppData';
import { scheduleAll, fireMilestone, fireSavingsMilestone, requestPermission } from './utils/notifications';
import { authenticateBiometric, authenticateBiometricDetailed, getBiometricCapability, type BiometricCapability } from './utils/biometric';
import { setPin as savePin, verifyPin, clearPin } from './utils/pin';
import EmergencyKit from './components/EmergencyKit';
import Heatmap from './components/Heatmap';
import BackupScreen from './components/BackupScreen';
import MilestoneScreen from './components/MilestoneScreen';
import RecoveryTimeline from './components/RecoveryTimeline';
import InsightsScreen from './components/InsightsScreen';
import PuzzleScreen from './components/PuzzleScreen';
import ProgressScreen from './components/ProgressScreen';
import CBTScreen from './components/CBTScreen';
import HistoryScreen from './components/HistoryScreen';
import JournalScreen from './components/JournalScreen';
import RecoveryGroupsScreen from './components/RecoveryGroupsScreen';
import CrisisScreen from './components/CrisisScreen';
import PrivacyPolicyScreen from './components/PrivacyPolicyScreen';
import SlipScreen, { SlipLogScreen } from './components/SlipScreen';
import ForestVisual from './components/ForestVisual';
import MissionIcon from './components/MissionIcon';
import LockScreen from './components/LockScreen';
import SafetyModal from './components/SafetyModal';
import BackButton from './components/BackButton';
import { getDailyQuote } from './data/quotes';
import { MISSION_POOL, type MissionCat } from './data/missions';
import { CURRENCIES } from './data/currencies';
import type { Screen, UserProfile } from './types';
import './index.css';
import {
  IconHome, IconProgress, IconHeart, IconJournal, IconProfile, IconShield,
  IconWind, IconLeaf, IconBrain, IconWave, IconChat, IconRun, IconMoon,
  IconMilestone, IconBody, IconPuzzle, IconCompass, IconCloud, IconTimer,
  IconPhone, IconTarget, IconChevron, IconHistory, IconGratitude, IconReset,
  IconWalk, IconNote, IconSeedling, IconBalance, IconSparkles, IconHands,
  IconBookmark, IconCalendar, IconBell, IconShieldLock, IconWifiOff,
  IconLock, IconKey,
} from './components/Icons';

// ── Onboarding (multi-step) ────────────────────────────────────────────────────
type OnbStep = 'welcome' | 'name' | 'date' | 'spend' | 'security' | 'pin' | 'notifications' | 'finish';

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex justify-center gap-1.5 mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`h-1.5 rounded-full transition-all ${i === current ? 'w-6 bg-teal-500' : i < current ? 'w-1.5 bg-teal-300' : 'w-1.5 bg-slate-200'}`}/>
      ))}
    </div>
  );
}

// Top-level so React doesn't unmount/remount on every Onboarding re-render
// (which was killing focus on the numeric inputs).
function OnbShell({ title, subtitle, canNext, onNext, onBack, nextLabel = 'Continue', children, allowSkip, onSkip, stepIndex, stepTotal }: {
  title: string; subtitle?: string; canNext?: boolean; onNext: () => void; onBack: () => void;
  nextLabel?: string; children: React.ReactNode; allowSkip?: boolean; onSkip?: () => void;
  stepIndex: number; stepTotal: number;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col px-6 py-8">
      <div className="flex items-center mb-2">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-500 active:text-slate-800">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
        </button>
        {allowSkip && <button onClick={onSkip} className="ml-auto text-slate-400 text-sm font-medium px-2">Skip</button>}
      </div>
      <StepDots current={stepIndex} total={stepTotal} />
      <div className="flex-1 max-w-sm mx-auto w-full">
        <h2 className="text-slate-900 text-2xl font-serif font-bold mb-2">{title}</h2>
        {subtitle && <p className="text-slate-500 text-sm mb-6 leading-relaxed">{subtitle}</p>}
        {children}
      </div>
      <button onClick={onNext} disabled={canNext === false}
        className="w-full max-w-sm mx-auto py-4 rounded-2xl bg-teal-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-base shadow-md shadow-teal-500/20 active:scale-[0.98] transition-transform">
        {nextLabel}
      </button>
    </div>
  );
}

function Onboarding({ onComplete }: { onComplete: (p: UserProfile) => void }) {
  const [step, setStep] = useState<OnbStep>('welcome');
  const [name, setName] = useState('');
  const [soberDate, setSoberDate] = useState(() => new Date().toISOString().slice(0, 16));
  const [spend, setSpend] = useState('');
  const [currency, setCurrency] = useState('R');
  const [lockMethod, setLockMethod] = useState<'none' | 'biometric' | 'pin'>('none');
  const [bioCap, setBioCap] = useState<BiometricCapability | null>(null);
  const [pinValue, setPinValue] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [pinError, setPinError] = useState('');
  const [notifMotivations, setNotifMotivations] = useState(true);
  const [notifReminders, setNotifReminders] = useState(true);
  const [notifMilestones, setNotifMilestones] = useState(true);
  const [morningTime, setMorningTime] = useState('08:00');
  const [eveningTime, setEveningTime] = useState('19:00');
  const [notifFrequency, setNotifFrequency] = useState<'auto' | 'gentle' | 'light' | 'minimal'>('auto');
  const [submitting, setSubmitting] = useState(false);

  // Step ordering for progress dots & back navigation
  const stepOrder: OnbStep[] = ['welcome', 'name', 'date', 'spend', 'security', 'notifications', 'finish'];
  const stepIndex = stepOrder.indexOf(step === 'pin' ? 'security' : step);

  // Probe biometrics once on mount
  useEffect(() => { getBiometricCapability().then(setBioCap); }, []);

  function goBack() {
    if (step === 'pin') return setStep('security');
    const i = stepOrder.indexOf(step);
    if (i > 0) setStep(stepOrder[i - 1]);
  }

  async function finalize() {
    if (submitting) return;
    setSubmitting(true);
    try {
      // Persist PIN credential first if chosen
      if (lockMethod === 'pin' && pinValue) {
        await savePin(pinValue);
      }

      // Request notification permission (Android 13+ runtime)
      const wantsNotifs = notifMotivations || notifReminders || notifMilestones;
      let granted = false;
      if (wantsNotifs) {
        granted = await requestPermission();
      }

      onComplete({
        username: name.trim() || 'Friend',
        soberDate,
        dailySpend: parseFloat(spend) || 0,
        currency,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        pledgeStreak: 0,
        lastPledgeDate: '',
        lockMethod,
        biometricEnabled: lockMethod === 'biometric',
        notificationSettings: wantsNotifs && granted ? {
          motivations: notifMotivations,
          reminders: notifReminders,
          milestones: notifMilestones,
          morningTime,
          eveningTime,
          frequency: notifFrequency,
        } : undefined,
      });
    } catch (e) {
      console.error('[onboarding] finalize failed:', e);
      setSubmitting(false);
    }
  }

  // ── Step screens ─────────────────────────────────────────────────────────
  if (step === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 flex flex-col px-6 py-10">
        <div className="flex-1 flex flex-col items-center justify-center text-center max-w-sm mx-auto">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center mb-6 shadow-lg shadow-teal-500/20">
            <IconSeedling size={42} color="white"/>
          </div>
          <h1 className="text-slate-900 text-3xl font-serif font-bold mb-2">Welcome to<br/>Journey Forward</h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">A quiet companion for the road back to yourself.</p>
          <div className="bg-white/80 backdrop-blur border border-slate-100 rounded-2xl p-4 shadow-sm w-full mb-4">
            {[
              { Icon: IconLock, title: 'Completely private', body: 'Everything stays on your phone. No accounts, no cloud, no analytics.' },
              { Icon: IconWifiOff, title: 'Works offline', body: 'No internet needed. Reach for it anywhere — even on a flight.' },
              { Icon: IconShieldLock, title: 'You own your data', body: 'Export or erase it any time. We never see it.' },
            ].map((row, i) => (
              <div key={row.title} className={`flex items-start gap-3 ${i < 2 ? 'mb-3' : ''}`}>
                <div className="w-9 h-9 rounded-full bg-teal-50 flex items-center justify-center text-teal-700 flex-shrink-0">
                  <row.Icon size={18}/>
                </div>
                <div className="text-left">
                  <div className="text-slate-800 font-semibold text-sm">{row.title}</div>
                  <div className="text-slate-500 text-xs">{row.body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <button onClick={() => setStep('name')}
          className="w-full max-w-sm mx-auto py-4 rounded-2xl bg-teal-600 text-white font-semibold text-base shadow-md shadow-teal-500/20 active:scale-[0.98] transition-transform">
          Begin
        </button>
        <p className="text-center text-slate-400 text-xs mt-3">Takes less than a minute</p>
      </div>
    );
  }

  // Local helper: spread common shell props to keep call sites tight
  const shell = (overrides: Partial<React.ComponentProps<typeof OnbShell>>) =>
    ({ onBack: goBack, stepIndex, stepTotal: stepOrder.length, onNext: () => {}, title: '', ...overrides });

  if (step === 'name') {
    return (
      <OnbShell {...shell({
        title: "What should we call you?",
        subtitle: "Just a first name or nickname is fine. This stays only on your phone.",
        canNext: !!name.trim(),
        onNext: () => setStep('date'),
      })}>
        <input autoFocus value={name} onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && name.trim() && setStep('date')}
          placeholder="e.g., Alex"
          className="w-full bg-white border border-slate-200 text-slate-800 placeholder-slate-400 rounded-2xl px-4 py-4 text-base outline-none focus:ring-2 focus:ring-teal-500 mb-6"/>
      </OnbShell>
    );
  }

  if (step === 'date') {
    return (
      <OnbShell {...shell({
        title: "When did you stop drinking?",
        subtitle: "Pick the moment you made the decision. We'll count from there.",
        onNext: () => setStep('spend'),
      })}>
        <input type="datetime-local" value={soberDate} onChange={e => setSoberDate(e.target.value)}
          className="w-full bg-white border border-slate-200 text-slate-800 rounded-2xl px-4 py-4 text-base outline-none focus:ring-2 focus:ring-teal-500 mb-3"/>
        <button onClick={() => setSoberDate(new Date().toISOString().slice(0,16))}
          className="text-teal-600 text-sm font-semibold mb-6">Use right now ↗</button>
      </OnbShell>
    );
  }

  if (step === 'spend') {
    return (
      <OnbShell {...shell({
        title: "What did you spend on alcohol?",
        subtitle: "A rough daily amount. We'll quietly tally what you save. Skip if you'd rather not.",
        onNext: () => setStep('security'),
        allowSkip: true,
        onSkip: () => { setSpend(''); setStep('security'); },
      })}>
        <div className="space-y-3 mb-6">
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">Currency</label>
            <select value={currency} onChange={e => setCurrency(e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-800 rounded-2xl px-3 py-3.5 text-base outline-none focus:ring-2 focus:ring-teal-500">
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.sym}>{c.code} — {c.name} ({c.sym})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">Amount per day</label>
            <div className="flex items-center gap-2">
              <span className="bg-slate-100 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-600 font-semibold min-w-[3rem] text-center">{currency}</span>
              <input
                type="text" inputMode="decimal" autoComplete="off"
                value={spend}
                onChange={e => setSpend(e.target.value.replace(/[^0-9.]/g, ''))}
                placeholder="0"
                enterKeyHint="done"
                className="flex-1 bg-white border border-slate-200 text-slate-800 rounded-2xl px-4 py-3.5 text-base outline-none focus:ring-2 focus:ring-teal-500"/>
            </div>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">Tip — be honest. Even an estimate gives you a powerful daily reminder of what sobriety is buying back for you.</p>
          </div>
        </div>
      </OnbShell>
    );
  }

  if (step === 'security') {
    const bioOk = bioCap?.available === true;
    const bioReason = bioCap?.reason;
    const bioLabel = bioCap?.kind === 'face' ? 'Face Unlock'
                   : bioCap?.kind === 'fingerprint' ? 'Fingerprint'
                   : 'Biometric Unlock';
    return (
      <OnbShell {...shell({
        title: "Keep this private?",
        subtitle: "Optional, but recommended. Your data is sensitive — a lock keeps it yours even if someone else picks up your phone.",
        onNext: () => { if (lockMethod === 'pin') setStep('pin'); else setStep('notifications'); },
        nextLabel: lockMethod === 'pin' ? 'Set up PIN' : 'Continue',
      })}>
        <div className="space-y-3 mb-6">
          {/* Biometric */}
          <button onClick={() => bioOk && setLockMethod('biometric')} disabled={!bioOk}
            className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
              lockMethod === 'biometric' ? 'border-teal-500 bg-teal-50' : bioOk ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50 opacity-60'
            }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 11.5V9a3 3 0 116 0v2.5M5 11h14a1 1 0 011 1v8a1 1 0 01-1 1H5a1 1 0 01-1-1v-8a1 1 0 011-1z"/>
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-slate-800 font-semibold text-sm">{bioLabel}</div>
                <div className="text-slate-500 text-xs">{bioOk ? 'Recommended — fastest and most secure' : (bioReason || 'Not available on this device')}</div>
              </div>
              {lockMethod === 'biometric' && <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs">✓</div>}
            </div>
          </button>

          {/* PIN */}
          <button onClick={() => setLockMethod('pin')}
            className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
              lockMethod === 'pin' ? 'border-teal-500 bg-teal-50' : 'border-slate-200 bg-white'
            }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                  <rect x="4" y="6" width="16" height="12" rx="2"/><path strokeLinecap="round" d="M8 11h.01M12 11h.01M16 11h.01M8 15h8"/>
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-slate-800 font-semibold text-sm">PIN Code</div>
                <div className="text-slate-500 text-xs">A 4–8 digit code only you know</div>
              </div>
              {lockMethod === 'pin' && <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs">✓</div>}
            </div>
          </button>

          {/* None */}
          <button onClick={() => setLockMethod('none')}
            className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
              lockMethod === 'none' ? 'border-teal-500 bg-teal-50' : 'border-slate-200 bg-white'
            }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 11.5V9a3 3 0 015.83-1M5 11h14a1 1 0 011 1v8a1 1 0 01-1 1H5a1 1 0 01-1-1v-8a1 1 0 011-1z"/>
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-slate-800 font-semibold text-sm">No Lock</div>
                <div className="text-slate-500 text-xs">Open the app without authenticating</div>
              </div>
              {lockMethod === 'none' && <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs">✓</div>}
            </div>
          </button>
        </div>
      </OnbShell>
    );
  }

  if (step === 'pin') {
    const pinsMatch = pinValue.length >= 4 && pinValue === pinConfirm;
    function tryNext() {
      if (!/^\d{4,8}$/.test(pinValue)) { setPinError('PIN must be 4–8 digits'); return; }
      if (pinValue !== pinConfirm) { setPinError('PINs do not match'); return; }
      setPinError('');
      setStep('notifications');
    }
    return (
      <OnbShell {...shell({
        title: "Create your PIN",
        subtitle: "4 to 8 digits. You'll enter this when you open the app. We can't recover it for you, so pick something memorable.",
        canNext: pinsMatch,
        onNext: tryNext,
      })}>
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Choose PIN</label>
            <input type="password" inputMode="numeric" pattern="\d*" maxLength={8} autoFocus
              value={pinValue} onChange={e => { setPinValue(e.target.value.replace(/\D/g,'')); setPinError(''); }}
              placeholder="••••"
              className="w-full bg-white border border-slate-200 text-slate-800 placeholder-slate-300 rounded-2xl px-4 py-4 text-2xl tracking-[0.4em] text-center outline-none focus:ring-2 focus:ring-teal-500"/>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Confirm PIN</label>
            <input type="password" inputMode="numeric" pattern="\d*" maxLength={8}
              value={pinConfirm} onChange={e => { setPinConfirm(e.target.value.replace(/\D/g,'')); setPinError(''); }}
              placeholder="••••"
              className="w-full bg-white border border-slate-200 text-slate-800 placeholder-slate-300 rounded-2xl px-4 py-4 text-2xl tracking-[0.4em] text-center outline-none focus:ring-2 focus:ring-teal-500"/>
          </div>
          {pinError && <p className="text-rose-500 text-xs text-center">{pinError}</p>}
        </div>
      </OnbShell>
    );
  }

  if (step === 'notifications') {
    const wantsNotifs = notifMotivations || notifReminders || notifMilestones;
    return (
      <OnbShell {...shell({
        title: "Want gentle reminders?",
        subtitle: "We'll start with daily check-ins for your first month, then quietly fade to weekly as your routine settles. You're in control.",
        onNext: () => setStep('finish'),
      })}>
        <div className="space-y-2 mb-4">
          {[
            { k: 'motivations', label: 'Daily motivations', desc: 'A line from your reasons each morning & evening', val: notifMotivations, set: setNotifMotivations },
            { k: 'reminders', label: 'Check-in reminders', desc: 'Soft nudges to log your mood and progress', val: notifReminders, set: setNotifReminders },
            { k: 'milestones', label: 'Milestone celebrations', desc: '1 day, 1 week, 1 month, 1 year and beyond', val: notifMilestones, set: setNotifMilestones },
          ].map(t => (
            <button key={t.k} onClick={() => t.set(!t.val)}
              className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${t.val ? 'border-teal-500 bg-teal-50' : 'border-slate-200 bg-white'}`}>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="text-slate-800 font-semibold text-sm">{t.label}</div>
                  <div className="text-slate-500 text-xs">{t.desc}</div>
                </div>
                <div className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 flex-shrink-0 ${t.val ? 'bg-teal-500' : 'bg-slate-200'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${t.val ? 'translate-x-6' : 'translate-x-0'}`}/>
                </div>
              </div>
            </button>
          ))}
        </div>
        {(notifMotivations || notifReminders) && (
          <>
            <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3 mb-3">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">How often</div>
              {([
                { v: 'auto',    title: 'Adapts to you (recommended)', desc: 'Daily for the first month, lighter as your routine settles.' },
                { v: 'gentle',  title: 'Gentle', desc: 'Two soft reminders a day.' },
                { v: 'light',   title: 'Light',  desc: 'Once a day, in the morning.' },
                { v: 'minimal', title: 'Minimal',desc: 'Every three days.' },
              ] as { v: typeof notifFrequency; title: string; desc: string }[]).map(o => (
                <button key={o.v} onClick={() => setNotifFrequency(o.v)}
                  className={`w-full text-left p-3 rounded-xl border-2 transition-all ${notifFrequency === o.v ? 'border-teal-500 bg-teal-50' : 'border-slate-100 bg-slate-50'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-slate-800 font-semibold text-sm">{o.title}</div>
                      <div className="text-slate-500 text-xs">{o.desc}</div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${notifFrequency === o.v ? 'bg-teal-500 border-teal-500' : 'border-slate-300'}`}>
                      {notifFrequency === o.v && <span className="text-white text-[10px]">✓</span>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3 mb-6">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">When to nudge you</div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700 text-sm">Morning</span>
                <input type="time" value={morningTime} onChange={e => setMorningTime(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500"/>
              </div>
              {(notifFrequency === 'gentle' || notifFrequency === 'auto') && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 text-sm">Evening</span>
                  <input type="time" value={eveningTime} onChange={e => setEveningTime(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500"/>
                </div>
              )}
            </div>
          </>
        )}
        {!wantsNotifs && (
          <div className="bg-slate-100 rounded-2xl p-3 text-slate-500 text-xs text-center mb-6">No notifications — that's totally fine. You can turn them on later.</div>
        )}
      </OnbShell>
    );
  }

  // Finish
  const summaryRows = [
    { Icon: IconProfile, label: name.trim() || 'Friend' },
    { Icon: IconCalendar, label: `Sober since ${new Date(soberDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}` },
    ...(parseFloat(spend) > 0 ? [{ Icon: IconBalance, label: `Tracking ${currency}${spend}/day` }] : []),
    { Icon: lockMethod === 'pin' ? IconKey : (lockMethod === 'biometric' ? IconShieldLock : IconLock),
      label: lockMethod === 'biometric' ? 'Biometric lock enabled' : lockMethod === 'pin' ? 'PIN lock enabled' : 'No app lock' },
    { Icon: IconBell, label: (notifMotivations || notifReminders || notifMilestones) ? 'Gentle notifications enabled' : 'No notifications' },
  ];
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 flex flex-col px-6 py-10">
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-sm mx-auto">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center mb-6 shadow-lg shadow-teal-500/20">
          <IconSparkles size={42} color="white"/>
        </div>
        <h1 className="text-slate-900 text-3xl font-serif font-bold mb-2">You're all set, {name.trim() || 'friend'}.</h1>
        <p className="text-slate-500 text-sm leading-relaxed mb-6">Take it one breath at a time. We're rooting for you.</p>
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm w-full text-left">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Your setup</div>
          <div className="space-y-2.5">
            {summaryRows.map((r, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-slate-700">
                <div className="w-7 h-7 rounded-full bg-teal-50 flex items-center justify-center text-teal-700 flex-shrink-0">
                  <r.Icon size={16}/>
                </div>
                <span>{r.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <button onClick={finalize} disabled={submitting}
        className="w-full max-w-sm mx-auto py-4 rounded-2xl bg-teal-600 disabled:bg-slate-300 text-white font-semibold text-base shadow-md shadow-teal-500/20 active:scale-[0.98] transition-transform">
        {submitting ? 'Setting up…' : 'Enter the app'}
      </button>
    </div>
  );
}

// ── Profile Modal ──────────────────────────────────────────────────────────────
function ProfileModal({ profile, onSave, onClose }: { profile: UserProfile; onSave: (p: UserProfile) => void; onClose: () => void }) {
  const [p, setP] = useState({ ...profile });
  function save() { onSave(p); onClose(); }
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4" onClick={onClose}>
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm space-y-4 shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center">
          <div className="text-slate-800 text-lg font-bold">Update Your Details</div>
          <button onClick={onClose} className="text-slate-400 text-xl w-8 h-8 flex items-center justify-center">✕</button>
        </div>
        <p className="text-slate-400 text-sm">Update your information below.</p>
        <div className="space-y-3">
          <div>
            <label className="text-slate-500 text-xs font-medium block mb-1">Username</label>
            <input value={p.username} onChange={e => setP({...p, username: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-teal-500" />
          </div>
          <div>
            <label className="text-slate-500 text-xs font-medium block mb-1">My sobriety start date & time</label>
            <input type="datetime-local" value={p.soberDate?.slice(0,16)} onChange={e => setP({...p, soberDate: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-teal-500" />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-slate-500 text-xs font-medium block mb-1">Avg. Daily Spend</label>
              <input type="number" value={p.dailySpend || ''} onChange={e => setP({...p, dailySpend: parseFloat(e.target.value)||0})}
                placeholder="e.g., 150"
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-teal-500" />
            </div>
            <div className="w-32">
              <label className="text-slate-500 text-xs font-medium block mb-1">Currency</label>
              <select value={p.currency} onChange={e => setP({...p, currency: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-3 text-sm outline-none">
                {[['R','ZAR'],['$','USD'],['£','GBP'],['€','EUR'],['A$','AUD'],['NZ$','NZD']].map(([sym,code]) => (
                  <option key={sym} value={sym}>{code}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <button onClick={save} className="w-full py-3 rounded-xl bg-teal-600 text-white font-semibold">Save Changes</button>
      </div>
    </div>
  );
}

// ── Daily Missions ─────────────────────────────────────────────────────────────
function DailyMissions() {
  const today = new Date().toISOString().split('T')[0];
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(),0,0).getTime())/86400000);
  const missions = [
    MISSION_POOL[dayOfYear % MISSION_POOL.length],
    MISSION_POOL[(dayOfYear+17) % MISSION_POOL.length],
    MISSION_POOL[(dayOfYear+33) % MISSION_POOL.length],
  ];
  const completedKey = `missions_${today}`;
  const [completed, setCompleted] = useState<string[]>([]);
  useEffect(()=>{
    (async()=>{
      const {storageGet} = await import('./utils/storage');
      const res = await storageGet(completedKey);
      if(res) setCompleted(JSON.parse(res));
    })();
  },[today]);
  async function toggle(id:string){
    const next=completed.includes(id)?completed.filter(x=>x!==id):[...completed,id];
    setCompleted(next);
    const {storageSet} = await import('./utils/storage');
    await storageSet(completedKey,JSON.stringify(next));
  }
  const doneCount=missions.filter(m=>completed.includes(m.id)).length;
  const allDone = doneCount === missions.length;
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <span className="text-slate-800 font-semibold text-sm">Today's small steps</span>
        <span className={`text-sm font-semibold ${allDone?'text-emerald-600':'text-teal-600'} tabular-nums`}>{doneCount} / {missions.length}</span>
      </div>
      <div className="space-y-2">
        {missions.map(m => {
          const done = completed.includes(m.id);
          return (
            <button key={m.id} onClick={() => toggle(m.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                done ? 'bg-emerald-50/60 border border-emerald-100' : 'bg-slate-50 border border-slate-100'
              }`}>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${done ? 'bg-teal-500 border-teal-500' : 'border-slate-300'}`}>
                {done && <span className="text-white text-xs">✓</span>}
              </div>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${done ? 'bg-emerald-100' : 'bg-white border border-slate-200'}`}>
                <MissionIcon cat={m.cat} size={18} color={done ? '#059669' : '#0d9488'} />
              </div>
              <span className={`text-xs ${done ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{m.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Check-In Modals ────────────────────────────────────────────────────────────
type CheckInType = 'craving'|'thought'|'activity'|'sleep'|null;
const CRAVING_TRIGGERS = ['Stress','Social','Boredom','Time of Day','Celebration','Sadness','Location','Memory','Hungry','Angry','Tired'];

function CravingModal({ onClose, onSave }: { onClose:()=>void; onSave:(d:any)=>void }) {
  const [intensity, setIntensity] = useState<number>(6);
  const [triggers, setTriggers] = useState<string[]>([]);
  const [duration, setDuration] = useState(15);
  const [notes, setNotes] = useState('');
  const toggleTrigger=(t:string)=>setTriggers(p=>p.includes(t)?p.filter(x=>x!==t):[...p,t]);
  const intLabels=[['Mild',2],['Low',4],['Medium',6],['High',8],['Intense',10]] as [string,number][];
  const intColors=['bg-green-500','bg-lime-500','bg-amber-500','bg-orange-500','bg-red-500'];
  const intInactive=['bg-green-100 text-green-700','bg-lime-100 text-lime-700','bg-amber-100 text-amber-700','bg-orange-100 text-orange-700','bg-red-100 text-red-700'];
  return (
    <div className="fixed inset-0 bg-black/40 flex items-end z-50" onClick={onClose}>
      <div className="bg-white rounded-t-3xl p-6 w-full max-w-md mx-auto space-y-4 max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><IconWave size={22} color="#c0666e"/><span className="font-bold text-lg text-red-500">Log a Craving</span></div>
          <button onClick={onClose} className="text-slate-400 text-xl w-8 h-8 flex items-center justify-center">✕</button>
        </div>
        <p className="text-slate-400 text-sm">Acknowledge the feeling, and let it pass. You're in control.</p>
        <div>
          <div className="text-slate-700 text-sm font-semibold mb-2">How intense is the craving?</div>
          <div className="flex gap-2">
            {intLabels.map(([label,val],i)=>{
              const active=intensity===val;
              return <button key={label} onClick={()=>setIntensity(val)}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${active?intColors[i]+' text-white':intInactive[i]}`}>{label}</button>;
            })}
          </div>
        </div>
        <div>
          <div className="text-slate-700 text-sm font-semibold mb-2">What are the triggers?</div>
          <div className="flex flex-wrap gap-2">
            {CRAVING_TRIGGERS.map(t=>(
              <button key={t} onClick={()=>toggleTrigger(t)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${triggers.includes(t)?'bg-teal-500 text-white border-transparent':'bg-slate-50 text-slate-600 border-slate-200'}`}>{t}</button>
            ))}
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <div className="text-slate-700 text-sm font-semibold">How long did it last?</div>
            <div className="text-teal-600 text-sm font-semibold">{duration} minutes</div>
          </div>
          <input type="range" min={1} max={60} value={duration} onChange={e=>setDuration(Number(e.target.value))} className="w-full accent-teal-500"/>
        </div>
        <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Notes (optional) — e.g., Feeling tired after a long day at work..." rows={2}
          className="w-full bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl px-4 py-3 text-sm outline-none resize-none"/>
        <button onClick={()=>{onSave({intensity,triggers,duration,notes});onClose();}}
          className="w-full py-3.5 rounded-xl bg-teal-600 text-white font-semibold text-sm">Save Craving</button>
      </div>
    </div>
  );
}

function ThoughtModal({ onClose, onSave }: { onClose:()=>void; onSave:(d:any)=>void }) {
  const [intensity, setIntensity] = useState<number>(6);
  const [triggers, setTriggers] = useState<string[]>([]);
  const [duration, setDuration] = useState(5);
  const [notes, setNotes] = useState('');
  const toggleTrigger=(t:string)=>setTriggers(p=>p.includes(t)?p.filter(x=>x!==t):[...p,t]);
  const intLabels=[['Brief',2],['Mild',4],['Moderate',6],['Strong',8],['Consuming',10]] as [string,number][];
  const intColors=['bg-teal-500','bg-lime-500','bg-amber-500','bg-orange-500','bg-red-500'];
  const intInactive=['bg-teal-100 text-teal-700','bg-lime-100 text-lime-700','bg-amber-100 text-amber-700','bg-orange-100 text-orange-700','bg-red-100 text-red-700'];
  return (
    <div className="fixed inset-0 bg-black/40 flex items-end z-50" onClick={onClose}>
      <div className="bg-white rounded-t-3xl p-6 w-full max-w-md mx-auto space-y-4 max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><IconChat size={22} color="#4a6ab8"/><span className="font-bold text-lg text-blue-500">Log a Thought</span></div>
          <button onClick={onClose} className="text-slate-400 text-xl w-8 h-8 flex items-center justify-center">✕</button>
        </div>
        <p className="text-slate-400 text-sm">Noticing thoughts about alcohol is normal. Logging them helps you understand your patterns.</p>
        <div>
          <div className="text-slate-700 text-sm font-semibold mb-2">How strong was the thought?</div>
          <div className="flex gap-2">
            {intLabels.map(([label,val],i)=>{
              const active=intensity===val;
              return <button key={label} onClick={()=>setIntensity(val)}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${active?intColors[i]+' text-white':intInactive[i]}`}>{label}</button>;
            })}
          </div>
        </div>
        <div>
          <div className="text-slate-700 text-sm font-semibold mb-2">What triggered the thought?</div>
          <div className="flex flex-wrap gap-2">
            {CRAVING_TRIGGERS.map(t=>(
              <button key={t} onClick={()=>toggleTrigger(t)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${triggers.includes(t)?'bg-teal-500 text-white border-transparent':'bg-slate-50 text-slate-600 border-slate-200'}`}>{t}</button>
            ))}
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <div className="text-slate-700 text-sm font-semibold">How long did it last?</div>
            <div className="text-teal-600 text-sm font-semibold">{duration} minutes</div>
          </div>
          <input type="range" min={1} max={60} value={duration} onChange={e=>setDuration(Number(e.target.value))} className="w-full accent-teal-500"/>
        </div>
        <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Notes (optional) — e.g., Saw an ad on TV and thought about drinking..." rows={2}
          className="w-full bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl px-4 py-3 text-sm outline-none resize-none"/>
        <button onClick={()=>{onSave({intensity,triggers,duration,notes});onClose();}}
          className="w-full py-3.5 rounded-xl bg-teal-600 text-white font-semibold text-sm">Save Thought</button>
      </div>
    </div>
  );
}

const ACTIVITY_ICONS = [
  {label:'Running', icon:'🏃'},
  {label:'Walking', icon:'🚶'},
  {label:'Cycling', icon:'🚴'},
  {label:'Gym', icon:'🏋️'},
  {label:'Yoga', icon:'🧘'},
  {label:'Swimming', icon:'🏊'},
];

function ActivityModal({ onClose, onSave }: { onClose:()=>void; onSave:(d:any)=>void }) {
  const [selected, setSelected] = useState('');
  const [custom, setCustom] = useState('');
  const [duration, setDuration] = useState(30);
  const [distance, setDistance] = useState('');
  const [unit, setUnit] = useState<'km'|'miles'>('km');
  const [notes, setNotes] = useState('');
  const activity = selected || custom;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-end z-50" onClick={onClose}>
      <div className="bg-white rounded-t-3xl p-6 w-full max-w-md mx-auto space-y-4 max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><IconRun size={22} color="#3a8a58"/><span className="font-bold text-lg text-green-500">Log an Activity</span></div>
          <button onClick={onClose} className="text-slate-400 text-xl w-8 h-8 flex items-center justify-center">✕</button>
        </div>
        <p className="text-slate-400 text-sm">Celebrate your movement. Every step forward is a victory.</p>
        <div>
          <div className="text-slate-700 text-sm font-semibold mb-2">What did you do?</div>
          <div className="grid grid-cols-3 gap-3 mb-3">
            {ACTIVITY_ICONS.map(a=>(
              <button key={a.label} onClick={()=>{setSelected(a.label);setCustom('');}}
                className={`flex flex-col items-center py-3 rounded-xl border transition-all ${selected===a.label?'bg-teal-50 border-teal-400':'bg-slate-50 border-slate-200'}`}>
                <span className="text-2xl mb-1">{a.icon}</span>
                <span className="text-xs text-slate-600 font-medium">{a.label}</span>
              </button>
            ))}
          </div>
          <input value={custom} onChange={e=>{setCustom(e.target.value);setSelected('');}} placeholder="Or type another activity"
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-sm outline-none"/>
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <div className="text-slate-700 text-sm font-semibold">Duration</div>
            <div className="text-teal-600 text-sm font-semibold">{duration} minutes</div>
          </div>
          <input type="range" min={5} max={180} step={5} value={duration} onChange={e=>setDuration(Number(e.target.value))} className="w-full accent-teal-500"/>
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-slate-500 text-xs font-medium block mb-1">Distance (Optional)</label>
            <input type="number" value={distance} onChange={e=>setDistance(e.target.value)} placeholder="e.g., 5"
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-sm outline-none"/>
          </div>
          <div className="w-28">
            <label className="text-slate-500 text-xs font-medium block mb-1">Unit</label>
            <div className="flex gap-1 mt-1">
              {(['km','miles'] as const).map(u=>(
                <button key={u} onClick={()=>setUnit(u)}
                  className={`flex-1 py-3 rounded-xl text-xs font-semibold border transition-all ${unit===u?'bg-teal-500 text-white border-transparent':'bg-slate-50 text-slate-600 border-slate-200'}`}>{u}</button>
              ))}
            </div>
          </div>
        </div>
        <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Notes (optional) — e.g., Felt great and energized afterwards!" rows={2}
          className="w-full bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl px-4 py-3 text-sm outline-none resize-none"/>
        <button onClick={()=>{if(activity){onSave({activity,duration,distance,unit,notes});onClose();}}}
          disabled={!activity}
          className="w-full py-3.5 rounded-xl bg-teal-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-sm">Save Activity</button>
      </div>
    </div>
  );
}

function SleepModal({ onClose, onSave }: { onClose:()=>void; onSave:(d:any)=>void }) {
  const [hours, setHours] = useState(7);
  const [minutes, setMinutes] = useState(0);
  const [quality, setQuality] = useState<1|2|3|4|5>(3);
  const [notes, setNotes] = useState('');
  return (
    <div className="fixed inset-0 bg-black/40 flex items-end z-50" onClick={onClose}>
      <div className="bg-white rounded-t-3xl p-6 w-full max-w-md mx-auto space-y-4 max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><IconMoon size={22} color="#6e5a9a"/><span className="font-bold text-lg text-indigo-500">Log Your Sleep</span></div>
          <button onClick={onClose} className="text-slate-400 text-xl w-8 h-8 flex items-center justify-center">✕</button>
        </div>
        <p className="text-slate-400 text-sm">Good sleep is a cornerstone of recovery. Track how you're resting.</p>
        <div>
          <div className="text-slate-700 text-sm font-semibold mb-2">How long did you sleep?</div>
          <div className="flex items-center gap-3">
            <input type="number" min={0} max={24} value={hours} onChange={e=>setHours(Number(e.target.value))}
              className="w-20 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-3 text-sm outline-none text-center font-bold"/>
            <span className="text-slate-500 text-sm">hours</span>
            <input type="number" min={0} max={59} step={5} value={minutes} onChange={e=>setMinutes(Number(e.target.value))}
              className="w-20 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-3 text-sm outline-none text-center font-bold"/>
            <span className="text-slate-500 text-sm">min</span>
          </div>
        </div>
        <div>
          <div className="text-slate-700 text-sm font-semibold mb-2">How was the quality?</div>
          <div className="flex gap-2">
            {(['😫','😕','😐','😊','🌟'] as const).map((em,i)=>(
              <button key={i} onClick={()=>setQuality((i+1) as 1|2|3|4|5)}
                className={`flex-1 text-2xl py-3 rounded-xl border transition-all ${quality===i+1?'bg-teal-50 border-teal-400 scale-110':'bg-slate-50 border-slate-200'}`}>{em}</button>
            ))}
          </div>
        </div>
        <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Notes (optional) — e.g., Woke up a few times, but fell back asleep quickly." rows={2}
          className="w-full bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl px-4 py-3 text-sm outline-none resize-none"/>
        <button onClick={()=>{onSave({hours,minutes,quality,notes});onClose();}}
          className="w-full py-3.5 rounded-xl bg-teal-600 text-white font-semibold text-sm">Save Sleep Entry</button>
      </div>
    </div>
  );
}

// ── Weekly Goals Card ──────────────────────────────────────────────────────────
function WeeklyGoalsCard({ profile, onSave, onEdit }: { profile: any; onSave: (p: any) => void; onEdit: () => void }) {
  const goals: string[] = profile?.weeklyGoals || [];
  const storageKey = `weekly_goals_checked_${new Date().toISOString().slice(0,7)}`; // monthly reset
  const [checked, setChecked] = useState<string[]>([]);

  useEffect(() => {
    import('./utils/storage').then(({ storageGet }) => {
      storageGet(storageKey).then(val => { if (val) try { setChecked(JSON.parse(val)); } catch {} });
    });
  }, [storageKey]);

  function toggle(goal: string) {
    setChecked(prev => {
      const next = prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal];
      import('./utils/storage').then(({ storageSet }) => storageSet(storageKey, JSON.stringify(next)));
      return next;
    });
  }

  if (!goals.length) return null;

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <span className="text-slate-800 font-bold text-base">Weekly Goals</span>
        <button onClick={onEdit} className="text-teal-600 font-semibold text-sm">Edit</button>
      </div>
      <div className="space-y-2">
        {goals.map((goal, i) => {
          const done = checked.includes(goal);
          return (
            <button key={i} onClick={() => toggle(goal)}
              className="w-full flex items-center gap-3 text-left">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${done ? 'bg-teal-500' : 'border-2 border-slate-300'}`}>
                {done && <span className="text-white text-xs">✓</span>}
              </div>
              <span className={`text-sm ${done ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{goal}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Home Screen ────────────────────────────────────────────────────────────────
const TOOLS = [
  {key:'emergency',iconEl:<IconShield size={20} color="#e05555"/>,title:'Emergency Kit',desc:'Tools to help you through a tough moment',color:'bg-red-50'},
  {key:'buddy',iconEl:<IconHeart size={20} color="#7c5cbf"/>,title:'Sober Buddy',desc:"Feeling an urge? Talk it through",color:'bg-violet-50'},
  {key:'journal',iconEl:<IconJournal size={20} color="#b07840"/>,title:'Daily Journal',desc:'Reflect on your thoughts and feelings',color:'bg-amber-50'},
  {key:'emergency_cbt',iconEl:<IconBrain size={20} color="#4a6ab8"/>,title:'CBT Guides',desc:'Learn techniques to manage thoughts',color:'bg-blue-50'},
  {key:'emergency_breathing',iconEl:<IconWind size={20} color="#0d9488"/>,title:'Breathing Exercise',desc:'Calm your mind and body',color:'bg-teal-50'},
  {key:'emergency_meditation',iconEl:<IconLeaf size={20} color="#059669"/>,title:'Guided Meditations',desc:'Find calm and focus with guided sessions',color:'bg-emerald-50'},
  {key:'mindfulness',iconEl:<IconTarget size={20} color="#8b5cf6"/>,title:'Mindfulness Training',desc:'Practice staying present and grounded',color:'bg-purple-50'},
  {key:'tape_forward',iconEl:<IconProgress size={20} color="#0369a1"/>,title:'Play the Tape Forward',desc:'Visualise the consequences of giving in',color:'bg-sky-50'},
  {key:'urge_timer',iconEl:<IconTimer size={20} color="#d97706"/>,title:'15-Minute Urge Timer',desc:'Ride the wave of a craving until it passes',color:'bg-amber-50'},
  {key:'halt',iconEl:<IconBody size={20} color="#dc2626"/>,title:'H.A.L.T. Check-in',desc:'Are you Hungry, Angry, Lonely, or Tired?',color:'bg-rose-50'},
  {key:'puzzle',iconEl:<IconPuzzle size={20} color="#4a82a8"/>,title:'Interactive Puzzles',desc:'Engage your mind to overcome cravings',color:'bg-indigo-50'},
];

function useRealtimeStats(profile: UserProfile | null) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!profile?.soberDate) return null;
  const start = new Date(profile.soberDate).getTime();
  const ms = Math.max(0, now - start);
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = totalSeconds % 60;
  const heartbeats = Math.floor(totalSeconds * 1.2);
  const breaths = Math.floor(totalSeconds / 5);
  const perSecond = (profile.dailySpend || 0) / 86400;
  const moneySaved = perSecond * totalSeconds;
  return { days, hours, minutes, seconds, heartbeats, breaths, moneySaved, totalSeconds };
}

function fmtNum(n: number) {
  if (n >= 1000000) return `${(n/1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n/1000).toFixed(0)}K`;
  return n.toString();
}

// ── Serenity Card ────────────────────────────────────────────────────────────
// One unified, calm view of Time Sober + Money Saved. Replaces the old
// auto-flipping carousel which felt "shouty". Soft gradient, generous space,
// serif numerals — meant to feel like a meditation, not a dashboard.
function SerenityCard({ stats, currency, savingsGoal, savingsGoalName, goalProgress, showSavings }: {
  stats: ReturnType<typeof useRealtimeStats>;
  currency: string;
  savingsGoal?: number;
  savingsGoalName?: string;
  goalProgress: number;
  showSavings: boolean;
}) {
  const days    = stats?.days ?? 0;
  const hours   = stats?.hours ?? 0;
  const minutes = stats?.minutes ?? 0;
  const seconds = stats?.seconds ?? 0;
  const moneySaved = stats?.moneySaved ?? 0;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-50 via-white to-teal-50/60 border border-slate-100 shadow-sm">
      {/* Soft decorative leaf in the corner */}
      <svg className="absolute -top-8 -right-8 opacity-10" width="160" height="160" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="1">
        <path d="M2 22c1.25-1.25 2.5-3.5 3-5 0 0 4 1 8-3s3-8 3-8-4-1-8 3c-2 2-3 4-4 6"/>
        <path d="M2 22l8-8"/>
      </svg>

      <div className="relative p-6">
        {/* Header */}
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-700/80 mb-3">Sober for</div>

        {/* Days — large serif */}
        <div className="flex items-baseline gap-3 mb-1">
          <div className="text-6xl font-serif font-light text-slate-800 leading-none tabular-nums">{days}</div>
          <div className="text-slate-500 text-base font-light">{days === 1 ? 'day' : 'days'}</div>
        </div>

        {/* Hours / Minutes / Seconds — small, monospaced */}
        <div className="flex items-center gap-1 text-slate-400 text-xs font-mono tabular-nums mb-5">
          <span>{String(hours).padStart(2,'0')}h</span>
          <span className="text-slate-300">·</span>
          <span>{String(minutes).padStart(2,'0')}m</span>
          <span className="text-slate-300">·</span>
          <span>{String(seconds).padStart(2,'0')}s</span>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-5"/>

        {/* Money saved — only when a daily spend is being tracked */}
        {showSavings ? (
          <>
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-700/80 mb-2">Reclaimed so far</div>
            <div className="flex items-baseline gap-1 mb-3">
              <span className="text-slate-400 text-lg font-light">{currency}</span>
              <span className="text-3xl font-serif font-light text-slate-800 tabular-nums">
                {moneySaved.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            {savingsGoal && savingsGoal > 0 ? (
              <div>
                <div className="flex justify-between text-slate-400 text-xs mb-1.5">
                  <span>{savingsGoalName || 'Goal'}</span>
                  <span className="tabular-nums">{Math.round(goalProgress)}%</span>
                </div>
                <div className="w-full bg-slate-200/60 rounded-full h-1 overflow-hidden">
                  <div className="bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full h-1 transition-all duration-1000"
                    style={{ width: `${Math.min(100, goalProgress)}%` }}/>
                </div>
              </div>
            ) : (
              <div className="text-slate-400 text-xs italic">A small offering for your future self.</div>
            )}
          </>
        ) : (
          <div className="text-slate-400 text-xs italic">Add a daily spend in your profile to track savings.</div>
        )}
      </div>
    </div>
  );
}

function HomeScreen({ data, onNavigate }: { data: ReturnType<typeof useAppData>; onNavigate: (s: any) => void }) {
  const stats = useRealtimeStats(data.profile);
  const [pledge, setPledge] = useState('');
  const [pledgeSaved, setPledgeSaved] = useState(false);
  const [checkIn, setCheckIn] = useState<CheckInType>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [gratitudeText, setGratitudeText] = useState('');
  const [gratitudeSaved, setGratitudeSaved] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const pledgedToday = data.profile?.lastPledgeDate === today;
  const gratitudeToday = data.gratitude?.find(g => g.date === today);
  const savingsGoal = data.profile?.savingsGoal;
  const goalProgress = savingsGoal && stats ? Math.min(100,(stats.moneySaved/savingsGoal)*100) : 0;

  async function savePledge() {
    if (!data.profile || !pledge.trim()) return;
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const wasYesterday = data.profile.lastPledgeDate === yesterday;
    const newStreak = wasYesterday ? (data.profile.pledgeStreak || 0) + 1 : 1;
    await data.saveProfile({...data.profile, lastPledgeDate: today, pledgeStreak: newStreak, lastPledgeText:pledge.trim()});
    setPledgeSaved(true); setTimeout(()=>setPledgeSaved(false),2000); setPledge('');
  }

  function saveGratitude() {
    if (!gratitudeText.trim()) return;
    data.addGratitude({ id: Date.now().toString(), date: today, text: gratitudeText.trim() });
    setGratitudeSaved(true); setTimeout(()=>setGratitudeSaved(false),2000); setGratitudeText('');
  }

  async function handleCheckIn(type: CheckInType, d: any) {
    const ts = new Date().toISOString();
    if (type==='craving') await data.addCraving({id:ts,timestamp:ts,intensity:d.intensity,duration:d.duration||0,trigger:(d.triggers||[]).join(', '),overcome:true});
    else if (type==='thought') { const ILABELS: Record<number,string>={2:'Brief',4:'Mild',6:'Moderate',8:'Strong',10:'Consuming'}; const iLabel=ILABELS[d.intensity]||'Moderate'; const trig=(d.triggers||[]).length>0?' · Triggers: '+d.triggers.join(', '):''; const nt=d.notes?' — '+d.notes:''; await data.addThought({id:ts,timestamp:ts,type:'negative',text:iLabel+' thought'+trig+nt}); }
    else if (type==='activity') await data.addActivity({
      id: ts,
      timestamp: ts,
      activity: d.activity,
      duration: typeof d.duration === 'number' ? d.duration : undefined,
      distance: d.distance ? parseFloat(d.distance) : undefined,
      unit: d.unit,
      notes: d.notes || undefined,
    });
    else if (type==='sleep') await data.addSleep({id:ts,date:today,hours:d.hours+(d.minutes||0)/60,quality:d.quality});
  }

  const now = new Date();
  const dateStr = now.toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long'});

  return (
    <div className="overflow-y-auto h-full px-4 py-5 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <div className="text-slate-400 text-xs">{dateStr}</div>
          <div className="text-slate-800 text-2xl font-bold">Hi, {data.profile?.username} 👋</div>
        </div>
        <button onClick={()=>setShowProfile(true)} className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center"><IconProfile size={20} color="#0d9488"/></button>
      </div>

      {showProfile && data.profile && <ProfileModal profile={data.profile} onSave={data.saveProfile} onClose={()=>setShowProfile(false)}/>}

      {/* Today card — serene unified view of time sober + money saved */}
      <SerenityCard
        stats={stats}
        currency={data.profile?.currency || '$'}
        savingsGoal={savingsGoal}
        savingsGoalName={data.profile?.savingsGoalName}
        goalProgress={goalProgress}
        showSavings={(data.profile?.dailySpend || 0) > 0}
      />

      {/* Forest — grows hourly in first week, daily through month, biweekly after */}
      <ForestVisual soberDate={data.profile?.soberDate || ''}/>

      {/* Pledge */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
        <p className="text-sm font-semibold text-teal-600 italic text-center mb-3">Daily Pledge</p>
        {pledgedToday && !pledge ? (
          <div className="bg-green-50 rounded-xl p-3 border border-green-100">
            <div className="text-green-700 text-sm font-medium">✓ Pledge made today</div>
            {data.profile?.lastPledgeText&&<div className="text-green-600 text-xs mt-1 italic">"{data.profile.lastPledgeText}"</div>}
            <div className="text-green-500 text-xs mt-1">Streak: {data.profile?.pledgeStreak||1} days ⚡</div>
          </div>
        ) : (
          <div className="flex gap-2">
            <input value={pledge} onChange={e=>setPledge(e.target.value)} placeholder="e.g., Today I choose clarity."
              className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-teal-500"/>
            <button onClick={savePledge} disabled={!pledge.trim()}
              className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors ${pledge.trim()?'bg-teal-600 text-white':'bg-slate-100 text-slate-400'}`}>
              {pledgeSaved?'✓':'Save'}
            </button>
          </div>
        )}
      </div>

      {/* Gratitude */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <IconGratitude size={16} color="#e11d48"/>
          <p className="text-sm font-semibold text-rose-500">Daily Gratitude</p>
        </div>
        {gratitudeToday && !gratitudeText ? (
          <div className="bg-pink-50 rounded-xl p-3 border border-pink-100">
            <div className="text-pink-700 text-sm font-medium">✓ Gratitude logged today</div>
            <div className="text-pink-600 text-xs mt-1 italic">"{gratitudeToday.text}"</div>
          </div>
        ) : (
          <div className="space-y-2">
            {data.gratitude.find(g=>g.date===new Date(Date.now()-86400000).toISOString().split('T')[0]) && (
              <div className="text-slate-400 text-xs italic mb-1">Yesterday: "{data.gratitude.find(g=>g.date===new Date(Date.now()-86400000).toISOString().split('T')[0])?.text}"</div>
            )}
            <div className="flex gap-2">
              <input value={gratitudeText} onChange={e=>setGratitudeText(e.target.value)}
                placeholder="What are you grateful for today?"
                className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-rose-400"/>
              <button onClick={saveGratitude} disabled={!gratitudeText.trim()}
                className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors ${gratitudeText.trim()?'bg-rose-500 text-white':'bg-slate-100 text-slate-400'}`}>
                {gratitudeSaved?'✓':'Save'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Weekly Goals */}
      <WeeklyGoalsCard profile={data.profile} onSave={data.saveProfile} onEdit={()=>onNavigate('weeklygoals')} />

      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-3">Daily Missions</h2>
        <DailyMissions/>
      </div>

      {/* Daily Check-In */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-3">Daily Check-in</h2>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="grid grid-cols-4 gap-2">
          <button onClick={()=>setCheckIn('craving')}
              className="bg-red-50 border border-red-100 rounded-xl p-3 text-center active:scale-95 transition-transform flex flex-col items-center gap-1.5">
              <IconWave size={22} color="#c0666e"/>
              <div className="text-xs font-medium text-red-500 leading-tight">Log Craving</div>
            </button>
            <button onClick={()=>setCheckIn('thought')}
              className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center active:scale-95 transition-transform flex flex-col items-center gap-1.5">
              <IconChat size={22} color="#4a6ab8"/>
              <div className="text-xs font-medium text-blue-500 leading-tight">Log Thought</div>
            </button>
            <button onClick={()=>setCheckIn('activity')}
              className="bg-green-50 border border-green-100 rounded-xl p-3 text-center active:scale-95 transition-transform flex flex-col items-center gap-1.5">
              <IconRun size={22} color="#3a8a58"/>
              <div className="text-xs font-medium text-green-500 leading-tight">Log Activity</div>
            </button>
            <button onClick={()=>setCheckIn('sleep')}
              className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-center active:scale-95 transition-transform flex flex-col items-center gap-1.5">
              <IconMoon size={22} color="#6e5a9a"/>
              <div className="text-xs font-medium text-indigo-500 leading-tight">Log Sleep</div>
            </button>
        </div>
        </div>
      </div>

      {/* Today's Reminder */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-3">Today's Reminder</h2>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex">
          <div className="w-1.5 bg-teal-500 flex-shrink-0 rounded-l-2xl" />
          <div className="px-4 py-4">
            <p className="text-gray-700 italic text-base leading-relaxed">"{getDailyQuote()}"</p>
          </div>
        </div>
      </div>

      {/* Tools list */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-3">Your Tools</h2>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-50">
          {TOOLS.map(tool=>(
            <button key={tool.key} onClick={()=>onNavigate(tool.key)}
              className="w-full px-4 py-3.5 flex items-center gap-3 text-left active:bg-slate-50 transition-colors">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${tool.color}`}>{tool.iconEl}</div>
              <div className="flex-1 min-w-0">
                <div className="text-slate-800 font-semibold text-sm">{tool.title}</div>
                <div className="text-slate-400 text-xs">{tool.desc}</div>
              </div>
              <IconChevron size={18} color="#cbd5e1"/>
            </button>
          ))}
        </div>
        </div>
      </div>

      <button onClick={()=>onNavigate('recovery')}
        className="w-full bg-emerald-50 rounded-2xl p-4 border border-emerald-100 text-left active:scale-95 transition-transform shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2"><IconBody size={16} color="#059669"/><span className="text-slate-800 font-semibold text-sm">Your Quitting Timeline</span></div>
            <div className="text-slate-500 text-xs mt-0.5">See what's healing in your body right now</div>
          </div>
          <div className="text-slate-400 text-lg">›</div>
        </div>
      </button>

      {checkIn==='craving' && <CravingModal onClose={()=>setCheckIn(null)} onSave={d=>handleCheckIn('craving',d)}/>}
      {checkIn==='thought' && <ThoughtModal onClose={()=>setCheckIn(null)} onSave={d=>handleCheckIn('thought',d)}/>}
      {checkIn==='activity' && <ActivityModal onClose={()=>setCheckIn(null)} onSave={d=>handleCheckIn('activity',d)}/>}
      {checkIn==='sleep' && <SleepModal onClose={()=>setCheckIn(null)} onSave={d=>handleCheckIn('sleep',d)}/>}
    </div>
  );
}

// ── My Motivation Screen ───────────────────────────────────────────────────────
function MotivationSection({title,items,newVal,setNew,onAdd,onRemove,placeholder}:{title:string;items:string[];newVal:string;setNew:(v:string)=>void;onAdd:()=>void;onRemove:(i:number)=>void;placeholder:string}) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
      <div className="text-slate-800 font-bold text-sm mb-3">{title}</div>
      {items.length===0?<div className="text-slate-400 text-xs italic mb-3">No items added yet.</div>:(
        <div className="space-y-2 mb-3">
          {items.map((item,i)=>(
            <div key={i} className="flex items-start gap-2 bg-slate-50 rounded-xl px-3 py-2">
              <div className="flex-1 text-slate-700 text-sm">{item}</div>
              <button onClick={()=>onRemove(i)} className="text-slate-300 text-lg leading-none flex-shrink-0">×</button>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input value={newVal} onChange={e=>setNew(e.target.value)} onKeyDown={e=>e.key==='Enter'&&onAdd()} placeholder={placeholder}
          className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-teal-500"/>
        <button onClick={onAdd} className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center text-xl font-bold flex-shrink-0">+</button>
      </div>
    </div>
  );
}

function MyMotivation({ onBack, saveReasons: _saveReasons, initialReasons }: {
  onBack: () => void;
  saveReasons: (r: string[]) => void;
  initialReasons: string[];
}) {
  // reasons uses the canonical 'reasons' key shared with EmergencyKit (via useAppData)
  const [reasons, setReasons] = useState<string[]>(initialReasons);
  const [pros, setPros] = useState<string[]>([]);
  const [cons, setCons] = useState<string[]>([]);
  const [newReason, setNewReason] = useState('');
  const [newPro, setNewPro] = useState('');
  const [newCon, setNewCon] = useState('');

  useEffect(() => {
    (async () => {
      const { storageGet } = await import('./utils/storage');
      const [legacy, p, c] = await Promise.all([
        storageGet('motivation_reasons'), // migration: old key
        storageGet('motivation_pros'),
        storageGet('motivation_cons'),
      ]);
      if (p) setPros(JSON.parse(p));
      if (c) setCons(JSON.parse(c));
      // One-time migration: if the old key has data but the canonical 'reasons' is empty
      if (legacy && initialReasons.length === 0) {
        try {
          const migrated: string[] = JSON.parse(legacy);
          if (migrated.length > 0) {
            setReasons(migrated);
            _saveReasons(migrated); // writes to 'reasons' and updates useAppData state
          }
        } catch {}
      }
    })();
  }, []);

  // Reasons use the shared 'reasons' key via the saveReasons callback
  function addReason() {
    if (!newReason.trim()) return;
    const next = [...reasons, newReason.trim()];
    setReasons(next);
    setNewReason('');
    _saveReasons(next);
  }
  function removeReason(idx: number) {
    const next = reasons.filter((_, i) => i !== idx);
    setReasons(next);
    _saveReasons(next);
  }

  // Pros / cons still use their own storage keys (they are not shown in EmergencyKit)
  async function add(list: string[], item: string, setter: (v: string[]) => void, key: string, clearInput: () => void) {
    if (!item.trim()) return;
    const next = [...list, item.trim()];
    setter(next);
    clearInput();
    const { storageSet } = await import('./utils/storage');
    await storageSet(key, JSON.stringify(next));
  }
  async function removeProsOrCons(list: string[], idx: number, setter: (v: string[]) => void, key: string) {
    const next = list.filter((_, i) => i !== idx);
    setter(next);
    const { storageSet } = await import('./utils/storage');
    await storageSet(key, JSON.stringify(next));
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="flex items-center gap-3 px-4 py-4 bg-white border-b border-slate-100">
        <button onClick={onBack} className="text-slate-400 text-xl">←</button>
        <div className="text-slate-800 font-bold">My Motivation</div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        <div className="text-center text-slate-500 text-sm px-4">Remind yourself why you started this journey. Your reasons are your anchor.</div>
        <div className="bg-teal-50 border border-teal-100 rounded-2xl px-4 py-2 text-teal-700 text-xs">
          ✓ Your reasons appear inside the Emergency Kit under "My Reasons"
        </div>
        <MotivationSection title="My Reasons to Quit" items={reasons} newVal={newReason} setNew={setNewReason}
          onAdd={addReason}
          onRemove={removeReason} placeholder="e.g., To be healthier"/>
        <MotivationSection title="Pros of Sobriety" items={pros} newVal={newPro} setNew={setNewPro}
          onAdd={() => add(pros, newPro, setPros, 'motivation_pros', () => setNewPro(''))}
          onRemove={i => removeProsOrCons(pros, i, setPros, 'motivation_pros')} placeholder="e.g., More energy"/>
        <MotivationSection title="Cons I'm Leaving Behind" items={cons} newVal={newCon} setNew={setNewCon}
          onAdd={() => add(cons, newCon, setCons, 'motivation_cons', () => setNewCon(''))}
          onRemove={i => removeProsOrCons(cons, i, setCons, 'motivation_cons')} placeholder="e.g., Feeling anxious"/>
      </div>
    </div>
  );
}

function WeeklyGoalAdder({ onAdd }: { onAdd: (g: string) => void }) {
  const [val, setVal] = useState('');
  function add() { if (!val.trim()) return; onAdd(val.trim()); setVal(''); }
  return (
    <div className="flex gap-2">
      <input value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key==='Enter' && add()}
        placeholder="e.g., Go to the gym 3 times"
        className="flex-1 bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-teal-500"/>
      <button onClick={add} className="px-4 py-2.5 bg-teal-100 text-teal-700 font-bold rounded-xl text-sm">Add</button>
    </div>
  );
}

// ── Security section (Profile) ─────────────────────────────────────────────────
function SecuritySection({ profile, setProfile, saveProfile }: {
  profile: UserProfile;
  setProfile: (p: UserProfile) => void;
  saveProfile: (p: UserProfile) => Promise<void>;
}) {
  const currentMethod: 'none' | 'biometric' | 'pin' =
    profile.lockMethod ?? (profile.biometricEnabled ? 'biometric' : 'none');
  const [bioCap, setBioCap] = useState<BiometricCapability | null>(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinValue, setPinValue] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [pinError, setPinError] = useState('');

  useEffect(() => { getBiometricCapability().then(setBioCap); }, []);

  async function applyMethod(next: 'none' | 'biometric' | 'pin') {
    if (next === currentMethod) return;
    if (next === 'biometric') {
      const ok = await authenticateBiometric('Enable biometric unlock');
      if (!ok) return;
      const updated: UserProfile = { ...profile, lockMethod: 'biometric', biometricEnabled: true };
      setProfile(updated);
      await saveProfile(updated);
      // Clear any leftover PIN credential
      try { await clearPin(); } catch (e) { console.error('[security] clearPin failed:', e); }
    } else if (next === 'pin') {
      setPinValue(''); setPinConfirm(''); setPinError('');
      setShowPinModal(true);
    } else {
      const updated: UserProfile = { ...profile, lockMethod: 'none', biometricEnabled: false };
      setProfile(updated);
      await saveProfile(updated);
      try { await clearPin(); } catch (e) { console.error('[security] clearPin failed:', e); }
    }
  }

  async function confirmPin() {
    if (!/^\d{4,8}$/.test(pinValue)) { setPinError('PIN must be 4–8 digits'); return; }
    if (pinValue !== pinConfirm) { setPinError('PINs do not match'); return; }
    try {
      await savePin(pinValue);
      const updated: UserProfile = { ...profile, lockMethod: 'pin', biometricEnabled: false };
      setProfile(updated);
      await saveProfile(updated);
      setShowPinModal(false);
    } catch (e: any) {
      console.error('[security] savePin failed:', e);
      setPinError(e?.message ?? 'Could not save PIN');
    }
  }

  const Option = ({ id, title, subtitle, icon, disabled }: { id: 'none'|'biometric'|'pin'; title: string; subtitle: string; icon: string; disabled?: boolean }) => (
    <button onClick={() => !disabled && applyMethod(id)} disabled={disabled}
      className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
        currentMethod === id ? 'border-teal-500 bg-teal-50'
          : disabled ? 'border-slate-100 bg-slate-50 opacity-60'
          : 'border-slate-200 bg-white'
      }`}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-base flex-shrink-0">{icon}</div>
        <div className="flex-1">
          <div className="text-slate-800 font-semibold text-sm">{title}</div>
          <div className="text-slate-500 text-xs">{subtitle}</div>
        </div>
        {currentMethod === id && <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs">✓</div>}
      </div>
    </button>
  );

  const bioAvailable = bioCap?.available === true;
  const bioLabel = bioCap?.kind === 'face' ? 'Face Unlock' : bioCap?.kind === 'fingerprint' ? 'Fingerprint' : 'Biometric Unlock';
  const bioSub = bioAvailable ? 'Recommended — fastest and most secure' : (bioCap?.reason || 'Not available on this device');

  return (
    <div>
      <p className="text-gray-500 text-xs font-medium mb-3 uppercase tracking-wider">App Lock</p>
      <div className="space-y-2">
        <Option id="biometric" title={bioLabel} subtitle={bioSub} icon={bioCap?.kind === 'face' ? '😊' : '👆'} disabled={!bioAvailable}/>
        <Option id="pin" title="PIN Code" subtitle="A 4–8 digit code only you know" icon="🔢"/>
        <Option id="none" title="No Lock" subtitle="Open without authenticating" icon="🔓"/>
      </div>

      {showPinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4" onClick={() => setShowPinModal(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-slate-900 font-bold text-lg text-center">Set up PIN</h3>
            <p className="text-slate-500 text-sm text-center">Choose a 4–8 digit code. We can't recover this for you.</p>
            <input type="password" inputMode="numeric" pattern="\d*" maxLength={8} autoFocus
              value={pinValue} onChange={e => { setPinValue(e.target.value.replace(/\D/g,'')); setPinError(''); }}
              placeholder="••••"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-2xl tracking-[0.4em] text-center outline-none focus:ring-2 focus:ring-teal-500"/>
            <input type="password" inputMode="numeric" pattern="\d*" maxLength={8}
              value={pinConfirm} onChange={e => { setPinConfirm(e.target.value.replace(/\D/g,'')); setPinError(''); }}
              placeholder="Confirm"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-2xl tracking-[0.4em] text-center outline-none focus:ring-2 focus:ring-teal-500"/>
            {pinError && <p className="text-rose-500 text-xs text-center">{pinError}</p>}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button onClick={() => setShowPinModal(false)} className="py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm">Cancel</button>
              <button onClick={confirmPin} className="py-3 rounded-xl bg-teal-600 text-white font-semibold text-sm">Save PIN</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Voice Card (Profile) ──────────────────────────────────────────────────
// Fully offline — opens Android TTS settings so the user can install a
// neural voice pack, and exposes a speaking-speed slider.
// Nothing leaves the device.
function VoiceCard() {
  const [rate, setRateState] = useState(0.78);
  const [open, setOpen] = useState(false);
  const [opened, setOpened] = useState(false);
  const [voiceName, setVoiceName] = useState('—');
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    (async () => {
      const { getTTSRate, getActiveVoiceName, speak, stopSpeaking } = await import('./utils/tts');
      setRateState(await getTTSRate());
      // Trigger a silent probe so the active voice is resolved
      try { await speak(' '); await stopSpeaking(); } catch {}
      setVoiceName(getActiveVoiceName());
    })();
  }, []);

  async function handleRate(val: number) {
    setRateState(val);
    const { setTTSRate } = await import('./utils/tts');
    await setTTSRate(val);
  }

  async function handleOpenSettings() {
    setOpened(true);
    const { openTTSSettings } = await import('./utils/tts');
    await openTTSSettings();
  }

  async function handleTest() {
    if (testing) return;
    setTesting(true);
    const { speak, getActiveVoiceName } = await import('./utils/tts');
    await speak("This is your current voice. If it sounds robotic, install a high quality voice pack from Android settings.");
    setVoiceName(getActiveVoiceName());
    setTesting(false);
  }

  const speedLabel = rate < 0.65 ? 'Very slow' : rate < 0.85 ? 'Normal' : rate < 1.05 ? 'Fast' : 'Very fast';

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center px-5 py-4 text-left gap-3">
        <div className="w-9 h-9 rounded-full bg-violet-50 flex items-center justify-center flex-shrink-0">
          <IconNote size={18} color="#7c3aed"/>
        </div>
        <div className="flex-1">
          <div className="font-semibold text-slate-800 text-sm">Voice & TTS</div>
          <div className="text-slate-500 text-xs">Fully on-device — nothing leaves your phone</div>
        </div>
        <div className={`text-slate-400 transition-transform ${open ? 'rotate-90' : ''}`}>
          <IconChevron size={18} color="#94a3b8"/>
        </div>
      </button>

      {open && (
        <div className="border-t border-slate-50 px-5 pb-5 space-y-4">
          <p className="text-slate-600 text-sm leading-relaxed">
            Audio is generated entirely on your device. The default Android voice is robotic —
            installing a <strong>neural voice pack</strong> from your phone's settings makes it
            sound much more natural, with no internet needed afterward.
          </p>

          {/* Currently active voice + test */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Currently using</div>
              <div className="text-slate-700 text-xs font-mono truncate">{voiceName}</div>
            </div>
            <button onClick={handleTest} disabled={testing}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${testing ? 'bg-slate-200 text-slate-500' : 'bg-violet-600 text-white active:bg-violet-700'}`}>
              {testing ? 'Playing…' : 'Test voice'}
            </button>
          </div>

          {/* Open TTS settings button */}
          <button onClick={handleOpenSettings}
            className="w-full flex items-center gap-3 bg-teal-50 border border-teal-200 rounded-xl px-4 py-3.5 text-left active:bg-teal-100 transition-colors">
            <div className="flex-1">
              <div className="text-teal-800 font-semibold text-sm">
                {opened ? '↗ TTS settings opened' : 'Install a better voice'}
              </div>
              <div className="text-teal-600 text-xs mt-0.5">
                Opens Android Text-to-Speech settings — look for <em>high quality</em> or <em>neural</em> packs
              </div>
            </div>
            <IconChevron size={16} color="#0d9488"/>
          </button>

          {/* Step-by-step instructions */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
            <p className="text-slate-600 text-xs font-semibold mb-1.5">What to do once settings open:</p>
            {[
              'Tap Google Text-to-Speech Engine',
              'Tap "Install voice data"',
              'Find your language → tap ★ High quality',
              'Download and set as default',
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-teal-500 font-bold text-xs w-4 shrink-0">{i + 1}.</span>
                <span className="text-slate-600 text-xs">{step}</span>
              </div>
            ))}
          </div>

          {/* Speed control */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-700 text-sm font-medium">Speaking speed</span>
              <span className="text-teal-600 text-sm font-semibold">{speedLabel}</span>
            </div>
            <input type="range" min={0.5} max={1.4} step={0.05} value={rate}
              onChange={e => handleRate(parseFloat(e.target.value))}
              className="w-full accent-teal-500"/>
            <div className="flex justify-between text-slate-400 text-[10px] mt-1">
              <span>Slower</span>
              <span>Faster</span>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-emerald-800 text-xs leading-relaxed">
            🔒 <strong>Zero network calls.</strong> All TTS runs entirely on your device. No text is ever sent anywhere.
          </div>
        </div>
      )}
    </section>
  );
}

// ── Recovery Section (Profile) ─────────────────────────────────────────────
// Shows the user's full recovery story (current streak, best ever, lifetime
// total, slips logged) and provides the entry points for recording a slip
// or reading the slip log. Designed to feel supportive, not clinical.
function RecoverySection({ data, onNavigate }: {
  data: ReturnType<typeof useAppData>;
  onNavigate: (s: Screen | 'motivation' | 'weeklygoals' | 'history' | 'crisis' | 'privacy') => void;
}) {
  const stats = data.getRecoveryStats();
  const isFirstStreak = stats.slipCount === 0;

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-5 border-b border-gray-50">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Your Journey</h2>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <div className="text-2xl font-serif font-light text-teal-700 tabular-nums">{stats.currentStreak}</div>
            <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Current</div>
            <div className="text-[10px] text-slate-400">{stats.currentStreak === 1 ? 'day' : 'days'}</div>
          </div>
          <div>
            <div className="text-2xl font-serif font-light text-teal-700 tabular-nums">{stats.bestStreak}</div>
            <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Best ever</div>
            <div className="text-[10px] text-slate-400">{stats.bestStreak === 1 ? 'day' : 'days'}</div>
          </div>
          <div>
            <div className="text-2xl font-serif font-light text-teal-700 tabular-nums">{stats.lifetimeSoberDays}</div>
            <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Lifetime</div>
            <div className="text-[10px] text-slate-400">sober days</div>
          </div>
        </div>
        {!isFirstStreak && (
          <div className="text-slate-500 text-xs mt-3 italic leading-relaxed">
            {stats.slipCount} slip{stats.slipCount === 1 ? '' : 's'} logged. Each one is a teacher, not a verdict.
          </div>
        )}
      </div>

      <button onClick={() => onNavigate('slip' as Screen)}
        className="w-full px-5 py-4 flex items-center text-left hover:bg-slate-50 active:bg-slate-100 transition-colors border-b border-gray-50">
        <div className="w-9 h-9 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mr-3">
          <IconHeart size={18}/>
        </div>
        <div className="flex-1">
          <div className="font-semibold text-slate-800 text-sm">I had a slip</div>
          <div className="text-slate-500 text-xs">Record it gently — your data and history all stay.</div>
        </div>
        <IconChevron size={18} color="#cbd5e1"/>
      </button>

      <button onClick={() => onNavigate('sliplog' as Screen)}
        className="w-full px-5 py-4 flex items-center text-left hover:bg-slate-50 active:bg-slate-100 transition-colors">
        <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 mr-3">
          <IconBookmark size={18}/>
        </div>
        <div className="flex-1">
          <div className="font-semibold text-slate-800 text-sm">Slip log</div>
          <div className="text-slate-500 text-xs">{stats.slipCount === 0 ? 'Empty so far.' : `${stats.slipCount} entr${stats.slipCount === 1 ? 'y' : 'ies'} — read your past notes`}</div>
        </div>
        <IconChevron size={18} color="#cbd5e1"/>
      </button>
    </section>
  );
}

// ── Profile Screen ─────────────────────────────────────────────────────────────
const DEFAULT_NS = { motivations: false, reminders: false, milestones: false, morningTime: '08:00', eveningTime: '19:00' };
function ProfileScreen({ data, onNavigate }: { data: ReturnType<typeof useAppData>; onNavigate: (s: Screen|'motivation'|'weeklygoals'|'history'|'crisis'|'privacy') => void }) {
  const [profile, setProfile] = useState(data.profile);
  const [showReset, setShowReset] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [saved, setSaved] = useState(false);
  const stats = useRealtimeStats(data.profile);

  async function save(p: UserProfile) {
    try {
      await data.saveProfile(p);
      setProfile(p);
      // Reschedule notifications with updated settings
      if (p.notificationSettings) {
        const granted = await requestPermission();
        if (granted) await scheduleAll(p, data.reasons || []);
      }
      setSaved(true);
      const t = window.setTimeout(() => { setSaved(false); setShowEdit(false); }, 1500);
      return () => window.clearTimeout(t);
    } catch (e) {
      console.error('[ProfileScreen] save failed:', e);
    }
  }

  async function resetAll() {
    const {storageRemoveAll} = await import('./utils/storage');
    await storageRemoveAll();
    window.location.reload();
  }

  if (!profile) return null;
  const moneySaved = stats?.moneySaved || 0;
  const savingsGoal = profile.savingsGoal || 0;
  const goalProgress = savingsGoal ? Math.min(100,(moneySaved/savingsGoal)*100) : 0;

  const menuRows = [
    {icon:<IconCompass size={22} color='#0d9488'/>,label:'My Motivation',action:()=>onNavigate('motivation')},
    {icon:<IconTarget size={22} color='#7c3aed'/>,label:'Weekly Goals',action:()=>onNavigate('weeklygoals')},
    {icon:<IconHistory size={22} color='#0284c7'/>,label:'My History',action:()=>onNavigate('history')},
    {icon:<IconPhone size={22} color='#e11d48'/>,label:'Crisis Lines',action:()=>onNavigate('crisis')},
    {icon:<IconHands size={22} color='#0d9488'/>,label:'Recovery Groups',action:()=>onNavigate('groups')},
    {icon:<IconCloud size={22} color='#4a82a8'/>,label:'Backup & Restore',action:()=>onNavigate('backup')},
    {icon:<IconMilestone size={22} color='#b07840'/>,label:'Milestone Cards',action:()=>onNavigate('milestone')},
    {icon:<IconShieldLock size={22} color='#0d9488'/>,label:'Privacy Policy',action:()=>onNavigate('privacy')},
  ];

  return (
    <div className="overflow-y-auto h-full bg-gray-50">
      <div className="p-6 flex flex-col min-h-full space-y-5">

        {/* Header */}
        <header className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Profile</h1>
          {!showEdit && (
            <button onClick={()=>setShowEdit(true)} className="text-teal-600 font-medium text-sm hover:text-teal-700">
              Edit Details
            </button>
          )}
        </header>

        {/* Your Details */}
        <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Your Details</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-gray-50 pb-2">
              <span className="text-gray-600 text-sm">Username</span>
              <span className="font-semibold text-gray-800 text-sm">{profile.username}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-50 pb-2">
              <span className="text-gray-600 text-sm">Sobriety Start</span>
              <span className="font-semibold text-gray-800 text-sm">{new Date(profile.soberDate).toLocaleString([],{dateStyle:'short',timeStyle:'short'})}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Avg. Daily Spend</span>
              <span className="font-semibold text-gray-800 text-sm">{profile.currency}{profile.dailySpend||0}</span>
            </div>
          </div>
        </section>

        {/* Recovery — current/best/lifetime + slip log + record-a-slip */}
        <RecoverySection data={data} onNavigate={onNavigate}/>

        {/* Edit form — shown only when Edit Details is tapped */}
        {showEdit && (
          <section className="bg-white p-5 rounded-2xl shadow-sm border border-teal-100 space-y-4">
            <h2 className="text-xs font-bold text-teal-600 uppercase tracking-wider">Edit Details</h2>
            <div>
              <label className="text-gray-500 text-xs font-medium block mb-1">Username</label>
              <input value={profile.username} onChange={e=>setProfile({...profile,username:e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-teal-500"/>
            </div>
            <div>
              <label className="text-gray-500 text-xs font-medium block mb-1">Sobriety start date & time</label>
              <input type="datetime-local" value={profile.soberDate?.slice(0,16) ?? ''} onChange={e=>setProfile({...profile,soberDate:e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-teal-500"/>
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-gray-500 text-xs font-medium block mb-1">Avg. Daily Spend</label>
                <input type="number" value={profile.dailySpend||''} onChange={e=>setProfile({...profile,dailySpend:parseFloat(e.target.value)||0})}
                  placeholder="e.g., 150" className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-teal-500"/>
              </div>
              <div className="w-28">
                <label className="text-gray-500 text-xs font-medium block mb-1">Currency</label>
                <select value={profile.currency} onChange={e=>setProfile({...profile,currency:e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-3 py-3 text-sm outline-none">
                  {[['R','ZAR'],['$','USD'],['£','GBP'],['€','EUR'],['A$','AUD'],['NZ$','NZD']].map(([sym,code])=>(<option key={sym} value={sym}>{code}</option>))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-gray-500 text-xs font-medium block mb-1">Emergency Contact Name</label>
              <input value={profile.emergencyContact?.name||''} onChange={e=>setProfile({...profile,emergencyContact:{name:e.target.value,phone:profile.emergencyContact?.phone||''}})}
                placeholder="Trusted friend or sponsor" className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-teal-500"/>
            </div>
            <div>
              <label className="text-gray-500 text-xs font-medium block mb-1">Emergency Contact Phone</label>
              <input type="tel" value={profile.emergencyContact?.phone||''} onChange={e=>setProfile({...profile,emergencyContact:{name:profile.emergencyContact?.name||'',phone:e.target.value}})}
                placeholder="+27..." className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-teal-500"/>
            </div>
            <div>
              <label className="text-gray-500 text-xs font-medium block mb-1">Savings Goal Name</label>
              <input value={profile.savingsGoalName||''} onChange={e=>setProfile({...profile,savingsGoalName:e.target.value})}
                placeholder="What are you saving for?" className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-teal-500"/>
            </div>
            <div>
              <label className="text-gray-500 text-xs font-medium block mb-1">Savings Goal Amount ({profile.currency})</label>
              <input type="number" value={profile.savingsGoal||''} onChange={e=>setProfile({...profile,savingsGoal:parseFloat(e.target.value)||0})}
                placeholder="Target amount" className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-teal-500"/>
            </div>
            <div>
              <label className="text-gray-500 text-xs font-medium block mb-2">Weekly Goals</label>
              {(profile.weeklyGoals||[]).map((g: string, i: number) => (
                <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2 mb-2">
                  <span className="text-gray-700 text-sm">{g}</span>
                  <button onClick={() => setProfile({...profile, weeklyGoals: (profile.weeklyGoals||[]).filter((_: string, j: number) => j !== i)})}
                    className="text-slate-300 text-lg leading-none">×</button>
                </div>
              ))}
              <WeeklyGoalAdder onAdd={(g: string) => setProfile({...profile, weeklyGoals: [...(profile.weeklyGoals||[]), g]})} />
            </div>

            {/* ── Security ── */}
            <SecuritySection profile={profile} setProfile={setProfile} saveProfile={data.saveProfile}/>

            {/* ── Notifications ── */}
            <div className="mt-6">
              <p className="text-gray-500 text-xs font-medium mb-3 uppercase tracking-wider">Push Notifications</p>

              {/* Motivations toggle */}
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="text-gray-800 text-sm font-medium">My Motivations</p>
                  <p className="text-gray-400 text-xs">Daily quotes from your motivations list</p>
                </div>
                <button onClick={() => setProfile({...profile, notificationSettings: {...(profile.notificationSettings||DEFAULT_NS), motivations: !(profile.notificationSettings?.motivations)}})}
                  className={`w-12 h-6 rounded-full transition-colors ${profile.notificationSettings?.motivations ? 'bg-teal-500' : 'bg-gray-200'} flex items-center px-1`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${profile.notificationSettings?.motivations ? 'translate-x-6' : 'translate-x-0'}`}/>
                </button>
              </div>

              {/* Reminders toggle */}
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="text-gray-800 text-sm font-medium">Reminders</p>
                  <p className="text-gray-400 text-xs">Check-in nudges and streak reminders</p>
                </div>
                <button onClick={() => setProfile({...profile, notificationSettings: {...(profile.notificationSettings||DEFAULT_NS), reminders: !(profile.notificationSettings?.reminders)}})}
                  className={`w-12 h-6 rounded-full transition-colors ${profile.notificationSettings?.reminders ? 'bg-teal-500' : 'bg-gray-200'} flex items-center px-1`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${profile.notificationSettings?.reminders ? 'translate-x-6' : 'translate-x-0'}`}/>
                </button>
              </div>

              {/* Milestones toggle */}
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="text-gray-800 text-sm font-medium">Milestone Alerts</p>
                  <p className="text-gray-400 text-xs">1d, 7d, 14d, 30d, 60d, 90d, 180d, 1yr</p>
                </div>
                <button onClick={() => setProfile({...profile, notificationSettings: {...(profile.notificationSettings||DEFAULT_NS), milestones: !(profile.notificationSettings?.milestones)}})}
                  className={`w-12 h-6 rounded-full transition-colors ${profile.notificationSettings?.milestones ? 'bg-teal-500' : 'bg-gray-200'} flex items-center px-1`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${profile.notificationSettings?.milestones ? 'translate-x-6' : 'translate-x-0'}`}/>
                </button>
              </div>

              {/* Time pickers — only show if motivations or reminders on */}
              {(profile.notificationSettings?.motivations || profile.notificationSettings?.reminders) && (
                <div className="mt-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-800 text-sm font-medium">Morning notification</p>
                      <p className="text-gray-400 text-xs">First daily notification</p>
                    </div>
                    <input type="time"
                      value={profile.notificationSettings?.morningTime || '08:00'}
                      onChange={e => setProfile({...profile, notificationSettings: {...(profile.notificationSettings||DEFAULT_NS), morningTime: e.target.value}})}
                      className="bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-teal-500"/>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-800 text-sm font-medium">Evening notification</p>
                      <p className="text-gray-400 text-xs">Second daily notification</p>
                    </div>
                    <input type="time"
                      value={profile.notificationSettings?.eveningTime || '19:00'}
                      onChange={e => setProfile({...profile, notificationSettings: {...(profile.notificationSettings||DEFAULT_NS), eveningTime: e.target.value}})}
                      className="bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-teal-500"/>
                  </div>
                </div>
              )}
            </div>
            <button onClick={()=>save(profile)} className={`w-full py-3 rounded-xl font-semibold text-sm ${saved?'bg-green-500':'bg-teal-600'} text-white transition-colors`}>
              {saved?'✓ Saved!':'Save All Changes'}
            </button>
          </section>
        )}

        {/* Savings Goal */}
        <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Savings Goal</h2>
          {profile.savingsGoalName && savingsGoal > 0 ? (
            <div>
              <div className="flex justify-between items-end mb-2">
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{profile.savingsGoalName}</p>
                  <p className="text-xs text-gray-500">Target: {profile.currency}{savingsGoal.toLocaleString()}</p>
                </div>
                <span className="text-lg font-bold text-teal-600">{goalProgress.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-teal-500 h-3 rounded-full transition-all duration-1000" style={{width:`${goalProgress}%`}}/>
              </div>
              <p className="text-xs text-gray-400 mt-2">{profile.currency}{moneySaved.toFixed(2)} saved of {profile.currency}{savingsGoal}</p>
            </div>
          ) : (
            <div className="text-center py-2">
              <p className="text-sm text-gray-500 mb-2">No savings goal set yet.</p>
              <button onClick={()=>setShowEdit(true)} className="text-teal-600 text-sm font-medium">Set a Goal →</button>
            </div>
          )}
        </section>

        {/* Emergency Contact */}
        <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Emergency Contact</h2>
          {profile.emergencyContact?.name && profile.emergencyContact?.phone ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800">{profile.emergencyContact.name}</p>
                <p className="text-sm text-gray-500">{profile.emergencyContact.phone}</p>
              </div>
              <a href={`tel:${profile.emergencyContact.phone}`} className="bg-rose-100 text-rose-600 p-3 rounded-full hover:bg-rose-200 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
              </a>
            </div>
          ) : (
            <div className="text-center py-2">
              <p className="text-sm text-gray-500 mb-2">No emergency contact set.</p>
              <button onClick={()=>setShowEdit(true)} className="text-teal-600 text-sm font-medium">Add Contact →</button>
            </div>
          )}
        </section>

        {/* Menu rows */}
        <section className="space-y-3">
          {menuRows.map(item=>(
            <button key={item.label} onClick={item.action}
              className="w-full bg-white p-4 rounded-2xl shadow-sm flex items-center text-left transition-transform duration-200 active:scale-95 border border-gray-100">
              <div className="bg-gray-100 p-2 rounded-full mr-4 text-gray-600 flex-shrink-0">{item.icon}</div>
              <span className="font-semibold text-gray-700 flex-1">{item.label}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          ))}
        </section>

        {/* Voice Settings */}
        <VoiceCard/>

        {/* Danger Zone */}
        <div className="mt-4 pt-6 border-t border-gray-200">
          <h3 className="text-xs font-bold text-center text-slate-400 uppercase tracking-wider mb-3">Danger Zone</h3>
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-3 text-amber-800 text-xs leading-relaxed">
            <strong className="font-semibold">If you had a slip,</strong> use <em>I had a slip</em> in your journey card above — it keeps your data and your history. The button below is only for a clean wipe.
          </div>
          <button onClick={()=>setShowReset(true)}
            className="w-full bg-rose-50 border border-rose-200 text-rose-600 p-4 rounded-2xl flex items-center text-left hover:bg-rose-100 transition-colors active:scale-95">
            <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center mr-3 flex-shrink-0">
              <IconReset size={18} color="#e11d48"/>
            </div>
            <div>
              <span className="font-semibold block">Erase All Data</span>
              <span className="text-sm text-rose-500">Permanently delete everything — journal, vision board, streak, slips. Cannot be undone.</span>
            </div>
          </button>
        </div>

        <div className="text-center text-xs text-gray-400 pb-4">
          <p>Journey Forward · Version 1.0.1</p>
        </div>

        {showReset && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-6">
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl space-y-4">
              <div className="text-slate-900 text-lg font-bold text-center">Erase everything?</div>
              <p className="text-slate-600 text-sm text-center leading-relaxed">This permanently deletes <strong>everything</strong>: your streak, journal, vision board, slip log, gratitude entries — all of it. There is no recovery from this.</p>
              <p className="text-slate-500 text-xs text-center italic">If you slipped, please use <em>I had a slip</em> instead — that preserves your story.</p>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={()=>setShowReset(false)} className="py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold">Cancel</button>
                <button onClick={resetAll} className="py-3 rounded-xl bg-rose-500 text-white font-semibold">Yes, erase</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// JournalScreen now lives in ./components/JournalScreen.tsx (tabbed: Journal /
// Affirmations / Daily Zen / Vision Board).

// ── Nav ────────────────────────────────────────────────────────────────────────
const NAV = [
  {key:'home',icon:'home',label:'Home'},
  {key:'progress',icon:'progress',label:'Progress'},
  {key:'journal',icon:'journal',label:'Journal'},
  {key:'settings',icon:'profile',label:'Profile'},
] as const;

// LockScreen and SafetyModal are imported from ./components/

// ── Root App ───────────────────────────────────────────────────────────────────
export default function App() {
  const data = useAppData();
  const [screen, setScreen] = useState<Screen>('home');
  const [subScreen, setSubScreen] = useState<string>('');
  const [isLocked, setIsLocked] = useState(false);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const soberDays = useMemo(() => data.getSoberStats()?.days ?? 0, [data.profile?.soberDate]);

  // Resolve effective lock method (handles legacy biometricEnabled flag)
  const lockMethod: 'none' | 'biometric' | 'pin' = useMemo(() => {
    const p = data.profile;
    if (!p) return 'none';
    if (p.lockMethod) return p.lockMethod;
    if (p.biometricEnabled) return 'biometric';
    return 'none';
  }, [data.profile]);

  // Lock the app when profile loads with a lock method
  useEffect(() => {
    if (data.loaded && lockMethod !== 'none') {
      setIsLocked(true);
    }
  }, [data.loaded, lockMethod]);

  // One-shot migration: remove any ElevenLabs keys that may have been stored
  // during the brief period it was available. The feature is gone; leaving
  // orphaned keys in storage would be misleading.
  useEffect(() => {
    if (!data.loaded) return;
    (async () => {
      const { storageGet, storageRemove } = await import('./utils/storage');
      if (await storageGet('elevenLabsKey')) {
        await storageRemove('elevenLabsKey');
        await storageRemove('elevenLabsVoice');
      }
    })();
  }, [data.loaded]);

  // Show the safety modal once — after the first post-onboarding launch.
  // We store a flag so it never fires again after dismissal.
  useEffect(() => {
    if (!data.loaded || !data.profile || isLocked) return;
    (async () => {
      const { storageGet } = await import('./utils/storage');
      const seen = await storageGet('safetyDismissed');
      if (!seen) setShowSafetyModal(true);
    })();
  }, [data.loaded, data.profile, isLocked]);

  async function dismissSafetyModal(goCrisis = false) {
    const { storageSet } = await import('./utils/storage');
    await storageSet('safetyDismissed', '1');
    setShowSafetyModal(false);
    if (goCrisis) { setSubScreen(''); setScreen('crisis'); }
  }

  // Scroll all internal scroll containers to the top whenever we navigate.
  // Without this, switching tabs preserves the previous screen's scroll
  // position — which on re-open made the app appear to load at the bottom.
  useEffect(() => {
    // Defer one frame so the new screen's DOM has mounted.
    const id = requestAnimationFrame(() => {
      document.querySelectorAll<HTMLElement>('.overflow-y-auto, .overflow-auto').forEach(el => {
        el.scrollTop = 0;
      });
      window.scrollTo(0, 0);
    });
    return () => cancelAnimationFrame(id);
  }, [screen, subScreen]);


  // Schedule notifications whenever profile loads or changes
  useEffect(() => {
    if (!data.profile?.notificationSettings) return;
    const anyOn = data.profile.notificationSettings.motivations ||
                  data.profile.notificationSettings.reminders;
    if (!anyOn) return;
    requestPermission().then(granted => {
      if (granted && data.profile) {
        scheduleAll(data.profile, data.reasons || []);
      }
    });
  }, [data.profile, data.reasons]);

  // Fire a milestone notification when a tier is freshly crossed. We persist
  // which tiers have fired so they don't re-fire on every cold launch.
  useEffect(() => {
    if (!data.loaded || !data.profile) return;
    if (!data.profile.notificationSettings?.milestones) return;
    const stats = data.getSoberStats();
    const days = stats?.days || 0;
    const moneySaved = stats?.moneySaved || 0;
    const currency = data.profile.currency || '$';

    const firedDays = data.profile.firedMilestoneDays ?? [];
    const firedTiers = data.profile.firedSavingsTiers ?? [];

    const MILESTONE_DAYS = [1, 7, 14, 30, 60, 90, 180, 365, 730, 1095];
    const SAVINGS_TIERS  = [50, 100, 250, 500, 1000, 2500, 5000, 10000];

    let needsSave = false;
    let updated = { ...data.profile };

    for (const m of MILESTONE_DAYS) {
      if (days >= m && !firedDays.includes(m)) {
        fireMilestone(m);
        updated.firedMilestoneDays = [...(updated.firedMilestoneDays ?? []), m];
        needsSave = true;
      }
    }

    if (data.profile.dailySpend > 0) {
      for (const t of SAVINGS_TIERS) {
        if (moneySaved >= t && !firedTiers.includes(t)) {
          fireSavingsMilestone(t, currency);
          updated.firedSavingsTiers = [...(updated.firedSavingsTiers ?? []), t];
          needsSave = true;
        }
      }
    }

    if (needsSave) data.saveProfile(updated);
  }, [data.loaded, soberDays]);


  function navigate(s: string) {
    if (s==='emergency_cbt') {
      setSubScreen(''); setScreen('cbt');
    } else if (s==='emergency_breathing') {
      setSubScreen('breathing'); setScreen('emergency');
    } else if (s==='emergency_meditation') {
      setSubScreen('meditation'); setScreen('emergency');
    } else if (s==='motivation') {
      setSubScreen('motivation'); setScreen('settings');
    } else if (s==='weeklygoals') {
      setSubScreen('weeklygoals'); setScreen('settings');
    } else if (s==='history') {
      setSubScreen(''); setScreen('history');
    } else if (s==='mindfulness'||s==='tape_forward'||s==='urge_timer'||s==='halt') {
      setSubScreen(s); setScreen('emergency');
    } else {
      setSubScreen(''); setScreen(s as Screen);
    }
  }

  if (!data.loaded) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center"><div className="text-4xl mb-3">🌱</div><div className="text-slate-400 text-sm">Loading your journey...</div></div>
    </div>
  );

  if (isLocked && lockMethod !== 'none') {
    return <LockScreen method={lockMethod === 'pin' ? 'pin' : 'biometric'} onUnlocked={() => setIsLocked(false)}/>;
  }

  if (!data.profile) return <Onboarding onComplete={data.saveProfile}/>;

  const stats = data.getSoberStats();
  const heatmapData = data.getHeatmapData();

  if (screen==='emergency') return <EmergencyKit profile={data.profile} soberDays={stats?.days||0} reasons={data.reasons}
    onLogCraving={(intensity)=>data.addCraving({id:Date.now().toString(),timestamp:new Date().toISOString(),intensity:intensity as any,duration:3,overcome:true})}
    onNavigatePuzzle={()=>{ setSubScreen(''); setScreen('puzzle'); }}
    initialTab={subScreen as any || 'home'}
    onBack={()=>{ setSubScreen(''); setScreen('home'); }}/>;
  if (screen==='heatmap') return <Heatmap data={heatmapData} soberDate={data.profile.soberDate} onBack={()=>setScreen('home')}/>;
  if (screen==='backup') return <BackupScreen onBack={()=>setScreen('settings')} onRestored={()=>{data.reload();setScreen('home');}}/>;
  if (screen==='history') return <HistoryScreen cravings={data.cravings} thoughts={data.thoughts} activities={data.activities} sleep={data.sleep} journal={data.journal} gratitude={data.gratitude||[]} onBack={()=>setScreen('settings')} onDelete={(type,id)=>data.deleteEntry(type,id)}/>;
  if (screen==='milestone') return <MilestoneScreen profile={data.profile} soberDays={stats?.days||0} moneySaved={stats?.moneySaved||0} onBack={()=>setScreen('home')}/>;
  if (screen==='recovery') return <RecoveryTimeline soberDays={stats?.days||0} soberHours={(stats?.hours||0)+(stats?.minutes||0)/60} onBack={()=>setScreen('home')}/>;
  if (screen==='insights') return <InsightsScreen cravings={data.cravings} thoughts={data.thoughts} sleep={data.sleep} activities={data.activities} onAddSleep={data.addSleep} onBack={()=>setScreen('home')} soberDays={stats?.days||0}/>;
  if (screen==='puzzle') return <PuzzleScreen onBack={()=>setScreen('home')} completedDays={data.completedDays} onToggleDay={data.toggleDay}/>;
  if (screen==='cbt') return <CBTScreen onBack={()=>setScreen('home')}/>;
  if (screen==='groups') return <RecoveryGroupsScreen onBack={()=>setScreen('settings')}/>;
  if (screen==='crisis') return <CrisisScreen onBack={()=>setScreen('settings')}/>;
  if (screen==='privacy') return <PrivacyPolicyScreen onBack={()=>setScreen('settings')}/>;
  if (screen==='slip' && data.profile) return <SlipScreen
    currentSoberDate={data.profile.soberDate}
    onConfirm={async (slipData) => {
      await data.recordSlip(slipData);
      setScreen('settings');
    }}
    onCancel={()=>setScreen('settings')}/>;
  if (screen==='sliplog') return <SlipLogScreen
    slips={data.slips}
    onBack={()=>setScreen('settings')}
    onDelete={data.deleteSlip}
    onUpdateReflection={data.updateSlipReflection}/>;

  // Settings sub-screens
  if (screen==='settings' && subScreen==='motivation') return <MyMotivation
    onBack={() => { setSubScreen(''); setScreen('settings'); }}
    saveReasons={data.saveReasons}
    initialReasons={data.reasons}
  />;

  if (screen==='settings' && subScreen==='weeklygoals') return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="bg-white border-b border-slate-100 px-4 py-4 flex items-center gap-3">
        <BackButton onClick={()=>{setSubScreen('');setScreen('settings');}} />
        <div>
          <div className="text-slate-800 font-bold">Weekly Goals</div>
          <div className="text-slate-400 text-xs">Track your weekly commitments</div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3">
        <p className="text-slate-500 text-sm">These goals appear on your home screen each week. Tap to check them off as you complete them.</p>
        {(data.profile?.weeklyGoals||[]).map((g,i) => (
          <div key={i} className="bg-white rounded-2xl px-4 py-3 border border-slate-100 shadow-sm flex items-center justify-between">
            <span className="text-slate-700 text-sm">{g}</span>
            <button onClick={async()=>{
              const updated = (data.profile?.weeklyGoals||[]).filter((_,j)=>j!==i);
              await data.saveProfile({...data.profile!, weeklyGoals: updated});
            }} className="text-slate-300 hover:text-red-400 text-lg w-8 h-8 flex items-center justify-center">✕</button>
          </div>
        ))}
        {(data.profile?.weeklyGoals||[]).length === 0 && (
          <div className="text-slate-400 text-sm text-center py-6">No goals yet — add one below</div>
        )}
        <WeeklyGoalAdder onAdd={async(g:string)=>{
          const updated = [...(data.profile?.weeklyGoals||[]), g];
          await data.saveProfile({...data.profile!, weeklyGoals: updated});
        }}/>
      </div>
    </div>
  );
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto">
      {showSafetyModal && (
        <SafetyModal
          onDismiss={() => dismissSafetyModal(false)}
          onViewLines={() => dismissSafetyModal(true)}
        />
      )}
      <div className="flex-1 overflow-hidden" style={{paddingBottom:'72px'}}>
        {screen==='home' && <HomeScreen data={data} onNavigate={navigate}/>}
        {screen==='progress' && <ProgressScreen
          soberDays={stats?.days||0} soberHours={stats?.hours||0} soberMinutes={stats?.minutes||0}
          moneySaved={stats?.moneySaved||0} currency={data.profile.currency}
          cravings={data.cravings} thoughts={data.thoughts} journal={data.journal} sleep={data.sleep}
          activities={data.activities} soberDate={data.profile.soberDate}/>}
        {screen==='journal' && <JournalScreen
          username={data.profile.username || 'Friend'}
          journal={data.journal}
          saveJournal={data.saveJournal}
          gratitude={data.gratitude}
          addGratitude={data.addGratitude}
          visionBoards={data.visionBoards}
          saveVisionBoards={data.saveVisionBoards}
          affirmationFavs={data.affirmationFavs}
          saveAffirmationFavs={data.saveAffirmationFavs}
          soberDays={stats?.days || 0}
        />}
        {screen==='settings' && <ProfileScreen data={data} onNavigate={navigate as any}/>}
      </div>
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/95 backdrop-blur border-t border-slate-100 z-40"
        style={{paddingBottom:'env(safe-area-inset-bottom)'}}>
        <div className="flex">
          {NAV.map(item=>(
            <button key={item.key} onClick={()=>{setSubScreen('');setScreen(item.key as Screen);}}
              className={`flex-1 flex flex-col items-center py-3 gap-1 transition-colors ${screen===item.key?'text-teal-500':'text-slate-400'}`}>
              {item.key==='home' && <IconHome size={22} color={screen===item.key?'#0d9488':'#94a3b8'}/>}
              {item.key==='progress' && <IconProgress size={22} color={screen===item.key?'#0d9488':'#94a3b8'}/>}
              {item.key==='journal' && <IconJournal size={22} color={screen===item.key?'#0d9488':'#94a3b8'}/>}
              {item.key==='settings' && <IconProfile size={22} color={screen===item.key?'#0d9488':'#94a3b8'}/>}
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
