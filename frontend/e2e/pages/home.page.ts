import type { Page, Locator } from '@playwright/test';

export class HomePage {
  readonly getStartedLink: Locator;
  readonly loginLink: Locator;
  readonly goToListsLink: Locator;

  constructor(private readonly page: Page) {
    this.getStartedLink = page.getByTestId('home-get-started');
    this.loginLink = page.getByTestId('home-login');
    this.goToListsLink = page.getByTestId('home-go-to-lists');
  }

  async goto() {
    await this.page.goto('/');
  }
}
