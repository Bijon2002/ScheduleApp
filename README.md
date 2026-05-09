# DayMap — Schedule App

Dark-mode daily schedule tracker with notifications, recurring blocks, JSON export/import, and image storage.

## Stack
- Expo SDK 54 + Expo Router
- TypeScript
- AsyncStorage (local persistence)
- expo-notifications (local alarms)
- expo-file-system + expo-sharing (JSON export)
- expo-document-picker (JSON + image import)

## Setup

### 1. Install Expo Go on your phone
- Android: https://play.google.com/store/apps/details?id=host.exp.exponent
- iOS: https://apps.apple.com/app/expo-go/id982107779

### 2. Install dependencies
```bash
cd ScheduleApp
npm install
```

### 3. Start dev server
```bash
npx expo start --clear
```

### 4. Scan QR code
Open Expo Go 54.0.6 and scan the QR code shown in the terminal.

If you see a remote update error, stop the dev server, run `npx expo start --clear`, and make sure the client app is Expo Go 54.0.6 or newer.

---

## Features
- ✅ Timeline view with color-coded blocks
- ✅ Add / edit / delete schedule blocks
- ✅ Local push notifications per block
- ✅ Recurring daily schedule toggle
- ✅ "Now" indicator on current block
- ✅ Export schedule as JSON
- ✅ Import schedule from JSON
- ✅ Import images and store a selected app image in the UI
- ✅ Store the pasted sample schedule into local app storage
- ✅ Dark mode

## Install on a device

Expo Go is fine for local testing of the UI and local notifications, but Android push notifications / remote notifications need a development build.

To install the app on your phone as a standalone build:
```bash
npx expo install eas-cli
eas build:configure
eas build -p android --profile preview
```

For a direct installable APK, use an EAS Android preview build and install the generated file on the device.

If you only want to test in Expo Go, keep using:
```bash
npx expo start --clear
```

## File structure
```
app/
  _layout.tsx      # Tab navigation
  index.tsx        # Timeline screen
  settings.tsx     # Export/import/images/clear
src/
  components/
    BlockCard.tsx  # Timeline card UI
    BlockForm.tsx  # Add/edit modal
  utils/
    storage.ts     # AsyncStorage + file ops
    notifications.ts
    theme.ts       # Colors
```
