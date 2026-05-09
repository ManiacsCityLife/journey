import { useState, useEffect, useCallback, useRef } from 'react';
import { storageGet, storageSet } from '../utils/storage';
import type { UserProfile, JournalEntry, CravingLog, SleepLog, ThoughtLog, ActivityLog, DailyHeatmapEntry, GratitudeEntry, VisionBoard, AffirmationFavorite, Slip } from '../types';

export function useAppData() {
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [cravings, setCravings] = useState<CravingLog[]>([]);
  const [sleep, setSleep] = useState<SleepLog[]>([]);
  const [thoughts, setThoughts] = useState<ThoughtLog[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [reasons, setReasons] = useState<string[]>([]);
  const [gratitude, setGratitude] = useState<GratitudeEntry[]>([]);
  const [visionBoards, setVisionBoards] = useState<VisionBoard[]>([]);
  const [affirmationFavs, setAffirmationFavs] = useState<AffirmationFavorite[]>([]);
  const [slips, setSlips] = useState<Slip[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Refs keep latest value in sync for writes that fire in quick succession
  const cravingsRef   = useRef<CravingLog[]>([]);
  const thoughtsRef   = useRef<ThoughtLog[]>([]);
  const activitiesRef = useRef<ActivityLog[]>([]);
  const sleepRef      = useRef<SleepLog[]>([]);
  const completedRef  = useRef<number[]>([]);
  const gratitudeRef  = useRef<GratitudeEntry[]>([]);
  const slipsRef      = useRef<Slip[]>([]);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    try {
      const [p, j, c, s, t, a, d, r, g, vb, af, sl] = await Promise.all([
        storageGet('profile'),
        storageGet('journal'),
        storageGet('cravings'),
        storageGet('sleep'),
        storageGet('thoughts'),
        storageGet('activities'),
        storageGet('completedDays'),
        storageGet('reasons'),
        storageGet('gratitude'),
        storageGet('visionBoards'),
        storageGet('affirmationFavs'),
        storageGet('slips'),
      ]);

      if (p) setProfileState(JSON.parse(p));
      if (j) setJournal(JSON.parse(j));
      if (c) { const v = JSON.parse(c); setCravings(v); cravingsRef.current = v; }
      if (s) { const v = JSON.parse(s); setSleep(v); sleepRef.current = v; }
      if (t) { const v = JSON.parse(t); setThoughts(v); thoughtsRef.current = v; }
      if (a) { const v = JSON.parse(a); setActivities(v); activitiesRef.current = v; }
      if (d) { const v = JSON.parse(d); setCompletedDays(v); completedRef.current = v; }
      if (r) setReasons(JSON.parse(r));
      if (g) { const v = JSON.parse(g); setGratitude(v); gratitudeRef.current = v; }
      if (vb) setVisionBoards(JSON.parse(vb));
      if (af) setAffirmationFavs(JSON.parse(af));
      if (sl) { const v = JSON.parse(sl); setSlips(v); slipsRef.current = v; }
    } catch (e) {
      console.error('[useAppData] loadAll failed:', e);
    }
    setLoaded(true);
  }

  const saveProfile = useCallback(async (p: UserProfile): Promise<void> => {
    setProfileState(p);
    await storageSet('profile', JSON.stringify(p));
  }, []);

  const saveJournal = useCallback((entries: JournalEntry[]) => {
    setJournal(entries);
    storageSet('journal', JSON.stringify(entries));
  }, []);

  const addCraving = useCallback((log: CravingLog) => {
    const next = [log, ...cravingsRef.current];
    cravingsRef.current = next;
    setCravings(next);
    storageSet('cravings', JSON.stringify(next));
  }, []);

  const addSleep = useCallback((log: SleepLog) => {
    const today = new Date().toISOString().split('T')[0];
    const filtered = sleepRef.current.filter(s => s.date !== today);
    const next = [log, ...filtered];
    sleepRef.current = next;
    setSleep(next);
    storageSet('sleep', JSON.stringify(next));
  }, []);

  const addThought = useCallback((log: ThoughtLog) => {
    const next = [log, ...thoughtsRef.current];
    thoughtsRef.current = next;
    setThoughts(next);
    storageSet('thoughts', JSON.stringify(next));
  }, []);

  const addActivity = useCallback((log: ActivityLog) => {
    const next = [log, ...activitiesRef.current];
    activitiesRef.current = next;
    setActivities(next);
    storageSet('activities', JSON.stringify(next));
  }, []);

  const toggleDay = useCallback((day: number) => {
    const prev = completedRef.current;
    const next = prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day];
    completedRef.current = next;
    setCompletedDays(next);
    storageSet('completedDays', JSON.stringify(next));
  }, []);

  const saveReasons = useCallback((r: string[]) => {
    setReasons(r);
    storageSet('reasons', JSON.stringify(r));
  }, []);

  const saveVisionBoards = useCallback((boards: VisionBoard[]) => {
    setVisionBoards(boards);
    storageSet('visionBoards', JSON.stringify(boards));
  }, []);

  const saveAffirmationFavs = useCallback((favs: AffirmationFavorite[]) => {
    setAffirmationFavs(favs);
    storageSet('affirmationFavs', JSON.stringify(favs));
  }, []);

  /**
   * Record a slip — preserves all journal/log data, snapshots the previous
   * streak as part of the user's recovery story, and resets only the sober
   * date counter so the user can start counting again from this moment.
   *
   * Also clears `firedMilestoneDays` and `firedSavingsTiers` so milestone
   * notifications fire again on the new streak (1 day, 7 days, etc.).
   */
  const recordSlip = useCallback(async (data: {
    timestamp: string;
    trigger?: string;
    triggerTags?: string[];
    feeling?: string;
    reflection?: string;
  }): Promise<void> => {
    if (!profile) return;
    const previousSoberDate = profile.soberDate;
    const slipMs = new Date(data.timestamp).getTime();
    const startMs = new Date(previousSoberDate).getTime();
    const previousStreakDays = isFinite(slipMs) && isFinite(startMs)
      ? Math.max(0, Math.floor((slipMs - startMs) / 86400000))
      : 0;

    const slip: Slip = {
      id: 'slip_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
      timestamp: data.timestamp,
      previousSoberDate,
      previousStreakDays,
      trigger: data.trigger,
      triggerTags: data.triggerTags,
      feeling: data.feeling,
      reflection: data.reflection,
    };

    const nextSlips = [slip, ...slipsRef.current];
    slipsRef.current = nextSlips;
    setSlips(nextSlips);
    await storageSet('slips', JSON.stringify(nextSlips));

    const updated: UserProfile = {
      ...profile,
      soberDate: data.timestamp,
      firedMilestoneDays: [],
      firedSavingsTiers: [],
    };
    setProfileState(updated);
    await storageSet('profile', JSON.stringify(updated));
  }, [profile]);

  const deleteSlip = useCallback((id: string) => {
    const next = slipsRef.current.filter(s => s.id !== id);
    slipsRef.current = next;
    setSlips(next);
    storageSet('slips', JSON.stringify(next));
  }, []);

  const updateSlipReflection = useCallback((id: string, reflection: string) => {
    const next = slipsRef.current.map(s => s.id === id ? { ...s, reflection } : s);
    slipsRef.current = next;
    setSlips(next);
    storageSet('slips', JSON.stringify(next));
  }, []);

  /**
   * Composed recovery stats: current streak + previous streaks + lifetime
   * total. Best streak treats "current" as a candidate too — if you're now
   * past your previous best, that should be reflected.
   */
  const getRecoveryStats = useCallback(() => {
    const stats = profile?.soberDate
      ? Math.max(0, Math.floor((Date.now() - new Date(profile.soberDate).getTime()) / 86400000))
      : 0;
    const previousStreaks = slips.map(s => s.previousStreakDays);
    const bestStreak = Math.max(stats, ...previousStreaks, 0);
    const lifetimeSoberDays = stats + previousStreaks.reduce((sum, d) => sum + d, 0);
    return {
      currentStreak: stats,
      bestStreak,
      lifetimeSoberDays,
      slipCount: slips.length,
    };
  }, [profile, slips]);

  const addGratitude = useCallback((entry: GratitudeEntry) => {
    // One entry per day — replace if exists for today
    const today = new Date().toISOString().split('T')[0];
    const filtered = gratitudeRef.current.filter(g => g.date !== today);
    const next = [entry, ...filtered];
    gratitudeRef.current = next;
    setGratitude(next);
    storageSet('gratitude', JSON.stringify(next));
  }, []);

  const deleteEntry = useCallback((type: 'craving'|'thought'|'activity'|'sleep'|'journal'|'gratitude', id: string) => {
    if (type === 'craving') {
      const next = cravingsRef.current.filter(x => x.id !== id);
      cravingsRef.current = next; setCravings(next);
      storageSet('cravings', JSON.stringify(next));
    } else if (type === 'thought') {
      const next = thoughtsRef.current.filter(x => x.id !== id);
      thoughtsRef.current = next; setThoughts(next);
      storageSet('thoughts', JSON.stringify(next));
    } else if (type === 'activity') {
      const next = activitiesRef.current.filter(x => x.id !== id);
      activitiesRef.current = next; setActivities(next);
      storageSet('activities', JSON.stringify(next));
    } else if (type === 'sleep') {
      const next = sleepRef.current.filter((x, idx) => {
        const xid = x.id || `sleep_legacy_${x.date}_${idx}`;
        return xid !== id;
      });
      sleepRef.current = next; setSleep(next);
      storageSet('sleep', JSON.stringify(next));
    } else if (type === 'gratitude') {
      const next = gratitudeRef.current.filter(x => x.id !== id);
      gratitudeRef.current = next; setGratitude(next);
      storageSet('gratitude', JSON.stringify(next));
    } else if (type === 'journal') {
      const next = journal.filter(x => x.id !== id);
      setJournal(next);
      storageSet('journal', JSON.stringify(next));
    }
  }, [journal]);

  const getSoberStats = useCallback(() => {
    if (!profile?.soberDate) return null;
    const ms = Math.max(0, Date.now() - new Date(profile.soberDate).getTime());
    const totalSeconds = Math.floor(ms / 1000);
    const days    = Math.floor(ms / 86400000);
    const hours   = Math.floor((ms % 86400000) / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = totalSeconds % 60;
    const heartbeats = Math.floor(totalSeconds * 1.2);
    const breaths    = Math.floor(totalSeconds / 5);
    const moneySaved = (profile.dailySpend || 0) / 86400 * totalSeconds;
    return { days, hours, minutes, seconds, heartbeats, breaths, moneySaved, totalSeconds };
  }, [profile]);

  const getHeatmapData = useCallback((): DailyHeatmapEntry[] => {
    const map: Record<string, DailyHeatmapEntry> = {};
    thoughtsRef.current.forEach(t => {
      const date = t.timestamp.split('T')[0];
      if (!map[date]) map[date] = { date, cravings: 0, thoughts: 0 };
      map[date].thoughts++;
    });
    cravingsRef.current.forEach(c => {
      const date = c.timestamp.split('T')[0];
      if (!map[date]) map[date] = { date, cravings: 0, thoughts: 0 };
      map[date].cravings++;
    });
    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
  }, [thoughts, cravings]);

  return {
    loaded, profile, journal, cravings, sleep, thoughts, activities,
    completedDays, reasons, gratitude, visionBoards, affirmationFavs, slips,
    saveProfile, saveJournal, addCraving, addSleep, addThought, addActivity,
    toggleDay, saveReasons, addGratitude, deleteEntry, getSoberStats, getHeatmapData,
    saveVisionBoards, saveAffirmationFavs,
    recordSlip, deleteSlip, updateSlipReflection, getRecoveryStats,
    reload: loadAll,
  };
}
