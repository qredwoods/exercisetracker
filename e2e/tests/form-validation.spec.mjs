import { test, expect } from '@playwright/test';
import { generateUser, signupViaUI, fillExerciseForm, submitExerciseForm, todayISO, SEL } from './helpers.mjs';

test.describe('Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    const user = generateUser();
    await signupViaUI(page, user);
    await page.click(SEL.ctaButton);
    await page.waitForSelector(SEL.formName);
  });

  test('Empty name — shows required fields error', async ({ page }) => {
    await fillExerciseForm(page, { name: '', reps: 10, weight: 100, unit: 'lbs' });
    await page.click(SEL.formSubmitBtn);
    await expect(page.locator(SEL.formError)).toHaveText('Please complete all required fields.');
  });

  test('Zero reps — shows reps error', async ({ page }) => {
    await fillExerciseForm(page, { name: 'Curl', reps: 0, weight: 30, unit: 'lbs' });
    // Native min="1" blocks form submit, so dispatch submit event directly
    await submitExerciseForm(page);
    await expect(page.locator(SEL.formError)).toHaveText('Reps must be greater than 0.');
  });

  test('Future date — shows date error', async ({ page }) => {
    await fillExerciseForm(page, { name: 'Run', reps: 1, weight: 100, unit: 'lbs' });
    // Set date to tomorrow via native setter to bypass max attribute
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const y = tomorrow.getFullYear();
    const m = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const d = String(tomorrow.getDate()).padStart(2, '0');
    const futureDate = `${y}-${m}-${d}`;
    await page.locator(SEL.formDate).evaluate(
      (el, val) => {
        const nativeSet = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
        nativeSet.call(el, val);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      },
      futureDate,
    );
    // Native max blocks form submit, so dispatch submit event directly
    await submitExerciseForm(page);
    await expect(page.locator(SEL.formError)).toHaveText('Date cannot be in the future.');
  });

  test('Missing weight with lbs — shows weight error', async ({ page }) => {
    await fillExerciseForm(page, { name: 'Curl', reps: 10, unit: 'lbs' });
    await page.click(SEL.formSubmitBtn);
    await expect(page.locator(SEL.formError)).toHaveText('Enter weight or select "Bodyweight only."');
  });

  test('Bodyweight disables weight field', async ({ page }) => {
    await page.selectOption(SEL.formUnit, 'bodyweight');
    await expect(page.locator(SEL.formWeight)).toBeDisabled();
    await expect(page.locator(SEL.formWeight)).toHaveAttribute('placeholder', 'no added weight');
  });

  test('Bodyweight submit — table shows BW', async ({ page }) => {
    await fillExerciseForm(page, { name: 'Pull-ups', reps: 12, unit: 'bodyweight' });
    await page.click(SEL.formSubmitBtn);

    await page.waitForSelector(SEL.signoutBtn);
    const row = page.locator('table tbody tr').first();
    await expect(row).toContainText('Pull-ups');
    await expect(row).toContainText('BW');
  });

  test('Re-enable weight — switch from bodyweight to lbs', async ({ page }) => {
    await page.selectOption(SEL.formUnit, 'bodyweight');
    await expect(page.locator(SEL.formWeight)).toBeDisabled();

    await page.selectOption(SEL.formUnit, 'lbs');
    await expect(page.locator(SEL.formWeight)).toBeEnabled();
  });
});

test.describe('Signup Validation', () => {
  test('Password mismatch — shows error', async ({ page }) => {
    await page.goto('/');
    await page.click(SEL.authToggleBtn);
    await page.fill('input[placeholder="First name"]', 'Test');
    await page.fill('input[placeholder="Last name"]', 'User');
    await page.fill('input[placeholder="Email"]', 'mismatch@example.com');
    await page.fill('input[placeholder="Password"]', 'TestPass1');
    await page.fill('input[placeholder="Confirm password"]', 'WrongPass1');
    await page.check(SEL.ageConfirm);
    await page.click(SEL.authSubmit);
    await expect(page.locator(SEL.authError)).toHaveText('Passwords do not match.');
  });

  test('Short password — shows error', async ({ page }) => {
    await page.goto('/');
    await page.click(SEL.authToggleBtn);
    await page.fill('input[placeholder="First name"]', 'Test');
    await page.fill('input[placeholder="Last name"]', 'User');
    await page.fill('input[placeholder="Email"]', 'short@example.com');
    await page.fill('input[placeholder="Password"]', 'Te1');
    await page.fill('input[placeholder="Confirm password"]', 'Te1');
    await page.check(SEL.ageConfirm);
    await page.click(SEL.authSubmit);
    await expect(page.locator(SEL.authError)).toHaveText('Password must be at least 8 characters.');
  });

  test('Age not confirmed — shows error', async ({ page }) => {
    await page.goto('/');
    await page.click(SEL.authToggleBtn);
    await page.fill('input[placeholder="First name"]', 'Test');
    await page.fill('input[placeholder="Last name"]', 'User');
    await page.fill('input[placeholder="Email"]', 'noage@example.com');
    await page.fill('input[placeholder="Password"]', 'TestPass1');
    await page.fill('input[placeholder="Confirm password"]', 'TestPass1');
    // Do NOT check age checkbox
    await page.click(SEL.authSubmit);
    await expect(page.locator(SEL.authError)).toHaveText('You must confirm you are 13 or older.');
  });
});
