import { useState } from 'react';
import { storageSet, storageGet, storageKeys } from '../utils/storage';
import { IconShare, IconCloud } from './Icons';
import BackButton from './BackButton';

interface BackupScreenProps {
  onBack: () => void;
  onRestored: () => void;
}

export default function BackupScreen({ onBack, onRestored }: BackupScreenProps) {
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState<'success'|'error'|'info'>('info');
  const [loading, setLoading] = useState(false);
  const [confirmRestore, setConfirmRestore] = useState<null | Record<string, string>>(null);

  function showStatus(msg: string, type: 'success'|'error'|'info' = 'info') {
    setStatus(msg); setStatusType(type);
  }

  async function handleExport() {
    setLoading(true);
    showStatus('Preparing backup...', 'info');
    try {
      const keys = await storageKeys();
      const backupData: Record<string, string> = {};
      for (const k of keys) {
        const v = await storageGet(k);
        if (v !== null) backupData[k] = v;
      }
      const json = JSON.stringify({ version: 2, timestamp: Date.now(), data: backupData }, null, 2);
      const filename = `journey_forward_backup_${new Date().toISOString().split('T')[0]}.json`;

      // Try Capacitor Filesystem + Share (Android native)
      try {
        const { Filesystem, Directory } = await import('@capacitor/filesystem');
        const { Share } = await import('@capacitor/share');
        await Filesystem.writeFile({
          path: filename,
          data: json,
          directory: Directory.Cache,
          encoding: 'utf8' as any,
        });
        const uriResult = await Filesystem.getUri({ path: filename, directory: Directory.Cache });
        await Share.share({
          title: 'Journey Forward Backup',
          text: 'My sobriety journey backup',
          url: uriResult.uri,
          dialogTitle: 'Save your backup',
        });
        showStatus('Backup shared successfully', 'success');
        return;
      } catch (capErr: any) {
        if (capErr?.message?.includes('cancel') || capErr?.message?.includes('dismiss')) {
          showStatus('Share cancelled', 'info');
          return;
        }
      }

      // Web fallback
      const blob = new Blob([json], { type: 'application/json' });
      if (navigator.share && navigator.canShare) {
        const file = new File([blob], filename, { type: 'application/json' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: 'Journey Forward Backup' });
          showStatus('Backup shared successfully', 'success');
          return;
        }
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename; a.click();
      URL.revokeObjectURL(url);
      showStatus('Backup file saved to Downloads', 'success');
    } catch (e: any) {
      if (e?.name !== 'AbortError') showStatus('Export failed: ' + (e?.message || 'unknown error'), 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleImport() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        const data: Record<string, string> = parsed.data || parsed;
        if (typeof data !== 'object') throw new Error('Invalid backup format');
        setConfirmRestore(data);
      } catch (err: any) {
        showStatus('Could not read backup file: ' + (err?.message || 'unknown error'), 'error');
      }
    };
    input.click();
  }

  async function applyRestore(data: Record<string, string>) {
    setConfirmRestore(null);
    setLoading(true);
    showStatus('Restoring...', 'info');
    try {
      for (const [key, value] of Object.entries(data)) {
        await storageSet(key, value);
      }
      showStatus('Restore complete! Reloading...', 'success');
      setTimeout(() => onRestored(), 1500);
    } catch (e: any) {
      showStatus('Restore failed: ' + (e?.message || 'unknown error'), 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="bg-white border-b border-slate-100 px-4 py-4 flex items-center gap-3">
        <BackButton onClick={onBack} />
        <div>
          <div className="text-slate-800 font-bold">Backup & Restore</div>
          <div className="text-slate-400 text-xs">Your data, your control</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        <div className="bg-teal-50 rounded-2xl p-4 border border-teal-100">
          <div className="flex gap-3 items-start">
            <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0">
              <IconCloud size={20} color="#0d9488"/>
            </div>
            <div>
              <div className="text-teal-800 font-semibold text-sm">Your data never touches a server</div>
              <div className="text-teal-700 text-xs mt-1 leading-relaxed">
                This app runs entirely on <strong>your device</strong>. I built it as a recovering alcoholic —
                I drank daily for 25 years. There is no server. Your data is yours alone. Export a backup and save it wherever you choose.
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <IconShare size={20} color="#059669"/>
            </div>
            <div>
              <div className="text-slate-800 font-semibold text-sm">Export Backup</div>
              <div className="text-slate-400 text-xs mt-0.5">Opens share sheet — save to your Files app, email, WhatsApp, or any local storage</div>
            </div>
          </div>
          <button onClick={handleExport} disabled={loading}
            className="w-full py-3.5 rounded-xl bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-sm">
            {loading ? 'Preparing...' : 'Export & Share Backup'}
          </button>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </div>
            <div>
              <div className="text-slate-800 font-semibold text-sm">Restore from Backup</div>
              <div className="text-slate-400 text-xs mt-0.5">Select a .json backup file. All your data will be restored exactly as it was.</div>
            </div>
          </div>
          <button onClick={handleImport} disabled={loading}
            className="w-full py-3.5 rounded-xl bg-amber-500 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-sm">
            Choose Backup File
          </button>
        </div>

        {status && (
          <div className={`rounded-xl p-3.5 text-sm text-center font-medium flex items-center justify-center gap-2 ${
            statusType==='success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
            statusType==='error'   ? 'bg-red-50 text-red-600 border border-red-100' :
                                     'bg-slate-100 text-slate-600'
          }`}>
            {loading && <span className="inline-block w-3.5 h-3.5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin"/>}
            {status}
          </div>
        )}
      </div>

      {confirmRestore && (
        <div className="fixed inset-0 bg-black/40 flex items-end z-50" onClick={() => setConfirmRestore(null)}>
          <div className="bg-white rounded-t-3xl p-6 w-full border-t border-slate-100" onClick={e => e.stopPropagation()}>
            <div className="text-slate-800 font-bold text-lg mb-2">Restore this backup?</div>
            <div className="text-slate-500 text-sm mb-6 leading-relaxed">
              This will replace all current data on this device with the backup. Your existing entries will be overwritten.
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setConfirmRestore(null)}
                className="py-3.5 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm">Cancel</button>
              <button onClick={() => applyRestore(confirmRestore)}
                className="py-3.5 rounded-xl bg-amber-500 text-white font-semibold text-sm">Yes, Restore</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
