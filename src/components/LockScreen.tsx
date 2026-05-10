import { useState, useEffect, useRef } from 'react';
import { authenticateBiometricDetailed } from '../utils/biometric';
import { verifyPin } from '../utils/pin';

function LockScreen({ method, onUnlocked }: { method: 'biometric' | 'pin'; onUnlocked: () => void }) {
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [bioMessage, setBioMessage] = useState('');
  const [bioBusy, setBioBusy] = useState(false);
  const triedRef = useRef(false);

  async function tryBiometric() {
    if (bioBusy) return;
    setBioBusy(true);
    setBioMessage('');
    const result = await authenticateBiometricDetailed();
    setBioBusy(false);
    if (result.success) onUnlocked();
    else if (result.error === 'lockout') setBioMessage('Too many attempts. Try again in a moment.');
    else if (result.error === 'no_enrollment') setBioMessage('No biometrics enrolled on your device.');
    else if (result.error === 'no_hardware') setBioMessage('Biometric hardware not available.');
    else if (result.error === 'cancelled') setBioMessage(''); // silent
    else if (result.error === 'unavailable') setBioMessage('Biometric unavailable on this device.');
    else if (result.message) setBioMessage(result.message);
  }

  // Auto-trigger biometric once on mount
  useEffect(() => {
    if (method === 'biometric' && !triedRef.current) {
      triedRef.current = true;
      tryBiometric();
    }
  }, [method]);

  async function tryPin(value: string) {
    setPinError('');
    if (!/^\d{4,8}$/.test(value)) {
      setPinError('Enter your 4–8 digit PIN');
      return;
    }
    const ok = await verifyPin(value);
    if (ok) onUnlocked();
    else { setPinError('Incorrect PIN'); setPinInput(''); }
  }

  if (method === 'pin') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6">
        <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center text-3xl mb-6">🔒</div>
        <h1 className="text-xl font-bold text-slate-800 mb-2">Enter your PIN</h1>
        <p className="text-slate-500 text-center text-sm mb-6">Your data stays private on this device.</p>
        <div className="w-full max-w-xs">
          <input
            autoFocus type="password" inputMode="numeric" pattern="\d*" maxLength={8}
            value={pinInput}
            onChange={e => { const v = e.target.value.replace(/\D/g,''); setPinInput(v); setPinError(''); if (v.length >= 4) { /* allow auto-submit on enter only */ } }}
            onKeyDown={e => e.key === 'Enter' && tryPin(pinInput)}
            placeholder="••••"
            className="w-full bg-white border border-slate-200 text-slate-800 placeholder-slate-300 rounded-2xl px-4 py-4 text-3xl tracking-[0.5em] text-center outline-none focus:ring-2 focus:ring-teal-500 mb-3"/>
          {pinError && <p className="text-rose-500 text-xs text-center mb-3">{pinError}</p>}
          <button onClick={() => tryPin(pinInput)}
            className="w-full py-4 rounded-2xl bg-teal-600 text-white font-bold text-base shadow-sm active:scale-[0.98] transition-transform">
            Unlock
          </button>
        </div>
      </div>
    );
  }

  // Biometric
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6">
      <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center text-3xl mb-6">🔒</div>
      <h1 className="text-xl font-bold text-slate-800 mb-2">App Locked</h1>
      <p className="text-slate-500 text-center text-sm mb-4">Authenticate to access your journey.</p>
      {bioMessage && <p className="text-rose-500 text-center text-xs mb-4 px-4">{bioMessage}</p>}
      <button onClick={tryBiometric} disabled={bioBusy}
        className="w-full max-w-xs py-4 rounded-2xl bg-teal-600 disabled:bg-teal-400 text-white font-bold text-base shadow-sm active:scale-[0.98] transition-transform">
        {bioBusy ? 'Authenticating…' : 'Unlock'}
      </button>
    </div>
  );
}

export default LockScreen;
