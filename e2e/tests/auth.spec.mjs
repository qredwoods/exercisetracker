import { test, expect } from '@playwright/test';
import { generateUser, signupViaUI, loginViaUI, fillExerciseForm, SEL } from './helpers.mjs';

test.describe('Authentication', () => {
  test('Register — signup via UI shows home page and table', async ({ page }) => {
    const user = generateUser();
    await signupViaUI(page, user);
    await expect(page.locator(SEL.signoutBtn)).toBeVisible();
    await expect(page.locator(SEL.exerciseTable)).toBeVisible();
  });

  test('Sign out — shows auth card', async ({ page }) => {
    const user = generateUser();
    await signupViaUI(page, user);
    await page.click(SEL.signoutBtn);
    await expect(page.locator(SEL.authCard)).toBeVisible();
  });

  test('Log back in — sign out then login with same creds', async ({ page }) => {
    const user = generateUser();
    await signupViaUI(page, user);
    await page.click(SEL.signoutBtn);
    await loginViaUI(page, user.email, user.password);
    await expect(page.locator(SEL.signoutBtn)).toBeVisible();
  });

  test('Session restore on reload — exercise persists after refresh', async ({ page }) => {
    const user = generateUser();
    await signupViaUI(page, user);

    // Create an exercise
    await page.click(SEL.ctaButton);
    await fillExerciseForm(page, { name: 'Squat', reps: 5, weight: 225, unit: 'lbs' });
    await page.click(SEL.formSubmitBtn);
    await page.waitForSelector('table tbody tr');

    // Reload and verify exercise is still there
    await page.reload();
    await page.waitForSelector(SEL.signoutBtn);
    await expect(page.locator('table tbody tr')).toHaveCount(1);
    await expect(page.locator('table tbody tr').first()).toContainText('Squat');
  });

  test('Session restore in new context — cookies carry session', async ({ page, browser }) => {
    const user = generateUser();
    await signupViaUI(page, user);

    // Extract cookies from current context
    const cookies = await page.context().cookies();

    // Create a brand new context and inject cookies
    const newContext = await browser.newContext();
    await newContext.addCookies(cookies);
    const newPage = await newContext.newPage();

    await newPage.goto('/');
    await expect(newPage.locator(SEL.signoutBtn)).toBeVisible({ timeout: 10000 });

    await newContext.close();
  });

  test('Demo mode — seeded exercises load', async ({ page }) => {
    await page.goto('/');
    await page.click('.demo-btn');
    // Wait for home page with exercises
    await page.waitForSelector(SEL.signoutBtn, { timeout: 10000 });
    // Demo accounts come with seeded exercises
    const rows = page.locator('table tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Duplicate email signup — shows server error in UI', async ({ page }) => {
    const user = generateUser();
    await signupViaUI(page, user);
    await page.click(SEL.signoutBtn);

    // Try to sign up again with the same email
    await page.click(SEL.authToggleBtn);
    await page.fill('input[placeholder="First name"]', 'Another');
    await page.fill('input[placeholder="Last name"]', 'Person');
    await page.fill('input[placeholder="Email"]', user.email);
    await page.fill('input[placeholder="Password"]', user.password);
    await page.fill('input[placeholder="Confirm password"]', user.password);
    await page.check(SEL.ageConfirm);
    await page.click(SEL.authSubmit);

    await expect(page.locator(SEL.authError)).toContainText('already exists');
  });
});
