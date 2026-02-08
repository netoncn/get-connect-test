import { test, expect } from '../fixtures/auth.fixture';
import { HeaderPage } from '../pages/header.page';

test.describe('Theme', () => {
  test('should toggle, persist across reload, and persist across navigation', async ({
    authenticatedPage,
  }) => {
    const header = new HeaderPage(authenticatedPage);

    await expect(authenticatedPage.locator('html')).not.toHaveClass(/dark/);

    await header.themeToggle.click();
    await expect(authenticatedPage.locator('html')).toHaveClass(/dark/);

    await header.themeToggle.click();
    await expect(authenticatedPage.locator('html')).not.toHaveClass(/dark/);

    await header.themeToggle.click();
    await expect(authenticatedPage.locator('html')).toHaveClass(/dark/);

    await authenticatedPage.reload();
    await expect(authenticatedPage.locator('html')).toHaveClass(/dark/);

    await authenticatedPage.goto('/');
    await expect(authenticatedPage.locator('html')).toHaveClass(/dark/);

    await authenticatedPage.goto('/lists');
    await expect(authenticatedPage.locator('html')).toHaveClass(/dark/);
  });
});
