import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.fanfrenzy.challenge', // Or your chosen App ID
  appName: 'FanFrenzy',
  webDir: 'out', // Standard directory for 'next export' output
  server: {
    // Use your actual domain
    url: 'https://fanfrenzy.app',
    cleartext: true // Allows HTTP traffic for local development if needed, generally safe for HTTPS URLs
  }
};

export default config; 