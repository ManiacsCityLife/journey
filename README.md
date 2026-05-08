# Journey Forward — Recovery & Sobriety Companion App

**Version 5.6** | **Production-Ready**

A comprehensive mobile app built with React, Capacitor, and TypeScript to support individuals on their sobriety journey. Journey Forward combines daily check-ins, progress tracking, emergency support tools, and evidence-based techniques (CBT, mindfulness, urge surfing) to help users maintain long-term recovery.

---

## Features

### Core Functionality
- **Sobriety Tracker**: Real-time countdown of days, hours, minutes, and seconds sober
- **Daily Check-ins**: Log cravings, intrusive thoughts, physical activities, and sleep
- **Progress Tracking**: Heatmap visualization of daily engagement and trends
- **Milestone Celebrations**: Notifications and cards for 1d, 7d, 14d, 30d, 60d, 90d, 180d, 1yr milestones
- **Savings Goal**: Track money saved from not drinking
- **Emergency Kit**: Quick access to grounding techniques, breathing exercises, and guided meditations
- **Sober Buddy AI Chat**: Conversational support powered by LLM integration
- **CBT Guides**: Cognitive Behavioral Therapy techniques for managing cravings
- **Daily Journal**: Voice-to-text and text journaling with mood tracking
- **Weekly Goals**: Set and track personal recovery goals
- **Pledge System**: Daily sobriety pledges with streak tracking
- **Biometric Security**: Optional fingerprint/Face ID unlock
- **Backup & Restore**: Encrypted cloud backup of all user data
- **Push Notifications**: Customizable motivation quotes and daily reminders

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + TypeScript |
| **Build Tool** | Vite 6 |
| **Styling** | Tailwind CSS |
| **Mobile Framework** | Capacitor 6 |
| **State Management** | React Hooks + Context |
| **Storage** | @capacitor/preferences (native secure storage) |
| **Notifications** | @capacitor/local-notifications |
| **Biometrics** | @capgo/capacitor-native-biometric |
| **Speech Recognition** | @capacitor-community/speech-recognition |
| **Text-to-Speech** | @capacitor-community/text-to-speech |
| **File System** | @capacitor/filesystem |

---

## Architecture

### Project Structure
```
journey/
├── src/
│   ├── App.tsx                    # Root component with navigation
│   ├── index.css                  # Tailwind CSS entry point
│   ├── types/                     # TypeScript type definitions
│   ├── hooks/
│   │   └── useAppData.ts          # Global state management hook
│   ├── utils/
│   │   ├── storage.ts             # Encrypted storage wrapper
│   │   ├── biometric.ts           # Biometric authentication
│   │   ├── notifications.ts       # Push notification scheduling
│   │   ├── speech.ts              # Speech recognition & TTS
│   │   ├── milestoneCard.ts       # Milestone card generation
│   │   └── ...
│   └── components/
│       ├── HomeScreen.tsx         # Main dashboard
│       ├── ProgressScreen.tsx     # Analytics & insights
│       ├── EmergencyKit.tsx       # Crisis support tools
│       ├── SoberBuddyChat.tsx     # AI chat interface
│       ├── CBTScreen.tsx          # Cognitive therapy guides
│       ├── HistoryScreen.tsx      # Activity history
│       ├── BackupScreen.tsx       # Data backup/restore
│       └── ...
├── android/                       # Android native code
├── ios/                          # iOS native code (future)
├── capacitor.config.ts           # Capacitor configuration
├── vite.config.ts                # Vite build configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Dependencies
└── .npmrc                        # NPM configuration (legacy peer deps)
```

### Data Flow
1. **App Initialization**: `useAppData()` hook loads all user data from encrypted storage
2. **State Management**: Global state is managed through React Context and refs
3. **User Interaction**: Components dispatch actions (save, add, delete) through callback functions
4. **Persistence**: All changes are immediately persisted to native secure storage
5. **Notifications**: Background notifications are scheduled based on user settings
6. **Biometric Lock**: App can require fingerprint/Face ID on launch

### Key Design Patterns
- **Custom Hooks**: `useAppData()` encapsulates all data logic
- **Callback Props**: Components communicate through parent-provided callbacks
- **Async Storage**: All storage operations are async and properly awaited
- **Error Boundaries**: Silent error handling with optional logging for debugging
- **Lazy Loading**: Screen components are code-split for faster initial load

---

## Setup & Installation

### Prerequisites
- **Node.js** 18+ and npm 9+
- **Android Studio** (for Android development)
- **Xcode** (for iOS development, macOS only)
- **Capacitor CLI** (installed via npm)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/ManiacsCityLife/journey.git
   cd journey
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   > Note: The project uses `--legacy-peer-deps` due to Capacitor v6 compatibility. This is configured in `.npmrc`.

3. **Start development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`

4. **Build for production**
   ```bash
   npm run build
   ```
   Output is in the `dist/` directory.

---

## Building for Mobile

### Android

1. **Sync Capacitor files**
   ```bash
   npx cap sync android
   ```

2. **Open Android Studio**
   ```bash
   npx cap open android
   ```

3. **Build and run**
   - Select your device/emulator in Android Studio
   - Click "Run" or press Shift+F10

4. **Generate signed APK** (for release)
   - Build → Generate Signed Bundle/APK
   - Follow the signing wizard

### iOS (macOS only)

1. **Sync Capacitor files**
   ```bash
   npx cap sync ios
   ```

2. **Open Xcode**
   ```bash
   npx cap open ios
   ```

3. **Build and run**
   - Select your device/simulator in Xcode
   - Press Cmd+R to build and run

4. **Generate IPA** (for release)
   - Product → Archive
   - Distribute App

---

## Configuration

### Capacitor Configuration (`capacitor.config.ts`)
- **App ID**: `com.journeyforward.app`
- **App Name**: `Journey Forward`
- **Server**: Configured to load local assets in production
- **Plugins**: All Capacitor plugins are pre-configured

### Environment Variables
Currently, no environment variables are required for development. For production:
- **API Endpoint**: (if backend is added) Set in environment
- **API Key**: (if using external LLM) Set securely

---

## Testing

### Manual Testing Checklist
- [ ] App launches without errors
- [ ] Biometric unlock works (if enabled)
- [ ] Voice-to-text journal entry saves correctly
- [ ] Pledge streak resets after missed days
- [ ] Notifications fire at scheduled times
- [ ] Backup/restore preserves all data
- [ ] All screens are responsive on mobile

### Running Tests
```bash
npm test  # (not yet configured — see "Future Improvements")
```

---

## Troubleshooting

### Common Issues

**"ERR_CONNECTION_REFUSED" on Android**
- Ensure `capacitor.config.ts` has `server: { androidScheme: 'https' }`
- Clear app cache: Settings → Apps → Journey Forward → Storage → Clear Cache

**Voice-to-text not working**
- Check microphone permissions: Settings → Apps → Journey Forward → Permissions → Microphone
- Ensure speech recognition is available on your device

**Notifications not appearing**
- Enable notifications: Settings → Apps → Journey Forward → Notifications → Allow
- Check notification channel is enabled: Settings → Notifications → Journey Forward

**Biometric unlock fails**
- Ensure fingerprint/Face ID is set up on your device
- Try disabling and re-enabling biometric unlock in app settings

---

## Performance Optimization

### Bundle Size
- **Main bundle**: ~489 kB (gzipped: ~142 kB)
- **Vendor chunk**: ~11.8 kB (React, React DOM)
- **Capacitor chunk**: ~11.5 kB (Capacitor plugins)
- **Code splitting**: Implemented via Vite's manual chunks

### Optimization Techniques
1. **Tree-shaking**: Unused code is removed during build
2. **Minification**: Production builds are minified and optimized
3. **Lazy loading**: Components are code-split for faster initial load
4. **Gzip compression**: Enabled in production

---

## Security

### Data Protection
- **Encrypted Storage**: All user data is stored using native secure storage (`@capacitor/preferences`)
- **Biometric Authentication**: Optional fingerprint/Face ID unlock
- **No localStorage**: Web Storage is not used; all data persists via Capacitor
- **No hardcoded secrets**: API keys and sensitive data must be stored securely

### Best Practices
- Always use HTTPS in production
- Never commit `.env` files or secrets to version control
- Regularly update dependencies: `npm audit fix`
- Review security advisories: `npm audit`

---

## Deployment

### Android Play Store
1. Generate signed APK/Bundle
2. Create a Google Play Developer account
3. Upload to Google Play Console
4. Fill in app details, screenshots, and privacy policy
5. Submit for review (typically 2-4 hours)

### iOS App Store
1. Generate signed IPA
2. Create an Apple Developer account
3. Upload via Xcode or Transporter
4. Fill in app details, screenshots, and privacy policy
5. Submit for review (typically 24-48 hours)

### Web Deployment (Optional)
```bash
npm run build
# Deploy dist/ folder to any static hosting (Vercel, Netlify, etc.)
```

---

## Maintenance & Updates

### Regular Tasks
- **Weekly**: Monitor crash reports and user feedback
- **Monthly**: Review and update dependencies
- **Quarterly**: Audit security vulnerabilities
- **Annually**: Plan major feature releases

### Updating Dependencies
```bash
npm update                    # Update to latest compatible versions
npm audit fix                 # Fix security vulnerabilities
npm outdated                  # Check for outdated packages
```

---

## Future Improvements

### Short Term (v5.7–v6.0)
- [ ] Add unit tests (Vitest) for core logic
- [ ] Implement E2E tests (Playwright)
- [ ] Add dark mode toggle
- [ ] Implement data export (CSV/PDF)
- [ ] Add offline mode with sync

### Medium Term (v6.1–v7.0)
- [ ] Backend API integration for cloud sync
- [ ] Social features (share milestones, support groups)
- [ ] Advanced analytics and insights
- [ ] Wearable integration (Apple Watch, Wear OS)
- [ ] Multi-language support

### Long Term (v7.1+)
- [ ] AI-powered personalized recommendations
- [ ] Integration with healthcare providers
- [ ] Telehealth support sessions
- [ ] Community forums and peer support
- [ ] Research data collection (with consent)

---

## Contributing

### Code Style
- Use TypeScript for all new code
- Follow React best practices (hooks, functional components)
- Use Tailwind CSS for styling
- Keep components small and focused
- Add comments for complex logic

### Pull Request Process
1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes and test thoroughly
3. Commit with clear messages: `git commit -m "Add feature: description"`
4. Push to your fork: `git push origin feature/your-feature`
5. Create a Pull Request with a detailed description

---

## Support & Contact

For issues, questions, or feedback:
- **GitHub Issues**: [ManiacsCityLife/journey/issues](https://github.com/ManiacsCityLife/journey/issues)
- **Email**: support@journeyforward.app (future)
- **Discord**: [Join our community](https://discord.gg/journeyforward) (future)

---

## License

This project is licensed under the **MIT License** — see LICENSE file for details.

---

## Acknowledgments

Journey Forward is built with ❤️ for anyone on the path to recovery. Special thanks to:
- The Capacitor team for excellent mobile framework
- The React community for amazing tools and libraries
- All users and contributors who help improve this app

---

**Last Updated**: May 2026 | **Status**: Production-Ready ✅
