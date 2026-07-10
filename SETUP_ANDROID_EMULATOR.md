# Android Emulator Setup

## Prerequisites
Java 17 is already installed.

## 1. Set ANDROID_HOME
Add this to `~/.bashrc` or `~/.zshrc`:
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$PATH
```
Then `source ~/.zshrc` (or restart terminal).

## 2. Install system image + emulator
```bash
sdkmanager "emulator" "platform-tools" "platforms;android-34"
sdkmanager "system-images;android-34;google_apis;x86_64"
```

## 3. Create the emulator (AVD)
```bash
avdmanager create avd \
  -name Pixel_6 \
  -k "system-images;android-34;google_apis;x86_64" \
  -d pixel_6
```

## 4. Run it
```bash
emulator -avd Pixel_6 -no-snapshot -netdelay none -netspeed full
```

## 5. Launch the app
```bash
npx expo start
```
Press `a` to open on the running emulator.
