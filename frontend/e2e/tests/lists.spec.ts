import { test, expect } from '../fixtures/auth.fixture';
import { ListIndexPage } from '../pages/list-index.page';
import { ListDetailPage } from '../pages/list-detail.page';
import { uniqueListName } from '../helpers/test-data';
import { createList } from '../helpers/api-client';

async function reloadUntilListVisible(page: import('@playwright/test').Page, listName: string) {
  const card = page.getByTestId('list-card').filter({ hasText: listName });
  for (let attempt = 0; attempt < 5; attempt++) {
    await page.reload();
    if (await card.isVisible({ timeout: 3_000 }).catch(() => false)) return;
    await page.waitForTimeout(2_000);
  }
}

test.describe('Lists - Index', () => {
  test('should show empty state for new user', async ({ authenticatedPage }) => {
    const listIndex = new ListIndexPage(authenticatedPage);
    await expect(listIndex.emptyState).toBeVisible();
  });

  test('should create a new list via modal', async ({ authenticatedPage }) => {
    const listIndex = new ListIndexPage(authenticatedPage);
    const listName = uniqueListName();

    await listIndex.createList(listName);

    await expect(listIndex.listCard(listName)).toBeVisible();
    await expect(listIndex.emptyState).not.toBeVisible();
  });

  test('should cancel creating a list', async ({ authenticatedPage }) => {
    const listIndex = new ListIndexPage(authenticatedPage);

    await listIndex.createButton.click();
    await expect(listIndex.modalNameInput).toBeVisible();

    await listIndex.modalCancelButton.click();
    await expect(listIndex.modalNameInput).not.toBeVisible();
  });

  test('should display existing lists', async ({ authenticatedPage, testUser }) => {
    const listName = uniqueListName();
    await createList(testUser.token, listName);

    await reloadUntilListVisible(authenticatedPage, listName);
    const listIndex = new ListIndexPage(authenticatedPage);

    await expect(listIndex.listCard(listName)).toBeVisible();
  });
});

test.describe('Lists - Detail', () => {
  test('should navigate to list detail and show list name', async ({ authenticatedPage, testUser }) => {
    const listName = uniqueListName();
    await createList(testUser.token, listName);

    await reloadUntilListVisible(authenticatedPage, listName);
    const listIndex = new ListIndexPage(authenticatedPage);
    await listIndex.listCard(listName).click();

    const detail = new ListDetailPage(authenticatedPage);
    await expect(detail.listName).toHaveText(listName);
  });

  test('should show items and members tabs', async ({ authenticatedPage, testUser }) => {
    const listName = uniqueListName();
    await createList(testUser.token, listName);

    await reloadUntilListVisible(authenticatedPage, listName);
    const listIndex = new ListIndexPage(authenticatedPage);
    await listIndex.listCard(listName).click();

    const detail = new ListDetailPage(authenticatedPage);
    await expect(detail.itemsTab).toBeVisible();
    await expect(detail.membersTab).toBeVisible();
  });

  test('should delete a list and redirect to /lists', async ({ authenticatedPage, testUser }) => {
    const listName = uniqueListName();
    await createList(testUser.token, listName);

    await reloadUntilListVisible(authenticatedPage, listName);
    const listIndex = new ListIndexPage(authenticatedPage);
    await listIndex.listCard(listName).click();

    const detail = new ListDetailPage(authenticatedPage);
    await detail.deleteButton.click();
    await detail.deleteConfirmButton.click();

    await expect(authenticatedPage).toHaveURL(/\/lists/);
    await expect(listIndex.listCard(listName)).not.toBeVisible();
  });

  test('should navigate back to lists', async ({ authenticatedPage, testUser }) => {
    const listName = uniqueListName();
    await createList(testUser.token, listName);

    await reloadUntilListVisible(authenticatedPage, listName);
    const listIndex = new ListIndexPage(authenticatedPage);
    await listIndex.listCard(listName).click();

    const detail = new ListDetailPage(authenticatedPage);
    await detail.backButton.click();

    await expect(authenticatedPage).toHaveURL(/\/lists/);
  });
});
