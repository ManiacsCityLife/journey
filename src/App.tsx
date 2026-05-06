import React, { useState, useEffect, useRef } from 'react';
import { useAppData } from './hooks/useAppData';
import { startListening, stopListening } from './utils/speech';
import { scheduleAll, fireMilestone, fireSavingsMilestone, requestPermission } from './utils/notifications';
import { isBiometricAvailable, authenticateBiometric } from './utils/biometric';
import SoberBuddyChat from './components/SoberBuddyChat';
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
import type { Screen, UserProfile } from './types';
import './index.css';
import { IconHome, IconProgress, IconHeart, IconJournal, IconProfile, IconShield, IconWind, IconLeaf, IconBrain, IconAnchor, IconWave, IconChat, IconRun, IconMoon, IconMilestone, IconBody, IconPuzzle, IconCompass, IconCloud, IconCoin, IconFlame, IconCheck, IconTimer, IconPhone, IconStar, IconTarget, IconChevron, IconWarning, IconReset, IconHistory, IconGratitude } from './components/Icons';

// ── 60 Quotes ─────────────────────────────────────────────────────────────────
const QUOTES = [
  "Every day sober is a victory worth celebrating.",
  "You are not giving something up. You are gaining everything.",
  "The cravings will pass, whether you drink or not.",
  "Sobriety is a journey, not a destination.",
  "Your future self is cheering you on right now.",
  "One day at a time is all you need.",
  "Strength is choosing to fight when it would be easier not to.",
  "You have survived 100% of your hardest days.",
  "Recovery is not a sign of weakness. It is the ultimate act of strength.",
  "The best thing you can do for the people you love is to get better.",
  "Your story isn't over. The best chapters are still being written.",
  "Be patient with yourself. Healing takes time.",
  "You are not alone in this fight.",
  "Every craving you survive makes you stronger.",
  "The person you are becoming is worth the discomfort.",
  "Sober and present is a gift — to yourself and everyone around you.",
  "Small progress is still progress.",
  "You didn't come this far to only come this far.",
  "The hardest step is the one you take right now.",
  "What you do today is building who you become tomorrow.",
  "Alcohol was never the solution. It was the problem wearing a mask.",
  "You are rewriting your story with every sober hour.",
  "Your brain is healing. Your body is healing. Keep going.",
  "The version of you that drinks is not the real you.",
  "You deserve a life that doesn't require numbing.",
  "Every morning you wake up sober is a win. Full stop.",
  "The uncomfortable feelings won't kill you. Drinking might.",
  "You are someone's reason to keep going.",
  "Clarity is your superpower now.",
  "Freedom from alcohol is freedom to live fully.",
  "The craving is a liar. It promises relief and delivers regret.",
  "One sober day builds the foundation for a hundred more.",
  "Your sobriety is the greatest gift you'll ever give yourself.",
  "Feel everything. You are strong enough.",
  "Recovery means showing up for yourself, every single day.",
  "The fog is lifting. What's ahead is worth seeing clearly.",
  "You chose hard today. The easy choice would have cost you everything.",
  "Drinking steals your tomorrows. Sobriety gives them back.",
  "You are not missing out. You are opting in — to your real life.",
  "Every sober night of sleep is your body saying thank you.",
  "Courage is not the absence of fear. It's doing it anyway.",
  "There is no rock bottom if you stop digging now.",
  "The people who love you want you present, not perfect.",
  "Your past does not define you. Your choices today do.",
  "Trust the process even when you can't see the progress.",
  "You are building something that can never be taken from you.",
  "Being sober is not a punishment. It is a privilege.",
  "The version of you sober is the one the world needs.",
  "You are allowed to be proud of yourself today.",
  "Recovery is hard. Regret is harder. Choose the hard that builds you.",
  "Sobriety doesn't remove your problems. It gives you the tools to face them.",
  "Your nervous system is healing. Let it.",
  "The urge will peak and then fall. Just outlast it.",
  "You are not white-knuckling through life. You are reclaiming it.",
  "Alcohol promised you everything and delivered nothing. Remember that.",
  "The person you are now would amaze the person you were then.",
  "Every breath you take sober is your body restoring itself.",
  "You are worthy of the life sobriety opens up.",
  "Don't negotiate with cravings. They are not your friends.",
  "Today's struggle is tomorrow's strength.",
  "You are doing something extraordinary. Don't forget that.",
];

function getDailyQuote() {
  const day = Math.floor(Date.now() / 86400000);
  return QUOTES[day % QUOTES.length];
}

// ── 50 Daily Missions ─────────────────────────────────────────────────────────
const MISSION_POOL = [
  { id: 'm1',  icon: '🚶', text: 'Go for a 10-minute walk outside' },
  { id: 'm2',  icon: '📞', text: 'Text or call a friend or family member' },
  { id: 'm3',  icon: '📖', text: 'Read one of your reasons to quit' },
  { id: 'm4',  icon: '💧', text: 'Drink 3 glasses of water today' },
  { id: 'm5',  icon: '🧘', text: 'Do 5 minutes of deep breathing' },
  { id: 'm6',  icon: '✍️', text: 'Write one thing you\'re grateful for today' },
  { id: 'm7',  icon: '🍎', text: 'Eat a healthy meal without skipping' },
  { id: 'm8',  icon: '😴', text: 'Be in bed by 10pm tonight' },
  { id: 'm9',  icon: '🏃', text: 'Do 10 minutes of physical exercise' },
  { id: 'm10', icon: '🧹', text: 'Tidy one area of your home' },
  { id: 'm11', icon: '🌞', text: 'Step outside and get some fresh air' },
  { id: 'm12', icon: '💬', text: 'Share how you\'re feeling with someone you trust' },
  { id: 'm13', icon: '🎵', text: 'Listen to music that lifts your mood' },
  { id: 'm14', icon: '📝', text: 'Write a journal entry, even just two lines' },
  { id: 'm15', icon: '🤝', text: 'Do something kind for someone else today' },
  { id: 'm16', icon: '🧠', text: 'Complete a CBT exercise in the Emergency Kit' },
  { id: 'm17', icon: '🌿', text: 'Spend 10 minutes in a green space or park' },
  { id: 'm18', icon: '📵', text: 'Take a 1-hour break from social media' },
  { id: 'm19', icon: '🛁', text: 'Take a shower and get fully dressed today' },
  { id: 'm20', icon: '⭐', text: 'Say one positive affirmation out loud' },
  { id: 'm21', icon: '🍵', text: 'Make yourself a calming herbal tea' },
  { id: 'm22', icon: '🌅', text: 'Watch the sunrise or sunset today' },
  { id: 'm23', icon: '📚', text: 'Read 10 pages of a book' },
  { id: 'm24', icon: '🎨', text: 'Do something creative — draw, doodle, colour' },
  { id: 'm25', icon: '🧗', text: 'Do something that scares you just a little' },
  { id: 'm26', icon: '💌', text: 'Write a short letter to your future sober self' },
  { id: 'm27', icon: '🙏', text: 'Spend 5 minutes in quiet meditation or prayer' },
  { id: 'm28', icon: '🥗', text: 'Eat one piece of fruit or vegetable extra today' },
  { id: 'm29', icon: '🎯', text: 'Set one small goal for tomorrow and write it down' },
  { id: 'm30', icon: '🌊', text: 'Try urge surfing — ride a craving without acting on it' },
  { id: 'm31', icon: '🏊', text: 'Do 20 minutes of any physical activity you enjoy' },
  { id: 'm32', icon: '📷', text: 'Take a photo of something beautiful today' },
  { id: 'm33', icon: '💪', text: 'Do 10 push-ups or sit-ups' },
  { id: 'm34', icon: '🗣️', text: 'Tell someone you trust how your recovery is going' },
  { id: 'm35', icon: '🌱', text: 'Do one thing today your sober self would be proud of' },
  { id: 'm36', icon: '🤲', text: 'Ask for help with something — don\'t do it alone' },
  { id: 'm37', icon: '🎭', text: 'Watch something that makes you laugh out loud' },
  { id: 'm38', icon: '🧩', text: 'Play a game — puzzle, cards, phone game' },
  { id: 'm39', icon: '🌍', text: 'Learn one new fact about alcohol recovery today' },
  { id: 'm40', icon: '🛏️', text: 'Take a 20-minute nap if you\'re tired — rest is recovery' },
  { id: 'm41', icon: '💡', text: 'Identify one trigger today and write down how to handle it' },
  { id: 'm42', icon: '🔔', text: 'Set a daily reminder to check in with yourself' },
  { id: 'm43', icon: '🌺', text: 'Buy yourself a small treat — something non-alcoholic' },
  { id: 'm44', icon: '🏡', text: 'Spend quality time at home doing something you enjoy' },
  { id: 'm45', icon: '📿', text: 'Repeat your primary reason to stay sober 3 times today' },
  { id: 'm46', icon: '🦶', text: 'Walk barefoot on grass for 5 minutes — grounding exercise' },
  { id: 'm47', icon: '🔥', text: 'Complete the urge survival timer in the Emergency Kit' },
  { id: 'm48', icon: '🌙', text: 'Write down 3 things that went well today before bed' },
  { id: 'm49', icon: '🤗', text: 'Give someone a genuine compliment today' },
  { id: 'm50', icon: '🏆', text: 'Remind yourself: I am proud of how far I have come' },
];

// ── Onboarding ─────────────────────────────────────────────────────────────────
function Onboarding({ onComplete }: { onComplete: (p: UserProfile) => void }) {
  const [step, setStep] = useState<'name' | 'details'>('name');
  const [name, setName] = useState('');
  const [soberDate, setSoberDate] = useState(() => new Date().toISOString().slice(0, 16));
  const [spend, setSpend] = useState('');
  const [currency, setCurrency] = useState('R');
  const [goalName, setGoalName] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [weeklyGoals, setWeeklyGoals] = useState<string[]>([]);
  const [weeklyGoalInput, setWeeklyGoalInput] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  function addWeeklyGoal() {
    if (!weeklyGoalInput.trim()) return;
    setWeeklyGoals(prev => [...prev, weeklyGoalInput.trim()]);
    setWeeklyGoalInput('');
  }

  function finishDetails() {
    onComplete({
      username: name.trim(),
      soberDate,
      dailySpend: parseFloat(spend) || 0,
      currency,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      pledgeStreak: 0, lastPledgeDate: '',
      savingsGoalName: goalName.trim() || undefined,
      savingsGoal: parseFloat(goalAmount) || undefined,
      weeklyGoals: weeklyGoals.length > 0 ? weeklyGoals : undefined,
      emergencyContact: emergencyName.trim() ? { name: emergencyName.trim(), phone: emergencyPhone.trim() } : undefined,
    });
  }

  if (step === 'name') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-teal-500 flex items-center justify-center text-2xl mx-auto mb-4">⭐</div>
            <h1 className="text-slate-800 text-3xl font-bold">The Journey Forward</h1>
            <p className="text-slate-400 text-sm mt-2">Your daily companion to clarity, confidence, and control.</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
            <div>
              <label className="text-slate-600 text-sm font-medium block mb-2">What should we call you?</label>
              <input autoFocus value={name} onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && name.trim() && setStep('details')}
                placeholder="e.g., Alex"
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500 text-sm" />
            </div>
            <button onClick={() => name.trim() && setStep('details')} disabled={!name.trim()}
              className="w-full py-4 rounded-xl bg-teal-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-base">
              Next →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="px-6 pt-8 pb-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Update Your Details</h2>
            <p className="text-slate-500 text-sm mt-1">Update your information below.</p>
          </div>
          <button onClick={() => setStep('name')} className="text-slate-400 text-xl p-1">✕</button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-6 pb-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
          <input value={name} onChange={e => setName(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-800 text-sm outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">My sobriety start date & time</label>
          <input type="datetime-local" value={soberDate} onChange={e => setSoberDate(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-800 text-sm outline-none focus:ring-2 focus:ring-teal-500 bg-white" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Avg. Daily Spend</label>
            <input type="number" value={spend} onChange={e => setSpend(e.target.value)}
              placeholder="e.g., 15" min="0" step="0.01"
              className="w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-800 text-sm outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
            <select value={currency} onChange={e => setCurrency(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-800 text-sm outline-none bg-white">
              {[['R','ZAR'],['$','USD'],['£','GBP'],['€','EUR'],['A$','AUD'],['NZ$','NZD']].map(([sym,code]) => (
                <option key={sym} value={sym}>{code}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="border-t border-slate-100" />
        <div>
          <p className="font-bold text-slate-800 mb-3">Savings Goal <span className="font-normal text-slate-400">(Optional)</span></p>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Goal Name</label>
              <input value={goalName} onChange={e => setGoalName(e.target.value)}
                placeholder="e.g., New Laptop"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 text-sm outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Target Amount</label>
              <input type="number" value={goalAmount} onChange={e => setGoalAmount(e.target.value)}
                placeholder="e.g., 1000" min="0"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 text-sm outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
          </div>
        </div>
        <div className="border-t border-slate-100" />
        <div>
          <p className="font-bold text-slate-800 mb-3">Weekly Goals</p>
          {weeklyGoals.map((g, i) => (
            <div key={i} className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2 mb-2">
              <span className="text-slate-700 text-sm">{g}</span>
              <button onClick={() => setWeeklyGoals(prev => prev.filter((_, j) => j !== i))} className="text-slate-300 text-lg leading-none">×</button>
            </div>
          ))}
          <div className="flex gap-2">
            <input value={weeklyGoalInput} onChange={e => setWeeklyGoalInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addWeeklyGoal()}
              placeholder="e.g., Go to the gym 3 times"
              className="flex-1 px-4 py-3 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 text-sm outline-none focus:ring-2 focus:ring-teal-500" />
            <button onClick={addWeeklyGoal}
              className="px-5 py-3 bg-teal-100 text-teal-700 font-bold rounded-xl text-sm">Add</button>
          </div>
        </div>
        <div className="border-t border-slate-100" />
        <div>
          <p className="font-bold text-slate-800 mb-3">Emergency Contact <span className="font-normal text-slate-400">(Optional)</span></p>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Trusted Friend or Sponsor Name</label>
              <input value={emergencyName} onChange={e => setEmergencyName(e.target.value)}
                placeholder="e.g., Jane Doe"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 text-sm outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
              <input type="tel" value={emergencyPhone} onChange={e => setEmergencyPhone(e.target.value)}
                placeholder="e.g., +1234567890"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 text-sm outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
          </div>
        </div>
        <button onClick={finishDetails}
          className="w-full py-4 rounded-xl bg-teal-600 text-white font-semibold text-base">
          Save Changes
        </button>
      </div>
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

// ── Forest Visual ──────────────────────────────────────────────────────────────
function getForestStage(soberDate: string): number {
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

function getForestInfo(stage: number) {
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
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <span className="text-slate-800 font-semibold text-sm">Complete your tasks</span>
        <div className="flex items-center gap-1">
          <span className={`text-sm font-bold ${doneCount===missions.length?'text-green-500':'text-teal-600'}`}>{doneCount} / {missions.length}</span>
          {doneCount===missions.length&&<span className="text-xs">🎉</span>}
        </div>
      </div>
      <div className="space-y-2">
        {missions.map(m=>{
          const done=completed.includes(m.id);
          return (
            <button key={m.id} onClick={()=>toggle(m.id)}
              className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all ${done?'bg-green-50 border border-green-100':'bg-slate-50 border border-slate-100'}`}>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${done?'bg-teal-500 border-teal-500':'border-slate-300'}`}>
                {done&&<span className="text-white text-xs">✓</span>}
              </div>
              <span className="text-lg">{m.icon}</span>
              <span className={`text-xs ${done?'text-slate-400 line-through':'text-slate-700'}`}>{m.text}</span>
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

function HomeScreen({ data, onNavigate }: { data: ReturnType<typeof useAppData>; onNavigate: (s: any) => void }) {
  const stats = useRealtimeStats(data.profile);
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number|null>(null);
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

  // Auto-flip carousel every 3 seconds
  useEffect(() => {
    const t = setInterval(() => setCarouselIdx(p => p === 0 ? 1 : 0), 3000);
    return () => clearInterval(t);
  }, []);

  async function savePledge() {
    if (!data.profile || !pledge.trim()) return;
    await data.saveProfile({...data.profile, lastPledgeDate: today, pledgeStreak:(data.profile.pledgeStreak||0)+1, lastPledgeText:pledge.trim()});
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
    else if (type==='activity') await data.addActivity({id:ts,timestamp:ts,activity:`${d.activity} — ${d.duration}min${d.distance?' · '+d.distance+d.unit:''}`});
    else if (type==='sleep') await data.addSleep({id:ts,date:today,hours:d.hours+(d.minutes||0)/60,quality:d.quality});
  }

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-ZA',{weekday:'long',day:'numeric',month:'long'});

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

      {/* Carousel — Money Saved / Time Sober */}
      <div className="relative"
        onTouchStart={e => setTouchStartX(e.touches[0].clientX)}
        onTouchEnd={e => {
          if (touchStartX === null) return;
          const diff = touchStartX - e.changedTouches[0].clientX;
          if (Math.abs(diff) > 40) setCarouselIdx(diff > 0 ? 1 : 0);
          setTouchStartX(null);
        }}
      >
        <div className="overflow-hidden rounded-3xl shadow-lg">
          {carouselIdx === 0 ? (
            <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-3xl p-5 text-white" style={{minHeight:'148px'}}>
              <div className="text-white/70 text-xs font-medium uppercase tracking-wider mb-1">💰 Money Saved</div>
              <div className="text-4xl font-bold mb-1 font-mono tracking-tight">
                {data.profile?.currency}{stats ? stats.moneySaved.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2}) : '0.00'}
              </div>
              <div className="flex gap-3 text-white/80 text-xs mb-2">
                <span>❤️ {stats?fmtNum(stats.heartbeats):'0'} beats</span>
                <span>💨 {stats?fmtNum(stats.breaths):'0'} breaths</span>
              </div>
              {savingsGoal && savingsGoal > 0 ? (
                <div className="mt-1">
                  <div className="flex justify-between text-white/60 text-xs mb-1">
                    <span>{data.profile?.savingsGoalName||'Savings Goal'}</span>
                    <span>{goalProgress.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-1.5">
                    <div className="bg-white rounded-full h-1.5 transition-all" style={{width:`${goalProgress}%`}}/>
                  </div>
                </div>
              ) : (
                <div className="mt-1 text-white/40 text-xs">No savings goal set</div>
              )}
            </div>
          ) : (
            <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-3xl p-5 text-white" style={{minHeight:'148px'}}>
              <div className="text-white/70 text-xs font-medium uppercase tracking-wider mb-1">⏱ Time Sober</div>
              <div className="text-3xl font-bold mb-2 font-mono tracking-tight">
                {stats ? `${stats.days}d ${String(stats.hours).padStart(2,'0')}h ${String(stats.minutes).padStart(2,'0')}m ${String(stats.seconds).padStart(2,'0')}s` : '0d 00h 00m 00s'}
              </div>
              <div className="flex gap-3 text-white/80 text-xs mb-2">
                <span>📅 {stats?.days||0} days</span>
                <span>🔥 {data.profile?.pledgeStreak||0} day pledge streak</span>
              </div>
              <div className="mt-1 text-white/40 text-xs">Every second counts 🌱</div>
            </div>
          )}
        </div>
        {/* Carousel dots */}
        <div className="flex justify-center gap-2 mt-2">
          {[0,1].map(i => (
            <button key={i} onClick={()=>setCarouselIdx(i)}
              className={`w-2 h-2 rounded-full transition-all ${carouselIdx===i?'bg-teal-500 w-4':'bg-slate-300'}`}/>
          ))}
        </div>

      </div>

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
            {gratitudeToday && (
              <div className="text-slate-400 text-xs italic mb-1">Yesterday: "{data.gratitude.find(g=>g.date===new Date(Date.now()-86400000).toISOString().split('T')[0])?.text || gratitudeToday.text}"</div>
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
      <WeeklyGoalsCard profile={data.profile} onSave={data.saveProfile} onEdit={()=>onNavigate('settings')} />

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

function MyMotivation({ onBack }: { onBack:()=>void }) {
  const [reasons, setReasons] = useState<string[]>([]);
  const [pros, setPros] = useState<string[]>([]);
  const [cons, setCons] = useState<string[]>([]);
  const [newReason, setNewReason] = useState('');
  const [newPro, setNewPro] = useState('');
  const [newCon, setNewCon] = useState('');

  useEffect(()=>{
    (async()=>{
      const {storageGet} = await import('./utils/storage');
      const [r,p,c] = await Promise.all([storageGet('motivation_reasons'),storageGet('motivation_pros'),storageGet('motivation_cons')]);
      if(r) setReasons(JSON.parse(r));
      if(p) setPros(JSON.parse(p));
      if(c) setCons(JSON.parse(c));
    })();
  },[]);

  async function add(list:string[],item:string,setter:(v:string[])=>void,key:string,clearInput:()=>void){
    if(!item.trim()) return;
    const next=[...list,item.trim()];
    setter(next);
    clearInput();
    const {storageSet} = await import('./utils/storage');
    await storageSet(key,JSON.stringify(next));
  }
  async function remove(list:string[],idx:number,setter:(v:string[])=>void,key:string){
    const next=list.filter((_,i)=>i!==idx);
    setter(next);
    const {storageSet} = await import('./utils/storage');
    await storageSet(key,JSON.stringify(next));
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="flex items-center gap-3 px-4 py-4 bg-white border-b border-slate-100">
        <button onClick={onBack} className="text-slate-400 text-xl">←</button>
        <div className="text-slate-800 font-bold">My Motivation</div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        <div className="text-center text-slate-500 text-sm px-4">Remind yourself why you started this journey. Your reasons are your anchor.</div>
        <MotivationSection title="My Reasons to Quit" items={reasons} newVal={newReason} setNew={setNewReason}
          onAdd={()=>add(reasons,newReason,setReasons,'motivation_reasons',()=>setNewReason(''))}
          onRemove={i=>remove(reasons,i,setReasons,'motivation_reasons')} placeholder="e.g., To be healthier"/>
        <MotivationSection title="Pros of Sobriety" items={pros} newVal={newPro} setNew={setNewPro}
          onAdd={()=>add(pros,newPro,setPros,'motivation_pros',()=>setNewPro(''))}
          onRemove={i=>remove(pros,i,setPros,'motivation_pros')} placeholder="e.g., More energy"/>
        <MotivationSection title="Cons I'm Leaving Behind" items={cons} newVal={newCon} setNew={setNewCon}
          onAdd={()=>add(cons,newCon,setCons,'motivation_cons',()=>setNewCon(''))}
          onRemove={i=>remove(cons,i,setCons,'motivation_cons')} placeholder="e.g., Feeling anxious"/>
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

// ── Profile Screen ─────────────────────────────────────────────────────────────
const DEFAULT_NS = { motivations: false, reminders: false, milestones: false, morningTime: '08:00', eveningTime: '19:00' };
function ProfileScreen({ data, onNavigate }: { data: ReturnType<typeof useAppData>; onNavigate: (s: Screen|'motivation'|'weeklygoals'|'history') => void }) {
  const [profile, setProfile] = useState(data.profile);
  const [showReset, setShowReset] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [saved, setSaved] = useState(false);
  const stats = useRealtimeStats(data.profile);

  async function save(p: UserProfile) {
    await data.saveProfile(p);
    setProfile(p);
    // Reschedule notifications with updated settings
    if (p.notificationSettings) {
      const granted = await requestPermission();
      if (granted) scheduleAll(p, data.reasons || []);
    }
    setSaved(true); setTimeout(()=>{setSaved(false);setShowEdit(false);},1500);
  }

  async function resetAll() {
    const {storageRemove,storageKeys} = await import('./utils/storage');
    const keys = await storageKeys();
    for (const k of keys) await storageRemove(k);
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
    {icon:<IconCloud size={22} color='#4a82a8'/>,label:'Backup & Restore',action:()=>onNavigate('backup')},
    {icon:<IconMilestone size={22} color='#b07840'/>,label:'Milestone Cards',action:()=>onNavigate('milestone')},
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
              <input type="datetime-local" value={profile.soberDate?.slice(0,16)} onChange={e=>setProfile({...profile,soberDate:e.target.value})}
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
            <div>
              <p className="text-gray-500 text-xs font-medium mb-3 uppercase tracking-wider">Security</p>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="text-gray-800 text-sm font-medium">Biometric Unlock</p>
                  <p className="text-gray-400 text-xs">Require Fingerprint/Face ID to open app</p>
                </div>
                <button onClick={async () => {
                  const enabled = !profile.biometricEnabled;
                  if (enabled) {
                    const success = await authenticateBiometric('Enable biometric unlock');
                    if (!success) return;
                  }
                  setProfile({...profile, biometricEnabled: enabled});
                }}
                  className={`w-12 h-6 rounded-full transition-colors ${profile.biometricEnabled ? 'bg-teal-500' : 'bg-gray-200'} flex items-center px-1`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${profile.biometricEnabled ? 'translate-x-6' : 'translate-x-0'}`}/>
                </button>
              </div>
            </div>

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

        {/* Danger Zone */}
        <div className="mt-4 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-bold text-center text-rose-600 mb-3">Danger Zone</h3>
          <button onClick={()=>setShowReset(true)}
            className="w-full bg-rose-50 border border-rose-200 text-rose-600 p-4 rounded-2xl flex items-center text-left hover:bg-rose-100 transition-colors active:scale-95">
            <span className="text-xl mr-4">🔄</span>
            <div>
              <span className="font-semibold block">Reset Progress</span>
              <span className="text-sm text-rose-500">This will permanently delete all your data.</span>
            </div>
          </button>
        </div>

        <div className="text-center text-xs text-gray-400 pb-4">
          <p>Journey Forward · Version 5.6</p>
        </div>

        {showReset && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl space-y-4">
              <div className="text-gray-800 text-lg font-bold text-center">Are you sure?</div>
              <p className="text-gray-500 text-sm text-center">This will permanently delete all your data including your streak, journal, and logs. This cannot be undone.</p>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={()=>setShowReset(false)} className="py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold">Cancel</button>
                <button onClick={resetAll} className="py-3 rounded-xl bg-red-500 text-white font-semibold">Yes, Reset</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Journal Screen ─────────────────────────────────────────────────────────────
function JournalScreen({ data }: { data: ReturnType<typeof useAppData> }) {
  const [text, setText] = useState('');
  const [mood, setMood] = useState<1|2|3|4|5>(3);
  const [isListening, setIsListening] = useState(false);
  const moodEmoji = ['😢','😟','😐','🙂','😊'];

  async function startVoice() {
    setIsListening(true);
    await startListening(
      (partial) => setText(partial),
      (final) => setText(final),
      () => setIsListening(false)
    );
  }
  async function stopVoice() { await stopListening(); setIsListening(false); }

  async function save() {
    if (!text.trim()) return;
    await data.saveJournal([{id:Date.now().toString(),date:new Date().toISOString(),text:text.trim(),mood,tags:[]}, ...data.journal]);
    setText('');
  }

  return (
    <div className="overflow-y-auto h-full px-4 py-6 space-y-4">
      <div className="text-slate-800 text-xl font-bold">Journal</div>
      <div className="bg-white rounded-2xl p-4 border border-slate-100 space-y-3">
        <div className="flex justify-between items-center">
          <div className="text-slate-400 text-xs uppercase tracking-wider">How are you feeling?</div>
          <div className="flex gap-2">
            {([1,2,3,4,5] as const).map(m=>(
              <button key={m} onClick={()=>setMood(m)} className={`text-xl transition-transform ${mood===m?'scale-125':'opacity-40'}`}>{moodEmoji[m-1]}</button>
            ))}
          </div>
        </div>
        <div className="relative">
          <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="What's on your mind today? Tap 🎤 to speak..." rows={4}
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl px-4 py-3 pr-12 text-sm resize-none outline-none focus:ring-1 focus:ring-teal-500"/>
          <button onClick={isListening?stopVoice:startVoice}
            className={`absolute bottom-3 right-3 w-9 h-9 rounded-full flex items-center justify-center text-base ${isListening?'bg-red-500 animate-pulse':'bg-teal-600'}`}>🎤</button>
        </div>
        {isListening&&<div className="flex items-center gap-2 text-red-500 text-xs"><div className="w-2 h-2 rounded-full bg-red-400 animate-pulse"/>Listening... tap mic to stop</div>}
        <button onClick={save} disabled={!text.trim()}
          className="w-full py-3 rounded-xl bg-teal-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-sm">Save Entry</button>
      </div>
      <div className="space-y-3">
        {data.journal.slice(0,20).map(e=>(
          <div key={e.id} className="bg-white rounded-2xl p-4 border border-slate-100">
            <div className="flex justify-between items-center mb-2">
              <div className="text-slate-400 text-xs">{new Date(e.date).toLocaleDateString('en-ZA',{weekday:'short',day:'numeric',month:'short'})}</div>
              <div className="text-lg">{moodEmoji[e.mood-1]}</div>
            </div>
            <div className="text-slate-700 text-sm leading-relaxed">{e.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Nav ────────────────────────────────────────────────────────────────────────
const NAV = [
  {key:'home',icon:'home',label:'Home'},
  {key:'progress',icon:'progress',label:'Progress'},
  {key:'buddy',icon:'buddy',label:'Buddy'},
  {key:'journal',icon:'journal',label:'Journal'},
  {key:'settings',icon:'profile',label:'Profile'},
] as const;

// ── Root App ───────────────────────────────────────────────────────────────────
export default function App() {
  const data = useAppData();
  const [screen, setScreen] = useState<Screen>('home');
  const [subScreen, setSubScreen] = useState<string>('');
  const [isLocked, setIsLocked] = useState(false);

  // Biometric Lock Check
  useEffect(() => {
    if (data.loaded && data.profile?.biometricEnabled) {
      setIsLocked(true);
      authenticateBiometric().then(success => {
        if (success) setIsLocked(false);
      });
    }
  }, [data.loaded, data.profile?.biometricEnabled]);


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

  // Fire milestone notifications when sober days or money saved changes
  const prevDaysRef = useRef<number | null>(null);
  const prevSavingsRef = useRef<number | null>(null);

  useEffect(() => {
    if (!data.loaded || !data.profile) return;
    if (!data.profile.notificationSettings?.milestones) return;
    const stats = data.getSoberStats();
    const days = stats?.days || 0;
    const moneySaved = stats?.moneySaved || 0;
    const currency = data.profile.currency || 'R';

    // Time milestone
    if (prevDaysRef.current !== null && days !== prevDaysRef.current) {
      fireMilestone(days);
    }
    prevDaysRef.current = days;

    // Savings milestone — only if user tracks daily spend
    if (data.profile.dailySpend > 0) {
      const SAVINGS_TIERS = [50, 100, 250, 500, 1000, 2500, 5000, 10000];
      const prevSavings = prevSavingsRef.current ?? 0;
      const crossedTier = SAVINGS_TIERS.find(
        t => moneySaved >= t && prevSavings < t
      );
      if (crossedTier !== undefined) {
        fireSavingsMilestone(crossedTier, currency);
      }
      prevSavingsRef.current = moneySaved;
    }
  }, [data.loaded, data.profile]);


  function navigate(s: string) {
    if (s==='emergency_cbt') {
      setSubScreen(''); setScreen('cbt');
    } else if (s==='emergency_breathing'||s==='emergency_meditation') {
      setSubScreen(s); setScreen('emergency');
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

  if (isLocked) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6">
      <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center text-3xl mb-6">🔒</div>
      <h1 className="text-xl font-bold text-slate-800 mb-2">App Locked</h1>
      <p className="text-slate-500 text-center text-sm mb-8">Please authenticate to access your journey.</p>
      <button onClick={async () => {
        const success = await authenticateBiometric();
        if (success) setIsLocked(false);
      }} className="w-full py-4 rounded-2xl bg-teal-600 text-white font-bold text-base shadow-sm">
        Unlock with Biometrics
      </button>
    </div>
  );

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

  // Settings sub-screens
  if (screen==='settings' && subScreen==='motivation') return <MyMotivation onBack={()=>{setSubScreen('');setScreen('settings');}} />;

  if (screen==='settings' && subScreen==='weeklygoals') return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="bg-white border-b border-slate-100 px-4 py-4 flex items-center gap-3">
        <button onClick={()=>{setSubScreen('');setScreen('settings');}} className="text-slate-400 text-xl leading-none">‹</button>
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
      <div className="flex-1 overflow-hidden" style={{paddingBottom:'72px'}}>
        {screen==='home' && <HomeScreen data={data} onNavigate={navigate}/>}
        {screen==='progress' && <ProgressScreen
          soberDays={stats?.days||0} soberHours={stats?.hours||0} soberMinutes={stats?.minutes||0}
          moneySaved={stats?.moneySaved||0} currency={data.profile.currency}
          cravings={data.cravings} thoughts={data.thoughts} journal={data.journal} sleep={data.sleep}
          activities={data.activities} soberDate={data.profile.soberDate}/>}
        {screen==='journal' && <JournalScreen data={data}/>}
        {screen==='buddy' && <div className="h-full flex flex-col"><SoberBuddyChat profile={data.profile} soberDays={stats?.days||0}/></div>}
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
              {item.key==='buddy' && <IconHeart size={22} color={screen===item.key?'#0d9488':'#94a3b8'}/>}
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
