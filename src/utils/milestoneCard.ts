// Generates shareable milestone card images using HTML Canvas
// Returns a base64 PNG that can be shared via Web Share interface or saved

const MILESTONES: Record<number, { label: string; benefit: string; emoji: string }> = {
  1:   { label: '1 Day Sober',    benefit: 'Blood alcohol cleared',          emoji: '🌱' },
  3:   { label: '3 Days Sober',   benefit: 'Sleep is improving',             emoji: '😴' },
  7:   { label: '1 Week Sober',   benefit: 'Hydration fully restored',        emoji: '💧' },
  14:  { label: '2 Weeks Sober',  benefit: 'Anxiety beginning to lift',       emoji: '🧘' },
  30:  { label: '1 Month Sober',  benefit: 'Liver function recovering',       emoji: '💚' },
  60:  { label: '2 Months Sober', benefit: 'Skin is visibly clearer',         emoji: '✨' },
  90:  { label: '90 Days Sober',  benefit: 'Brain chemistry rebalancing',     emoji: '🧠' },
  100: { label: '100 Day Hero',   benefit: 'You completed the challenge!',    emoji: '🏆' },
  180: { label: '6 Months Sober', benefit: 'Heart health significantly improved', emoji: '❤️' },
  365: { label: '1 Year Sober',   benefit: 'Full liver regeneration underway', emoji: '🌳' },
};

export function getMilestoneForDay(days: number): { label: string; benefit: string; emoji: string } | null {
  return MILESTONES[days] || null;
}

export async function generateMilestoneCard(data: { days: number; milestone: string; healthBenefit: string; moneySaved: number; currency: string; username: string }): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d')!;

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, 1080, 1080);
  bg.addColorStop(0, '#0f172a');
  bg.addColorStop(0.5, '#1e1b4b');
  bg.addColorStop(1, '#0f172a');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1080, 1080);

  // Decorative circles
  ctx.save();
  ctx.globalAlpha = 0.08;
  ctx.beginPath();
  ctx.arc(900, 150, 300, 0, Math.PI * 2);
  ctx.fillStyle = '#818cf8';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(150, 950, 250, 0, Math.PI * 2);
  ctx.fillStyle = '#6d28d9';
  ctx.fill();
  ctx.restore();

  // Inner card
  ctx.save();
  ctx.globalAlpha = 0.15;
  roundRect(ctx, 60, 60, 960, 960, 40);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.restore();

  // Border glow
  ctx.save();
  ctx.globalAlpha = 0.4;
  ctx.strokeStyle = '#818cf8';
  ctx.lineWidth = 2;
  roundRect(ctx, 60, 60, 960, 960, 40);
  ctx.stroke();
  ctx.restore();

  // App name
  ctx.font = 'bold 36px "DM Sans", sans-serif';
  ctx.fillStyle = '#818cf8';
  ctx.textAlign = 'center';
  ctx.fillText('THE JOURNEY FORWARD', 540, 140);

  // Emoji
  ctx.font = '140px serif';
  ctx.textAlign = 'center';
  ctx.fillText(data.milestone.includes('1 Year') ? '🌳' :
    data.days >= 100 ? '🏆' : data.days >= 90 ? '🧠' :
    data.days >= 30 ? '💚' : data.days >= 7 ? '💧' : '🌱', 540, 340);

  // Big milestone text
  ctx.font = 'bold 100px "Playfair Display", serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText(data.days.toString(), 540, 480);

  ctx.font = 'bold 48px "DM Sans", sans-serif';
  ctx.fillStyle = '#e2e8f0';
  ctx.fillText(data.days === 1 ? 'DAY SOBER' : 'DAYS SOBER', 540, 550);

  // Health benefit
  ctx.font = '34px "DM Sans", sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(data.healthBenefit, 540, 630);

  // Divider
  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.strokeStyle = '#818cf8';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(200, 680);
  ctx.lineTo(880, 680);
  ctx.stroke();
  ctx.restore();

  // Money saved
  ctx.font = 'bold 42px "DM Sans", sans-serif';
  ctx.fillStyle = '#4ade80';
  ctx.textAlign = 'center';
  ctx.fillText(`${data.currency}${data.moneySaved.toLocaleString()} saved`, 540, 760);

  // Username
  if (data.username) {
    ctx.font = '30px "DM Sans", sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText(`${data.username}'s milestone`, 540, 830);
  }

  // Watermark
  ctx.font = '24px "DM Sans", sans-serif';
  ctx.fillStyle = '#334155';
  ctx.fillText('journey-forward.app', 540, 980);

  return canvas.toDataURL('image/png');
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export async function shareMilestoneCard(dataUrl: string, days: number): Promise<void> {
  try {
    // Convert to blob for sharing
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const file = new File([blob], `journey_forward_${days}_days.png`, { type: 'image/png' });

    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: `${days} Days Sober — The Journey Forward`,
        text: `I'm ${days} days sober! 🌱 #JourneyForward #SoberLife`,
      });
    } else {
      // Fallback: download
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `journey_forward_${days}_days.png`;
      a.click();
    }
  } catch (e) {}
}
