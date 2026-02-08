import { test, expect } from '../fixtures/auth.fixture';
import { ListDetailPage } from '../pages/list-detail.page';
import { uniqueListName, uniqueEmail } from '../helpers/test-data';
import { createList } from '../helpers/api-client';

test.describe('Members', () => {
  test('should show owner in members tab', async ({ authenticatedPage, testUser }) => {
    const listName = uniqueListName();
    const list = await createList(testUser.token, listName);

    await authenticatedPage.goto(`/lists/${list.id}`);
    const detail = new ListDetailPage(authenticatedPage);

    await detail.membersTab.click();
    await expect(detail.memberRow(testUser.name)).toBeVisible();
  });

  test('should show invite button for owner', async ({ authenticatedPage, testUser }) => {
    const listName = uniqueListName();
    const list = await createList(testUser.token, listName);

    await authenticatedPage.goto(`/lists/${list.id}`);
    const detail = new ListDetailPage(authenticatedPage);
    await detail.membersTab.click();

    await expect(detail.inviteMemberButton).toBeVisible();
  });

  test('should send invite via modal', async ({ authenticatedPage, testUser }) => {
    const listName = uniqueListName();
    const list = await createList(testUser.token, listName);

    await authenticatedPage.goto(`/lists/${list.id}`);
    const detail = new ListDetailPage(authenticatedPage);
    await detail.membersTab.click();

    await detail.inviteMemberButton.click();

    const inviteEmail = uniqueEmail();
    await authenticatedPage.getByTestId('invite-email').fill(inviteEmail);
    await authenticatedPage.getByTestId('invite-role').selectOption('EDITOR');
    await authenticatedPage.getByTestId('invite-submit').click();

    await expect(authenticatedPage.getByTestId('invite-form')).not.toBeVisible({ timeout: 5_000 });
  });

  test('should show owner role badge (non-removable)', async ({ authenticatedPage, testUser }) => {
    const listName = uniqueListName();
    const list = await createList(testUser.token, listName);

    await authenticatedPage.goto(`/lists/${list.id}`);
    const detail = new ListDetailPage(authenticatedPage);
    await detail.membersTab.click();

    const ownerRow = detail.memberRow(testUser.name);
    await expect(ownerRow).toBeVisible();

    await expect(ownerRow.getByTestId('member-remove')).not.toBeVisible();
  });
});
