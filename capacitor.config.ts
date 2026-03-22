import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.modelforge.app',
  appName: 'Model Forge',
  webDir: 'dist',

  server: {
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
    webContentsDebuggingEnabled: false,
  },

  ios: {
    contentInset: 'automatic',
    scheme: 'Model Forge',
    webContentsDebuggingEnabled: false,
  },

  plugins: {
    App: {
      launchShowDuration: 0,
    },
    Filesystem: {},
    Network: {},
  },
};

export default config;