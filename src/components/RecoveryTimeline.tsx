import { IconBody, IconChevron } from './Icons';
import { useState, useEffect } from 'react';
import BackButton from './BackButton';

interface Props { soberDays: number; soberHours: number; onBack: () => void; }

const MILESTONES = [
  {
    hours: 6, label: '6 Hours', icon: '⚡', color: 'teal',
    summary: 'Alcohol is leaving your bloodstream.',
    body: [
      'Blood alcohol concentration is returning to zero — your liver has been processing roughly one standard drink per hour.',
      'Blood pressure begins to drop for the first time. The cardiovascular strain caused by alcohol starts to ease.',
      'Your liver begins prioritising toxin filtration over everything else. Liver enzymes are still elevated but the damage rate is slowing.',
      'Blood sugar levels may drop — alcohol disrupts insulin function and glucose regulation. You may feel shaky, light-headed, or hungry.',
      'Your kidneys, which were working overtime as a diuretic, begin to rebalance fluid levels.',
    ],
    mind: [
      'Anxiety may spike noticeably — this is GABA rebound. Alcohol was artificially stimulating your GABA receptors (your brain\'s calming system). Without it, your nervous system feels like the brakes have been cut.',
      'You may feel more alert than expected, or conversely, deeply fatigued. Both are normal — your brain is doing rapid chemistry.',
      'Irritability and restlessness are common. Your dopamine system is already beginning to register the absence of its regular chemical boost.',
      'The emotional rawness you feel is real — alcohol was a buffer between you and your feelings. Those feelings are now accessible for the first time in however long.',
    ],
    experience: 'Physically: sweating, tremors, headache, nausea are all possible. Emotionally: raw, anxious, and acutely aware.',
    tip: 'Drink water constantly. Eat something — even plain crackers help blood sugar. Rest. This is the hardest stretch.',
  },
  {
    hours: 12, label: '12 Hours', icon: '🌅', color: 'amber',
    summary: 'Your body is fully in withdrawal management mode.',
    body: [
      'Your blood sugar is still volatile. Eating small amounts regularly helps enormously.',
      'Sweating may intensify as your body works to eliminate alcohol metabolites through your skin.',
      'Heart rate remains elevated — the heart was using alcohol as a rhythm regulator and is now recalibrating.',
      'Your stomach lining, inflamed by alcohol, is beginning its first hours of healing. Nausea and discomfort are your body doing this work.',
      'Dehydration is significant — drink far more water than feels necessary.',
    ],
    mind: [
      'Sleep tonight will likely be difficult. Alcohol suppressed REM sleep for years — without it, your brain doesn\'t yet know how to cycle normally. You may have vivid or disturbing dreams if you do sleep.',
      'Anxiety may peak around this time — GABA rebound is at full intensity. The Emergency Kit breathing exercises physically lower the anxiety response.',
      'Racing thoughts, difficulty concentrating, and emotional swings are all neurological — not personal weakness.',
      'You may experience a strange clarity and heaviness at the same time. Both are real. Your brain is doing hard chemistry right now.',
    ],
    experience: 'Peak discomfort often hits between 12 and 24 hours. This is the toughest window.',
    tip: 'Don\'t be alone if you can help it. Have someone check in on you. If tremors are severe — please seek medical attention.',
  },
  {
    hours: 24, label: '24 Hours', icon: '🌱', color: 'green',
    summary: 'One full day. Your body is in active healing.',
    body: [
      'Heart rate and blood pressure are both measurably improving. The risk of heart attack drops in just the first 24 hours without alcohol.',
      'Your liver has cleared the bulk of the alcohol — it\'s now in full repair mode, addressing the inflammation and fatty deposits that built up.',
      'Blood pressure, often chronically elevated by heavy drinking, begins a sustained drop that will continue for weeks.',
      'Hydration is restoring. Your kidneys are functioning better. Cell hydration is normalising throughout your body.',
      'Your immune system — chronically suppressed by alcohol — is beginning to come back online.',
    ],
    mind: [
      'Cravings will likely peak in the next 24 to 48 hours. This is neurological — the dopamine system seeking its old stimulus. Ride the wave. Use the Emergency Kit.',
      'You may feel proud and frightened at the same time. Both are appropriate responses to doing something hard.',
      'The emotional volatility is still present. Don\'t make major life decisions today — your emotional regulation is still coming back online.',
      'Some people report a strange sense of clarity at the 24-hour mark — a window of resolve and purpose. Hold onto it.',
    ],
    experience: 'Nausea usually peaks and begins to ease. Anxiety remains. A cautious sense of possibility may emerge.',
    tip: 'Acknowledge 24 hours. It\'s real. Tell someone who will celebrate it with you.',
  },
  {
    hours: 48, label: '48 Hours', icon: '🌿', color: 'green',
    summary: 'The hardest window. Your nervous system is rebuilding.',
    body: [
      'Nerve endings begin regrowing — this is why your sense of smell and taste starts returning, sometimes almost overwhelming in its vividness.',
      'Dopamine receptors are beginning to upregulate — your brain is slowly rebuilding its ability to experience natural pleasure.',
      'The risk of alcohol withdrawal seizures is highest in this window (especially in heavy, long-term drinkers). If you feel confused, see lights, or have any unusual neurological symptoms — seek help immediately.',
      'Your skin is beginning to rehydrate. The puffiness and redness associated with heavy drinking starts to reduce.',
      'Gut bacteria — severely disrupted by alcohol — begin the slow process of rebalancing.',
    ],
    mind: [
      'Hallucinations or vivid, disturbing dreams are possible at the 48-hour mark — particularly for heavy long-term drinkers. This is your brain chemistry in extreme flux. It passes.',
      'The obsessive thinking about alcohol that many people describe at this stage is real. Your prefrontal cortex is fighting for control against deeply ingrained neural pathways.',
      'Depression may feel profound. Your brain\'s natural feel-good chemistry is at its lowest point — it hasn\'t yet rebuilt its own production.',
      'Irritability, anger, or sudden tears are all normal. You\'re going through chemical withdrawal from one of the most powerful psychoactive substances humans consume.',
    ],
    experience: 'Often described as the hardest point. Not the peak of symptoms — but the accumulation of everything at once.',
    tip: 'Do not be alone tonight. Call someone. Watch something. Get through the night. 72 hours is a very different place.',
  },
  {
    hours: 72, label: '72 Hours', icon: '💪', color: 'teal',
    summary: 'Acute withdrawal peaks and begins to ease.',
    body: [
      'Dopamine receptors are healing and beginning to respond to natural pleasures again — food, music, conversation may start to feel meaningful.',
      'Energy levels, rock bottom in the first 48 hours, begin a gradual improvement as your mitochondria (cell energy factories) recover from alcohol\'s toxic effects.',
      'Blood pressure is measurably lower than it was at the start. Cardiovascular function is genuinely improving.',
      'Your liver is in active fat reduction — the fatty deposits that accumulate with heavy drinking are beginning to clear.',
      'The most severe acute withdrawal symptoms — seizures, hallucinations — are largely past this window for most people.',
    ],
    mind: [
      'The fog is lifting. The first signs of mental clarity return — concentration may still be poor but the profound confusion of the first 48 hours is easing.',
      'Most acute physical withdrawal symptoms begin their descent from peak intensity. The severity curve bends.',
      'Sleep quality, while still disrupted, often improves slightly around 72 hours. Your brain is beginning to rebuild normal sleep architecture.',
      'You may feel a genuine sense of accomplishment and also profound tiredness. Both are appropriate. You just did something hard.',
    ],
    experience: '72 hours is a recognised milestone in addiction medicine. The acute crisis phase is ending. What comes next is recovery proper.',
    tip: 'You made it through the hardest part. Now build structure — routines, meals, sleep schedules. The brain craves predictability as it heals.',
  },
  {
    hours: 168, label: '1 Week', icon: '🌳', color: 'teal',
    summary: 'Your body is noticeably healing. The fog is lifting.',
    body: [
      'Liver inflammation reduces measurably in the first week. Liver enzymes — AST and ALT — begin returning toward normal ranges.',
      'Sleep quality takes a significant step forward at one week. REM sleep is slowly being rebuilt. You may dream vividly — this is healing.',
      'Skin hydration and elasticity visibly improve. The yellow tinge of mild jaundice (if present) begins to fade.',
      'Blood pressure continues its sustained drop — often reaching the healthiest levels in years.',
      'Your sense of smell and taste are substantially restored. Food smells, fresh air, and small sensory pleasures are noticeably different.',
      'Weight may begin to shift — the empty calories of alcohol are gone. Digestion is improving.',
    ],
    mind: [
      'Mental clarity improves noticeably in week one. Concentration begins returning. Short-term memory improves.',
      'Anxiety, while still present, has reduced significantly from its peak. The GABA system is rebuilding its natural regulation.',
      'Mood is more stable — not necessarily good, but less violently swinging. Emotional regulation is gradually returning.',
      'You may begin to feel the psychological benefit of the decision itself — pride, resolve, a sense of agency returning.',
      'The cravings are less constant. They come in waves rather than as a relentless background hum.',
    ],
    experience: 'Many people describe week one as a combination of exhaustion, cautious pride, and the first glimpses of feeling like themselves again.',
    tip: 'Structure is everything right now — regular sleep, regular meals, regular movement. The brain rebuilds in routine.',
  },
  {
    hours: 336, label: '2 Weeks', icon: '🌊', color: 'blue',
    summary: 'Real physical changes you can see and feel.',
    body: [
      'Blood pressure is often in its healthiest range in years — sustained reduction with every passing day.',
      'Immune system function has substantially improved. Your body\'s ability to fight infection is returning to normal.',
      'The skin transformation is visible — puffiness, redness, and inflammation have reduced significantly. Many people report that people start commenting on how well they look.',
      'Liver fat deposits are meaningfully reduced. The liver is doing a remarkable amount of self-repair in two weeks.',
      'Digestive regularity returning — the gut lining is healing, gut bacteria are rebalancing, and nutrient absorption is improving.',
      'Hydration is fully restored. The chronic dehydration of heavy drinking is resolved.',
    ],
    mind: [
      'Cognitive function takes a major step forward at two weeks. Processing speed, working memory, and decision-making measurably improve.',
      'Concentration and focus return more consistently. Many people notice they can read, follow conversations, and think through problems much more effectively.',
      'Emotional regulation continues to strengthen. Fewer sudden tears, less irrational anger, more access to calm.',
      'Sleep has improved meaningfully. REM sleep cycles are more regular. Dreams are vivid but usually less disturbing.',
      'Social confidence often begins to return — the social anxiety that alcohol was "treating" remains, but you\'re learning to manage it differently.',
    ],
    experience: 'Two weeks is the point where most people report that the decision to stop feels undeniably worth it — the physical evidence is too clear to ignore.',
    tip: 'Keep going. The second month is often described as the most psychologically interesting — your real personality re-emerges.',
  },
  {
    hours: 720, label: '1 Month', icon: '🏆', color: 'amber',
    summary: 'One month. Your brain and body are transforming.',
    body: [
      'Liver function is dramatically improved. A month of sobriety can reverse years of fatty liver disease for many people — the liver is one of the few organs that can fully regenerate.',
      'The stomach lining has substantially healed. Acid reflux, bloating, and digestive discomfort that you may have normalised are often gone.',
      'Cancer risk reduction begins — the carcinogenic effects of alcohol are dose-dependent and begin reversing from day one, but at one month the benefit is measurable.',
      'Heart health markers — cholesterol, blood pressure, heart rate variability — are all in meaningfully better territory.',
      'Body composition may have changed. Without the empty calories and the cortisol spikes that alcohol causes, many people find weight begins to normalise.',
      'Your palate has fully reset. The taste and texture of food is richer and more complex than it\'s been in years.',
    ],
    mind: [
      'Brain fog — the dull, slow thinking many heavy drinkers normalise — is largely resolved. Many people describe this as feeling like they were living behind glass and now the glass is gone.',
      'Anxiety and depression symptoms measurably reduce at one month. The neurochemistry is genuinely more balanced.',
      'Sleep has entered normal REM cycles for most people. The deep, restorative sleep that alcohol was always suppressing is now accessible.',
      'Emotional depth returns. The full range of emotions — not just the numbed and then flooded version — becomes accessible. This includes difficult emotions, but also genuine joy.',
      'Impulse control and decision-making quality are substantially improved. The prefrontal cortex is functioning better.',
      'Your sense of self is rebuilding. The sober identity, still fragile at one month, is forming.',
    ],
    experience: 'Most people describe the first month as one of the most physically transformative of their lives. The evidence of healing is undeniable.',
    tip: 'Write down everything that has changed. Concrete evidence of improvement becomes your armour against future cravings.',
  },
  {
    hours: 2160, label: '3 Months', icon: '🌟', color: 'teal',
    summary: 'Your brain is being rewired. New neural pathways are forming.',
    body: [
      'Liver function has dramatically improved for most people — by three months, liver enzyme levels are typically in the normal range.',
      'Heart disease risk has dropped significantly. Cardiovascular health markers continue to improve with every sober month.',
      'Bone density begins to increase — alcohol actively inhibits calcium absorption and bone formation. This reverses in recovery.',
      'Blood cell production normalises — alcohol suppresses bone marrow function, leading to anaemia and weakened immunity. Both are resolving.',
      'The nervous system has substantially recovered — peripheral neuropathy (numbness, tingling in hands and feet) often improves or resolves.',
      'Energy levels are consistently higher. Many people describe this as the point where they feel genuinely well rather than just less unwell.',
    ],
    mind: [
      'New neural pathways have formed. The brain\'s reward system has rebuilt new circuits for natural pleasure — food, exercise, connection, achievement genuinely feel good again.',
      'Cravings are significantly less frequent and less intense. The neural pathways of addiction are weakening from disuse.',
      'Emotional resilience is substantially stronger. You are better equipped to handle stress, disappointment, and difficult feelings than at any point in your drinking years.',
      'Cognitive performance — memory, processing speed, executive function — is close to its maximum potential recovery.',
      'Self-awareness has deepened. Three months of sobriety brings a degree of self-knowledge that many people describe as the most important thing they\'ve gained.',
      'Relationships are healing. Trust is rebuilding. The person people see across from them is more consistently present.',
    ],
    experience: 'Three months is described by many in recovery as a turning point — the point where sobriety starts to feel like a way of life rather than a battle.',
    tip: 'This is also a high-risk window for complacency. "I\'ve got this" can precede difficult days. Keep your tools close.',
  },
  {
    hours: 4380, label: '6 Months', icon: '💎', color: 'violet',
    summary: 'You are a different person in measurable, fundamental ways.',
    body: [
      'Cancer risk has dropped significantly. Six months of sobriety is associated with measurable reductions in the risk of alcohol-related cancers of the liver, bowel, breast, and oesophagus.',
      'Cardiovascular health is profoundly improved. Heart disease risk, stroke risk, and hypertension are all substantially reduced.',
      'Your immune system is fully restored and, for many people, stronger than it was before heavy drinking began.',
      'Skin quality is dramatically different — collagen production, hydration, and circulation have all improved. Most people look years younger.',
      'Brain volume has measurably increased — heavy alcohol use causes shrinkage of brain tissue that reverses significantly in recovery.',
      'Sexual health and hormonal balance have normalised — alcohol suppresses testosterone and disrupts oestrogen. Both recover with extended sobriety.',
    ],
    mind: [
      'The sober identity is solid. You are no longer fighting for sobriety — you are living it. The identity has shifted.',
      'Confidence has rebuilt from the inside — not the false confidence of alcohol but earned confidence from doing a hard thing over and over again.',
      'Long-term thinking has returned. You can plan, visualise a future, and make decisions based on your values rather than your next drink.',
      'Emotional intelligence and empathy are heightened. When you\'re actually present in your relationships, they deepen in ways that weren\'t possible while drinking.',
      'Purpose and meaning are more accessible — many people at six months describe a clarity about what matters in their life that feels entirely new.',
      'The grief work of recovery — mourning what alcohol cost you — is largely integrated. What was grief becomes motivation.',
    ],
    experience: 'Six months is the point where the people around you fully see the change. The transformation is visible to everyone.',
    tip: 'Share your story if you\'re comfortable. Your experience is someone else\'s lifeline.',
  },
  {
    hours: 8760, label: '1 Year', icon: '👑', color: 'gold',
    summary: 'One year. What you have built is extraordinary.',
    body: [
      'Your liver, one of the body\'s most regenerative organs, is largely healed. Fatty liver disease is resolved for most people. Cirrhosis in early stages can even reverse with one year of sobriety.',
      'Heart disease risk has halved. The cumulative cardiovascular benefit of one year without alcohol is substantial and evidence-based.',
      'Cancer risk reduction is significant and measurable across multiple cancer types.',
      'Your brain has fully (or substantially) recovered its lost volume. Neuroplasticity has created new structures that didn\'t exist when you were drinking.',
      'Your immune system is fully functional and robust. The susceptibility to illness that heavy drinkers experience is gone.',
      'Life expectancy has meaningfully increased — a year of sobriety adds measurable years to your life.',
      'Physical appearance has transformed — skin, eyes, body composition, and energy all reflect the health of your organs.',
    ],
    mind: [
      'Psychological wellbeing at one year of sobriety is, for most people, the highest it has been in their adult lives.',
      'The neural pathways of addiction are substantially weakened. The brain has built robust alternatives.',
      'Emotional maturity has deepened in ways that are only possible through sustained sobriety — you have been fully present in your life for a year.',
      'Relationships — repaired, deepened, or newly built — are qualitatively different from anything possible while drinking.',
      'Self-trust has returned. You made a commitment to yourself and you kept it. That changes your relationship with yourself fundamentally.',
      'Life satisfaction, measured across all domains — work, relationships, health, purpose — is dramatically higher than at the start.',
      'You have become someone that others in recovery look to. Your existence is evidence that it is possible.',
    ],
    experience: 'One year is not just a milestone — it is a transformation. The person who reaches it is fundamentally different from the one who started.',
    tip: 'Celebrate this in every way that feels right. You have done something extraordinary. Let people know. Let yourself know.',
  },
  {
    hours: 17520, label: '2 Years', icon: '🌍', color: 'teal',
    summary: 'Two years. Your new life is fully established.',
    body: [
      'All major organ systems have completed their primary healing. The body is functioning as it was designed to.',
      'Cancer risk continues to drop with every passing year of sobriety — the benefit compounds.',
      'Bone density has substantially recovered — the skeletal damage of long-term heavy drinking is largely reversed.',
      'Hormonal health is fully normalised. Fertility (for those of reproductive age) has recovered.',
      'Physical performance — strength, endurance, recovery — is at its peak without the suppression of alcohol.',
      'Sleep architecture is fully restored. Deep, restorative sleep every night.',
    ],
    mind: [
      'You have lived through every season of life sober. Holidays, anniversaries, difficult days, celebrations — all experienced authentically.',
      'The question "who am I without alcohol?" has been answered. You know who you are.',
      'Your emotional toolkit — the skills, strategies, and relationships you\'ve built in recovery — is robust and real.',
      'The cravings, if they appear, are manageable and infrequent. You have two years of evidence that you can handle them.',
      'Your relationships have been transformed. The trust, presence, and genuine intimacy of two sober years is irreplaceable.',
      'You are, in every measurable sense, living your best life.',
    ],
    experience: 'Two years is where sobriety stops being something you maintain and becomes simply who you are.',
    tip: 'Your story can change someone else\'s life. Consider sharing it.',
  },
];

export default function RecoveryTimeline({ soberDays, soberHours, onBack }: Props) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // Compute live elapsed time from soberDays + soberHours
  const totalSecondsElapsed = soberDays * 86400 + soberHours * 3600;
  const totalHours = totalSecondsElapsed / 3600;

  // Live display values
  const liveD = soberDays;
  const liveH = soberHours % 24;
  const liveM = Math.floor((now / 1000) % 60);
  const liveS = Math.floor(now / 1000) % 60;

  const currentIdx = (() => {
    let idx = -1;
    for (let i = 0; i < MILESTONES.length; i++) {
      if (totalHours >= MILESTONES[i].hours) idx = i;
    }
    return idx;
  })();

  const colorMap: Record<string, string> = {
    teal: 'bg-teal-500', amber: 'bg-amber-500', green: 'bg-green-500',
    blue: 'bg-blue-500', violet: 'bg-violet-500', gold: 'bg-yellow-500',
  };
  const bgMap: Record<string, string> = {
    teal: 'bg-teal-50 border-teal-200', amber: 'bg-amber-50 border-amber-200',
    green: 'bg-green-50 border-green-200', blue: 'bg-blue-50 border-blue-200',
    violet: 'bg-violet-50 border-violet-200', gold: 'bg-yellow-50 border-yellow-200',
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="flex items-center gap-3 px-4 py-4 bg-white border-b border-slate-100">
        <BackButton onClick={onBack} />
        <div className="flex-1">
          <div className="flex items-center gap-2"><IconBody size={18} color="#059669"/><span className="text-slate-800 font-bold">Body Recovery Timeline</span></div>
          <div className="text-teal-600 text-xs font-mono font-semibold">
            {liveD}d {String(liveH).padStart(2,'0')}h {String(liveM).padStart(2,'0')}m {String(liveS).padStart(2,'0')}s sober
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3">
        <div className="bg-teal-50 rounded-2xl p-4 border border-teal-100 text-xs text-teal-700 leading-relaxed">
          Based on published medical research on alcohol withdrawal and recovery. Every timeline is individual — this is evidence-based guidance, not a guarantee. Tap any milestone to learn more, including future ones.
        </div>

        {MILESTONES.map((m, i) => {
          const achieved = totalHours >= m.hours;
          const isCurrent = i === currentIdx;
          const isOpen = expanded === i;
          const isNext = i === currentIdx + 1;

          return (
            <div key={i} className={`rounded-2xl border transition-all ${
              isCurrent ? bgMap[m.color] + ' shadow-sm' :
              achieved ? 'bg-white border-slate-100' :
              'bg-white border-slate-100'
            }`}>
              <button className="w-full px-4 py-4 text-left" onClick={() => setExpanded(isOpen ? null : i)}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0 ${
                    isCurrent ? colorMap[m.color] : achieved ? 'bg-teal-100' : 'bg-slate-100'
                  }`}>
                    {m.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-bold text-sm ${isCurrent ? 'text-slate-800' : achieved ? 'text-slate-800' : 'text-slate-500'}`}>{m.label}</span>
                      {isCurrent && <span className={`${colorMap[m.color]} text-white text-xs px-2 py-0.5 rounded-full font-semibold`}>YOU ARE HERE</span>}
                      {isNext && !achieved && <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full font-semibold">Up Next</span>}
                      {achieved && !isCurrent && <span className="text-teal-500 text-xs font-medium">✓ Achieved</span>}
                    </div>
                    <div className={`text-xs mt-0.5 ${isCurrent ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>{m.summary}</div>
                  </div>
                  <div className={`text-slate-400 text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</div>
                </div>
              </button>

              {isOpen && (
                <div className="px-4 pb-5 space-y-4 border-t border-slate-100 pt-4">
                  {!achieved && (
                    <div className="bg-amber-50 rounded-xl p-3 border border-amber-100 text-xs text-amber-700 leading-relaxed">
                      🔮 You haven't reached this milestone yet — but here's what to expect when you do. Consider it a roadmap.
                    </div>
                  )}

                  {/* Body */}
                  <div>
                    <div className="text-emerald-700 font-bold text-xs uppercase tracking-wider mb-2">🫀 What's Happening in Your Body</div>
                    <div className="space-y-2">
                      {m.body.map((point, j) => (
                        <div key={j} className="flex gap-2 bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                          <div className="text-emerald-400 text-xs mt-0.5 flex-shrink-0">•</div>
                          <div className="text-slate-700 text-sm leading-relaxed">{point}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mind */}
                  <div>
                    <div className="text-violet-700 font-bold text-xs uppercase tracking-wider mb-2">🧠 What's Happening in Your Mind</div>
                    <div className="space-y-2">
                      {m.mind.map((point, j) => (
                        <div key={j} className="flex gap-2 bg-violet-50 rounded-xl p-3 border border-violet-100">
                          <div className="text-violet-400 text-xs mt-0.5 flex-shrink-0">•</div>
                          <div className="text-slate-700 text-sm leading-relaxed">{point}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Experience */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <div className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-1">What to Expect</div>
                    <div className="text-slate-600 text-sm leading-relaxed">{m.experience}</div>
                  </div>

                  {/* Tip */}
                  <div className="bg-teal-50 rounded-xl p-3 border border-teal-100">
                    <div className="text-teal-600 font-bold text-xs uppercase tracking-wider mb-1">💡 Tip for This Stage</div>
                    <div className="text-slate-700 text-sm leading-relaxed">{m.tip}</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        <div className="text-center text-slate-400 text-xs pb-4 px-4 leading-relaxed">
          Based on peer-reviewed research on alcohol use disorder recovery. Individual experiences vary. Consult a medical professional if you have concerns about withdrawal.
        </div>
      </div>
    </div>
  );
}
