import type { UserProfile } from '../types';

// ── Notification IDs ────────────────────────────────────────────────────────
// 1    = morning motivation
// 2    = evening motivation
// 3    = morning reminder
// 4    = evening reminder
// 500+ = time milestones  (500 + days, e.g. 507 = 7-day)
// 600+ = savings milestones (600 + tier index, e.g. 600 = R50, 607 = R10000)

const MILESTONE_DAYS = [1, 7, 14, 30, 60, 90, 180, 365, 730, 1095];
const SAVINGS_TIERS  = [50, 100, 250, 500, 1000, 2500, 5000, 10000];

const REMINDER_MORNING = [
  "Start your day strong 💪 — Check in and complete your missions.",
  "Good morning! Your streak is worth protecting today. 🌅",
  "One day at a time. You've got this — check in now. ✨",
  "Morning check-in time 🌿 — Log your mood and set your intentions.",
  "Your sober journey continues today. Open the app and check in. 🏃",
];

const REMINDER_EVENING = [
  "You've made it through another day 🌟 — Log your progress.",
  "Evening check-in 🌙 — How did your day go? Log it and reflect.",
  "Don't forget to log today before it slips away. 📝",
  "Great job today 💚 — Take a moment to reflect and log your day.",
  "Your streak is still going strong 🔥 — Log tonight before you sleep.",
];

const MILESTONE_MESSAGES: Record<number, string> = {
  1:    "🏆 1 Day Sober! The hardest step is the first. You did it.",
  7:    "🏆 7 Days Sober! One full week clean — that's real strength.",
  14:   "🏆 14 Days Sober! Two weeks. Your body is already healing.",
  30:   "🏆 30 Days Sober! One month — you're building something real.",
  60:   "🏆 60 Days Sober! Two months of fighting and winning.",
  90:   "🏆 90 Days Sober! Three months. This is who you are now.",
  180:  "🏆 180 Days Sober! Half a year. Unbelievable progress.",
  365:  "🏆 1 Year Sober! 365 days. You are an inspiration. 🎉",
  730:  "🏆 2 Years Sober! Two years of choosing yourself every single day.",
  1095: "🏆 3 Years Sober! Three years. You've transformed your life. 🌟",
};

function savingsMessage(amount: number, currency: string): string {
  const fmt = `${currency}${amount.toLocaleString()}`;
  const messages: Record<number, string> = {
    50:    `💰 You've saved your first ${fmt} — real money back in your pocket.`,
    100:   `💰 ${fmt} saved! What will you spend it on instead of drinks?`,
    250:   `💰 ${fmt} saved — a weekend away is within reach.`,
    500:   `💰 ${fmt} saved! Half a thousand. That used to go on alcohol.`,
    1000:  `💰 ${fmt} saved — four figures. Sobriety is literally paying off.`,
    2500:  `💰 ${fmt} saved — you're building real financial freedom.`,
    5000:  `💰 ${fmt} saved! This is life-changing money. Well done.`,
    10000: `💰 ${fmt} saved — ten thousand reasons sobriety was the right choice. 🎉`,
  };
  return messages[amount] || `💰 ${fmt} saved through sobriety. Keep going!`;
}

function parseTime(timeStr: string): { hour: number; minute: number } {
  const parts = (timeStr || '08:00').split(':').map(Number);
  const h = parts[0] ?? 8;
  const m = parts[1] ?? 0;
  return { hour: isNaN(h) ? 8 : h, minute: isNaN(m) ? 0 : m };
}

function addMinutes(t: { hour: number; minute: number }, mins: number): { hour: number; minute: number } {
  const total = t.hour * 60 + t.minute + mins;
  return { hour: Math.floor(total / 60) % 24, minute: total % 60 };
}

/**
 * Deterministic pick — picks the same item on the same day regardless of
 * how many times scheduleAll() runs. Without this, opening the app twice on
 * the same day would re-roll tomorrow's notification text, which feels random
 * and jittery to users.
 *
 * `offset` lets us pick a *different* deterministic item for evening vs.
 * morning notifications on the same day.
 */
function pickByDay<T>(arr: T[], offset = 0): T {
  if (!arr.length) return '' as unknown as T;
  const day = Math.floor(Date.now() / 86400000);
  return arr[(day + offset) % arr.length];
}

export async function requestPermission(): Promise<boolean> {
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    const { display } = await LocalNotifications.requestPermissions();
    return display === 'granted';
  } catch (e) {
    console.error('[notifications] requestPermission failed:', e);
    return false;
  }
}

/**
 * Resolve the effective frequency given a possibly-'auto' setting.
 *
 * Recovery research is consistent: the first month of sobriety is the hardest
 * and the best moment for support cues. After the routine is established,
 * frequent reminders become noise. So:
 *
 *   • Days  0– 30 → 'gentle'  (2× per day)
 *   • Days 31– 90 → 'light'   (1× per day, morning only)
 *   • Days 91+   → 'minimal'  (1× every 3 days, morning only)
 */
export function effectiveFrequency(setting: string | undefined, soberDays: number): 'gentle' | 'light' | 'minimal' {
  if (setting === 'gentle' || setting === 'light' || setting === 'minimal') return setting;
  // 'auto' or undefined → derive from sober days
  if (soberDays < 30) return 'gentle';
  if (soberDays < 90) return 'light';
  return 'minimal';
}

function daysSince(soberDateISO?: string): number {
  if (!soberDateISO) return 0;
  const t = new Date(soberDateISO).getTime();
  if (isNaN(t)) return 0;
  return Math.max(0, Math.floor((Date.now() - t) / 86400000));
}

export async function scheduleAll(profile: UserProfile, motivations: string[]): Promise<void> {
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    const settings = profile.notificationSettings;
    if (!settings) return;

    // Cancel all existing scheduled (IDs 1–4)
    await LocalNotifications.cancel({ notifications: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }] });

    const notifications: any[] = [];

    const morning = parseTime(settings.morningTime || '08:00');
    const evening = parseTime(settings.eveningTime || '19:00');

    const freq = effectiveFrequency(settings.frequency, daysSince(profile.soberDate));

    // 'minimal' wakes every 3rd day. Local Notifications doesn't support a
    // built-in "every 3 days" schedule, so we schedule a one-shot 3 days out
    // and re-arm it on every app launch (which is when scheduleAll runs).
    const minimalMs = 3 * 86400000;
    const nextMinimal = (h: number, m: number) => {
      const d = new Date();
      d.setDate(d.getDate() + 3);
      d.setHours(h, m, 0, 0);
      return d;
    };

    // ── Motivations ──
    if (settings.motivations && motivations.length > 0) {
      const morningMot = pickByDay(motivations, 0);
      const eveningMot = pickByDay(motivations, Math.max(1, Math.floor(motivations.length / 2)));

      if (freq === 'minimal') {
        notifications.push({
          id: 1,
          title: 'A note from your reasons',
          body: morningMot,
          schedule: { at: nextMinimal(morning.hour, morning.minute), every: 'day', count: 1 } as any,
          smallIcon: 'ic_stat_icon',
          channelId: 'journey',
        });
      } else {
        notifications.push({
          id: 1,
          title: 'Good morning',
          body: morningMot,
          schedule: { on: { hour: morning.hour, minute: morning.minute }, repeats: true, every: 'day' },
          smallIcon: 'ic_stat_icon',
          channelId: 'journey',
        });
        if (freq === 'gentle') {
          notifications.push({
            id: 2,
            title: 'Evening pause',
            body: eveningMot,
            schedule: { on: { hour: evening.hour, minute: evening.minute }, repeats: true, every: 'day' },
            smallIcon: 'ic_stat_icon',
            channelId: 'journey',
          });
        }
      }
      void minimalMs; // documentation only
    }

    // ── Reminders ── (offset by 5 minutes to avoid collision with motivations)
    if (settings.reminders) {
      const morningR = addMinutes(morning, 5);
      const eveningR = addMinutes(evening, 5);
      if (freq === 'minimal') {
        notifications.push({
          id: 3,
          title: 'Journey Forward',
          body: pickByDay(REMINDER_MORNING),
          schedule: { at: nextMinimal(morningR.hour, morningR.minute) } as any,
          smallIcon: 'ic_stat_icon',
          channelId: 'journey',
        });
      } else {
        notifications.push({
          id: 3,
          title: 'Journey Forward',
          body: pickByDay(REMINDER_MORNING),
          schedule: { on: { hour: morningR.hour, minute: morningR.minute }, repeats: true, every: 'day' },
          smallIcon: 'ic_stat_icon',
          channelId: 'journey',
        });
        if (freq === 'gentle') {
          notifications.push({
            id: 4,
            title: 'Journey Forward',
            body: pickByDay(REMINDER_EVENING, 2),
            schedule: { on: { hour: eveningR.hour, minute: eveningR.minute }, repeats: true, every: 'day' },
            smallIcon: 'ic_stat_icon',
            channelId: 'journey',
          });
        }
      }
    }

    if (notifications.length > 0) {
      // Ensure channel exists on Android
      await LocalNotifications.createChannel({
        id: 'journey',
        name: 'Journey Forward',
        importance: 3,
        visibility: 1,
        sound: 'default',
        vibration: true,
      });
      await LocalNotifications.schedule({ notifications });
    }
  } catch (e) {
    console.error('[notifications] scheduleAll failed:', e);
  }
}

export async function fireMilestone(days: number): Promise<void> {
  if (!MILESTONE_DAYS.includes(days)) return;
  const msg = MILESTONE_MESSAGES[days];
  if (!msg) return;

  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    await LocalNotifications.createChannel({
      id: 'journey',
      name: 'Journey Forward',
      importance: 4,
      visibility: 1,
      sound: 'default',
      vibration: true,
    });
    await LocalNotifications.schedule({
      notifications: [{
        id: 500 + days,
        title: '🏆 Milestone Reached!',
        body: msg,
        schedule: { at: new Date(Date.now() + 1000) },
        smallIcon: 'ic_stat_icon',
        channelId: 'journey',
      }],
    });
  } catch (e) {
    console.error('[notifications] fireMilestone failed:', e);
  }
}

export async function fireSavingsMilestone(tier: number, currency: string): Promise<void> {
  if (!SAVINGS_TIERS.includes(tier)) return;
  const tierIndex = SAVINGS_TIERS.indexOf(tier);

  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    await LocalNotifications.createChannel({
      id: 'journey',
      name: 'Journey Forward',
      importance: 4,
      visibility: 1,
      sound: 'default',
      vibration: true,
    });
    await LocalNotifications.schedule({
      notifications: [{
        id: 600 + tierIndex,
        title: '💰 Savings Milestone!',
        body: savingsMessage(tier, currency),
        schedule: { at: new Date(Date.now() + 1500) },
        smallIcon: 'ic_stat_icon',
        channelId: 'journey',
      }],
    });
  } catch (e) {
    console.error('[notifications] fireSavingsMilestone failed:', e);
  }
}

export async function cancelAll(): Promise<void> {
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    const ids = [
      1, 2, 3, 4,
      ...MILESTONE_DAYS.map(d => 500 + d),
      ...SAVINGS_TIERS.map((_, i) => 600 + i),
    ].map(id => ({ id }));
    await LocalNotifications.cancel({ notifications: ids });
  } catch (e) {
    console.error('[notifications] cancelAll failed:', e);
  }
}
