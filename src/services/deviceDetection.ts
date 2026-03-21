import type { DeviceInfo, Platform, Architecture, GPUInfo } from '@/types';

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
    supportsWASM: typeof WebAssembly === 'object',
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

  const p = (navigator as any).userAgentData?.platform;
  if (p) {
    if (/Windows/i.test(p)) return 'x64';
    if (/macOS/i.test(p)) return 'arm64';
  }
  return 'unknown';
}

function detectGPU(): GPUInfo | null {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return null;

    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    if (!ext) {
      return {
        vendor: gl.getParameter(gl.VENDOR) || 'Unknown',
        renderer: gl.getParameter(gl.RENDERER) || 'Unknown',
        vram: null,
        supportsCUDA: false,
        supportsROCm: false,
        supportsMetal: false,
        supportsVulkan: false,
      };
    }

    const vendor = gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) || 'Unknown';
    const renderer = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || 'Unknown';

    const isNvidia = /nvidia/i.test(vendor) || /nvidia|geforce|rtx|gtx|quadro|tesla/i.test(renderer);
    const isAmd = /amd|ati/i.test(vendor) || /radeon|amd/i.test(renderer);
    const isApple = /apple/i.test(vendor);
    const isIntel = /intel/i.test(vendor);

    let vram: number | null = null;
    const vramMatch = renderer.match(/(\d+)\s*GB/i);
    if (vramMatch) {
      vram = parseInt(vramMatch[1]);
    } else if (isNvidia) {
      if (/4090/i.test(renderer)) vram = 24;
      else if (/4080/i.test(renderer)) vram = 16;
      else if (/4070/i.test(renderer)) vram = 12;
      else if (/3090/i.test(renderer)) vram = 24;
      else if (/3080/i.test(renderer)) vram = 10;
      else if (/3070/i.test(renderer)) vram = 8;
      else if (/3060/i.test(renderer)) vram = 12;
      else if (/2080/i.test(renderer)) vram = 8;
      else if (/2070/i.test(renderer)) vram = 8;
      else if (/2060/i.test(renderer)) vram = 6;
      else if (/1080/i.test(renderer)) vram = 8;
      else if (/1070/i.test(renderer)) vram = 8;
      else if (/1060/i.test(renderer)) vram = 6;
    } else if (isAmd) {
      if (/7900/i.test(renderer)) vram = 24;
      else if (/6900/i.test(renderer)) vram = 16;
      else if (/6800/i.test(renderer)) vram = 16;
      else if (/6700/i.test(renderer)) vram = 12;
    }

    return {
      vendor,
      renderer,
      vram,
      supportsCUDA: isNvidia,
      supportsROCm: isAmd && !isIntel,
      supportsMetal: isApple,
      supportsVulkan: isNvidia || isAmd,
    };
  } catch {
    return null;
  }
}

export function getHardwareAssessment(device: DeviceInfo) {
  const ram = device.ram || 4;
  const vram = device.gpu?.vram || 0;
  const hasCuda = device.gpu?.supportsCUDA || false;
  const hasMetal = device.gpu?.supportsMetal || false;

  let maxModelSize = '2B';
  let canRunLocally = true;
  let speed: string = 'slow';
  const recommendedModels: string[] = [];
  const backends: string[] = ['cpu'];

  if (hasCuda) backends.push('cuda');
  if (hasMetal) backends.push('metal');
  if (device.gpu?.supportsROCm) backends.push('rocm');
  if (device.gpu?.supportsVulkan) backends.push('vulkan');
  if (device.supportsWebGPU) backends.push('webgpu');

  if (vram >= 48 || ram >= 64) {
    maxModelSize = '70B';
    speed = 'fast';
    recommendedModels.push('llama-31-70b', 'qwen25-72b', 'mistral-large-2');
  } else if (vram >= 24 || ram >= 32) {
    maxModelSize = '34B';
    speed = 'fast';
    recommendedModels.push('codellama-34b', 'yi-15-34b', 'qwen25-32b');
  } else if (vram >= 12 || ram >= 16) {
    maxModelSize = '13B';
    speed = 'moderate';
    recommendedModels.push('llama-31-8b', 'mistral-nemo', 'qwen25-14b');
  } else if (vram >= 6 || ram >= 8) {
    maxModelSize = '8B';
    speed = 'moderate';
    recommendedModels.push('llama-31-8b', 'gemma-2-9b', 'mistral-7b-v03', 'phi-35-mini');
  } else if (ram >= 4) {
    maxModelSize = '3B';
    speed = 'slow';
    recommendedModels.push('llama-32-3b', 'gemma-2-2b', 'phi-2', 'tinyllama');
  } else {
    maxModelSize = '1B';
    speed = 'slow';
    canRunLocally = false;
    recommendedModels.push('llama-32-1b', 'tinyllama', 'smollm2');
  }

  const recommendation = !canRunLocally
    ? 'Your device may not support local inference. Use online mode instead.'
    : `Your device can run models up to ${maxModelSize} parameters locally. ${
        hasCuda
          ? 'NVIDIA GPU detected — CUDA acceleration available.'
          : hasMetal
            ? 'Apple GPU detected — Metal acceleration available.'
            : 'CPU-only inference — consider using quantized (GGUF Q4) models for best performance.'
      }`;

  return {
    canRunLocally,
    recommendedModels,
    maxModelSize,
    inferenceSpeed: speed as 'fast' | 'moderate' | 'slow' | 'unsupported',
    recommendation,
    availableBackends: backends as ('cpu' | 'cuda' | 'rocm' | 'metal' | 'vulkan' | 'webgpu')[],
  };
}

export function getInstallerInfo(device: DeviceInfo) {
  const { platform, architecture } = device;

  switch (platform) {
    case 'windows':
      return {
        platform: 'windows' as const,
        architecture,
        downloadUrl: '/api/install/download/windows',
        fileName: 'ModelForge-Setup.exe',
        fileSize: 85_000_000,
        version: '1.0.0',
        checksum: '',
        format: 'exe' as const,
        bundledModels: [] as string[],
        requirements: 'Windows 10 or later, 4GB RAM minimum',
      };
    case 'macos':
      return {
        platform: 'macos' as const,
        architecture,
        downloadUrl: '/api/install/download/macos',
        fileName: 'ModelForge.dmg',
        fileSize: 90_000_000,
        version: '1.0.0',
        checksum: '',
        format: 'dmg' as const,
        bundledModels: [] as string[],
        requirements: 'macOS 12 or later, Apple Silicon or Intel',
      };
    case 'linux':
      return {
        platform: 'linux' as const,
        architecture,
        downloadUrl: '/api/install/download/linux',
        fileName: 'ModelForge.AppImage',
        fileSize: 80_000_000,
        version: '1.0.0',
        checksum: '',
        format: 'appimage' as const,
        bundledModels: [] as string[],
        requirements: 'Ubuntu 20.04+ or equivalent, 4GB RAM minimum',
      };
    case 'android':
      return {
        platform: 'android' as const,
        architecture,
        downloadUrl: '/api/install/download/android',
        fileName: 'ModelForge.apk',
        fileSize: 45_000_000,
        version: '1.0.0',
        checksum: '',
        format: 'apk' as const,
        bundledModels: [] as string[],
        requirements: 'Android 10+ with 4GB RAM',
      };
    case 'ios':
      return {
        platform: 'ios' as const,
        architecture: 'arm64' as const,
        downloadUrl: '/api/install/download/ios',
        fileName: 'ModelForge.ipa',
        fileSize: 50_000_000,
        version: '1.0.0',
        checksum: '',
        format: 'ipa' as const,
        bundledModels: [] as string[],
        requirements: 'iOS 16+ — Requires sideloading via AltStore (no Apple Developer account)',
      };
    default:
      return null;
  }
}

export function getPlatformIcon(platform: Platform): string {
  const icons: Record<Platform, string> = {
    windows:
      'M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801',
    macos:
      'M18.71 19.5c-1.14 1.62-2.38 3.22-4.01 3.25-1.75.03-2.32-1.04-4.33-1.04s-2.63 1-4.28 1.07c-1.72.06-3.03-1.75-4.18-3.36C-.35 16.26-1.55 10.63.89 6.98c1.2-1.81 3.34-2.95 5.67-2.98 1.69-.03 3.28 1.14 4.31 1.14 1.03 0 2.96-1.41 4.99-1.2.85.04 3.24.34 4.77 2.58-.12.08-2.85 1.66-2.82 4.96.04 3.94 3.46 5.25 3.49 5.27-.03.09-.55 1.87-1.8 3.71M13 3.5c.85-1.03 2.27-1.82 3.45-1.87.16 1.37-.4 2.72-1.22 3.72-.82 1-2.17 1.77-3.48 1.67-.19-1.33.46-2.72 1.25-3.52',
    linux:
      'M12.5 2C11.12 2 10 3.12 10 4.5v.3C7.67 6 6 8.24 6 11v2l-2 3v1h16v-1l-2-3v-2c0-2.76-1.67-5-4-6.2v-.3C14 3.12 12.88 2 12.5 2M8 19c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2',
    android:
      'M17.6 9.48l1.84-3.18c.16-.31.04-.69-.27-.86-.31-.16-.69-.04-.86.27l-1.87 3.23C14.82 8.35 13.45 8 12 8s-2.82.35-4.44.94L5.69 5.71c-.16-.31-.54-.43-.86-.27-.31.16-.43.55-.27.86L6.4 9.48C3.3 11.25 1.28 14.44 1 18h22c-.28-3.56-2.3-6.75-5.4-8.52zM7 15.25c-.69 0-1.25-.56-1.25-1.25S6.31 12.75 7 12.75s1.25.56 1.25 1.25S7.69 15.25 7 15.25zm10 0c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25z',
    ios: 'M18.71 19.5c-1.14 1.62-2.38 3.22-4.01 3.25-1.75.03-2.32-1.04-4.33-1.04s-2.63 1-4.28 1.07c-1.72.06-3.03-1.75-4.18-3.36C-.35 16.26-1.55 10.63.89 6.98c1.2-1.81 3.34-2.95 5.67-2.98 1.69-.03 3.28 1.14 4.31 1.14 1.03 0 2.96-1.41 4.99-1.2.85.04 3.24.34 4.77 2.58-.12.08-2.85 1.66-2.82 4.96.04 3.94 3.46 5.25 3.49 5.27-.03.09-.55 1.87-1.8 3.71M13 3.5c.85-1.03 2.27-1.82 3.45-1.87.16 1.37-.4 2.72-1.22 3.72-.82 1-2.17 1.77-3.48 1.67-.19-1.33.46-2.72 1.25-3.52',
    unknown:
      'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z',
  };
  return icons[platform] || icons.unknown;
}