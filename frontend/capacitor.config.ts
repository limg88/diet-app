import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'it.dietapp.app',
  appName: 'Diet App',
  webDir: 'dist/browser',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'http',
    hostname: 'localhost',
  },
};

export default config;
