import type { DeviceInfo, Platform, Architecture, GPUInfo } from '@/types';

const GITHUB_RELEASES_BASE =
  'https://github.com/qosimovaumida345-ux/AI-Model-Creator-A-M-C-/releases/latest/download';

const INSTALLER_URLS: Record<Exclude<Platform, 'unknown'>, string> = {
  windows: `${GITHUB_RELEASES_BASE}/Model%20Forge%20Setup%201.0.0.exe`,
  macos: `${GITHUB_RELEASES_BASE}/Model%20Forge-1.0.0-universal.dmg`,
  linux: `${GITHUB_RELEASES_BASE}/Model%20Forge-1.0.0.AppImage`,
  android: `${GITHUB_RELEASES_BASE}/ModelForge.apk`,
  ios: `${GITHUB_RELEASES_BASE}/ModelForge.ipa`
};

export function detectDevice(): DeviceInfo {
  const ua = navigator.userAgent;
  const platform = detectPlatform(ua);
  const architecture = detectArchitecture(ua);
  const isMobile = /Android|iPhone|iPad|iPod/i.test(ua);
  const isTablet = /iPad|Android(?!.*Mobile)/i.test(ua);
  const isDesktop = !isMobile && !isTablet;

  return {
    platform,
    architecture,
    gpu: detectGPU(),
    ram: (navigator as any).deviceMemory || 0,
    cores: navigator.hardwareConcurrency || 0,
    isOnline: navigator.onLine,
    userAgent: ua,
    isMobile,
    isTablet,
    isDesktop,
    supportsWebGPU: 'gpu' in navigator,
    supportsWASM: typeof WebAssembly === 'object'
  };
}

function detectPlatform(ua: string): Platform {
  if (/Windows/i.test(ua)) return 'windows';
  if (/Macintosh|Mac OS X/i.test(ua)) return 'macos';
  if (/Linux/i.test(ua) && !/Android/i.test(ua)) return 'linux';
  if (/Android/i.test(ua)) return 'android';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
  return 'unknown';
}

function detectArchitecture(ua: string): Architecture {
  if (/arm64|aarch64/i.test(ua)) return 'arm64';
  if (/arm/i.test(ua)) return 'arm';
  if (/x86_64|x64|amd64|Win64|WOW64/i.test(ua)) return 'x64';
  if (/x86|i[3-6]86/i.test(ua)) return 'x86';
  return 'unknown';
}

function detectGPU(): GPUInfo | null {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return null;

    return {
      vendor: gl.getParameter(gl.VENDOR) || 'Unknown',
      renderer: gl.getParameter(gl.RENDERER) || 'Unknown',
      vram: null,
      supportsCUDA: false,
      supportsROCm: false,
      supportsMetal: false,
      supportsVulkan: false
    };
  } catch {
    return null;
  }
}

export function getHardwareAssessment(device: DeviceInfo) {
  const ram = device.ram || 4;
  const vram = device.gpu?.vram || 0;

  let maxModelSize = '2B';
  let canRunLocally = true;
  let speed: 'fast' | 'moderate' | 'slow' | 'unsupported' = 'slow';
  const recommendedModels: string[] = [];
  const backends: ('cpu' | 'cuda' | 'rocm' | 'metal' | 'vulkan' | 'webgpu')[] = ['cpu'];

  if (vram >= 48 || ram >= 64) {
    maxModelSize = '70B';
    speed = 'fast';
    recommendedModels.push('llama-31-70b', 'qwen25-72b');
  } else if (vram >= 24 || ram >= 32) {
    maxModelSize = '34B';
    speed = 'fast';
    recommendedModels.push('qwen25-32b', 'yi-15-34b');
  } else if (vram >= 12 || ram >= 16) {
    maxModelSize = '13B';
    speed = 'moderate';
    recommendedModels.push('llama-31-8b', 'qwen25-14b');
  } else if (vram >= 6 || ram >= 8) {
    maxModelSize = '8B';
    speed = 'moderate';
    recommendedModels.push('llama-31-8b', 'gemma-2-9b', 'mistral-7b-v03');
  } else if (ram >= 4) {
    maxModelSize = '3B';
    speed = 'slow';
    recommendedModels.push('llama-32-3b', 'gemma-2-2b', 'tinyllama');
  } else {
    maxModelSize = '1B';
    speed = 'unsupported';
    canRunLocally = false;
    recommendedModels.push('llama-32-1b', 'tinyllama');
  }

  return {
    canRunLocally,
    recommendedModels,
    maxModelSize,
    inferenceSpeed: speed,
    recommendation: canRunLocally
      ? `Your device can run up to ${maxModelSize} models locally.`
      : 'Your device is too weak for local inference; use online mode.',
    availableBackends: backends
  };
}

export function getInstallerInfo(device: DeviceInfo) {
  const { platform, architecture } = device;
  if (platform === 'unknown') return null;

  const meta: Record<Exclude<Platform, 'unknown'>, {
    fileName: string;
    format: 'exe' | 'dmg' | 'appimage' | 'apk' | 'ipa';
    fileSize: number;
    requirements: string;
  }> = {
    windows: {
      fileName: 'Model Forge Setup 1.0.0.exe',
      format: 'exe',
      fileSize: 95_000_000,
      requirements: 'Windows 10 or later, x64'
    },
    macos: {
      fileName: 'Model Forge-1.0.0-universal.dmg',
      format: 'dmg',
      fileSize: 199_000_000,
      requirements: 'macOS 12+, Intel or Apple Silicon'
    },
    linux: {
      fileName: 'Model Forge-1.0.0.AppImage',
      format: 'appimage',
      fileSize: 132_000_000,
      requirements: 'Linux x64'
    },
    android: {
      fileName: 'ModelForge.apk',
      format: 'apk',
      fileSize: 3_750_000,
      requirements: 'Android 10+'
    },
    ios: {
      fileName: 'ModelForge.ipa',
      format: 'ipa',
      fileSize: 50_000_000,
      requirements: 'iOS 16+ (manual sideload)'
    }
  };

  return {
    platform,
    architecture,
    downloadUrl: INSTALLER_URLS[platform],
    isAvailable: platform !== 'ios',
    fileName: meta[platform].fileName,
    fileSize: meta[platform].fileSize,
    version: '1.0.11',
    checksum: '',
    format: meta[platform].format,
    bundledModels: [] as string[],
    requirements: meta[platform].requirements
  };
}

export function getPlatformIcon(platform: Platform): string {
  const icons: Record<Platform, string> = {
    windows: 'M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801',
    macos: 'M18.71 19.5c-1.14 1.62-2.38 3.22-4.01 3.25-1.75.03-2.32-1.04-4.33-1.04s-2.63 1-4.28 1.07c-1.72.06-3.03-1.75-4.18-3.36C-.35 16.26-1.55 10.63.89 6.98c1.2-1.81 3.34-2.95 5.67-2.98 1.69-.03 3.28 1.14 4.31 1.14 1.03 0 2.96-1.41 4.99-1.2.85.04 3.24.34 4.77 2.58-.12.08-2.85 1.66-2.82 4.96.04 3.94 3.46 5.25 3.49 5.27-.03.09-.55 1.87-1.8 3.71M13 3.5c.85-1.03 2.27-1.82 3.45-1.87.16 1.37-.4 2.72-1.22 3.72-.82 1-2.17 1.77-3.48 1.67-.19-1.33.46-2.72 1.25-3.52',
    linux: 'M12.5 2C11.12 2 10 3.12 10 4.5v.3C7.67 6 6 8.24 6 11v2l-2 3v1h16v-1l-2-3v-2c0-2.76-1.67-5-4-6.2v-.3C14 3.12 12.88 2 12.5 2M8 19c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2',
    android: 'M17.6 9.48l1.84-3.18c.16-.31.04-.69-.27-.86-.31-.16-.69-.04-.86.27l-1.87 3.23C14.82 8.35 13.45 8 12 8s-2.82.35-4.44.94L5.69 5.71c-.16-.31-.54-.43-.86-.27-.31.16-.43.55-.27.86L6.4 9.48C3.3 11.25 1.28 14.44 1 18h22c-.28-3.56-2.3-6.75-5.4-8.52zM7 15.25c-.69 0-1.25-.56-1.25-1.25S6.31 12.75 7 12.75s1.25.56 1.25 1.25S7.69 15.25 7 15.25zm10 0c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25z',
    ios: 'M18.71 19.5c-1.14 1.62-2.38 3.22-4.01 3.25-1.75.03-2.32-1.04-4.33-1.04s-2.63 1-4.28 1.07c-1.72.06-3.03-1.75-4.18-3.36C-.35 16.26-1.55 10.63.89 6.98c1.2-1.81 3.34-2.95 5.67-2.98 1.69-.03 3.28 1.14 4.31 1.14 1.03 0 2.96-1.41 4.99-1.2.85.04 3.24.34 4.77 2.58-.12.08-2.85 1.66-2.82 4.96.04 3.94 3.46 5.25 3.49 5.27-.03.09-.55 1.87-1.8 3.71M13 3.5c.85-1.03 2.27-1.82 3.45-1.87.16 1.37-.4 2.72-1.22 3.72-.82 1-2.17 1.77-3.48 1.67-.19-1.33.46-2.72 1.25-3.52',
    unknown: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z'
  };
  return icons[platform] || icons.unknown;
}