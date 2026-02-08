import type { Page, Locator } from '@playwright/test';

export class ListIndexPage {
  readonly createButton: Locator;
  readonly listGrid: Locator;
  readonly emptyState: Locator;
  readonly modalNameInput: Locator;
  readonly modalSubmitButton: Locator;
  readonly modalCancelButton: Locator;

  constructor(private readonly page: Page) {
    this.createButton = page.getByTestId('list-create-btn');
    this.listGrid = page.getByTestId('list-grid');
    this.emptyState = page.getByTestId('list-empty-state');
    this.modalNameInput = page.getByTestId('list-modal-name');
    this.modalSubmitButton = page.getByTestId('list-modal-submit');
    this.modalCancelButton = page.getByTestId('list-modal-cancel');
  }

  async goto() {
    await this.page.goto('/lists');
  }

  async createList(name: string) {
    await this.createButton.click();
    await this.modalNameInput.fill(name);
    await this.modalSubmitButton.click();
  }

  listCard(name: string): Locator {
    return this.page.getByTestId('list-card').filter({ hasText: name });
  }
}
