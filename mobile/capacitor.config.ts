import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'cu.observadorcubano.app',
  appName: 'El Observador Cubano',
  webDir: 'dist',
  android: {
    allowMixedContent: false,
    backgroundColor: '#0567EE',
  },
  server: {
    androidScheme: 'https',
  },
};

export default config;
