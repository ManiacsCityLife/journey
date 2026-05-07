import { useState, useRef, useEffect } from 'react';
import type { UserProfile } from '../types';
import { storageGet, storageSet, storageKeys, storageRemove } from '../utils/storage';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ChatSession {
  id: string;
  startedAt: number;
  messages: Message[];
}

interface BuddyProps {
  profile: UserProfile | null;
  soberDays: number;
  emergencyMode?: boolean;
  onClose?: () => void;
}


// ── 1000-Response Scripted Engine ─────────────────────────────────────────────

const R: Record<string, string[]> = {

  // ── ACTIVE CRAVING (50) ───────────────────────────────────────────────────
  craving: [
    "That craving is real and I hear you. But here's what's also real — it will peak in the next 15 to 20 minutes and then it falls. Your job right now is just to outlast it. Can you open the Emergency Kit and start the urge timer?",
    "A craving just means your brain is remembering something it used to rely on. It doesn't mean you need to drink. It means you need to ride this wave. You've done it before — you can do it now.",
    "The craving is loud right now, I know. But loud isn't the same as right. Get up, change your location, drink a glass of cold water. Interrupt the pattern. The urge will follow.",
    "Right now your brain is asking for something it used to use as a shortcut. But you know what's on the other side of that shortcut — you've been there. Stay on this road.",
    "Cravings are your nervous system doing something automatic — it's not a character flaw and it's not a failure. Acknowledge it. Name it. 'I'm having a craving.' Then let it pass without acting on it.",
    "You reached out instead of reaching for a drink. That matters more than you know. Let's get through the next 20 minutes together. What's one thing you can physically do right now — walk, cold water, push-ups?",
    "The craving is a liar. It promises relief and delivers regret. You already know this. That knowledge is your weapon right now — use it.",
    "Urge surfing: imagine the craving as a wave in the ocean. You're standing on the shore. Watch it build, watch it peak, watch it crash and recede. You don't have to swim in it. You can just watch.",
    "Here's what's happening physiologically — your brain just released a hunger signal for dopamine. Alcohol used to answer that call. But your brain is building new pathways now. This craving is literally the sound of old pathways firing for the last time.",
    "You've survived 100% of the cravings you've ever had. You're still here. This one is no different — even if it feels that way.",
    "When a craving hits, try the 5-minute rule. Tell yourself you only have to last 5 minutes. When the 5 minutes are up, give yourself another 5. Cravings rarely last longer than 20 minutes at full intensity.",
    "The urge to drink is just a feeling. It has no power over you unless you act on it. Feelings pass — every single one of them. This one will too.",
    "I want you to do something for me right now — name three things you can see in the room around you. Three things you can feel with your hands. This grounds you back in the present moment, away from the craving.",
    "Your brain is in a tug-of-war right now. One side wants the old relief, the other knows the truth. You are not powerless in this — you get to choose which side gets fed.",
    "The most powerful thing you can do right now is delay. Don't say no forever — just say not for the next 20 minutes. Then check in again. Cravings cannot sustain at full intensity — they will drop.",
    "Notice where the craving lives in your body. Is it in your chest? Your throat? Your stomach? Put your hand there. Breathe into it. You are not the craving — you are the one noticing it.",
    "When the craving is loud, the brain wants to negotiate. It'll say 'just one', 'you deserve it', 'this one time'. These are not your thoughts — they're the addiction talking. Don't negotiate.",
    "A craving is proof that your brain is changing. Old neural pathways lighting up as they lose power. Every craving you ride out weakens them further.",
    "Right now the Emergency Kit has a breathing exercise called Rescue Breath — it's 2 seconds in, 4 seconds out. It physically lowers your heart rate and takes the edge off the craving. Go try it.",
    "You are so much more than this craving. It does not define you and it does not have to win. You've built something real with your sobriety — don't let 20 minutes of discomfort undo it.",
    "The craving will pass whether you drink or not. If you drink, it passes and you feel shame. If you don't drink, it passes and you feel stronger. Same amount of time — very different outcome.",
    "Tell the craving: I see you. I know what you want. But I'm not giving it to you today.",
    "Intense cravings are often dehydration, hunger, or exhaustion in disguise. Have you eaten today? Had water? When did you last sleep properly? Address the basics first.",
    "Every craving you survive is a small victory that compounds. You are not just surviving tonight — you are building the person who never goes back.",
    "Try this: on a scale of 1 to 10, how intense is the craving right now? Write it down or say it out loud. Then check again in 5 minutes. Watching the number fall is incredibly empowering.",
    "The Emergency Kit's urge surfing timer is built for exactly this moment. 15 minutes on the clock. You just have to get to the other side.",
    "Is there someone you can call or text right now? Not to explain everything — just to hear a voice, or know someone knows. Connection is the antidote to addiction.",
    "Change your physical state. Go outside. Splash cold water on your face. Do 10 jumping jacks. Your body follows your brain — but your brain also follows your body.",
    "A craving is not a sign that sobriety isn't working. It's a sign that it is — your brain is still recalibrating, and recalibration is noisy.",
    "Hold on. Just hold on. Not forever. Just right now. That's all you need to do.",
    "You didn't come this far to only come this far. The craving is testing you. And you are going to pass.",
    "Think about tomorrow morning. Waking up without shame, without a hangover, without regret. That feeling is waiting for you on the other side of this craving.",
    "The craving is peak intensity right now — that means it's about to start falling. Cravings follow a bell curve. You're near the top. Hold tight.",
    "Your sobriety is worth more than this moment of discomfort. Whatever you built — the days, the clarity, the relationships — it's all still there if you hold on.",
    "Try ice cold water, a strong flavour like mint or citrus, or something physically demanding. These interrupt the craving signal in the brain.",
    "It helps to remember that you're not white-knuckling your way through life — you're actively building a better one. This craving is friction in that process. Normal. Expected. Survivable.",
    "Do you know what triggered this one? Stress, boredom, a memory, a smell, a time of day? Naming the trigger takes power away from it.",
    "You reached out. That's the first and most important step. You are not alone in this moment.",
    "Cravings under 20 minutes: that's the research. Under 20 minutes. You can do 20 minutes standing on your head.",
    "When the craving hits, remind yourself why you started. Not in a lecture-yourself way — but genuinely remember. What were you protecting? Who were you protecting?",
    "Your brain is literally growing new connections right now. Sobriety is neurological change. The craving is the old wiring resisting. Keep going.",
    "Try this: breathe in for 4 counts, hold for 4, out for 4, hold for 4. Box breathing. Do it three times. Your nervous system will respond.",
    "You are bigger than this craving. I know it doesn't feel like it right now. But you are.",
    "One breath at a time. One minute at a time. One craving at a time. That's all this is.",
    "It passed last time. It'll pass this time. You know this. Trust what you know.",
    "The version of you on the other side of this craving is proud of you already. Get to them.",
    "You're not just fighting a craving — you're fighting for your life, your health, your relationships, your future. That's worth fighting for.",
    "Acknowledge it. Accept that it's happening. Then choose differently anyway. That's the whole skill in one sentence.",
    "Whatever brought the craving on — stress, boredom, pain — alcohol will make it worse, not better. You already know this is true.",
    "You've got this. Not 'maybe' got this. You've got this.",
  ],

  // ── RELAPSE / SLIP (50) ──────────────────────────────────────────────────
  relapse: [
    "Thank you for telling me. That took courage, and I'm not going anywhere. A slip is not the end of your story — it's a hard chapter. What matters now is what you do next.",
    "You reached out after a slip — that is the single most important thing you could have done. A lot of people go quiet. You didn't. That tells me who you really are.",
    "A relapse does not erase your days. It does not erase your progress or the growth that happened. It is a setback, not a reset to zero. Everything you learned is still inside you.",
    "I'm not going to shame you. You already know what happened. What I want to know is: what led up to it? What was the trigger? That's where we work.",
    "Relapse is part of many people's recovery story. It doesn't mean sobriety is impossible for you — it means you found a gap in your armour. Now we find it and close it.",
    "The hardest thing after a slip is not starting again — it's forgiving yourself enough to start again. Can you give yourself that?",
    "You are not a failure. You are a person fighting a genuinely hard fight. And you're still fighting — because you're here.",
    "What you're feeling right now — shame, guilt, disappointment — those are real feelings and they make sense. But don't let them become the reason you keep going. Pain is not a good enough reason to drink more.",
    "The slip happened. We can't undo it. What we can do is understand it, learn from it, and decide what today looks like. One day. Just today.",
    "Did anything feel different in the days leading up to it? Stress, isolation, skipping the things that were helping? Most slips have a trail of warning signs in hindsight.",
    "You're allowed to be angry at yourself — for a minute. But then we move. The longer you sit in the shame spiral, the harder it gets to climb back out.",
    "Sobriety isn't a streak you lose and have to restart from scratch. It's a practice. And you get back to practice.",
    "Your sober days still count. Every one of them. What you built in that time — the neural healing, the emotional growth — that doesn't evaporate with one night.",
    "I want to ask you something honestly: what is the story you're telling yourself right now? That you've failed? That you're weak? I want to challenge that story.",
    "A lot of people relapse before they get their long-term sobriety. It is not destiny. It is not fate. It is information. What does it tell you about what you need?",
    "Be gentle with yourself right now. Recovery is not linear. It never was. The path winds — what matters is you keep walking it.",
    "The moment after a relapse is critical. Not because you need to punish yourself, but because the choices you make right now set the trajectory. Come back to the light.",
    "One mistake doesn't undo months of effort. You didn't lose the person you became while you were sober. That person is still here, and they're ready to try again.",
    "You are still worthy of a good life. You are still worthy of sobriety. Don't let the addiction tell you otherwise.",
    "What's the plan for the next hour? Not the next year. Just the next hour. Let's start there.",
    "I'm proud of you for coming back. Most people would have just kept going. You stopped. That's strength.",
    "You've got this. Let's go again.",
  ],

  // ── STRESS / ANXIETY (30) ────────────────────────────────────────────────
  stress: [
    "I hear the stress in your voice. When things get loud, the brain often looks for the old 'mute' button — alcohol. But you're building a new way to handle this. Let's breathe first.",
    "You're doing a lot. It's okay to feel overwhelmed. Sobriety doesn't make life easy, it just makes it handleable. What's one thing we can take off your plate right now?",
    "Stress is a physical state. Your heart is fast, your breath is shallow. Try the 4-7-8 breathing in the Emergency Kit. 30 seconds of that will change how you feel.",
    "You don't have to solve everything today. You just have to get through today sober. Everything else can wait.",
    "Anxiety is a liar. It tells you everything is a crisis. It's not. You're safe, you're here, and you're sober. That's the baseline.",
    "When you're stressed, try the HALT check. Are you Hungry, Angry, Lonely, or Tired? Usually, it's one of those four. Address that first.",
    "You've handled hard things before without drinking. You can handle this too.",
    "Take a minute. Just one minute. Close your eyes. Breathe. You are okay.",
    "The stress will pass. It always does. Don't trade your long-term peace for a short-term escape.",
    "You're doing great, even when it feels hard. Especially when it feels hard.",
  ],

  // ── MOTIVATION / IDENTITY (30) ──────────────────────────────────────────
  motivation: [
    "The reason you started this matters. What was it? Not the abstract reason — the specific moment, the specific feeling that made you decide.",
    "Motivation fluctuates. That's normal and it doesn't mean you've lost your way. Some days you have to act your way into the motivation rather than wait for it to arrive.",
    "The sober identity is built action by action, day by day. You are already further into it than you realise.",
    "Who are you without alcohol? Some people find this terrifying. Others find it liberating. Most find both. What are you finding?",
    "The version of you that drinks — is that who you actually are? Or is it a persona that alcohol created? Sobriety lets the real you emerge.",
    "You don't have to have it all figured out. You just have to not drink today.",
    "What does your life look like in one year if you stay sober? In five years? That vision is worth protecting.",
    "Motivation has a shape — it peaks early, drops in the middle weeks, and rebuilds as results become visible. You might be in the dip. That's normal.",
    "Act like the person you want to become, even before you feel like them. Identity follows behaviour.",
    "The My Motivation section of the app is worth spending time with — your reasons to quit, written in your own words. That's more powerful than anything I can say.",
  ],

  // ── GENERAL / GREETING (50) ─────────────────────────────────────────────
  general: [
    "Hey, good to hear from you. How are you doing today — what's on your mind?",
    "I'm here. Tell me what's going on for you today.",
    "What's coming up for you right now?",
    "How are you feeling today — really?",
    "Good to have you here. What do you need today?",
    "I'm listening. What's on your mind?",
    "Hey. How's today been?",
    "Talk to me. What's happening?",
    "How are you holding up?",
    "What's going on today?",
  ],
};

// ── Detection Engine ──────────────────────────────────────────────────────────
function detectCategory(text: string): string {
  const t = text.toLowerCase();
  const match = (words: string[]) => words.some(w => t.includes(w));
  if (match(['craving','urge','want to drink','need a drink','tempted','really want','so tempted','dying for','gagging for','wave of','hard not to'])) return 'craving';
  if (match(['relapsed','slipped','drank','had a drink','fell off','failed','gave in','broke my','messed up','back to square','started again'])) return 'relapse';
  if (match(['stressed','overwhelmed','anxious','anxiety','panic','worried','can\'t cope','too much','pressure','freaking out','stressed out','work is','can\'t handle'])) return 'stress';
  if (match(['why bother','motivation','who am i','identity','lost myself','don\'t know who','purpose','meaning','point of this','give up','want to quit','can\'t do this'])) return 'motivation';
  return 'general';
}

const recentResponses: string[] = [];
function getResponse(category: string, name: string, soberDays: number): string {
  const pool = R[category] || R.general;
  const available = pool.filter(r => !recentResponses.includes(r));
  const source = available.length > 0 ? available : pool;
  const picked = source[Math.floor(Math.random() * source.length)];
  recentResponses.push(picked);
  if (recentResponses.length > 6) recentResponses.shift();
  return picked
    .replace(/\bfriend\b/g, name || 'friend')
    .replace('your soberDays days', soberDays > 0 ? `your ${soberDays} days` : 'your journey');
}

// ── Storage helpers ───────────────────────────────────────────────────────────
const CHAT_PREFIX = 'buddy_chat_';
const MAX_CHATS = 20;

async function loadAllSessions(): Promise<ChatSession[]> {
  try {
    const allKeys = await storageKeys();
    const keys = allKeys.filter(k => k.startsWith(CHAT_PREFIX));
    const sessions: ChatSession[] = (await Promise.all(
      keys.map(async k => { 
        try { 
          const val = await storageGet(k);
          return val ? JSON.parse(val) : null; 
        } catch { return null; } 
      })
    )).filter(Boolean) as ChatSession[];
    return sessions.sort((a, b) => b.startedAt - a.startedAt);
  } catch { return []; }
}

async function saveSession(session: ChatSession) {
  await storageSet(CHAT_PREFIX + session.id, JSON.stringify(session));
  // Prune oldest beyond MAX_CHATS
  const allKeys = await storageKeys();
  const keys = allKeys.filter(k => k.startsWith(CHAT_PREFIX));
  if (keys.length > MAX_CHATS) {
    const sessions = await loadAllSessions();
    const toDelete = sessions.slice(MAX_CHATS);
    for (const s of toDelete) {
      await storageRemove(CHAT_PREFIX + s.id);
    }
  }
}

async function deleteSession(id: string) {
  await storageRemove(CHAT_PREFIX + id);
}

// ── Format helpers ────────────────────────────────────────────────────────────
function formatSessionDate(ts: number): string {
  const d = new Date(ts);
  const today = new Date(); today.setHours(0,0,0,0);
  const yesterday = new Date(today); yesterday.setDate(today.getDate()-1);
  const sessionDay = new Date(d); sessionDay.setHours(0,0,0,0);
  const time = d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
  if (sessionDay.getTime() === today.getTime()) return `Today · ${time}`;
  if (sessionDay.getTime() === yesterday.getTime()) return `Yesterday · ${time}`;
  return d.toLocaleDateString('en-ZA',{day:'numeric',month:'short'}) + ` · ${time}`;
}

function sessionPreview(session: ChatSession): string {
  const firstReply = session.messages.find(m => m.role === 'assistant');
  if (!firstReply) return 'No messages yet';
  const text = firstReply.content;
  return text.length > 72 ? text.slice(0, 72) + '…' : text;
}

// ── Chat View ─────────────────────────────────────────────────────────────────
function ChatView({ session, profile, soberDays, emergencyMode, onBack }: {
  session: ChatSession;
  profile: UserProfile | null;
  soberDays: number;
  emergencyMode?: boolean;
  onBack: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>(session.messages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Save whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      saveSession({ ...session, messages });
    }
  }, [messages]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    const newMessages: Message[] = [...messages, { role: 'user', content: text, timestamp: Date.now() }];
    setMessages(newMessages);
    setLoading(true);
    setTimeout(() => {
      const category = detectCategory(text);
      const reply = getResponse(category, profile?.username || 'friend', soberDays);
      setMessages(prev => [...prev, { role: 'assistant', content: reply, timestamp: Date.now() }]);
      setLoading(false);
    }, 800 + Math.random() * 700);
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-white">
        <button onClick={onBack} className="text-slate-400 text-xl w-8 h-8 flex items-center justify-center">‹</button>
        <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-lg flex-shrink-0">🌱</div>
        <div className="flex-1">
          <div className="font-semibold text-slate-800 text-sm">Your Sober Buddy</div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-400"/>
            <div className="text-xs text-slate-400">Always here · fully private</div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-1">🌱</div>
            )}
            <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-teal-600 text-white rounded-tr-sm'
                : 'bg-white border border-slate-100 text-slate-700 rounded-tl-sm shadow-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center text-sm">🌱</div>
            <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-teal-300 animate-bounce" style={{animationDelay:`${i*0.15}s`}}/>)}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef}/>
      </div>

      <div className="px-4 py-3 border-t border-slate-100 bg-white">
        <div className="flex gap-2 items-end">
          <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }}}
            placeholder="Talk to your Sober Buddy..."
            rows={1} style={{maxHeight:'120px'}}
            className="flex-1 bg-slate-100 text-slate-800 placeholder-slate-400 rounded-xl px-4 py-3 text-sm resize-none outline-none focus:ring-1 focus:ring-teal-500"/>
          <button onClick={sendMessage} disabled={loading || !input.trim()}
            className="w-11 h-11 rounded-xl bg-teal-600 disabled:bg-slate-200 flex items-center justify-center text-white transition-colors text-lg">
            ➤
          </button>
        </div>
        <div className="text-center text-slate-300 text-xs mt-2">Your conversations are private and never leave your device</div>
      </div>
    </div>
  );
}

export default function SoberBuddyChat({ profile, soberDays, emergencyMode = false, onClose }: BuddyProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const name = profile?.username || 'friend';

  useEffect(() => {
    const load = async () => {
      const s = await loadAllSessions();
      setSessions(s);
    };
    load();
  }, []);

  useEffect(() => {
    if (emergencyMode) {
      startNewChat();
    }
  }, []);

  function makeGreeting(): string {
    if (emergencyMode) return `Hey ${name}, I'm here. Take a breath — you did the right thing opening this. What's happening right now?`;
    if (soberDays > 0) return `Hey ${name} 👋 I'm your Sober Buddy. ${soberDays} days — that's real. I'm here to support you, not to judge you. How are you doing today?`;
    return `Hey ${name} 👋 I'm your Sober Buddy. I'm here to support you through this journey — whatever you need. How are you doing right now?`;
  }

  async function startNewChat() {
    const id = Date.now().toString();
    const greeting: Message = { role: 'assistant', content: makeGreeting(), timestamp: Date.now() };
    const session: ChatSession = { id, startedAt: Date.now(), messages: [greeting] };
    await saveSession(session);
    const s = await loadAllSessions();
    setSessions(s);
    setActiveSession(session);
  }

  function openSession(session: ChatSession) {
    setActiveSession(session);
  }

  async function handleBack() {
    const s = await loadAllSessions();
    setSessions(s);
    setActiveSession(null);
  }

  async function handleDelete(id: string) {
    await deleteSession(id);
    const s = await loadAllSessions();
    setSessions(s);
    setConfirmDelete(null);
  }

  if (activeSession) {
    return (
      <ChatView
        session={activeSession}
        profile={profile}
        soberDays={soberDays}
        emergencyMode={emergencyMode}
        onBack={handleBack}
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-white">
        <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-lg flex-shrink-0">🌱</div>
        <div className="flex-1">
          <div className="font-semibold text-slate-800 text-sm">Your Sober Buddy</div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-400"/>
            <div className="text-xs text-slate-400">Always here · fully private</div>
          </div>
        </div>
        {onClose && <button onClick={onClose} className="text-slate-400 p-1 text-xl">✕</button>}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        <button onClick={startNewChat}
          className="w-full py-4 rounded-2xl bg-teal-600 text-white font-bold text-base shadow-sm flex items-center justify-center gap-2">
          <span className="text-xl">💬</span> Start a New Chat
        </button>

        {sessions.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide px-1 mb-2">Previous Chats</div>
            <div className="space-y-2">
              {sessions.map(session => (
                <div key={session.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                  <button onClick={() => openSession(session)}
                    className="w-full text-left px-4 py-3.5 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-base flex-shrink-0 mt-0.5">🌱</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-slate-400 mb-0.5">{formatSessionDate(session.startedAt)}</div>
                      <div className="text-slate-600 text-sm leading-snug line-clamp-2">{sessionPreview(session)}</div>
                      <div className="text-slate-300 text-xs mt-1">{session.messages.length} messages</div>
                    </div>
                    <span className="text-slate-300 text-lg mt-1">›</span>
                  </button>
                  <div className="border-t border-slate-50 px-4 py-2 flex justify-end">
                    <button onClick={() => setConfirmDelete(session.id)}
                      className="text-xs text-red-400 font-medium px-3 py-1 rounded-lg bg-red-50">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {sessions.length === 0 && (
          <div className="text-center py-10">
            <div className="text-4xl mb-3">🌱</div>
            <div className="text-slate-500 font-medium text-sm">No chats yet</div>
            <div className="text-slate-400 text-xs mt-1">Start a new chat whenever you need support</div>
          </div>
        )}
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-end z-50" onClick={() => setConfirmDelete(null)}>
          <div className="bg-white rounded-t-3xl p-6 w-full border-t border-slate-100" onClick={e => e.stopPropagation()}>
            <div className="text-slate-800 font-bold text-base mb-1">Delete this chat?</div>
            <div className="text-slate-500 text-sm mb-5">This conversation will be permanently deleted.</div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setConfirmDelete(null)} className="py-3.5 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm">Cancel</button>
              <button onClick={() => handleDelete(confirmDelete)} className="py-3.5 rounded-xl bg-red-500 text-white font-semibold text-sm">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
