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

  test('Session restore on reload — cached exercises load instantly', async ({ page }) => {
    const user = generateUser();
    await signupViaUI(page, user);

    // Create an exercise
    await page.click(SEL.ctaButton);
    await fillExerciseForm(page, { name: 'Squat', reps: 5, weight: 225, unit: 'lbs' });
    await page.click(SEL.formSubmitBtn);
    await page.waitForSelector('table tbody tr');

    // Reload — exercises should appear from IndexedDB cache
    // (encryption key is lost on reload, but cache has decrypted data)
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

  test('Demo mode — seeded exercises load without encryption', async ({ page }) => {
    await page.goto('/');
    await page.click('.demo-btn');
    // Wait for home page with exercises
    await page.waitForSelector(SEL.signoutBtn, { timeout: 10000 });
    // Demo accounts skip encryption — wait for seeded exercises to render
    await page.waitForSelector('table tbody tr', { timeout: 10000 });
    const count = await page.locator('table tbody tr').count();
    expect(count).toBeGreaterThan(0);
  });

  test('Duplicate email signup — shows server error in UI', async ({ page }) => {
    const user = generateUser();
    await signupViaUI(page, user);
    await page.click(SEL.signoutBtn);

    // Try to sign up again with the same email (already on signup by default)
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

test.describe('Encryption', () => {
  test('Logout → login — exercises decrypt correctly after key unwrap', async ({ page }) => {
    const user = generateUser();
    await signupViaUI(page, user);

    // Create exercise while encryption key is in memory
    await page.click(SEL.ctaButton);
    await fillExerciseForm(page, { name: 'Bench Press', reps: 10, weight: 135, unit: 'lbs', notes: 'Felt strong' });
    await page.click(SEL.formSubmitBtn);
    await page.waitForSelector('table tbody tr');
    await expect(page.locator('table tbody tr').first()).toContainText('Bench Press');

    // Logout — clears key + cache
    await page.click(SEL.signoutBtn);
    await expect(page.locator(SEL.authCard)).toBeVisible();

    // Login — unwraps key from server, decrypts exercises
    await loginViaUI(page, user.email, user.password);
    await page.waitForSelector('table tbody tr');
    await expect(page.locator('table tbody tr').first()).toContainText('Bench Press');
  });

  test('Encrypted exercises — name stored as ciphertext on server', async ({ page }) => {
    const user = generateUser();
    await signupViaUI(page, user);

    // Create exercise
    await page.click(SEL.ctaButton);
    await fillExerciseForm(page, { name: 'Deadlift', reps: 5, weight: 315, unit: 'lbs' });
    await page.click(SEL.formSubmitBtn);
    await page.waitForSelector('table tbody tr');

    // UI shows plaintext
    await expect(page.locator('table tbody tr').first()).toContainText('Deadlift');

    // Get a fresh access token via refresh endpoint, then fetch raw exercises
    const rawExercises = await page.evaluate(async () => {
      const refresh = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });
      const { accessToken } = await refresh.json();
      const res = await fetch('/api/exercises', {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      return res.json();
    });
    // Encrypted names contain a dot (iv.ciphertext format)
    expect(rawExercises[0].name).toContain('.');
    expect(rawExercises[0].name).not.toBe('Deadlift');
  });

  test('Notes encrypted — detail page shows decrypted notes', async ({ page }) => {
    const user = generateUser();
    await signupViaUI(page, user);

    // Create exercise with notes
    await page.click(SEL.ctaButton);
    await fillExerciseForm(page, { name: 'Squat', reps: 5, weight: 225, unit: 'lbs', notes: 'New PR attempt' });
    await page.click(SEL.formSubmitBtn);
    await page.waitForSelector('table tbody tr');

    // Click row to view detail
    await page.click('table tbody tr.clickable-row');
    await expect(page.locator(SEL.detailCard)).toBeVisible();
    await expect(page.locator(SEL.detailName)).toContainText('Squat');
    await expect(page.locator(SEL.detailNotes)).toContainText('New PR attempt');
  });

  test('Edit encrypted exercise — re-encrypts correctly', async ({ page }) => {
    const user = generateUser();
    await signupViaUI(page, user);

    // Create exercise
    await page.click(SEL.ctaButton);
    await fillExerciseForm(page, { name: 'Bench Press', reps: 10, weight: 135, unit: 'lbs' });
    await page.click(SEL.formSubmitBtn);
    await page.waitForSelector('button[aria-label="Edit Bench Press"]');

    // Edit it
    await page.click('button[aria-label="Edit Bench Press"]');
    await page.fill(SEL.formName, 'Incline Press');
    await page.click('button[type="submit"][form="exercise-form"]');

    await page.waitForSelector(SEL.signoutBtn);
    const row = page.locator('table tbody tr').first();
    await expect(row).toContainText('Incline Press');

    // Logout and login to verify re-encrypted value decrypts correctly
    await page.click(SEL.signoutBtn);
    await loginViaUI(page, user.email, user.password);
    await page.waitForSelector('table tbody tr');
    await expect(page.locator('table tbody tr').first()).toContainText('Incline Press');
  });

  test('Cache-first load — exercises appear before server response', async ({ page }) => {
    const user = generateUser();
    await signupViaUI(page, user);

    // Create two exercises to populate cache
    await page.click(SEL.ctaButton);
    await fillExerciseForm(page, { name: 'Squat', reps: 5, weight: 225, unit: 'lbs' });
    await page.click(SEL.formSubmitBtn);
    await page.waitForURL('**/');
    await expect(page.locator('table tbody tr')).toHaveCount(1);

    await page.click(SEL.ctaButton);
    await fillExerciseForm(page, { name: 'Deadlift', reps: 3, weight: 315, unit: 'lbs' });
    await page.locator(SEL.formSubmitBtn).click({ force: true });
    await page.waitForURL('**/');
    await expect(page.locator('table tbody tr')).toHaveCount(2);

    // Reload — IndexedDB cache should show exercises immediately
    await page.reload();
    await page.waitForSelector(SEL.signoutBtn);
    await expect(page.locator('table tbody tr')).toHaveCount(2);
  });

  test('Demo exercises — no encryption applied', async ({ page }) => {
    await page.goto('/');
    await page.click('.demo-btn');
    await page.waitForSelector(SEL.signoutBtn, { timeout: 10000 });

    // Wait for seeded exercises to render
    await page.waitForSelector('table tbody tr', { timeout: 10000 });
    const count = await page.locator('table tbody tr').count();
    expect(count).toBeGreaterThan(0);

    // Click first row — name should be readable (not ciphertext)
    await page.click('table tbody tr.clickable-row:first-child');
    await expect(page.locator(SEL.detailCard)).toBeVisible();
    const name = await page.locator(SEL.detailName).textContent();
    // Demo exercise names are plain English, no dot separator
    expect(name).not.toContain('.');
    expect(name.length).toBeGreaterThan(0);
  });
});
