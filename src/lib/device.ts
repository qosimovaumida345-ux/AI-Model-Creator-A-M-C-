export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  os: string;
  browser: string;
  isElectron: boolean;
  isCapacitor: boolean;
  isPWA: boolean;
  isOnline: boolean;
  cores: number;
  memory: number;
  gpu: string;
  storageEstimate: string;
  screenRes: string;
  touchSupport: boolean;
}

export function detectDevice(): DeviceInfo {
  const ua = navigator.userAgent;

  // Device type
  const isMobile = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isTablet = /iPad|Android(?!.*Mobile)|Tablet/i.test(ua);
  const type: DeviceInfo['type'] = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';

  // OS detection
  let os = 'Unknown';
  if (/Windows NT/i.test(ua)) os = 'Windows';
  else if (/Mac OS X/i.test(ua)) os = 'macOS';
  else if (/Linux/i.test(ua)) os = 'Linux';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/CrOS/i.test(ua)) os = 'ChromeOS';

  // Browser
  let browser = 'Unknown';
  if (/Edg\//i.test(ua)) browser = 'Edge';
  else if (/Chrome/i.test(ua)) browser = 'Chrome';
  else if (/Firefox/i.test(ua)) browser = 'Firefox';
  else if (/Safari/i.test(ua)) browser = 'Safari';
  else if (/Opera|OPR/i.test(ua)) browser = 'Opera';

  // Runtime detection
  const isElectron = typeof (window as any).process !== 'undefined' &&
    typeof (window as any).process.versions !== 'undefined' &&
    typeof (window as any).process.versions.electron !== 'undefined';

  const isCapacitor = typeof (window as any).Capacitor !== 'undefined';

  const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as any).standalone === true;

  const cores = navigator.hardwareConcurrency || 1;
  const memory = (navigator as any).deviceMemory || 0;

  // GPU detection
  let gpu = 'Unknown';
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (gl) {
      const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        gpu = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      }
    }
  } catch { gpu = 'Not available'; }

  const screenRes = `${screen.width}x${screen.height}`;
  const touchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  return {
    type, os, browser, isElectron, isCapacitor, isPWA,
    isOnline: navigator.onLine,
    cores, memory, gpu,
    storageEstimate: 'Calculating...',
    screenRes, touchSupport
  };
}

export async function getStorageEstimate(): Promise<string> {
  if (navigator.storage && navigator.storage.estimate) {
    const est = await navigator.storage.estimate();
    const used = ((est.usage || 0) / (1024 * 1024)).toFixed(1);
    const total = ((est.quota || 0) / (1024 * 1024 * 1024)).toFixed(1);
    return `${used} MB / ${total} GB`;
  }
  return 'Not available';
}
