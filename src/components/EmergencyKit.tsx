import React, { useState, useEffect, useRef } from 'react';
import type { UserProfile } from '../types';
import { speak, stopSpeaking } from '../utils/tts';
import { startAmbient, stopAmbient, type AmbientType } from '../utils/ambient';
import SoberBuddyChat from './SoberBuddyChat';
import { IconPhone, IconWind, IconLeaf, IconBrain, IconHeart, IconPuzzle, IconBody, IconTimer, IconProgress } from './Icons';

interface EmergencyKitProps {
  profile: UserProfile | null;
  soberDays: number;
  reasons: string[];
  onLogCraving: (intensity: number) => void;
  onBack: () => void;
  onNavigatePuzzle?: () => void;
  initialTab?: Tab;
}

type Tab = 'home' | 'breathing' | 'meditation' | 'cbt' | 'reasons' | 'halt' | 'tape_forward' | 'urge_timer' | 'mindfulness';

const BREATHING_PATTERNS = [
  { name: 'Box', in: 4, hold1: 4, out: 4, hold2: 4, desc: 'Equal sides — grounds you instantly' },
  { name: '4-7-8', in: 4, hold1: 7, out: 8, hold2: 0, desc: 'Activates your calming nervous system' },
  { name: 'Calm', in: 5, hold1: 0, out: 5, hold2: 0, desc: 'Simple equal breathing to slow your heart' },
  { name: 'Power', in: 6, hold1: 2, out: 8, hold2: 0, desc: 'Extended exhale defeats anxiety fast' },
  { name: 'Reset', in: 3, hold1: 1, out: 6, hold2: 2, desc: 'Quick reset for intense cravings' },
  { name: 'Triangle', in: 4, hold1: 4, out: 4, hold2: 0, desc: 'Three-part rhythm to clear your mind' },
  { name: 'Anchor', in: 6, hold1: 0, out: 6, hold2: 0, desc: 'Slow anchor breathing for deep calm' },
  { name: 'Rescue', in: 2, hold1: 0, out: 4, hold2: 0, desc: 'Fast rescue breath for crisis moments' },
  { name: 'Ocean', in: 5, hold1: 2, out: 7, hold2: 1, desc: 'Wave rhythm — ride the urge out' },
  { name: 'Morning', in: 4, hold1: 0, out: 6, hold2: 2, desc: 'Start your sober day with intention' },
  { name: 'Coherent', in: 5, hold1: 0, out: 5, hold2: 0, desc: '5-5 breath syncs heart and mind' },
  { name: '6-2-8', in: 6, hold1: 2, out: 8, hold2: 0, desc: 'Deep calm for high-anxiety moments' },
  { name: 'Square+', in: 5, hold1: 5, out: 5, hold2: 5, desc: 'Extended box for deep grounding' },
  { name: 'Warrior', in: 4, hold1: 0, out: 4, hold2: 0, desc: 'Steady warrior breath — stay strong' },
  { name: 'Night', in: 4, hold1: 7, out: 8, hold2: 0, desc: 'Wind down before sleep — gentle 4-7-8' },
];

const ALL_KIT_TOOLS = [
  { id: 'breathing', label: 'Breathing Exercise', desc: 'Calm your mind and body.' },
  { id: 'puzzle', label: 'Interactive Puzzle', desc: 'Engage your mind to overcome cravings.' },
  { id: 'cbt', label: 'CBT Guide', desc: 'Challenge negative thoughts.' },
  { id: 'meditation', label: 'Guided Meditation', desc: 'Find calm with a guided session.' },
  { id: 'halt', label: 'H.A.L.T. Check-in', desc: 'Are you Hungry, Angry, Lonely, or Tired?' },
  { id: 'urge_timer', label: '15-Minute Urge Timer', desc: 'Ride the wave until it passes.' },
  { id: 'tape_forward', label: 'Play the Tape Forward', desc: 'Visualise the consequences of giving in.' },
  { id: 'mindfulness', label: 'Mindfulness Training', desc: 'Practice staying present and grounded.' },
  { id: 'reasons', label: 'My Reasons', desc: 'Remember why you started.' },
  { id: 'quote', label: 'Quick Reminder', desc: 'A motivating quote to keep you going.' },
];

const DEFAULT_KIT_TOOLS = ['breathing', 'puzzle', 'cbt', 'halt', 'urge_timer', 'reasons', 'quote'];

const QUICK_REMINDERS = [
  "The uncomfortable feelings won't kill you. Drinking might.",
  "You didn't come this far to only come this far.",
  "One day at a time. Just today.",
  "The only way out is through.",
  "Your future self is counting on you right now.",
  "Cravings pass. Regret can last forever.",
  "You are not your addiction. You are so much more.",
  "Every sober hour is a victory worth celebrating.",
  "The pain of discipline is nothing like the pain of regret.",
  "You've survived 100% of your hardest days so far.",
  "Sobriety is not a punishment. It's a gift you give yourself.",
  "This moment will pass. Hold on.",
  "Be the person your sober self deserves.",
  "Strength doesn't come from what you can do — it comes from what you thought you couldn't.",
  "Recovery is not a race. You don't have to feel guilty about how long the journey takes.",
];

const MEDITATIONS = [
  {
    id: 'urge_surf', title: 'Urge Surfing', duration: '5 min', icon: '🌊',
    desc: 'Ride the craving like a wave', ambient: 'ocean' as AmbientType,
    script: [
      "Find a comfortable position. Close your eyes if you can. Take a slow breath in... and out.",
      "Notice the craving that's with you right now. Don't fight it. Just observe it.",
      "Where do you feel it in your body? Your chest? Your throat? Your stomach? Just notice.",
      "Imagine the craving is a wave in the ocean. It rises... it peaks... and it falls.",
      "You are not the wave. You are the surfer. You can ride this.",
      "Breathe in for 4... hold for 2... breathe out for 6.",
      "The wave is at its peak right now. Feel it. It cannot hurt you. It can only pass.",
      "Cravings last 3 to 20 minutes. You only need to survive this moment.",
      "The wave is starting to fall now. Feel your body begin to relax.",
      "You are stronger than this craving. You have survived every single one until now.",
      "Take one more deep breath... and know that you've got through this.",
    ]
  },
  {
    id: 'body_scan', title: 'Body Scan', duration: '7 min', icon: '🧘',
    desc: 'Release tension from head to toe', ambient: 'rain' as AmbientType,
    script: [
      "Lie down or sit comfortably. Close your eyes. Let your body become heavy.",
      "Take three deep breaths. In through your nose... out through your mouth.",
      "Bring your attention to the top of your head. Notice any tension there. Let it go.",
      "Move your attention down to your forehead. Your eyes. Your jaw. Let them soften.",
      "Notice your neck and shoulders. This is where many of us carry our stress. Breathe into them.",
      "Feel your chest. Your heart beating. Each beat is proof of your strength.",
      "Move down to your stomach. Let it be soft. You are safe right now.",
      "Notice your arms. Your hands. Open your fingers and let the tension pour out.",
      "Your lower back. Your hips. Sinking down, relaxing, releasing.",
      "Your legs. Your feet. Feel the ground beneath you. You are supported.",
      "You are completely relaxed. In this moment, you are okay. You are safe. You are sober.",
    ]
  },
  {
    id: 'gratitude', title: 'Gratitude Reset', duration: '4 min', icon: '🌟',
    desc: 'Shift your mindset with gratitude', ambient: 'forest' as AmbientType,
    script: [
      "Close your eyes. Take a slow breath. We're going to shift your focus for a few minutes.",
      "Think of one person in your life who you are grateful for. Picture their face.",
      "What has this person given you? Their time? Their love? Their support?",
      "Now think of one thing about your body you're grateful for. Your lungs that breathe. Your heart that beats.",
      "Think of one small thing today that went okay. Even something tiny counts.",
      "Now think about your sobriety. Every sober day is a gift you've given yourself.",
      "Think of the clearest head you've had. The best sleep. The money you've kept.",
      "These are all yours. Nobody can take them from you.",
      "Take a deep breath of gratitude. You are building something real.",
      "When you're ready, open your eyes. You've got this.",
    ]
  },
  {
    id: 'safe_place', title: 'Safe Place', duration: '6 min', icon: '🏡',
    desc: 'Visualise your calm, safe space', ambient: 'fire' as AmbientType,
    script: [
      "Close your eyes. Take three slow breaths. Let your body settle.",
      "Imagine a place where you feel completely safe. It could be real or imagined.",
      "Maybe it's a beach. A forest. A cozy room. A mountain top. Choose your place.",
      "Step into it now. Look around. What do you see? Notice the colours, the light.",
      "What do you hear? Waves? Wind in trees? Silence? The crackling of a fire?",
      "What do you feel? Warm sun? A cool breeze? The ground beneath your feet?",
      "You are completely safe here. Nothing can harm you in this place.",
      "There is no craving here. No pressure. No past. Just you, in this moment.",
      "Stay here as long as you need. Breathe slowly. Let your body believe it.",
      "When you're ready, take this feeling of safety back with you. It's always inside you.",
    ]
  },
  {
    id: 'self_compassion', title: 'Self-Compassion', duration: '5 min', icon: '💚',
    desc: 'Be kind to yourself right now', ambient: 'rain' as AmbientType,
    script: [
      "Close your eyes. Take a breath. This meditation is about being kind to yourself.",
      "You are fighting one of the hardest battles a person can face. That deserves respect.",
      "Place one hand on your heart. Feel it beating. This heart has carried you through so much.",
      "Say these words silently to yourself: I am doing the best I can.",
      "Again: I am doing the best I can.",
      "Recovery is not linear. Struggling doesn't mean failing. Struggling means you're still in the fight.",
      "Think of how you would speak to a dear friend who was going through what you're going through.",
      "Speak those same words to yourself now. You deserve that same kindness.",
      "You are not broken. You are healing. There is a difference.",
      "Take a deep breath. Place both hands over your heart. You are worthy of this journey.",
      "When you're ready, open your eyes. Be gentle with yourself today.",
    ]
  },
];

const CBT_GUIDES = [
  {
    id: 'thought_challenge', title: 'Challenge the Thought', icon: '🧠', desc: 'Examine and reframe a craving thought',
    steps: [
      { q: "What is the exact thought or urge?", placeholder: "e.g. I need a drink to relax..." },
      { q: "What evidence supports this thought?", placeholder: "e.g. It has helped me relax before..." },
      { q: "What evidence contradicts it?", placeholder: "e.g. It always led to more drinks..." },
      { q: "What would you say to a friend having this thought?", placeholder: "e.g. You don't need alcohol to relax..." },
      { q: "Write a more balanced thought:", placeholder: "e.g. I feel tense right now. That's okay. I can relax without alcohol." },
    ]
  },
  {
    id: 'urge_surf_cbt', title: 'Surf the Urge', icon: '🌊', desc: 'Ride out the craving without acting on it',
    steps: [
      { q: "Rate your urge right now (1–10):", placeholder: "e.g. 8" },
      { q: "Where do you feel it in your body?", placeholder: "e.g. Tight chest, restless hands..." },
      { q: "What triggered this urge?", placeholder: "e.g. Stress at work, seeing others drink..." },
      { q: "What do you predict will happen if you do not drink?", placeholder: "e.g. The urge will pass, I'll feel proud..." },
      { q: "What will you do for the next 20 minutes instead?", placeholder: "e.g. Go for a walk, call someone, breathe..." },
    ]
  },
  {
    id: 'cost_benefit', title: 'Cost-Benefit Check', icon: '⚖️', desc: 'Weigh the real costs vs the false benefits',
    steps: [
      { q: "What do you think drinking will give you right now?", placeholder: "e.g. Relief from anxiety, fun, sleep..." },
      { q: "What are the short-term costs of drinking today?", placeholder: "e.g. Break my streak, feel guilty tomorrow..." },
      { q: "What are the long-term costs?", placeholder: "e.g. Damage relationships, health, self-respect..." },
      { q: "What does staying sober give you today?", placeholder: "e.g. Pride, clarity, another day added to my streak..." },
      { q: "Looking at this honestly, what's the right choice?", placeholder: "e.g. Staying sober is clearly worth it..." },
    ]
  },
  {
    id: 'trigger_plan', title: 'Trigger Action Plan', icon: '🎯', desc: 'Build your personal response to triggers',
    steps: [
      { q: "What situation triggered this craving?", placeholder: "e.g. Argument with partner, Friday evening..." },
      { q: "What emotion are you feeling underneath the urge?", placeholder: "e.g. Lonely, anxious, bored, angry..." },
      { q: "What need is this emotion pointing to?", placeholder: "e.g. I need connection, rest, to feel heard..." },
      { q: "How can you meet that need WITHOUT alcohol?", placeholder: "e.g. Call a friend, take a walk, journal..." },
      { q: "Write your action plan for next time this trigger appears:", placeholder: "e.g. When I feel lonely on Friday evenings, I will..." },
    ]
  },
  {
    id: 'relapse_review', title: 'Relapse Prevention', icon: '🛡️', desc: 'Identify your high-risk situations',
    steps: [
      { q: "What are your top 3 high-risk situations?", placeholder: "e.g. Fridays, social events, stress at work..." },
      { q: "What thoughts usually come before a drink?", placeholder: "e.g. I deserve it, just one will not hurt..." },
      { q: "What early warning signs tell you you're struggling?", placeholder: "e.g. Irritable, isolating, skipping meetings..." },
      { q: "Who are your 3 support people you can call?", placeholder: "e.g. John, my sister, my sponsor..." },
      { q: "What is your emergency plan for a high-risk moment?", placeholder: "e.g. Leave, call John, open this app..." },
    ]
  },
  {
    id: 'identity_shift', title: 'Identity Shift', icon: '🦋', desc: 'Reinforce your sober identity',
    steps: [
      { q: "Complete: I am not a person who drinks. I am a person who...", placeholder: "e.g. takes care of my family, values my health..." },
      { q: "What kind of person are you becoming through sobriety?", placeholder: "e.g. Present, reliable, clear-headed, free..." },
      { q: "What have you already achieved sober that you couldn't have drunk?", placeholder: "e.g. Woke up clear-headed, kept my word..." },
      { q: "Write a statement about who you are now:", placeholder: "e.g. I am someone who faces life on life's terms..." },
      { q: "Read that statement out loud. How does it feel?", placeholder: "e.g. It feels true. It feels like me." },
    ]
  },
  {
    id: 'shame_release', title: 'Release the Shame', icon: '💜', desc: 'Work through guilt without giving up',
    steps: [
      { q: "What are you feeling ashamed or guilty about right now?", placeholder: "e.g. I drank last night, I let people down..." },
      { q: "Is this shame helping you or hurting you right now?", placeholder: "e.g. It's making me want to escape more..." },
      { q: "What would you say to someone else who made this mistake?", placeholder: "e.g. You're human. One slip doesn't erase your effort..." },
      { q: "What is one thing you can do TODAY to move forward?", placeholder: "e.g. Reset my counter, call my support person..." },
      { q: "Write yourself a message of self-compassion:", placeholder: "e.g. I am still worthy of recovery. I get back up." },
    ]
  },
  {
    id: 'craving_anatomy', title: 'Anatomy of a Craving', icon: '🔬', desc: 'Understand your craving to defeat it',
    steps: [
      { q: "When exactly did the craving start?", placeholder: "e.g. 5pm when I got home from work..." },
      { q: "What were you doing, feeling, or thinking just before it hit?", placeholder: "e.g. Driving past the bottle store, feeling lonely..." },
      { q: "How intense is it right now on a scale of 1–10?", placeholder: "e.g. 7 out of 10" },
      { q: "What does your mind tell you will happen if you drink?", placeholder: "e.g. I'll relax, the anxiety will stop..." },
      { q: "What do you KNOW will actually happen?", placeholder: "e.g. I'll feel worse, regret it, have to restart..." },
    ]
  },
  {
    id: 'alcohol_lies', title: 'Alcohol Lies', icon: '🚫', desc: 'Expose the false promises of alcohol',
    steps: [
      { q: "What is alcohol promising you right now?", placeholder: "e.g. You'll feel better, relax, have fun..." },
      { q: "Has alcohol actually delivered on that promise before? What really happened?", placeholder: "e.g. I felt relief for an hour then felt worse..." },
      { q: "What has alcohol taken from you?", placeholder: "e.g. Years, health, relationships, money, dignity..." },
      { q: "Complete this: Alcohol told me I needed it to cope, but the truth is...", placeholder: "e.g. I already have what I need inside me..." },
      { q: "What is one thing sobriety has given you that alcohol never could?", placeholder: "e.g. Waking up clear, being present for my family..." },
    ]
  },
  {
    id: 'values_anchor', title: 'Values Anchor', icon: '⚓', desc: 'Ground yourself in what truly matters',
    steps: [
      { q: "Name your top 3 values (e.g. family, honesty, health):", placeholder: "e.g. Family, freedom, self-respect..." },
      { q: "How does staying sober today connect to those values?", placeholder: "e.g. Sobriety means I'm present for my kids..." },
      { q: "Who in your life is affected by your recovery?", placeholder: "e.g. My children, my partner, myself..." },
      { q: "What would your future sober self say to you right now?", placeholder: "e.g. Hold on. You're so close. This is worth it..." },
      { q: "Write a commitment statement anchored to your values:", placeholder: "e.g. I choose sobriety because I am a person who..." },
    ]
  },
  {
    id: 'emotional_audit', title: 'Emotional Audit', icon: '🔎', desc: "Name what you're really feeling right now",
    steps: [
      { q: "List every emotion you're feeling right now, even conflicting ones:", placeholder: "e.g. Anxious, relieved, lonely, proud, bored..." },
      { q: "Which feeling is strongest? Where do you feel it in your body?", placeholder: "e.g. Anxiety — tight chest and clenched jaw..." },
      { q: "What is this emotion trying to tell you?", placeholder: "e.g. It's telling me I need rest / connection..." },
      { q: "Is this feeling based on a current fact or a fear about the future?", placeholder: "e.g. It's a fear — nothing bad is actually happening now..." },
      { q: "What is one thing you can do in the next 10 minutes without drinking?", placeholder: "e.g. Journal, walk, call someone, rest..." },
    ]
  },
  {
    id: 'grief_loss', title: 'Grieving the Drink', icon: '💧', desc: 'Process the loss of alcohol as a coping tool',
    steps: [
      { q: "What do you actually miss about drinking? Be honest.", placeholder: "e.g. The ritual, the numbing, the social ease..." },
      { q: "What need was alcohol meeting for you?", placeholder: "e.g. Relief from anxiety, belonging, escape, reward..." },
      { q: "How can you meet that same need in a healthy way now?", placeholder: "e.g. Relaxation through breathing, social ease through therapy..." },
      { q: "What has sobriety given you that alcohol never could?", placeholder: "e.g. Real sleep, real emotions, real presence..." },
      { q: "Write a goodbye to alcohol in one or two sentences:", placeholder: "e.g. You were my crutch for 25 years but you took more than you gave..." },
    ]
  },
];

export default function EmergencyKit({ profile, soberDays, reasons, onLogCraving, onBack, onNavigatePuzzle, initialTab }: EmergencyKitProps) {
  const [tab, setTab] = useState<Tab>(initialTab || 'home');
  const [urgeSeconds, setUrgeSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'in' | 'hold1' | 'out' | 'hold2'>('in');
  const [breathCount, setBreathCount] = useState(0);
  const [breathProgress, setBreathProgress] = useState(0);
  const [selectedPattern, setSelectedPattern] = useState(0);
  const [intensity, setIntensity] = useState(7);
  const [showLumi, setShowLumi] = useState(false);
  const [done, setDone] = useState(false);

  // Meditation state
  const [activeMed, setActiveMed] = useState<typeof MEDITATIONS[0] | null>(null);
  const [medStep, setMedStep] = useState(0);
  const [medRunning, setMedRunning] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const medStopRef = useRef(false);

  // CBT state
  const [activeCBT, setActiveCBT] = useState<typeof CBT_GUIDES[0] | null>(null);
  const [cbtStep, setCbtStep] = useState(0);
  const [cbtAnswers, setCbtAnswers] = useState<string[]>([]);

  // Kit home state
  const [kitTools, setKitTools] = useState<string[]>(DEFAULT_KIT_TOOLS);
  const [editMode, setEditMode] = useState(false);
  const [quote, setQuote] = useState(() => QUICK_REMINDERS[Math.floor(Math.random() * QUICK_REMINDERS.length)]);
  const [haltAnswers, setHaltAnswers] = useState<{h:boolean;a:boolean;l:boolean;t:boolean}>({h:false,a:false,l:false,t:false});

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const breathRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    import('../utils/storage').then(({ storageGet }) => {
      storageGet('kit_tools').then(v => {
        if (v) setKitTools(JSON.parse(v));
      });
    });
  }, []);

  async function saveKitTools(tools: string[]) {
    setKitTools(tools);
    const { storageSet } = await import('../utils/storage');
    await storageSet('kit_tools', JSON.stringify(tools));
  }

  function toggleKitTool(id: string) {
    const next = kitTools.includes(id) ? kitTools.filter(t => t !== id) : [...kitTools, id];
    saveKitTools(next);
  }

  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setUrgeSeconds(s => {
          if (s >= 180) { setTimerRunning(false); setDone(true); return s; }
          return s + 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerRunning]);

  useEffect(() => {
    if (tab !== 'breathing') return;
    const pattern = BREATHING_PATTERNS[selectedPattern];
    const phases: { name: typeof breathPhase; dur: number }[] = [
      { name: 'in', dur: pattern.in },
      { name: 'hold1', dur: pattern.hold1 },
      { name: 'out', dur: pattern.out },
      ...(pattern.hold2 > 0 ? [{ name: 'hold2' as typeof breathPhase, dur: pattern.hold2 }] : []),
    ].filter(p => p.dur > 0);

    let phaseIdx = 0, elapsed = 0;
    breathRef.current = setInterval(() => {
      elapsed += 0.1;
      const cur = phases[phaseIdx];
      if (elapsed >= cur.dur) {
        elapsed = 0;
        phaseIdx = (phaseIdx + 1) % phases.length;
        if (phaseIdx === 0) setBreathCount(c => c + 1);
        setBreathPhase(phases[phaseIdx].name);
      }
      setBreathProgress((elapsed / cur.dur) * 100);
    }, 100);
    return () => { if (breathRef.current) clearInterval(breathRef.current); };
  }, [tab, selectedPattern]);

  // Cleanup meditation on unmount
  useEffect(() => {
    return () => {
      medStopRef.current = true;
      stopSpeaking();
      stopAmbient(0.5);
    };
  }, []);

  async function startMeditation(med: typeof MEDITATIONS[0]) {
    setActiveMed(med);
    setMedStep(0);
    setMedRunning(true);
    medStopRef.current = false;
    startAmbient(med.ambient, 0.15);
    await runStep(med, 0);
  }

  async function runStep(med: typeof MEDITATIONS[0], step: number) {
    if (medStopRef.current || step >= med.script.length) {
      setSpeaking(false);
      setMedRunning(false);
      stopAmbient(3);
      return;
    }
    setSpeaking(true);
    setMedStep(step);
    await speak(med.script[step]);
    if (medStopRef.current) return;
    setSpeaking(false);
    await new Promise(r => setTimeout(r, 1800));
    if (!medStopRef.current) await runStep(med, step + 1);
  }

  function stopMeditation() {
    medStopRef.current = true;
    stopSpeaking();
    stopAmbient(2);
    setSpeaking(false);
    setMedRunning(false);
    setActiveMed(null);
  }

  const breathLabels = { in: 'Breathe In', hold1: 'Hold', out: 'Breathe Out', hold2: 'Hold' };
  const breathColors = { in: '#0d9488', hold1: '#7c3aed', out: '#0891b2', hold2: '#7c3aed' };

  if (showLumi) {
    return (
      <div className="fixed inset-0 bg-slate-50 z-50 flex flex-col">
        <SoberBuddyChat profile={profile} soberDays={soberDays} emergencyMode onClose={() => setShowLumi(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="flex items-center p-4 border-b border-slate-100 bg-white flex-shrink-0">
        <button onClick={tab !== 'home' ? () => setTab('home') : onBack} className="p-2 text-slate-500 hover:text-slate-800">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <div className="text-center flex-grow">
          <h1 className="font-bold text-lg text-slate-800">Emergency Kit</h1>
        </div>
        <div className="w-8"/>
      </header>

      {tab !== 'home' && (
      <div className="flex border-b border-slate-100 bg-white overflow-x-auto">
        {([
          { key: 'home', label: 'Kit', iconEl: <IconPhone size={16}/> },
          { key: 'breathing', label: 'Breathe', iconEl: <IconWind size={16}/> },
          { key: 'meditation', label: 'Meditate', iconEl: <IconLeaf size={16}/> },
          { key: 'cbt', label: 'CBT', iconEl: <IconBrain size={16}/> },
          { key: 'reasons', label: 'Reasons', iconEl: <IconHeart size={16}/> },
        ] as { key: Tab; label: string; iconEl: React.ReactNode }[]).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-shrink-0 px-4 py-3 text-xs font-semibold border-b-2 transition-colors ${
              tab === t.key ? 'text-teal-600 border-teal-500' : 'text-slate-400 border-transparent'
            }`}>
            <span className="flex items-center gap-1">{t.iconEl}{t.label}</span>
          </button>
        ))}
      </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">

        {/* ── HOME / KIT SCREEN ── */}
        {tab === 'home' && (
          <>
            {/* Call button */}
            {profile?.emergencyContact?.phone && (
              <a href={`tel:${profile.emergencyContact.phone}`}
                className="w-full bg-red-500 text-white rounded-2xl p-4 flex items-center gap-4 shadow-sm active:scale-95 transition-transform flex">
                <div className="bg-red-400 p-2 rounded-full">
                  <IconPhone size={22} color="white"/>
                </div>
                <div>
                  <div className="font-bold text-base">Call {profile.emergencyContact.name}</div>
                  <div className="text-red-100 text-xs">Tap to call immediately</div>
                </div>
              </a>
            )}

            {/* Tool list */}
            {!editMode ? (
              <div className="space-y-3">
                {kitTools.map(toolId => {
                  const tool = ALL_KIT_TOOLS.find(t => t.id === toolId);
                  if (!tool) return null;
                  if (tool.id === 'quote') return null;

                  const iconMap: Record<string, React.ReactNode> = {
                    breathing: <IconWind size={22} color="#0d9488"/>,
                    cbt: <IconBrain size={22} color="#0d9488"/>,
                    meditation: <IconLeaf size={22} color="#0d9488"/>,
                    puzzle: <IconPuzzle size={22} color="#0d9488"/>,
                    halt: <IconBody size={22} color="#0d9488"/>,
                    urge_timer: <IconTimer size={22} color="#0d9488"/>,
                    tape_forward: <IconProgress size={22} color="#0d9488"/>,
                    reasons: <IconHeart size={22} color="#0d9488"/>,
                    mindfulness: <IconLeaf size={22} color="#0d9488"/>,
                  };
                  const handleTool = () => {
                    if (tool.id === 'breathing') setTab('breathing');
                    else if (tool.id === 'cbt') setTab('cbt');
                    else if (tool.id === 'meditation') setTab('meditation');
                    else if (tool.id === 'reasons') setTab('reasons');
                    else if (tool.id === 'halt') setTab('halt');
                    else if (tool.id === 'urge_timer') { setUrgeSeconds(0); setTimerRunning(false); setDone(false); setTab('urge_timer'); }
                    else if (tool.id === 'tape_forward') setTab('tape_forward');
                    else if (tool.id === 'mindfulness') setTab('mindfulness');
                    else if (tool.id === 'puzzle') { if (onNavigatePuzzle) onNavigatePuzzle(); else onBack(); }
                  };
                  return (
                    <button key={tool.id} onClick={handleTool}
                      className="w-full bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4 text-left active:scale-[0.98] transition-transform">
                      <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                        {iconMap[tool.id]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-800 text-base">{tool.label}</div>
                        <div className="text-slate-500 text-sm mt-0.5">{tool.desc}</div>
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                      </svg>
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Edit mode */
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
                <div className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Tap to add or remove tools</div>
                {ALL_KIT_TOOLS.map(tool => {
                  const active = kitTools.includes(tool.id);
                  return (
                    <button key={tool.id} onClick={() => toggleKitTool(tool.id)}
                      className="w-full p-4 flex items-center text-left">
                      <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center flex-shrink-0 ${active ? 'bg-teal-500 border-teal-500' : 'border-slate-300'}`}>
                        {active && <span className="text-white text-xs">✓</span>}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-800 text-sm">{tool.label}</div>
                        <div className="text-slate-400 text-xs">{tool.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Quick Reminder */}
            {(kitTools.includes('quote') || !kitTools.length) && !editMode && (
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm text-center">
                <h2 className="text-base font-semibold text-slate-700 mb-4">A Quick Reminder</h2>
                <p className="text-xl font-serif italic text-slate-800 min-h-[5rem] flex items-center justify-center leading-relaxed">
                  "{quote}"
                </p>
                <button
                  onClick={() => setQuote(QUICK_REMINDERS[Math.floor(Math.random() * QUICK_REMINDERS.length)])}
                  className="mt-4 bg-slate-100 text-slate-600 font-semibold py-2 px-5 rounded-lg text-sm hover:bg-slate-200 transition-colors"
                >
                  New Quote
                </button>
              </div>
            )}
          </>
        )}

        {/* ── BREATHING TAB ── */}
        {tab === 'breathing' && (
          <>
            <div className="flex gap-2 flex-wrap">
              {BREATHING_PATTERNS.map((p, i) => (
                <button key={i} onClick={() => setSelectedPattern(i)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold ${selectedPattern === i ? 'bg-teal-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>
                  {p.name}
                </button>
              ))}
            </div>
            <div className="text-slate-500 text-xs text-center">{BREATHING_PATTERNS[selectedPattern].desc}</div>

            <div className="flex items-center justify-center py-4">
              <div className="relative w-52 h-52 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle cx="104" cy="104" r="96" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                  <circle cx="104" cy="104" r="96" fill="none" stroke={breathColors[breathPhase]} strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 96}`}
                    strokeDashoffset={`${2 * Math.PI * 96 * (1 - breathProgress / 100)}`}
                    style={{ transition: 'stroke-dashoffset 0.1s linear, stroke 0.3s' }} />
                </svg>
                <div className="text-center z-10">
                  <div className="text-slate-800 font-semibold text-xl">{breathLabels[breathPhase]}</div>
                  <div className="text-slate-400 text-sm mt-1">{breathCount} cycles</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center text-slate-500 text-xs">
              {BREATHING_PATTERNS[selectedPattern].name}: {BREATHING_PATTERNS[selectedPattern].in}s in
              {BREATHING_PATTERNS[selectedPattern].hold1 > 0 ? ` · ${BREATHING_PATTERNS[selectedPattern].hold1}s hold` : ''}
              {` · ${BREATHING_PATTERNS[selectedPattern].out}s out`}
              {BREATHING_PATTERNS[selectedPattern].hold2 > 0 ? ` · ${BREATHING_PATTERNS[selectedPattern].hold2}s hold` : ''}
            </div>
          </>
        )}

        {/* ── MEDITATION TAB ── */}
        {tab === 'meditation' && (
          <>
            {activeMed ? (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm text-center">
                  <div className="text-4xl mb-2">{activeMed.icon}</div>
                  <div className="text-slate-800 font-semibold text-lg mb-1">{activeMed.title}</div>
                  <div className="text-teal-600 text-xs mb-3">
                    Step {Math.min(medStep + 1, activeMed.script.length)} of {activeMed.script.length}
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 mb-4">
                    <div className="bg-teal-500 h-1.5 rounded-full transition-all"
                      style={{ width: `${(medStep / activeMed.script.length) * 100}%` }} />
                  </div>
                  <div className="bg-teal-50 rounded-xl p-4 text-slate-700 text-sm leading-relaxed min-h-16 text-left border border-teal-100">
                    {activeMed.script[Math.min(medStep, activeMed.script.length - 1)]}
                  </div>
                  {speaking && (
                    <div className="flex justify-center gap-1 mt-3">
                      {[0,1,2,3,4].map(i => (
                        <div key={i} className="w-1 bg-teal-400 rounded-full animate-bounce"
                          style={{ height: 16 + (i % 2) * 6, animationDelay: `${i * 0.1}s` }} />
                      ))}
                    </div>
                  )}
                  <div className="mt-3 text-slate-400 text-xs">
                    🎵 {activeMed.ambient} sounds playing
                  </div>
                </div>
                <button onClick={stopMeditation} className="w-full py-3 rounded-xl bg-slate-100 text-slate-600 font-semibold text-sm">
                  Stop Meditation
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-teal-50 rounded-xl p-3 border border-teal-100 text-xs text-teal-700">
                  🔊 Your device will speak each step aloud with ambient background sounds. Find a quiet place.
                </div>
                {MEDITATIONS.map(med => (
                  <button key={med.id} onClick={() => startMeditation(med)}
                    className="w-full bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-left active:scale-95 transition-transform">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{med.icon}</div>
                      <div className="flex-1">
                        <div className="text-slate-800 font-semibold text-sm">{med.title}</div>
                        <div className="text-slate-400 text-xs mt-0.5">{med.desc}</div>
                      </div>
                      <div>
                        <div className="text-teal-600 text-xs font-semibold">{med.duration}</div>
                        <div className="text-slate-400 text-xs">{med.ambient}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── CBT TAB ── */}
        {tab === 'cbt' && (
          <>
            {activeCBT ? (
              /* Full-screen step format */
              <div className="space-y-0 -mx-4 -mt-5">
                {/* Step header */}
                <div className="px-4 pt-4 pb-3 bg-white border-b border-slate-100">
                  <div className="text-teal-600 text-sm font-semibold mb-1">
                    Step {Math.min(cbtStep + 1, activeCBT.steps.length)} of {activeCBT.steps.length}
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1">
                    <div className="bg-teal-500 h-1 rounded-full transition-all"
                      style={{ width: `${((cbtStep + 1) / activeCBT.steps.length) * 100}%` }} />
                  </div>
                </div>
                {cbtStep < activeCBT.steps.length ? (
                  <div className="px-4 pt-5 flex flex-col min-h-[60vh]">
                    <div className="text-slate-800 font-bold text-xl mb-2">{activeCBT.steps[cbtStep].q}</div>
                    <div className="text-slate-500 text-sm mb-4 leading-relaxed">{activeCBT.steps[cbtStep].placeholder.startsWith('e.g') ? activeCBT.steps[cbtStep].placeholder.replace(/^e\.g\.,?\s*/,'').split('...')[0]+'...' : ''}</div>
                    <textarea
                      value={cbtAnswers[cbtStep] || ''}
                      onChange={e => { const a = [...cbtAnswers]; a[cbtStep] = e.target.value; setCbtAnswers(a); }}
                      placeholder={activeCBT.steps[cbtStep].placeholder}
                      rows={6}
                      className="flex-1 w-full bg-slate-50 text-slate-800 placeholder-slate-400 rounded-xl px-4 py-3 text-sm resize-none outline-none focus:ring-1 focus:ring-teal-500 border border-slate-200"
                    />
                    <div className="flex gap-3 mt-4 pb-4">
                      <button onClick={() => cbtStep > 0 ? setCbtStep(cbtStep - 1) : (setActiveCBT(null), setCbtStep(0), setCbtAnswers([]))}
                        className="flex-1 py-3.5 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm">Prev</button>
                      <button onClick={() => setCbtStep(cbtStep + 1)}
                        className="flex-1 py-3.5 rounded-xl bg-teal-600 text-white font-bold text-sm">
                        {cbtStep === activeCBT.steps.length - 1 ? 'Complete ✓' : 'Next'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="px-4 pt-8 text-center">
                    <div className="text-5xl mb-3">✅</div>
                    <div className="text-slate-800 font-bold text-lg mb-2">Exercise complete</div>
                    <div className="text-slate-500 text-sm mb-6">You've done the work. That changes things in your brain.</div>
                    <button onClick={() => { setActiveCBT(null); setCbtStep(0); setCbtAnswers([]); }}
                      className="w-full py-3.5 rounded-xl bg-teal-600 text-white font-semibold text-sm">Back to CBT Guides</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-slate-500 text-xs px-1">Interactive exercises to help you build powerful coping skills.</div>
                {CBT_GUIDES.map(guide => (
                  <button key={guide.id} onClick={() => { setActiveCBT(guide); setCbtStep(0); setCbtAnswers([]); }}
                    className="w-full bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-left active:scale-95 transition-transform">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-xl flex-shrink-0">{guide.icon}</div>
                      <div className="flex-1">
                        <div className="text-slate-800 font-semibold text-sm">{guide.title}</div>
                        <div className="text-slate-400 text-xs mt-0.5">{guide.desc}</div>
                      </div>
                      <div className="text-slate-400 text-sm">›</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── REASONS TAB ── */}
        {tab === 'reasons' && (
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <div className="text-slate-800 font-semibold mb-1">Your Reasons</div>
            <div className="text-slate-400 text-xs mb-4">You wrote these when you were strong. Read them now.</div>
            {reasons.length === 0 ? (
              <div className="text-slate-400 text-sm italic">No reasons saved yet. Add them in Settings.</div>
            ) : (
              <div className="space-y-3">
                {reasons.map((r, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-teal-100 border border-teal-200 flex items-center justify-center text-teal-600 text-xs flex-shrink-0 mt-0.5">{i + 1}</div>
                    <div className="text-slate-700 text-sm leading-relaxed">{r}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── H.A.L.T. CHECK-IN ── */}
        {tab === 'halt' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className="text-slate-800 font-bold text-base mb-1">H.A.L.T. Check-in</div>
              <div className="text-slate-500 text-sm mb-5">Cravings are often triggered by one of four states. Check in honestly.</div>
              {([
                { key: 'h', letter: 'H', word: 'Hungry', desc: 'Have you eaten in the last few hours?', tip: 'Eat something now — even a snack. Low blood sugar intensifies cravings.' },
                { key: 'a', letter: 'A', word: 'Angry', desc: 'Are you frustrated, resentful, or irritated?', tip: 'Name what is making you angry. Write it down. Then breathe through it.' },
                { key: 'l', letter: 'L', word: 'Lonely', desc: 'Do you feel disconnected or isolated?', tip: 'Reach out to someone — even a text. Connection is a craving killer.' },
                { key: 't', letter: 'T', word: 'Tired', desc: 'Are you exhausted or sleep-deprived?', tip: 'Rest if you can. Your willpower is lowest when you are tired.' },
              ] as {key: 'h'|'a'|'l'|'t', letter: string, word: string, desc: string, tip: string}[]).map(item => {
                const active = haltAnswers[item.key];
                return (
                  <div key={item.key} className={`rounded-xl border p-4 mb-3 transition-colors ${active ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-100'}`}>
                    <button className="w-full flex items-center gap-3 text-left" onClick={() => setHaltAnswers(p => ({...p, [item.key]: !p[item.key]}))}>
                      <div className={`w-10 h-10 rounded-full font-bold text-lg flex items-center justify-center flex-shrink-0 ${active ? 'bg-rose-500 text-white' : 'bg-slate-200 text-slate-600'}`}>{item.letter}</div>
                      <div>
                        <div className="font-semibold text-slate-800">{item.word}</div>
                        <div className="text-slate-500 text-xs">{item.desc}</div>
                      </div>
                      <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${active ? 'bg-rose-500 border-rose-500' : 'border-slate-300'}`}>
                        {active && <span className="text-white text-xs">✓</span>}
                      </div>
                    </button>
                    {active && <div className="mt-3 text-sm text-rose-700 bg-rose-100 rounded-lg p-3 leading-relaxed">{item.tip}</div>}
                  </div>
                );
              })}
            </div>
            <div className="bg-teal-50 rounded-2xl p-4 border border-teal-100">
              <div className="text-teal-700 text-sm leading-relaxed">
                {Object.values(haltAnswers).some(Boolean)
                  ? `You've identified ${Object.values(haltAnswers).filter(Boolean).length} trigger${Object.values(haltAnswers).filter(Boolean).length > 1 ? 's' : ''}. Address these needs — the craving will follow.`
                  : 'Tap each state that applies to you right now.'}
              </div>
            </div>
          </div>
        )}

        {/* ── 15-MINUTE URGE TIMER ── */}
        {tab === 'urge_timer' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className="text-slate-800 font-bold text-base mb-1">15-Minute Urge Timer</div>
              <div className="text-slate-500 text-sm mb-4">Cravings peak and pass within 15 minutes. You only need to survive this moment.</div>
              <div className="flex items-center justify-between mb-3">
                <div className="text-slate-500 text-sm">Time elapsed</div>
                <div className="text-4xl font-mono font-bold text-teal-600">
                  {String(Math.floor(urgeSeconds / 60)).padStart(2,'0')}:{String(urgeSeconds % 60).padStart(2,'0')}
                </div>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 mb-4">
                <div className="bg-gradient-to-r from-teal-400 to-emerald-500 h-3 rounded-full transition-all"
                  style={{ width: `${Math.min((urgeSeconds / 900) * 100, 100)}%` }} />
              </div>
              <div className="text-center text-slate-400 text-xs mb-4">{Math.max(0, 900 - urgeSeconds)}s remaining · {Math.round((urgeSeconds/900)*100)}% through</div>
              <div className="flex gap-3">
                <button onClick={() => setTimerRunning(!timerRunning)}
                  className={`flex-1 py-3 rounded-xl font-semibold text-sm ${timerRunning ? 'bg-slate-100 text-slate-600' : 'bg-teal-600 text-white'}`}>
                  {timerRunning ? '⏸ Pause' : urgeSeconds === 0 ? '▶ Start Timer' : '▶ Resume'}
                </button>
                <button onClick={() => { setUrgeSeconds(0); setTimerRunning(false); setDone(false); }}
                  className="px-4 py-3 rounded-xl bg-slate-100 text-slate-600 font-semibold text-sm">Reset</button>
              </div>
            </div>
            {urgeSeconds >= 900 && (
              <div className="bg-green-50 rounded-2xl p-5 border border-green-200 text-center">
                <div className="text-3xl mb-2">🎉</div>
                <div className="text-green-700 font-bold mb-1">You made it through!</div>
                <div className="text-green-600 text-sm">15 minutes survived. The craving has peaked and is fading.</div>
                <button onClick={() => { onLogCraving(intensity); }}
                  className="mt-4 w-full py-3 rounded-xl bg-green-500 text-white font-semibold text-sm">Log This Craving</button>
              </div>
            )}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
              <div className="text-slate-600 text-xs font-semibold uppercase tracking-wider mb-2">While you wait…</div>
              {['Take 5 deep breaths right now', 'Drink a glass of cold water', 'Walk to another room', 'Call or text someone', 'Do 10 jumping jacks'].map((tip, i) => (
                <div key={i} className="flex items-center gap-2 text-slate-600 text-sm"><span className="text-teal-500">→</span>{tip}</div>
              ))}
            </div>
          </div>
        )}

        {/* ── PLAY THE TAPE FORWARD ── */}
        {tab === 'tape_forward' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className="text-slate-800 font-bold text-base mb-1">Play the Tape Forward</div>
              <div className="text-slate-500 text-sm mb-4">Do not just imagine the drink. Play the full tape — what happens next, and next, and next.</div>
              {[
                { time: 'Right now', icon: '🍺', text: 'It feels like relief. The craving quiets. For a moment, it works.' },
                { time: '30 minutes later', icon: '😶', text: 'The guilt starts. You have broken your streak. Your sobriety count resets to zero.' },
                { time: 'A few hours later', icon: '😔', text: 'You feel worse than before you drank. The original problem is still there — plus shame.' },
                { time: 'Tomorrow morning', icon: '😞', text: 'You wake up and remember. All the days you built are gone. You have to start again.' },
                { time: 'One week later', icon: '💭', text: 'You wonder how far you could have gone. You think about the person you were becoming.' },
                { time: 'If you do not drink', icon: '💪', text: 'This craving passes in minutes. Your streak survives. Tomorrow you are stronger. Your future self thanks you.' },
              ].map((step, i) => (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-xl mb-2 ${i === 5 ? 'bg-teal-50 border border-teal-100' : 'bg-slate-50'}`}>
                  <div className="text-2xl flex-shrink-0">{step.icon}</div>
                  <div>
                    <div className={`text-xs font-bold uppercase tracking-wider mb-0.5 ${i === 5 ? 'text-teal-600' : 'text-slate-400'}`}>{step.time}</div>
                    <div className={`text-sm leading-relaxed ${i === 5 ? 'text-teal-700 font-medium' : 'text-slate-600'}`}>{step.text}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl p-5 text-white text-center">
              <div className="font-bold text-lg mb-1">Your streak: {soberDays} day{soberDays !== 1 ? 's' : ''}</div>
              <div className="text-teal-100 text-sm">This is worth protecting. One moment doesn't define you — but this choice does.</div>
            </div>
          </div>
        )}

        {/* ── MINDFULNESS TRAINING ── */}
        {tab === 'mindfulness' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className="text-slate-800 font-bold text-base mb-1">Mindfulness Training</div>
              <div className="text-slate-500 text-sm mb-4">Practice staying present. Your craving is in the future. Right now, you are okay.</div>
              {[
                { title: '5-4-3-2-1 Grounding', icon: '👁', desc: 'Name 5 things you can see. 4 you can touch. 3 you can hear. 2 you can smell. 1 you can taste. You are here. You are safe.' },
                { title: 'One Breath at a Time', icon: '\U0001f32c', desc: 'You do not have to stay sober forever. Just for this breath. Breathe in. Breathe out. That is all you have to do right now.' },
                { title: 'Body Check', icon: '🧘', desc: 'Where do you feel the craving in your body? Put your hand there. Breathe into it. Feelings are just sensations — they cannot harm you.' },
                { title: 'The Observer', icon: '👀', desc: 'Watch the craving like a cloud passing through. You are not the craving. You are the sky it passes through. Let it move.' },
                { title: 'Label It', icon: '🏷', desc: 'Say to yourself: "I notice I am having a craving." Not "I need a drink." The label creates distance. Distance creates choice.' },
                { title: 'Present Moment Anchor', icon: '\u2693', desc: 'Feel your feet on the floor. The weight of your body. The temperature of the air. Right now, in this second, you are not drinking. That is enough.' },
              ].map((ex, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl mb-3 border border-slate-100">
                  <div className="text-2xl flex-shrink-0">{ex.icon}</div>
                  <div>
                    <div className="font-semibold text-slate-800 text-sm mb-1">{ex.title}</div>
                    <div className="text-slate-500 text-sm leading-relaxed">{ex.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100">
              <div className="text-purple-700 text-sm leading-relaxed font-medium text-center italic">
                "Between stimulus and response, there is a space. In that space is our power to choose."
              </div>
            </div>
          </div>
        )}

      </div>
      {tab === 'home' && (
        <div className="p-4 border-t border-slate-100 flex-shrink-0">
          <button
            onClick={() => setEditMode(v => !v)}
            className="w-full flex items-center justify-center bg-slate-200 text-slate-700 font-semibold py-3 px-4 rounded-xl hover:bg-slate-300 transition-colors gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"/>
              <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd"/>
            </svg>
            {editMode ? 'Done Editing' : 'Edit Kit'}
          </button>
        </div>
      )}
    </div>
  );
}
