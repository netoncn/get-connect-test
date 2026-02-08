import { test, expect } from '../fixtures/auth.fixture';
import { ListDetailPage } from '../pages/list-detail.page';
import { uniqueListName } from '../helpers/test-data';
import { createList, createItem } from '../helpers/api-client';

test.describe.configure({ timeout: 60_000 });

async function waitForListLoaded(page: import('@playwright/test').Page, listId: string) {
  const listName = page.getByTestId('detail-list-name');
  for (let attempt = 0; attempt < 5; attempt++) {
    await page.goto(`/lists/${listId}`);
    if (await listName.isVisible({ timeout: 3_000 }).catch(() => false)) return;
    await page.waitForTimeout(2_000);
  }
}

async function gotoListWithItems(page: import('@playwright/test').Page, listId: string, expectedTitle: string) {
  const row = page.getByTestId('item-row').filter({ hasText: expectedTitle });
  for (let attempt = 0; attempt < 5; attempt++) {
    await page.goto(`/lists/${listId}`);
    if (await row.isVisible({ timeout: 3_000 }).catch(() => false)) break;
    await page.waitForTimeout(2_000);
  }
  return row;
}

test.describe('Items', () => {
  let listId: string;
  let listName: string;

  test.beforeEach(async ({ testUser }) => {
    listName = uniqueListName();
    const list = await createList(testUser.token, listName);
    listId = list.id;
  });

  test('should show empty items state', async ({ authenticatedPage }) => {
    await waitForListLoaded(authenticatedPage, listId);

    await expect(authenticatedPage.getByTestId('items-empty-state')).toBeVisible();
  });

  test('should add a custom item via search input', async ({ authenticatedPage }) => {
    await waitForListLoaded(authenticatedPage, listId);
    const detail = new ListDetailPage(authenticatedPage);

    await detail.itemInput.fill('My Custom Item');

    const suggestions = authenticatedPage.getByTestId('item-suggestions');
    await expect(suggestions).toBeVisible({ timeout: 10_000 });

    await suggestions.locator('button').first().click();

    const addBtn = authenticatedPage.getByTestId('item-add-btn');
    await expect(addBtn).toBeVisible();
    await addBtn.click();

    await expect(detail.itemRow('My Custom Item')).toBeVisible({ timeout: 10_000 });
  });

  test('should toggle item done status', async ({ authenticatedPage, testUser }) => {
    await createItem(testUser.token, listId, { kind: 'OTHER', title: 'Toggle Me' });
    const row = await gotoListWithItems(authenticatedPage, listId, 'Toggle Me');
    const detail = new ListDetailPage(authenticatedPage);

    await expect(row).toBeVisible({ timeout: 10_000 });
    await detail.itemCheckbox('Toggle Me').click();

    await expect(detail.itemRow('Toggle Me')).toHaveClass(/opacity-60/);
  });

  test('should delete an item', async ({ authenticatedPage, testUser }) => {
    await createItem(testUser.token, listId, { kind: 'OTHER', title: 'Delete Me' });
    const row = await gotoListWithItems(authenticatedPage, listId, 'Delete Me');
    const detail = new ListDetailPage(authenticatedPage);

    await expect(row).toBeVisible({ timeout: 10_000 });
    await detail.itemDeleteButton('Delete Me').click();

    await expect(detail.itemRow('Delete Me')).not.toBeVisible();
  });

  test('should display pre-created items', async ({ authenticatedPage, testUser }) => {
    await createItem(testUser.token, listId, { kind: 'OTHER', title: 'Pre-Created Item' });
    const row = await gotoListWithItems(authenticatedPage, listId, 'Pre-Created Item');
    const detail = new ListDetailPage(authenticatedPage);

    await expect(row).toBeVisible({ timeout: 10_000 });
    await expect(authenticatedPage.getByTestId('items-empty-state')).not.toBeVisible();
  });
});
