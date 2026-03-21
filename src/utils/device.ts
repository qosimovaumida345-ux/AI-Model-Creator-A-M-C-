export type DeviceType = 'windows' | 'macos' | 'linux' | 'android' | 'ios' | 'unknown';

export function detectDevice(): DeviceType {
  const ua = navigator.userAgent.toLowerCase();
  if (/android/i.test(ua)) return 'android';
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios';
  if (/win/i.test(ua)) return 'windows';
  if (/mac/i.test(ua)) return 'macos';
  if (/linux/i.test(ua)) return 'linux';
  return 'unknown';
}

export function getInstallLabel(device: DeviceType): string {
  switch (device) {
    case 'windows': return 'Download for Windows (.exe)';
    case 'macos': return 'Download for macOS (.dmg)';
    case 'linux': return 'Download for Linux (.AppImage)';
    case 'android': return 'Download for Android (.apk)';
    case 'ios': return 'Download for iOS (TestFlight)';
    default: return 'Download';
  }
}