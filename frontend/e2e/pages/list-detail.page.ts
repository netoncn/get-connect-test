import type { Page, Locator } from '@playwright/test';

export class ListDetailPage {
  readonly listName: Locator;
  readonly backButton: Locator;
  readonly deleteButton: Locator;
  readonly itemsTab: Locator;
  readonly membersTab: Locator;
  readonly itemInput: Locator;
  readonly addItemButton: Locator;
  readonly inviteMemberButton: Locator;
  readonly deleteConfirmButton: Locator;
  readonly deleteCancelButton: Locator;

  constructor(private readonly page: Page) {
    this.listName = page.getByTestId('detail-list-name');
    this.backButton = page.getByTestId('detail-back');
    this.deleteButton = page.getByTestId('detail-delete-btn');
    this.itemsTab = page.getByTestId('detail-items-tab');
    this.membersTab = page.getByTestId('detail-members-tab');
    this.itemInput = page.getByTestId('item-search-input');
    this.addItemButton = page.getByTestId('item-add-btn');
    this.inviteMemberButton = page.getByTestId('detail-invite-btn');
    this.deleteConfirmButton = page.getByTestId('detail-delete-confirm');
    this.deleteCancelButton = page.getByTestId('detail-delete-cancel');
  }

  itemRow(title: string): Locator {
    return this.page.getByTestId('item-row').filter({ hasText: title });
  }

  itemCheckbox(title: string): Locator {
    return this.itemRow(title).getByTestId('item-toggle');
  }

  itemDeleteButton(title: string): Locator {
    return this.itemRow(title).getByTestId('item-delete');
  }

  memberRow(name: string): Locator {
    return this.page.getByTestId('member-row').filter({ hasText: name });
  }
}
