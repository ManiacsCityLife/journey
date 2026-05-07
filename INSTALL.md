# Journey Forward — Build Instructions

## Full Build Sequence (PowerShell)

```powershell
cd "C:\Users\shawn\Documents\Personal Docs\Personal\journey-forward"
npm install --legacy-peer-deps
npm run build
npx cap add android

# Copy all icon folders (must be done after every cap add)
Copy-Item -Recurse -Force "android-icons\mipmap-mdpi"      "android\app\src\main\res\"
Copy-Item -Recurse -Force "android-icons\mipmap-hdpi"      "android\app\src\main\res\"
Copy-Item -Recurse -Force "android-icons\mipmap-xhdpi"     "android\app\src\main\res\"
Copy-Item -Recurse -Force "android-icons\mipmap-xxhdpi"    "android\app\src\main\res\"
Copy-Item -Recurse -Force "android-icons\mipmap-xxxhdpi"   "android\app\src\main\res\"
Copy-Item -Recurse -Force "android-icons\mipmap-anydpi-v26" "android\app\src\main\res\"
Copy-Item -Recurse -Force "android-icons\values"            "android\app\src\main\res\"

# Remove invalid Capacitor icon filenames (hyphen not allowed)
Get-ChildItem -Path "android\app\src\main\res" -Recurse -Filter "icon-only.png" | Remove-Item -Force

cd android
'sdk.dir=C\:\\Users\\shawn\\AppData\\Local\\Android\\Sdk' | Out-File -FilePath "local.properties" -Encoding ASCII
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:PATH += ";$env:JAVA_HOME\bin"
.\gradlew.bat assembleDebug -x clean
copy "app\build\outputs\apk\debug\app-debug.apk" "$env:USERPROFILE\Desktop\JourneyForward.apk"
```

## Notes
- ALWAYS use `npx cap add android` — never `npx cap sync`
- Re-copy all icon folders after every `cap add` (they get reset)
- After installing APK, go to Profile → Edit Details to set your sobriety start date

## Privacy Architecture

This app is fully offline and privacy-first. No data ever leaves the device.

- **No external AI calls** — SoberBuddyChat uses a 1,000-response scripted engine with on-device keyword detection. Zero network requests.
- **No analytics** — Analytics have been removed entirely.
- **No external fonts** — External fonts removed; Inter is served from the system font stack.
- **No keys required** — External AI dependencies removed. No `.env` file needed.
- **No external services** — External service configurations are not used; the plugin hook has been removed from the build configuration.
- **All user data** (journal entries, mood logs, chat history, milestones) is stored exclusively in `@capacitor/preferences` on the local device.
