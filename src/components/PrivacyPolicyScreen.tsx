// In-app Privacy Policy.
//
// This is a copy of the policy that should also be hosted at a public URL
// for the Play Store listing. Keeping a copy in-app means users can read it
// without internet, which fits the app's offline-first promise.
//
// If you change anything here, update the hosted version too.
import { IconShieldLock } from './Icons';

interface Props { onBack: () => void }

export default function PrivacyPolicyScreen({ onBack }: Props) {
  const lastUpdated = '10 May 2026';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="flex items-center px-4 py-4 bg-white border-b border-slate-100 flex-shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 className="text-slate-800 font-bold text-lg ml-2">Privacy Policy</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-5 pb-24 space-y-5">

        {/* Hero */}
        <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
            <IconShieldLock size={20} color="#0d9488"/>
          </div>
          <div>
            <p className="text-teal-900 font-semibold text-sm">The short version</p>
            <p className="text-teal-800 text-xs leading-relaxed mt-1">
              Journey Forward stores everything on your phone. We do not collect, transmit, sell, or share any of your data. There are no accounts, no servers, no analytics, no advertising IDs.
            </p>
          </div>
        </div>

        <p className="text-slate-400 text-xs">Last updated: {lastUpdated}</p>

        {/* Sections */}
        <Section title="1. What we collect">
          <p><strong>Nothing.</strong> Journey Forward has no servers and no telemetry. Everything you write, log, or save lives only in your phone's local storage (Android Preferences, encrypted at rest by the operating system).</p>
        </Section>

        <Section title="2. What we share">
          <p><strong>Nothing.</strong> We have no infrastructure to share your data with. The app makes zero outbound network requests in normal operation. The only network call ever made is when you intentionally tap a phone number on the Crisis Lines screen — and that's a phone call placed by your dialer, not a data transmission.</p>
        </Section>

        <Section title="3. Permissions we request, and why">
          <ul className="space-y-2 text-sm">
            <li><strong>Microphone (RECORD_AUDIO)</strong> — Only used when you tap the microphone button in the Journal to dictate an entry. Audio is processed entirely by your phone's built-in speech recognition engine and never leaves the device. We don't record audio files; only the recognised text is captured, and only into your journal entry.</li>
            <li><strong>Biometrics (USE_BIOMETRIC, USE_FINGERPRINT)</strong> — Optional. If you enable app lock with biometric unlock, your phone's secure biometric system verifies you locally. We never see or store your biometric data.</li>
            <li><strong>Notifications (POST_NOTIFICATIONS)</strong> — Optional. Used only for the daily motivation, reminder, and milestone notifications you opt into. All notification text is composed on your device.</li>
            <li><strong>Vibration (VIBRATE)</strong> — Used for short haptic feedback on certain interactions.</li>
            <li><strong>Internet (INTERNET)</strong> — Required by the Android system for the WebView, but Journey Forward does not initiate any HTTPS or HTTP requests on its own.</li>
          </ul>
        </Section>

        <Section title="4. Backups and exports">
          <p>You can export your data at any time via Profile → Backup &amp; Restore. The export is a JSON file written to your phone's storage. We never receive a copy. If you import a backup, the file is read locally only.</p>
        </Section>

        <Section title="5. Deleting your data">
          <p>You can erase everything at any time via Profile → Erase All Data. This permanently wipes your journal, vision board, slip log, gratitude entries, sleep, cravings, thoughts, activities, and all settings. There is no recovery from this — and because we don't have a copy on any server, this deletion is total.</p>
          <p>Uninstalling the app also removes all data, since there is nothing stored elsewhere.</p>
        </Section>

        <Section title="6. Children">
          <p>Journey Forward is intended for adults working on their relationship with alcohol or other substances. It is not directed at children under 13.</p>
        </Section>

        <Section title="7. Health information disclaimer">
          <p>Journey Forward is a self-help and journaling tool. It is not a medical device, not a substitute for professional medical care, and not a crisis service. If you are in danger, call your local emergency services. The Crisis Lines screen lists numbers in many regions.</p>
          <p>If you have been drinking heavily every day, stopping suddenly can cause medically serious withdrawal. Please consult a doctor before quitting cold turkey.</p>
        </Section>

        <Section title="8. Third parties">
          <p>None. The app contains no analytics SDKs, no advertising SDKs, no crash reporters that transmit data, no social-media trackers, no third-party authentication, and no in-app purchase systems.</p>
        </Section>

        <Section title="9. Open source">
          <p>The full source code is published on GitHub so that anyone can verify these privacy claims for themselves. The repository URL is shown in the app's About / Profile section.</p>
        </Section>

        <Section title="10. Contact">
          <p>Questions or concerns? Open an issue on the project's GitHub repository. Because we operate no servers, we cannot reset accounts or recover lost data — there are no accounts to reset and no copies to recover.</p>
        </Section>

        <Section title="11. Changes to this policy">
          <p>If this policy ever changes, the updated version will appear here on next app launch and the "Last updated" date above will change. We do not, and cannot, notify you remotely because we have no way to contact you.</p>
        </Section>

        <p className="text-center text-slate-400 text-xs italic pt-4">
          Your story is yours. We just give you a place to write it down.
        </p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border border-slate-100 p-4 space-y-2">
      <h2 className="text-slate-800 font-semibold text-sm">{title}</h2>
      <div className="text-slate-600 text-xs leading-relaxed space-y-2">{children}</div>
    </section>
  );
}
