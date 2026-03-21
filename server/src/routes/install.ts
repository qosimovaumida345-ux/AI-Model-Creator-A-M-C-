import { Router, type Request, type Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

export const installRouter = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Device-specific installer endpoints ──────────────────────

installRouter.get('/info', (req, res) => {
  const ua = req.headers['user-agent'] || '';
  const platform = detectPlatformFromUA(ua);

  res.json({
    success: true,
    data: {
      platform,
      availableInstallers: getAvailableInstallers(),
      electronVersion: '28.0.0',
      llamaCppVersion: 'b2534',
      appVersion: '1.0.0',
    },
  });
});

// ── Serve installer builds ───────────────────────────────────
installRouter.get('/download/:platform', (req, res) => {
  const { platform } = req.params;
  const buildDir = path.resolve(__dirname, '../../../builds');

  const fileMap: Record<string, string> = {
    windows: 'ModelForge-Setup.exe',
    macos: 'ModelForge.dmg',
    linux: 'ModelForge.AppImage',
    android: 'ModelForge.apk',
    ios: 'ModelForge.ipa',
  };

  const fileName = fileMap[platform];
  if (!fileName) {
    return res.status(400).json({ success: false, error: `Unknown platform: ${platform}` });
  }

  const filePath = path.join(buildDir, fileName);
  if (fs.existsSync(filePath)) {
    res.download(filePath, fileName);
  } else {
    res.status(404).json({
      success: false,
      error: `Installer not built yet. Run the build command first.`,
      buildCommand: getBuildCommand(platform),
    });
  }
});

// ── Proxy downloads (for GGUF models from HuggingFace) ──────
installRouter.post('/proxy-download', async (req: Request, res: Response) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ success: false, error: 'No URL provided' });
  }

  // Validate URL is from trusted sources
  const trustedHosts = [
    'huggingface.co',
    'cdn-lfs.huggingface.co',
    'hf.co',
    'github.com',
    'objects.githubusercontent.com',
    'replicate.delivery',
  ];

  try {
    const parsedUrl = new URL(url);
    if (!trustedHosts.some((h) => parsedUrl.hostname.endsWith(h))) {
      return res.status(403).json({ success: false, error: 'URL not from a trusted source' });
    }
  } catch {
    return res.status(400).json({ success: false, error: 'Invalid URL' });
  }

  try {
    const upstream = await fetch(url, {
      headers: {
        'User-Agent': 'ModelForge/1.0',
        ...(process.env.HF_TOKEN ? { Authorization: `Bearer ${process.env.HF_TOKEN}` } : {}),
      },
    });

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        success: false,
        error: `Upstream responded with ${upstream.status}`,
      });
    }

    const contentLength = upstream.headers.get('content-length');
    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    if (contentLength) res.setHeader('Content-Length', contentLength);
    res.setHeader('Transfer-Encoding', 'chunked');

    const reader = upstream.body?.getReader();
    if (!reader) {
      return res.status(500).json({ success: false, error: 'No response body' });
    }

    const pump = async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) { res.end(); return; }
        if (!res.write(Buffer.from(value))) {
          await new Promise<void>((resolve) => res.once('drain', resolve));
        }
      }
    };

    await pump();
  } catch (err: unknown) {
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: err instanceof Error ? err.message : 'Download failed',
      });
    }
  }
});

// ── List downloadable GGUF models ────────────────────────────
installRouter.get('/gguf-models', (_, res) => {
  res.json({
    success: true,
    data: GGUF_DOWNLOAD_REGISTRY,
  });
});

// ── Build instructions endpoint ──────────────────────────────
installRouter.get('/build-instructions/:platform', (req, res) => {
  const { platform } = req.params;
  res.json({
    success: true,
    data: {
      platform,
      command: getBuildCommand(platform),
      prerequisites: getPrerequisites(platform),
    },
  });
});

// ═══════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════

function detectPlatformFromUA(ua: string) {
  if (/Windows/i.test(ua)) return 'windows';
  if (/Macintosh/i.test(ua)) return 'macos';
  if (/Linux/i.test(ua) && !/Android/i.test(ua)) return 'linux';
  if (/Android/i.test(ua)) return 'android';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
  return 'unknown';
}

function getAvailableInstallers() {
  return [
    { platform: 'windows', format: 'exe', size: '~85MB', status: 'available' },
    { platform: 'macos', format: 'dmg', size: '~90MB', status: 'available' },
    { platform: 'linux', format: 'AppImage', size: '~80MB', status: 'available' },
    { platform: 'android', format: 'apk', size: '~45MB', status: 'available' },
    { platform: 'ios', format: 'ipa', size: '~50MB', status: 'sideload-only' },
  ];
}

function getBuildCommand(platform: string): string {
  const cmds: Record<string, string> = {
    windows: 'npm run build && npx electron-builder --win --x64',
    macos: 'npm run build && npx electron-builder --mac --universal',
    linux: 'npm run build && npx electron-builder --linux --x64',
    android: 'npm run build && npx cap sync android && cd android && ./gradlew assembleDebug',
    ios: 'npm run build && npx cap sync ios && cd ios && xcodebuild -workspace App/App.xcworkspace -scheme App -configuration Debug -sdk iphoneos',
  };
  return cmds[platform] || 'Unknown platform';
}

function getPrerequisites(platform: string): string[] {
  const prereqs: Record<string, string[]> = {
    windows: ['Node.js 18+', 'npm', 'electron-builder', 'Visual Studio Build Tools (optional)'],
    macos: ['Node.js 18+', 'npm', 'Xcode Command Line Tools', 'electron-builder'],
    linux: ['Node.js 18+', 'npm', 'electron-builder', 'dpkg or rpm tools'],
    android: ['Node.js 18+', 'npm', 'Android Studio', 'JDK 17', 'Capacitor CLI'],
    ios: ['Node.js 18+', 'npm', 'Xcode 15+', 'Capacitor CLI', 'AltStore (for sideloading)'],
  };
  return prereqs[platform] || [];
}

// ── Known GGUF models for download ───────────────────────────
const GGUF_DOWNLOAD_REGISTRY = [
  {
    modelId: 'llama-31-8b',
    name: 'LLaMA 3.1 8B Instruct',
    quant: 'Q4_K_M',
    size: 4_920_000_000,
    url: 'https://huggingface.co/bartowski/Meta-Llama-3.1-8B-Instruct-GGUF/resolve/main/Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf',
    fileName: 'llama-3.1-8b-instruct-q4_k_m.gguf',
  },
  {
    modelId: 'mistral-7b-v03',
    name: 'Mistral 7B v0.3 Instruct',
    quant: 'Q4_K_M',
    size: 4_370_000_000,
    url: 'https://huggingface.co/bartowski/Mistral-7B-Instruct-v0.3-GGUF/resolve/main/Mistral-7B-Instruct-v0.3-Q4_K_M.gguf',
    fileName: 'mistral-7b-instruct-v0.3-q4_k_m.gguf',
  },
  {
    modelId: 'gemma-2-2b',
    name: 'Gemma 2 2B Instruct',
    quant: 'Q4_K_M',
    size: 1_790_000_000,
    url: 'https://huggingface.co/bartowski/gemma-2-2b-it-GGUF/resolve/main/gemma-2-2b-it-Q4_K_M.gguf',
    fileName: 'gemma-2-2b-it-q4_k_m.gguf',
  },
  {
    modelId: 'phi-35-mini',
    name: 'Phi-3.5 Mini Instruct',
    quant: 'Q4_K_M',
    size: 2_390_000_000,
    url: 'https://huggingface.co/bartowski/Phi-3.5-mini-instruct-GGUF/resolve/main/Phi-3.5-mini-instruct-Q4_K_M.gguf',
    fileName: 'phi-3.5-mini-instruct-q4_k_m.gguf',
  },
  {
    modelId: 'qwen25-7b',
    name: 'Qwen2.5 7B Instruct',
    quant: 'Q4_K_M',
    size: 4_680_000_000,
    url: 'https://huggingface.co/Qwen/Qwen2.5-7B-Instruct-GGUF/resolve/main/qwen2.5-7b-instruct-q4_k_m.gguf',
    fileName: 'qwen2.5-7b-instruct-q4_k_m.gguf',
  },
  {
    modelId: 'llama-32-3b',
    name: 'LLaMA 3.2 3B Instruct',
    quant: 'Q4_K_M',
    size: 2_020_000_000,
    url: 'https://huggingface.co/bartowski/Llama-3.2-3B-Instruct-GGUF/resolve/main/Llama-3.2-3B-Instruct-Q4_K_M.gguf',
    fileName: 'llama-3.2-3b-instruct-q4_k_m.gguf',
  },
  {
    modelId: 'llama-32-1b',
    name: 'LLaMA 3.2 1B Instruct',
    quant: 'Q4_K_M',
    size: 820_000_000,
    url: 'https://huggingface.co/bartowski/Llama-3.2-1B-Instruct-GGUF/resolve/main/Llama-3.2-1B-Instruct-Q4_K_M.gguf',
    fileName: 'llama-3.2-1b-instruct-q4_k_m.gguf',
  },
  {
    modelId: 'tinyllama',
    name: 'TinyLlama 1.1B Chat',
    quant: 'Q4_K_M',
    size: 670_000_000,
    url: 'https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf',
    fileName: 'tinyllama-1.1b-chat-q4_k_m.gguf',
  },
  {
    modelId: 'deepseek-r1',
    name: 'DeepSeek-R1 Distill Qwen 7B',
    quant: 'Q4_K_M',
    size: 4_680_000_000,
    url: 'https://huggingface.co/bartowski/DeepSeek-R1-Distill-Qwen-7B-GGUF/resolve/main/DeepSeek-R1-Distill-Qwen-7B-Q4_K_M.gguf',
    fileName: 'deepseek-r1-distill-qwen-7b-q4_k_m.gguf',
  },
  {
    modelId: 'smollm2',
    name: 'SmolLM2 1.7B Instruct',
    quant: 'Q4_K_M',
    size: 1_060_000_000,
    url: 'https://huggingface.co/bartowski/SmolLM2-1.7B-Instruct-GGUF/resolve/main/SmolLM2-1.7B-Instruct-Q4_K_M.gguf',
    fileName: 'smollm2-1.7b-instruct-q4_k_m.gguf',
  },
];