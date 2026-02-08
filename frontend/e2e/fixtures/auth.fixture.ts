import { test as base, type Page } from '@playwright/test';
import { registerUser } from '../helpers/api-client';
import { uniqueEmail, uniqueName } from '../helpers/test-data';

interface AuthFixtures {
  authenticatedPage: Page;
  testUser: { email: string; password: string; name: string; token: string };
}

export const test = base.extend<AuthFixtures>({
  testUser: async ({}, use) => {
    const name = uniqueName();
    const email = uniqueEmail();
    const password = 'Test1234!';
    const auth = await registerUser(name, email, password);
    await use({ email, password, name, token: auth.accessToken });
  },

  authenticatedPage: async ({ page, testUser }, use) => {
    await page.goto('/');
    await page.evaluate(
      ({ token, user }) => {
        localStorage.setItem('gc_token', token);
        localStorage.setItem('gc_user', JSON.stringify(user));
      },
      {
        token: testUser.token,
        user: { name: testUser.name, email: testUser.email },
      },
    );
    await page.goto('/lists');
    await use(page);
  },
});

export { expect } from '@playwright/test';
