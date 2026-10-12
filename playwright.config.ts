import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: './tests',
  use: { baseURL: 'http://localhost:3000', headless: true, launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined } },
  webServer: { command: 'npm run preview', url: 'http://localhost:3000', reuseExistingServer: !process.env.CI },
})
