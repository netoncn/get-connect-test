import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['html', { open: 'never' }], ['list']],
  timeout: 30_000,
  expect: { timeout: 5_000 },

  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],

  webServer: [
    {
      command: 'cd ../backend && npm run start:dev',
      url: 'http://localhost:3333/auth/me',
      reuseExistingServer: true,
      timeout: 30_000,
    },
    {
      command: 'pnpm exec ng serve --configuration development',
      url: 'http://localhost:4200',
      reuseExistingServer: true,
      timeout: 60_000,
    },
  ],
});
