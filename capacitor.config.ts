import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.currency.converter',
  appName: 'currency-converter',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
