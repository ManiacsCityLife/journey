import {
  IconHome, IconHeart, IconJournal, IconWind, IconLeaf, IconMoon,
  IconWalk, IconCup, IconSun, IconBook, IconNote, IconSeedling, IconTeapot,
  IconBath, IconSparkles, IconHands, IconPalette, IconGarden, IconBookmark,
  IconHourglass, IconFootprint, IconBubble, IconBell, IconAffirm, IconTarget
} from './Icons';
import type { MissionCat } from '../data/missions';

// ── Mission category → calm icon ───────────────────────────────────────────
function MissionIcon({ cat, size = 18, color = '#0d9488' }: { cat: MissionCat | string; size?: number; color?: string }) {
  const c = (cat as MissionCat);
  const props = { size, color };
  switch (c) {
    case 'walk':       return <IconWalk {...props}/>;
    case 'connect':    return <IconBubble {...props}/>;
    case 'read':       return <IconBookmark {...props}/>;
    case 'water':      return <IconCup {...props}/>;
    case 'breathe':    return <IconWind {...props}/>;
    case 'write':      return <IconJournal {...props}/>;
    case 'meal':       return <IconSeedling {...props}/>;
    case 'sleep':      return <IconMoon {...props}/>;
    case 'move':       return <IconFootprint {...props}/>;
    case 'tidy':       return <IconBath {...props}/>;
    case 'sun':        return <IconSun {...props}/>;
    case 'music':      return <IconNote {...props}/>;
    case 'book':       return <IconBook {...props}/>;
    case 'create':     return <IconPalette {...props}/>;
    case 'mindful':    return <IconLeaf {...props}/>;
    case 'tea':        return <IconTeapot {...props}/>;
    case 'gratitude':  return <IconHeart {...props}/>;
    case 'goal':       return <IconTarget {...props}/>;
    case 'photo':      return <IconSparkles {...props}/>;
    case 'rest':       return <IconHourglass {...props}/>;
    case 'reflect':    return <IconAffirm {...props}/>;
    case 'reward':     return <IconBell {...props}/>;
    case 'home':       return <IconHome {...props}/>;
    case 'nature':     return <IconGarden {...props}/>;
    case 'celebrate':  return <IconHands {...props}/>;
    default:           return <IconLeaf {...props}/>;
  }
}

export default MissionIcon;
