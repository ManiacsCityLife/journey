import { useState, useEffect } from 'react';
import { generateMilestoneCard, shareMilestoneCard, getMilestoneForDay } from '../utils/milestoneCard';
import BackButton from './BackButton';
import type { UserProfile } from '../types';

interface MilestoneScreenProps {
  profile: UserProfile | null;
  soberDays: number;
  moneySaved: number;
  onBack: () => void;
}

const ALL_MILESTONES = [1, 3, 7, 14, 30, 60, 90, 100, 180, 365];

const TrophyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 21h6m-3-4v4m4-11V6a2 2 0 00-2-2H9a2 2 0 00-2 2v5l-3 3v2h14v-2l-3-3z" />
  </svg>
);

const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

export default function MilestoneScreen({ profile, soberDays, moneySaved, onBack }: MilestoneScreenProps) {
  const [generating, setGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(soberDays);

  const currentMilestone = getMilestoneForDay(soberDays);

  const generateMilestoneList = (days: number) => {
    const ms = [1, 3, 7, 14];
    let cur = 30;
    while (true) { ms.push(cur); if (cur > days) break; cur += 30; }
    return ms;
  };

  const MILESTONES = generateMilestoneList(soberDays);
  const nextMs = MILESTONES.find(m => m > soberDays);
  const prevMsIndex = MILESTONES.findIndex(m => m >= soberDays);
  const prevMs = prevMsIndex > 0 ? MILESTONES[prevMsIndex - 1] : 0;

  let progress = 0;
  let milestoneLabel = 'Keep Going!';
  let progressDetails = '';

  if (MILESTONES.includes(soberDays) && soberDays > 0) {
    milestoneLabel = `Congratulations! ${soberDays} Days!`;
    progress = 100;
    progressDetails = 'Milestone Achieved!';
  } else if (nextMs) {
    const range = nextMs - prevMs;
    const current = soberDays - prevMs;
    progress = Math.max(0, Math.min(100, Math.round((current / range) * 100)));
    milestoneLabel = `Next Milestone: ${nextMs} Days`;
    progressDetails = `${soberDays} / ${nextMs} days`;
  } else if (soberDays > 0) {
    milestoneLabel = `Over ${MILESTONES[MILESTONES.length - 1]} Days Sober!`;
    progress = 100;
    progressDetails = 'An incredible achievement!';
  } else {
    milestoneLabel = `Next Milestone: ${MILESTONES[0]} Days`;
    progressDetails = `0 / ${MILESTONES[0]} days`;
  }

  async function generateCard(days: number) {
    setGenerating(true);
    const milestone = getMilestoneForDay(days);
    const url = await generateMilestoneCard({
      days,
      milestone: milestone?.label || `${days} Days Sober`,
      healthBenefit: milestone?.benefit || 'Every day matters',
      moneySaved: Math.round((profile?.dailySpend || 0) * days),
      currency: profile?.currency || 'R',
      username: profile?.username || '',
    });
    setPreviewUrl(url);
    setGenerating(false);
  }

  useEffect(() => { if (currentMilestone) generateCard(soberDays); }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="flex items-center gap-3 px-4 py-4 bg-white border-b border-slate-100">
        <BackButton onClick={onBack} />
        <div className="text-slate-800 font-bold">Milestones</div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">

        {/* Trophy progress card — matches original */}
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <div className="flex items-center mb-3">
            <div className="mr-4 flex-shrink-0 p-2 bg-amber-100 rounded-full">
              <TrophyIcon />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-800">{milestoneLabel}</p>
              <p className="text-sm text-slate-500 font-medium">
                {nextMs ? 'Progress towards your next goal' : "You're an inspiration!"}
              </p>
            </div>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-amber-400 to-orange-500 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
              role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}
            />
          </div>
          <div className="flex justify-between items-center text-sm font-medium text-slate-600 mt-1">
            <span>{progressDetails}</span>
            {(nextMs || (MILESTONES.includes(soberDays) && soberDays > 0)) && (
              <span className="font-bold">{progress}%</span>
            )}
          </div>
        </div>

        {/* Current milestone badge */}
        {currentMilestone && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100">
            <div className="flex items-center gap-4">
              <div className="text-4xl">{currentMilestone.emoji}</div>
              <div className="flex-1">
                <div className="text-slate-800 font-bold text-lg">{currentMilestone.label}</div>
                <div className="text-slate-500 text-sm mt-0.5">{currentMilestone.benefit}</div>
              </div>
              <div className="text-amber-400"><StarIcon /></div>
            </div>
          </div>
        )}

        {/* Money saved */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Money Saved</div>
          <div className="text-3xl font-bold text-emerald-600">
            {profile?.currency || 'R'}{moneySaved.toLocaleString()}
          </div>
          <div className="text-slate-400 text-sm mt-0.5">in {soberDays} days</div>
        </div>

        {/* All milestones grid */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-slate-800 font-bold text-sm mb-1">All Milestones</div>
          <div className="text-slate-400 text-xs mb-4">Tap any to generate a shareable card</div>
          <div className="grid grid-cols-4 gap-2">
            {ALL_MILESTONES.map(d => {
              const achieved = d <= soberDays;
              const isSelected = selectedDay === d;
              const ms = getMilestoneForDay(d);
              return (
                <button key={d} onClick={() => { setSelectedDay(d); generateCard(d); }}
                  className={`py-3 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 transition-all border
                    ${isSelected ? 'bg-amber-50 border-amber-400 text-amber-700'
                      : achieved ? 'bg-slate-50 border-slate-200 text-slate-700'
                      : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                  <span className="text-base">{ms?.emoji || '🎯'}</span>
                  <span>{d}d</span>
                  {achieved && <span className="text-emerald-500 leading-none">✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Generating spinner */}
        {generating && (
          <div className="bg-white rounded-2xl p-6 shadow-sm flex items-center justify-center gap-3">
            <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-slate-500 text-sm">Generating card...</span>
          </div>
        )}

        {/* Card preview + share */}
        {previewUrl && !generating && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <img src={previewUrl} alt="Milestone card" className="w-full rounded-xl" />
            <button onClick={() => shareMilestoneCard(previewUrl, selectedDay)}
              className="w-full mt-3 py-3 rounded-xl bg-teal-600 text-white font-semibold text-sm flex items-center justify-center gap-2">
              <span>📤</span> Share Your Milestone
            </button>
          </div>
        )}

      </div>
    </div>
  );
}


