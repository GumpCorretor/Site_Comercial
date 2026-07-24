import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv, type ConfigEnv } from 'vite';

import { parseWebEnvironment } from './environment.schema.js';

export default defineConfig(({ command, mode }: ConfigEnv) => {
  if (command === 'build') {
    const loadedEnvironment = loadEnv(mode, process.cwd(), 'VITE_');

    parseWebEnvironment({
      ...loadedEnvironment,
      VITE_API_URL: process.env.VITE_API_URL ?? loadedEnvironment.VITE_API_URL,
    });
  }

  return {
    plugins: [react()],
  };
});
