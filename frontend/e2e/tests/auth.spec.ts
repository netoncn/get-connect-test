import { test, expect } from '@playwright/test';
import { test as authTest, expect as authExpect } from '../fixtures/auth.fixture';
import { LoginPage } from '../pages/login.page';
import { RegisterPage } from '../pages/register.page';
import { HomePage } from '../pages/home.page';
import { HeaderPage } from '../pages/header.page';
import { registerUser, loginUser } from '../helpers/api-client';
import { uniqueEmail, uniqueName } from '../helpers/test-data';

test.describe('Auth - Registration', () => {
  test('should register a new user and redirect to /lists', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.goto();

    const name = uniqueName();
    const email = uniqueEmail();
    await registerPage.register(name, email, 'Test1234!');

    await expect(page).toHaveURL(/\/lists/);
  });

  test('should show error for duplicate email', async ({ page }) => {
    const email = uniqueEmail();
    await registerUser(uniqueName(), email, 'Test1234!');

    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(uniqueName(), email, 'Test1234!');

    await expect(registerPage.errorMessage).toBeVisible();
  });

  test('should navigate to login page via link', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.goto();

    await registerPage.loginLink.click();
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Auth - Login', () => {
  let registeredEmail: string;
  const password = 'Test1234!';

  test.beforeAll(async () => {
    registeredEmail = uniqueEmail();
    await registerUser(uniqueName(), registeredEmail, password);
  });

  test('should login with valid credentials and redirect to /lists', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(registeredEmail, password);

    await expect(page).toHaveURL(/\/lists/);
  });

  test('should show error for invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(registeredEmail, 'WrongPassword!');

    await expect(loginPage.errorMessage).toBeVisible();
  });

  test('should navigate to register page via link', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.registerLink.click();
    await expect(page).toHaveURL(/\/register/);
  });
});

test.describe('Auth - Logout', () => {
  authTest('should logout and redirect to /login', async ({ authenticatedPage }) => {
    const header = new HeaderPage(authenticatedPage);

    await header.logout();
    await authExpect(authenticatedPage).toHaveURL(/\/login/);
  });
});

test.describe('Auth - Guards', () => {
  test('should redirect unauthenticated user from /lists to /login', async ({ page }) => {
    await page.goto('/lists');
    await expect(page).toHaveURL(/\/login/);
  });

  authTest('should show user info in header', async ({ authenticatedPage, testUser }) => {
    const header = new HeaderPage(authenticatedPage);
    await header.openUserMenu();

    await authExpect(header.userName).toContainText(testUser.name);
    await authExpect(header.userEmail).toContainText(testUser.email);
  });
});

test.describe('Auth - Home page', () => {
  test('should show get-started and login links when not authenticated', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    await expect(homePage.getStartedLink).toBeVisible();
    await expect(homePage.loginLink).toBeVisible();
  });

  authTest('should show go-to-lists link when authenticated', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/');
    const homePage = new HomePage(authenticatedPage);

    await authExpect(homePage.goToListsLink).toBeVisible();
  });
});
