import { useState, useMemo } from 'react';
import { IconWave, IconChat, IconMoon, IconRun } from './Icons';
import type { CravingLog, SleepLog, ThoughtLog, ActivityLog } from '../types';

interface Props {
  cravings: CravingLog[];
  thoughts: ThoughtLog[];
  sleep: SleepLog[];
  activities: ActivityLog[];
  onAddSleep: (log: SleepLog) => void;
  onBack: () => void;
  soberDays: number;
}

type Tab = 'overview' | 'cravings' | 'sleep' | 'triggers';

function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      date: d.toISOString().split('T')[0],
      label: d.toLocaleDateString('en', { weekday: 'short' }),
    };
  });
}

function LineChart({ data, color, fillColor, maxVal, height = 72 }: {
  data: (number | null)[]; color: string; fillColor: string; maxVal: number; height?: number;
}) {
  const W = 100; const H = height; const PAD = 5;
  const step = (W - PAD * 2) / (data.length - 1);
  const pts = data.map((v, i) => ({
    x: PAD + i * step,
    y: v === null ? null : H - PAD - ((v / (maxVal || 1)) * (H - PAD * 2)),
  }));

  const segs: {x:number;y:number}[][] = [];
  let cur: {x:number;y:number}[] = [];
  pts.forEach(p => {
    if (p.y === null) { if (cur.length) { segs.push(cur); cur = []; } }
    else cur.push({x:p.x, y:p.y as number});
  });
  if (cur.length) segs.push(cur);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{height}}>
      {[0.25,0.5,0.75,1].map(f => (
        <line key={f} x1={PAD} y1={H-PAD-f*(H-PAD*2)} x2={W-PAD} y2={H-PAD-f*(H-PAD*2)}
          stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="2,2"/>
      ))}
      {segs.map((seg,i) => seg.length > 1 && (
        <polygon key={'f'+i}
          points={`${seg[0].x},${H-PAD} ${seg.map(p=>`${p.x},${p.y}`).join(' ')} ${seg[seg.length-1].x},${H-PAD}`}
          fill={fillColor} opacity="0.12"/>
      ))}
      {segs.map((seg,i) => seg.length > 1 && (
        <polyline key={'l'+i} points={seg.map(p=>`${p.x},${p.y}`).join(' ')}
          fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      ))}
      {pts.map((p,i) => p.y !== null && (
        <circle key={i} cx={p.x} cy={p.y} r="2.2" fill={color}/>
      ))}
      <line x1={PAD} y1={H-PAD} x2={W-PAD} y2={H-PAD} stroke="#e2e8f0" strokeWidth="0.8"/>
    </svg>
  );
}

function StatPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex-1">
      <div className={`text-xs font-medium mb-1 ${color}`}>{label}</div>
      <div className="text-slate-800 font-bold text-xl leading-tight">{value}</div>
    </div>
  );
}

function ChartCard({ title, icon, values, labels, color, fillColor, maxVal, unit, emptyMsg }: {
  title: string; icon: React.ReactElement; values: (number|null)[];
  labels: string[]; color: string; fillColor: string; maxVal: number;
  unit: string; emptyMsg: string;
}) {
  const hasData = values.some(v => v !== null && v > 0);
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <span className="text-slate-700 font-semibold text-sm">{title}</span>
        <span className="ml-auto text-slate-400 text-xs">7 days</span>
      </div>
      {!hasData ? (
        <div className="py-5 text-center text-slate-400 text-sm">{emptyMsg}</div>
      ) : (
        <>
          <LineChart data={values} color={color} fillColor={fillColor} maxVal={maxVal}/>
          <div className="flex mt-1">
            {labels.map((l,i) => <div key={i} className="flex-1 text-center text-slate-400 text-xs">{l}</div>)}
          </div>
          <div className="text-right text-slate-400 text-xs mt-0.5">{unit}</div>
        </>
      )}
    </div>
  );
}

export default function InsightsScreen({ cravings, thoughts, sleep, activities, onAddSleep, onBack, soberDays }: Props) {
  const [tab, setTab] = useState<Tab>('overview');
  const [sleepHours, setSleepHours] = useState('7');
  const [sleepQuality, setSleepQuality] = useState<1|2|3|4|5>(3);
  const [sleepLogged, setSleepLogged] = useState(false);

  const days7 = useMemo(() => getLast7Days(), []);
  const labels = days7.map(d => d.label.charAt(0));

  const cravingVals = useMemo(() => days7.map(d => cravings.filter(c => c.timestamp.startsWith(d.date)).length || null), [cravings, days7]);
  const thoughtVals = useMemo(() => days7.map(d => thoughts.filter(t => t.timestamp.startsWith(d.date)).length || null), [thoughts, days7]);
  const sleepVals = useMemo(() => days7.map(d => sleep.find(s => s.date === d.date)?.hours ?? null), [sleep, days7]);
  const activityVals = useMemo(() => days7.map(d => {
    const logs = activities.filter(a => a.timestamp.startsWith(d.date));
    if (!logs.length) return null;
    return logs.reduce((sum, a) => { const m = a.activity.match(/(\d+)min/); return sum + (m ? parseInt(m[1]) : 30); }, 0);
  }), [activities, days7]);

  const totalCravings7 = cravingVals.reduce((a,b) => a + (b||0), 0);
  const totalThoughts7 = thoughtVals.reduce((a,b) => a + (b||0), 0);
  const sleepNums = sleepVals.filter((v): v is number => v !== null);
  const avgSleep7 = sleepNums.length ? (sleepNums.reduce((a,b) => a+b,0)/sleepNums.length).toFixed(1) : null;
  const activeDays7 = activityVals.filter(v => v !== null).length;
  const todaySleep = sleep.find(s => s.date === new Date().toISOString().split('T')[0]);
  const avgIntensity = cravings.length ? (cravings.reduce((a,b) => a+b.intensity,0)/cravings.length).toFixed(1) : null;

  const timeSlots = [
    { label:'Morning', range:'6am–12pm', hours:[6,7,8,9,10,11], icon:'🌅' },
    { label:'Afternoon', range:'12–6pm', hours:[12,13,14,15,16,17], icon:'☀️' },
    { label:'Evening', range:'6–10pm', hours:[18,19,20,21], icon:'🌆' },
    { label:'Night', range:'10pm–6am', hours:[22,23,0,1,2,3,4,5], icon:'🌙' },
  ];

  async function logSleep() {
    await onAddSleep({ id: Date.now().toString(), date: new Date().toISOString().split('T')[0], hours: parseFloat(sleepHours)||7, quality: sleepQuality });
    setSleepLogged(true); setTimeout(() => setSleepLogged(false), 2000);
  }

  const TABS: {id:Tab;label:string}[] = [
    {id:'overview',label:'Overview'},{id:'cravings',label:'Cravings'},
    {id:'sleep',label:'Sleep'},{id:'triggers',label:'Triggers'},
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="bg-white border-b border-slate-100 px-4 py-4 flex items-center gap-3 flex-shrink-0">
        <button onClick={onBack} className="text-slate-400 text-xl leading-none">‹</button>
        <div>
          <div className="text-slate-800 font-bold">Insights</div>
          <div className="text-slate-400 text-xs">Your patterns · stays on device</div>
        </div>
      </div>

      <div className="bg-white border-b border-slate-100 flex px-2 flex-shrink-0">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-3 text-xs font-semibold border-b-2 transition-colors ${tab===t.id?'border-teal-500 text-teal-600':'border-transparent text-slate-400'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">

        {tab === 'overview' && (
          <>
            <div className="flex gap-3">
              <StatPill label="Cravings (7d)" value={String(totalCravings7)} color="text-rose-500"/>
              <StatPill label="Thoughts (7d)" value={String(totalThoughts7)} color="text-sky-500"/>
            </div>
            <div className="flex gap-3">
              <StatPill label="Avg Sleep" value={avgSleep7 ? `${avgSleep7}h` : '—'} color="text-indigo-500"/>
              <StatPill label="Active Days" value={`${activeDays7}/7`} color="text-emerald-500"/>
            </div>
            <ChartCard title="Cravings" icon={<IconWave size={14} color="#f43f5e"/>}
              values={cravingVals} labels={labels} color="#f43f5e" fillColor="#f43f5e"
              maxVal={Math.max(5,...(cravingVals.filter(Boolean) as number[]))} unit="per day"
              emptyMsg="No cravings logged this week."/>
            <ChartCard title="Thoughts" icon={<IconChat size={14} color="#0ea5e9"/>}
              values={thoughtVals} labels={labels} color="#0ea5e9" fillColor="#0ea5e9"
              maxVal={Math.max(5,...(thoughtVals.filter(Boolean) as number[]))} unit="per day"
              emptyMsg="No thoughts logged this week."/>
            <ChartCard title="Sleep" icon={<IconMoon size={14} color="#6366f1"/>}
              values={sleepVals} labels={labels} color="#6366f1" fillColor="#6366f1"
              maxVal={10} unit="hours"
              emptyMsg="No sleep logged this week."/>
            <ChartCard title="Exercise" icon={<IconRun size={14} color="#10b981"/>}
              values={activityVals} labels={labels} color="#10b981" fillColor="#10b981"
              maxVal={Math.max(60,...(activityVals.filter(Boolean) as number[]))} unit="minutes"
              emptyMsg="No activity logged this week."/>
          </>
        )}

        {tab === 'cravings' && (
          <>
            <div className="flex gap-3">
              <StatPill label="Total" value={String(cravings.length)} color="text-rose-500"/>
              <StatPill label="Avg Intensity" value={avgIntensity ? `${avgIntensity}/10` : '—'} color="text-orange-500"/>
              <StatPill label="Overcome"
                value={cravings.length ? `${Math.round((cravings.filter(c=>c.overcome).length/cravings.length)*100)}%` : '—'}
                color="text-emerald-500"/>
            </div>
            <ChartCard title="This Week" icon={<IconWave size={14} color="#f43f5e"/>}
              values={cravingVals} labels={labels} color="#f43f5e" fillColor="#f43f5e"
              maxVal={Math.max(5,...(cravingVals.filter(Boolean) as number[]))} unit="per day"
              emptyMsg="No cravings logged this week — great work."/>
            {cravings.length > 0 && (
              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                <div className="text-slate-700 font-semibold text-sm mb-3">Intensity Distribution</div>
                {[1,2,3,4,5,6,7,8,9,10].map(level => {
                  const count = cravings.filter(c => Math.round(c.intensity) === level).length;
                  const pct = cravings.length ? (count/cravings.length)*100 : 0;
                  const bar = level<=3?'bg-emerald-400':level<=6?'bg-amber-400':'bg-rose-500';
                  return (
                    <div key={level} className="flex items-center gap-2 mb-1.5">
                      <div className="text-slate-400 text-xs w-4 text-right">{level}</div>
                      <div className="flex-1 bg-slate-100 rounded-full h-2">
                        <div className={`${bar} h-2 rounded-full`} style={{width:`${pct}%`}}/>
                      </div>
                      <div className="text-slate-400 text-xs w-4">{count}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {tab === 'sleep' && (
          <>
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
              <div className="text-slate-700 font-semibold text-sm">
                {todaySleep ? '✓ Sleep logged for today' : "Log Last Night's Sleep"}
              </div>
              {!todaySleep ? (
                <>
                  <div>
                    <label className="text-slate-500 text-xs block mb-1">Hours slept</label>
                    <div className="flex items-center gap-3">
                      <input type="range" min="1" max="12" step="0.5" value={sleepHours}
                        onChange={e => setSleepHours(e.target.value)} className="flex-1 accent-teal-500"/>
                      <div className="text-slate-800 font-bold w-10 text-right">{sleepHours}h</div>
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-500 text-xs block mb-2">Sleep quality</label>
                    <div className="flex gap-2">
                      {(['😴','😪','😐','😌','🌟'] as const).map((e,i) => (
                        <button key={i} onClick={() => setSleepQuality((i+1) as 1|2|3|4|5)}
                          className={`flex-1 py-2 rounded-xl text-lg ${sleepQuality===i+1?'bg-teal-100 ring-2 ring-teal-400':'bg-slate-100'}`}>{e}</button>
                      ))}
                    </div>
                  </div>
                  <button onClick={logSleep}
                    className={`w-full py-3 rounded-xl font-semibold text-sm text-white ${sleepLogged?'bg-green-500':'bg-teal-600'}`}>
                    {sleepLogged ? '✓ Logged!' : 'Save Sleep Log'}
                  </button>
                </>
              ) : (
                <div className="flex gap-4 text-center">
                  <div className="flex-1 bg-slate-50 rounded-xl p-3">
                    <div className="text-2xl font-bold text-teal-600">{todaySleep.hours}h</div>
                    <div className="text-slate-400 text-xs">Duration</div>
                  </div>
                  <div className="flex-1 bg-slate-50 rounded-xl p-3">
                    <div className="text-2xl">{'😴😪😐😌🌟'[todaySleep.quality-1]}</div>
                    <div className="text-slate-400 text-xs">Quality</div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <StatPill label="7-Day Avg" value={avgSleep7 ? `${avgSleep7}h` : '—'} color="text-indigo-500"/>
              <StatPill label="Nights Logged" value={String(sleepNums.length)} color="text-slate-500"/>
            </div>
            <ChartCard title="Sleep Duration" icon={<IconMoon size={14} color="#6366f1"/>}
              values={sleepVals} labels={labels} color="#6366f1" fillColor="#6366f1"
              maxVal={10} unit="hours" emptyMsg="No sleep logged this week."/>
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
              <div className="text-indigo-700 text-xs font-semibold mb-1">Recovery & Sleep</div>
              <div className="text-indigo-600 text-xs leading-relaxed">
                Alcohol disrupts REM sleep. In early sobriety, sleep often feels worse before it improves. Most people report dramatically better quality by week 3–4. Keep logging and you'll see the improvement here.
              </div>
            </div>
          </>
        )}

        {tab === 'triggers' && (
          <>
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
              <div className="text-slate-700 font-semibold text-sm mb-4">When Cravings Hit</div>
              {!cravings.length ? (
                <div className="text-slate-400 text-sm text-center py-2">No cravings logged yet.</div>
              ) : timeSlots.map(s => {
                const count = cravings.filter(c => s.hours.includes(new Date(c.timestamp).getHours())).length;
                const max = Math.max(...timeSlots.map(ts => cravings.filter(c => ts.hours.includes(new Date(c.timestamp).getHours())).length), 1);
                return (
                  <div key={s.label} className="flex items-center gap-3 mb-3 last:mb-0">
                    <div className="text-base w-6">{s.icon}</div>
                    <div className="w-20 flex-shrink-0">
                      <div className="text-slate-700 text-xs font-medium">{s.label}</div>
                      <div className="text-slate-400 text-xs">{s.range}</div>
                    </div>
                    <div className="flex-1 bg-slate-100 rounded-full h-2.5">
                      <div className="bg-rose-400 rounded-full h-2.5" style={{width:`${(count/max)*100}%`}}/>
                    </div>
                    <div className="text-slate-500 text-xs font-medium w-4 text-right">{count}</div>
                  </div>
                );
              })}
            </div>

            {cravings.length > 0 && (() => {
              const trigMap: Record<string,number> = {};
              cravings.forEach(c => { if (c.trigger) trigMap[c.trigger] = (trigMap[c.trigger]||0)+1; });
              const sorted = Object.entries(trigMap).sort((a,b)=>b[1]-a[1]).slice(0,6);
              if (!sorted.length) return null;
              const max = sorted[0][1];
              return (
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                  <div className="text-slate-700 font-semibold text-sm mb-4">Top Triggers</div>
                  {sorted.map(([trigger,count]) => (
                    <div key={trigger} className="flex items-center gap-3 mb-3 last:mb-0">
                      <div className="text-slate-600 text-xs w-28 truncate capitalize flex-shrink-0">{trigger}</div>
                      <div className="flex-1 bg-slate-100 rounded-full h-2.5">
                        <div className="bg-amber-400 rounded-full h-2.5" style={{width:`${(count/max)*100}%`}}/>
                      </div>
                      <div className="text-slate-400 text-xs w-4 text-right">{count}</div>
                    </div>
                  ))}
                </div>
              );
            })()}

            <ChartCard title="Thought Frequency" icon={<IconChat size={14} color="#0ea5e9"/>}
              values={thoughtVals} labels={labels} color="#0ea5e9" fillColor="#0ea5e9"
              maxVal={Math.max(5,...(thoughtVals.filter(Boolean) as number[]))} unit="per day"
              emptyMsg="No thoughts logged this week."/>
          </>
        )}
      </div>
    </div>
  );
}
