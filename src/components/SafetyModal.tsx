import { IconShield, IconPhone } from './Icons';

// First-launch sheet: flags withdrawal danger + key crisis numbers.
// Dismissed once and remembered (`safetyDismissed` in storage).
function SafetyModal({ onDismiss, onViewLines }: { onDismiss: () => void; onViewLines: () => void }) {
  const quickLines = [
    { flag: '🌐 US', number: '988', tel: '988' },
    { flag: '🇬🇧 UK', number: '116 123', tel: '116123' },
    { flag: '🇦🇺 AU', number: '13 11 14', tel: '131114' },
    { flag: '🇿🇦 SA', number: '0800 456 789', tel: '0800456789' },
    { flag: '🇨🇦 CA', number: '1-833-456-4566', tel: '18334564566' },
  ];
  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50">
      <div className="bg-white rounded-t-3xl w-full max-w-md mx-auto overflow-y-auto max-h-[92vh]">
        {/* drag pill */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-slate-200 rounded-full"/>
        </div>
        <div className="px-5 pb-6 space-y-4">
          <div className="flex items-center gap-3 pt-1">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <IconShield size={20} color="#d97706"/>
            </div>
            <div>
              <h2 className="text-slate-800 font-bold text-base">A note before you begin</h2>
              <p className="text-slate-400 text-xs">Shown once. For your safety.</p>
            </div>
          </div>

          {/* Withdrawal warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <p className="text-amber-900 font-semibold text-sm mb-1.5">Alcohol withdrawal can be dangerous</p>
            <p className="text-amber-800 text-xs leading-relaxed">
              If you've been drinking heavily every day and you stop suddenly, your body may react
              with shaking, sweating, or anxiety — and in serious cases, <strong>seizures or
              delirium tremens</strong>.
            </p>
            <p className="text-amber-800 text-xs leading-relaxed mt-2">
              This is a medical reality, not a weakness. If you experience confusion,
              hallucinations, or severe tremors after stopping, <strong>seek medical help
              immediately</strong>. Tapering slowly with a doctor is safer than stopping cold.
            </p>
          </div>

          {/* Quick crisis numbers */}
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">If you need help right now</p>
            <div className="space-y-1.5">
              {quickLines.map(({ flag, number, tel }) => (
                <div key={tel} className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
                  <span className="text-slate-500 text-xs font-semibold w-16 shrink-0">{flag}</span>
                  <span className="flex-1 text-slate-700 font-mono text-xs">{number}</span>
                  <a href={`tel:${tel}`}
                    className="bg-rose-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1">
                    <IconPhone size={11} color="white"/>
                    <span>Call</span>
                  </a>
                </div>
              ))}
            </div>
          </div>

          <button onClick={onViewLines}
            className="w-full text-teal-600 text-sm font-semibold py-2 rounded-xl border border-teal-200 bg-teal-50 active:bg-teal-100 transition-colors">
            View all crisis lines →
          </button>

          <button onClick={onDismiss}
            className="w-full py-4 rounded-2xl bg-teal-600 text-white font-semibold text-base shadow-md shadow-teal-500/20 active:scale-[0.98] transition-transform">
            Got it, I understand
          </button>
        </div>
      </div>
    </div>
  );
}

export default SafetyModal;
