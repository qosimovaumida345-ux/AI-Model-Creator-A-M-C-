import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.modelforge.app',
  appName: 'Model Forge',
  webDir: 'dist',
  bundledWebRuntime: false,

  server: {
    // In development, proxy to local dev server
    // In production, serve from bundled files
    url: process.env.NODE_ENV === 'development'
      ? 'http://localhost:5173'
      : undefined,
    cleartext: true,
    androidScheme: 'https',
  },

  android: {
    buildOptions: {
      keystorePath: undefined,
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
    },
    allowMixedContent: true,
    webContentsDebuggingEnabled: true,
  },

  ios: {
    contentInset: 'automatic',
    scheme: 'Model Forge',
    webContentsDebuggingEnabled: true,
  },

  plugins: {
    App: {
      launchShowDuration: 0,
    },
    Filesystem: {
      // Allow access to device storage for model files
    },
    Network: {
      // Monitor connectivity for online/offline switching
    },
  },
};

export default config;