import { IconWave, IconChat, IconFlame, IconMoon, IconProgress, IconStar, IconTarget, IconMilestone, IconRun, IconJournal, IconBody } from './Icons';
import { useState, useEffect } from 'react';
import type { CravingLog, JournalEntry, SleepLog, ActivityLog, ThoughtLog } from '../types';

interface Props {
  soberDays: number; soberHours: number; soberMinutes: number;
  moneySaved: number; currency: string;
  cravings: CravingLog[]; thoughts: any[]; journal: JournalEntry[];
  sleep: SleepLog[]; activities: ActivityLog[];
  soberDate: string;
}

const MILESTONES = [
  {days:1,label:'24 Hours',icon:'🌱'},
  {days:3,label:'3 Days',icon:'🌿'},
  {days:7,label:'1 Week',icon:'🌳'},
  {days:14,label:'2 Weeks',icon:'💪'},
  {days:30,label:'1 Month',icon:'🏆'},
  {days:60,label:'2 Months',icon:'⭐'},
  {days:90,label:'90 Days',icon:'🌟'},
  {days:180,label:'6 Months',icon:'💎'},
  {days:365,label:'1 Year',icon:'👑'},
];

function CravingsHeatmap({ soberDate, cravings, thoughts }: { soberDate:string; cravings:CravingLog[]; thoughts:any[] }) {
  const today = new Date();

  const toLocalDate = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

  const todayStr = toLocalDate(today);
  const soberStart = (() => {
    try { return new Date(soberDate).toISOString().split('T')[0]; }
    catch { return todayStr; }
  })();

  const activityMap: Record<string,number> = {};
  cravings.forEach(c=>{ const d=c.timestamp.split('T')[0]; activityMap[d]=(activityMap[d]||0)+1; });
  thoughts.forEach(t=>{ const d=t.timestamp.split('T')[0]; activityMap[d]=(activityMap[d]||0)+1; });

  // Build 5 weeks, each row = one week Mon→Sun, current week FIRST (top)
  // Week 0 = current week, week 4 = 4 weeks ago
  const rows: {date:string;level:number;count:number}[][] = [];

  for (let week = 0; week < 5; week++) {
    const row: {date:string;level:number;count:number}[] = [];
    for (let dow = 0; dow < 7; dow++) {
      // dow 0=Mon, 6=Sun
      const d = new Date(today);
      // Start of current week (Monday)
      const currentWeekMon = new Date(today);
      currentWeekMon.setDate(today.getDate() - ((today.getDay()+6)%7));
      // Go back `week` weeks, then forward `dow` days
      d.setDate(currentWeekMon.getDate() - (week * 7) + dow);
      const dateStr = toLocalDate(d);
      const isFuture = dateStr > todayStr;
      const isSober = dateStr >= soberStart && dateStr <= todayStr;
      const isToday = dateStr === todayStr;
      const count = activityMap[dateStr] || 0;
      let level: number;
      if (isFuture) level = -1; // future = invisible
      else if (!isSober) level = 0; // pre-sobriety = grey
      else if (isToday) level = 5;  // today = ring
      else if (count === 0) level = 1; // sober, clean day
      else if (count <= 2) level = 2;
      else if (count <= 4) level = 3;
      else level = 4;
      row.push({ date: dateStr, level, count });
    }
    rows.push(row);
  }

  const colors = ['bg-slate-100','bg-emerald-100','bg-teal-200','bg-teal-400','bg-teal-600',''];
  const days = ['M','T','W','T','F','S','S'];

  return (
    <div>
      <div className="flex justify-between text-xs text-slate-400 mb-2 px-1">
        <span>← 4 weeks ago</span><span>This week →</span>
      </div>
      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {days.map((d,i)=><div key={i} className="text-center text-slate-400 text-xs">{d}</div>)}
      </div>
      {/* Rows: week 0 = oldest (bottom of visual), reversed so current week = top */}
      {[...rows].map((row, ri) => (
        <div key={ri} className="grid grid-cols-7 gap-1 mb-1">
          {row.map((cell, ci) => {
            if (cell.level === -1) {
              return <div key={ci} className="aspect-square rounded-md bg-transparent"/>;
            }
            if (cell.level === 5) {
              return (
                <div key={ci} className="aspect-square rounded-md bg-teal-200 ring-2 ring-teal-600 flex items-center justify-center">
                  {cell.count > 0 && <span className="text-teal-800 font-bold" style={{fontSize:'9px'}}>{cell.count}</span>}
                </div>
              );
            }
            return (
              <div key={ci} className={`aspect-square rounded-md ${colors[cell.level]} flex items-center justify-center`} title={cell.date}>
                {cell.count > 0 && cell.level >= 2 && (
                  <span className="text-white font-bold" style={{fontSize:'9px'}}>{cell.count}</span>
                )}
              </div>
            );
          })}
        </div>
      ))}
      {/* Legend */}
      <div className="flex items-center gap-2 mt-2 justify-end">
        <span className="text-xs text-slate-400">Less</span>
        {['bg-emerald-100','bg-teal-200','bg-teal-400','bg-teal-600'].map((c,i)=>(
          <div key={i} className={`w-3.5 h-3.5 rounded-sm ${c}`}/>
        ))}
        <span className="text-xs text-slate-400">More</span>
      </div>
    </div>
  );
}

export default function ProgressScreen({ soberDays, soberHours, soberMinutes, moneySaved, currency, cravings, thoughts = [], journal, sleep, activities, soberDate }: Props) {
  const [tab, setTab] = useState<'streak'|'insights'>('streak');
  const [seconds, setSeconds] = useState(new Date().getSeconds());

  // Real-time counter
  useEffect(()=>{
    const t=setInterval(()=>setSeconds(new Date().getSeconds()),1000);
    return ()=>clearInterval(t);
  },[]);

  // Recalculate total from soberDate for accurate seconds
  const [liveStats, setLiveStats] = useState({days:soberDays,hours:soberHours,minutes:soberMinutes,secs:0});
  useEffect(()=>{
    function calc(){
      const ms=Math.max(0,Date.now()-new Date(soberDate).getTime());
      const totalSec=Math.floor(ms/1000);
      setLiveStats({
        days:Math.floor(ms/86400000),
        hours:Math.floor((ms%86400000)/3600000),
        minutes:Math.floor((ms%3600000)/60000),
        secs:totalSec%60,
      });
    }
    calc();
    const t=setInterval(calc,1000);
    return ()=>clearInterval(t);
  },[soberDate]);

  const nextMilestone=MILESTONES.find(m=>m.days>liveStats.days);
  const lastMilestone=MILESTONES.filter(m=>m.days<=liveStats.days).pop();
  const milestoneProgress=nextMilestone
    ?((liveStats.days-(lastMilestone?.days||0))/(nextMilestone.days-(lastMilestone?.days||0)))*100 : 100;

  const allLogs=[
    ...cravings.slice(0,5).map(c=>({date:c.timestamp,label:`Craving — intensity ${c.intensity}/10${c.trigger?' · '+c.trigger:''}`,iconEl:<IconWave size={18} color="#f43f5e"/>,bg:'bg-red-50'})),
    ...(thoughts||[]).slice(0,5).map(t=>({date:t.timestamp,label:`Thought logged — ${t.text}`,iconEl:<IconChat size={18} color="#0ea5e9"/>,bg:'bg-sky-50'})),
    ...journal.slice(0,5).map(j=>({date:j.date,label:'Journal entry',iconEl:<IconJournal size={18} color="#b07840"/>,bg:'bg-amber-50'})),
    ...sleep.slice(0,3).map(s=>({date:s.date+'T00:00:00',label:`${s.hours.toFixed(1)}h sleep · quality ${s.quality}/5`,iconEl:<IconMoon size={18} color="#6366f1"/>,bg:'bg-indigo-50'})),
    ...activities.slice(0,3).map(a=>({date:a.timestamp,label:a.activity,iconEl:<IconRun size={18} color="#10b981"/>,bg:'bg-emerald-50'})),
  ].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,10);

  const avgCravingIntensity=cravings.length?(cravings.reduce((s,c)=>s+c.intensity,0)/cravings.length).toFixed(1):'—';
  const avgSleep=sleep.length?(sleep.reduce((s,sl)=>s+sl.hours,0)/sleep.length).toFixed(1):'—';

  // Last 7 days data for tracking charts
  const last7 = Array.from({length:7},(_,i)=>{ const d=new Date(); d.setDate(d.getDate()-(6-i)); return d.toISOString().split('T')[0]; });
  const last7Labels = last7.map(d => new Date(d).toLocaleDateString('en',{weekday:'short'}).slice(0,1));
  const intensityByDay = last7.map(d => { const cs=cravings.filter(c=>c.timestamp.startsWith(d)); return cs.length ? cs.reduce((s,c)=>s+c.intensity,0)/cs.length : null; });
  const thoughtsByDay  = last7.map(d => thoughts.filter(t=>t.timestamp.startsWith(d)).length || null);
  const hasIntensity = intensityByDay.some(v=>v!==null);
  const hasThoughts  = thoughtsByDay.some(v=>v!==null);
  const journalStreak=(()=>{
    let streak=0; const today=new Date();
    for(let i=0;i<30;i++){
      const d=new Date(today); d.setDate(today.getDate()-i);
      const ds=d.toISOString().split('T')[0];
      if(journal.some(j=>j.date.startsWith(ds))) streak++;
      else if(i>0) break;
    }
    return streak;
  })();

  // For heatmap — need thought logs too (passed via activities for now, or pull from cravings)

  return (
    <div className="overflow-y-auto h-full bg-slate-50">
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-center gap-2 mb-4"><IconProgress size={18} color="#0d9488"/><span className="text-slate-800 text-xl font-bold">Progress</span></div>
        <div className="bg-white rounded-2xl p-1 flex border border-slate-100 shadow-sm">
          <button onClick={()=>setTab('streak')} className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${tab==='streak'?'bg-teal-500 text-white shadow-sm':'text-slate-500'}`}>Streak</button>
          <button onClick={()=>setTab('insights')} className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${tab==='insights'?'bg-teal-500 text-white shadow-sm':'text-slate-500'}`}>Insights</button>
        </div>
      </div>

      <div className="px-4 pb-6 space-y-4">
        {tab==='streak' && (
          <>
            {/* Live time sober */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm text-center">
              <div className="text-4xl font-bold text-teal-600 mb-1 font-mono">
                {liveStats.days}d {String(liveStats.hours).padStart(2,'0')}h {String(liveStats.minutes).padStart(2,'0')}m {String(liveStats.secs).padStart(2,'0')}s
              </div>
              <div className="text-slate-500 text-sm font-medium">Time Sober</div>
              <div className="text-slate-400 text-xs mt-1">Total: {liveStats.days} days. You've saved {currency}{moneySaved.toLocaleString(undefined,{maximumFractionDigits:2})}.</div>
            </div>

            {/* Next milestone */}
            {nextMilestone && (
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-xl">{nextMilestone.icon}</div>
                  <div>
                    <div className="text-slate-800 font-semibold text-sm">Next Milestone: {nextMilestone.label}</div>
                    <div className="text-slate-400 text-xs">Progress towards your next goal</div>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 mb-2">
                  <div className="bg-gradient-to-r from-amber-400 to-orange-400 h-2.5 rounded-full transition-all" style={{width:`${milestoneProgress}%`}}/>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>{liveStats.days} / {nextMilestone.days} days</span>
                  <span>{milestoneProgress.toFixed(0)}%</span>
                </div>
              </div>
            )}

            {lastMilestone && liveStats.days>=lastMilestone.days && (
              <div className="bg-teal-50 rounded-2xl p-4 border border-teal-100 flex items-center gap-3">
                <div className="text-2xl">{lastMilestone.icon}</div>
                <div>
                  <div className="text-teal-700 font-semibold text-sm">✓ {lastMilestone.label} achieved!</div>
                  <div className="text-teal-600 text-xs">Keep going — you're building something real.</div>
                </div>
              </div>
            )}

            {/* Cravings & Thoughts Heatmap */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className="text-slate-800 font-semibold text-sm mb-1">Cravings & Thoughts Heatmap</div>
              <div className="text-slate-400 text-xs mb-3">Orange = cravings/thoughts logged · Gray = clean day · Today = teal ring</div>
              <CravingsHeatmap soberDate={soberDate} cravings={cravings} thoughts={thoughts}/>
              <div className="flex items-center gap-2 mt-3 justify-end">
                <div className="text-slate-400 text-xs">Less</div>
                {['bg-slate-200','bg-teal-100','bg-teal-300','bg-teal-500'].map((c,i)=>(
                  <div key={i} className={`w-3 h-3 rounded-sm ${c}`}/>
                ))}
                <div className="text-slate-400 text-xs">More</div>
              </div>
            </div>

            {/* Recent Logs */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className="text-slate-800 font-semibold text-sm mb-3">Recent Logs</div>
              {allLogs.length===0?(
                <div className="text-slate-400 text-sm text-center py-4">No activity logged yet. Keep it up!</div>
              ):(
                <div className="space-y-3">
                  {allLogs.map((log,i)=>(
                    <div key={i} className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${log.bg}`}>{log.iconEl}</div>
                      <div className="flex-1">
                        <div className="text-slate-700 text-sm">{log.label}</div>
                        <div className="text-slate-400 text-xs">{new Date(log.date).toLocaleDateString('en-ZA',{weekday:'short',day:'numeric',month:'short'})}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Milestones grid */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className="text-slate-800 font-semibold text-sm mb-3">Milestones</div>
              <div className="grid grid-cols-3 gap-2">
                {MILESTONES.map(m=>{
                  const achieved=liveStats.days>=m.days;
                  return (
                    <div key={m.days} className={`rounded-xl p-3 text-center border ${achieved?'bg-teal-50 border-teal-200':'bg-slate-50 border-slate-100'}`}>
                      <div className={`text-2xl mb-1 ${!achieved&&'opacity-30'}`}>{m.icon}</div>
                      <div className={`text-xs font-semibold ${achieved?'text-teal-700':'text-slate-400'}`}>{m.label}</div>
                      {achieved&&<div className="text-teal-500 text-xs mt-0.5">✓</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {tab==='insights' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
                <div className="text-3xl font-bold text-red-500 mb-1">{cravings.length}</div>
                <div className="flex items-center gap-1 text-slate-500 text-xs"><IconWave size={12} color="#c0666e"/>Cravings</div>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
                <div className="text-3xl font-bold text-red-400 mb-1">{avgCravingIntensity}</div>
                <div className="flex items-center gap-1 text-slate-500 text-xs"><IconFlame size={12} color="#e07050"/>Avg intensity</div>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
                <div className="text-3xl font-bold text-amber-500 mb-1">{journalStreak}</div>
                <div className="text-slate-500 text-xs">Journal streak (days)</div>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
                <div className="text-3xl font-bold text-indigo-500 mb-1">{avgSleep}h</div>
                <div className="text-slate-500 text-xs">Avg sleep logged</div>
              </div>
            </div>

            {/* Craving Intensity Chart */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <IconFlame size={14} color="#ef4444"/>
                <span className="text-slate-700 font-semibold text-sm">Craving Intensity</span>
                <span className="ml-auto text-slate-400 text-xs">Average intensity over time.</span>
              </div>
              {!hasIntensity ? (
                <div className="py-4 text-center text-slate-400 text-xs">No data recorded for this period</div>
              ) : (
                <div className="flex gap-2">
                  <div className="flex flex-col justify-between text-slate-400 py-1 pr-1 flex-shrink-0" style={{fontSize:'10px'}}>
                    <span>Intense</span><span>High</span><span>Mod</span><span>Low</span><span>Mild</span>
                  </div>
                  <div className="flex-1">
                    <svg viewBox="0 0 100 60" className="w-full" style={{height:72}}>
                      {[0.2,0.4,0.6,0.8,1].map((_,i)=>(
                        <line key={i} x1={4} y1={4+(i+1)*10.4} x2={96} y2={4+(i+1)*10.4} stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="2,2"/>
                      ))}
                      {(() => {
                        const pts = intensityByDay.map((v,i)=>({x:4+i*(92/6), y:v===null?null:56-(v/10)*52}));
                        const segs: {x:number;y:number}[][] = []; let cur: {x:number;y:number}[] = [];
                        pts.forEach(p=>{ if(p.y===null){if(cur.length){segs.push(cur);cur=[];}}else cur.push({x:p.x,y:p.y as number}); });
                        if(cur.length) segs.push(cur);
                        return (<>
                          {segs.map((s,i)=>s.length>1&&<polygon key={'f'+i} points={`${s[0].x},56 ${s.map(p=>`${p.x},${p.y}`).join(' ')} ${s[s.length-1].x},56`} fill="#ef4444" opacity="0.1"/>)}
                          {segs.map((s,i)=>s.length>1&&<polyline key={'l'+i} points={s.map(p=>`${p.x},${p.y}`).join(' ')} fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round"/>)}
                          {pts.map((p,i)=>p.y!==null&&<circle key={i} cx={p.x} cy={p.y} r="2.2" fill="#ef4444"/>)}
                        </>);
                      })()}
                      <line x1={4} y1={56} x2={96} y2={56} stroke="#e2e8f0" strokeWidth="0.8"/>
                    </svg>
                    <div className="flex mt-1">{last7Labels.map((l,i)=><div key={i} className="flex-1 text-center text-slate-400" style={{fontSize:'10px'}}>{l}</div>)}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Thought Frequency Chart */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <IconChat size={14} color="#0ea5e9"/>
                <span className="text-slate-700 font-semibold text-sm">Thought Frequency</span>
                <span className="ml-auto text-slate-400 text-xs">Frequency of thoughts about drinking.</span>
              </div>
              {!hasThoughts ? (
                <div className="py-4 text-center text-slate-400 text-xs">No data recorded for this period</div>
              ) : (
                <div className="flex gap-2">
                  <div className="flex flex-col justify-between text-slate-400 py-1 pr-1 flex-shrink-0" style={{fontSize:'10px'}}>
                    <span>Obsessive</span><span style={{marginTop:'auto',marginBottom:'auto'}}>Recurring</span><span>Fleeting</span>
                  </div>
                  <div className="flex-1">
                    <svg viewBox="0 0 100 60" className="w-full" style={{height:72}}>
                      {[0.33,0.67,1].map((_,i)=>(
                        <line key={i} x1={4} y1={4+(i+1)*17.3} x2={96} y2={4+(i+1)*17.3} stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="2,2"/>
                      ))}
                      {(() => {
                        const maxT = Math.max(1,...(thoughtsByDay.filter(Boolean) as number[]));
                        const pts = thoughtsByDay.map((v,i)=>({x:4+i*(92/6), y:v===null?null:56-(v/maxT)*52}));
                        const segs: {x:number;y:number}[][] = []; let cur: {x:number;y:number}[] = [];
                        pts.forEach(p=>{ if(p.y===null){if(cur.length){segs.push(cur);cur=[];}}else cur.push({x:p.x,y:p.y as number}); });
                        if(cur.length) segs.push(cur);
                        return (<>
                          {segs.map((s,i)=>s.length>1&&<polygon key={'f'+i} points={`${s[0].x},56 ${s.map(p=>`${p.x},${p.y}`).join(' ')} ${s[s.length-1].x},56`} fill="#0ea5e9" opacity="0.1"/>)}
                          {segs.map((s,i)=>s.length>1&&<polyline key={'l'+i} points={s.map(p=>`${p.x},${p.y}`).join(' ')} fill="none" stroke="#0ea5e9" strokeWidth="1.5" strokeLinecap="round"/>)}
                          {pts.map((p,i)=>p.y!==null&&<circle key={i} cx={p.x} cy={p.y} r="2.2" fill="#0ea5e9"/>)}
                        </>);
                      })()}
                      <line x1={4} y1={56} x2={96} y2={56} stroke="#e2e8f0" strokeWidth="0.8"/>
                    </svg>
                    <div className="flex mt-1">{last7Labels.map((l,i)=><div key={i} className="flex-1 text-center text-slate-400" style={{fontSize:'10px'}}>{l}</div>)}</div>
                  </div>
                </div>
              )}
            </div>

            {(()=>{
              const last7=Array.from({length:7},(_,i)=>{
                const d=new Date(); d.setDate(d.getDate()-(6-i));
                const ds=d.toISOString().split('T')[0];
                const entries=journal.filter(j=>j.date.startsWith(ds));
                const avg=entries.length?entries.reduce((s,j)=>s+j.mood,0)/entries.length:null;
                return {day:d.toLocaleDateString('en-ZA',{weekday:'short'}),mood:avg};
              });
              const moodEmoji=['😢','😟','😐','🙂','😊'];
              return (
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                  <div className="text-slate-800 font-semibold text-sm mb-3">Mood This Week</div>
                  <div className="flex justify-between items-end gap-1">
                    {last7.map((d,i)=>(
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div className="text-xl">{d.mood!==null?moodEmoji[Math.round(d.mood)-1]:'·'}</div>
                        <div className="text-slate-400 text-xs">{d.day}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
            {cravings.length>0&&(()=>{
              const hourCounts=Array(24).fill(0);
              cravings.forEach(c=>{hourCounts[new Date(c.timestamp).getHours()]++;});
              const peakHour=hourCounts.indexOf(Math.max(...hourCounts));
              const h12=peakHour%12||12; const ampm=peakHour<12?'AM':'PM';
              return (
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                  <div className="text-slate-800 font-semibold text-sm mb-2">Craving Pattern</div>
                  <div className="text-slate-600 text-sm">Your cravings most often hit around <span className="text-teal-600 font-semibold">{h12}:00 {ampm}</span>.</div>
                  <div className="text-slate-400 text-xs mt-1">Plan ahead — have your Emergency Kit ready at this time.</div>
                </div>
              );
            })()}
          </>
        )}
      </div>
    </div>
  );
}
