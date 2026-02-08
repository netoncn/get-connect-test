import type { Page, Locator } from '@playwright/test';

export class HeaderPage {
  readonly logo: Locator;
  readonly themeToggle: Locator;
  readonly userMenuButton: Locator;
  readonly userName: Locator;
  readonly userEmail: Locator;
  readonly logoutButton: Locator;

  constructor(private readonly page: Page) {
    this.logo = page.getByTestId('header-logo');
    this.themeToggle = page.getByTestId('header-theme-toggle');
    this.userMenuButton = page.getByTestId('header-user-menu');
    this.userName = page.getByTestId('header-user-name');
    this.userEmail = page.getByTestId('header-user-email');
    this.logoutButton = page.getByTestId('header-logout');
  }

  async openUserMenu() {
    await this.userMenuButton.click();
  }

  async logout() {
    await this.openUserMenu();
    await this.logoutButton.click();
  }
}
