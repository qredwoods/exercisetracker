import { test, expect } from '@playwright/test';
import { generateUser, signupViaUI, fillExerciseForm, SEL } from './helpers.mjs';

/** Click delete icon then confirm in the overlay */
async function deleteExercise(page, name) {
  await page.click(`button[aria-label="Delete ${name}"]`);
  await page.waitForSelector(SEL.overlay);
  await page.click(SEL.overlayConfirm);
}

test.describe('Exercise CRUD', () => {
  let user;

  test.beforeEach(async ({ page }) => {
    user = generateUser();
    await signupViaUI(page, user);
  });

  test('Create exercise — row appears in table', async ({ page }) => {
    await page.click(SEL.ctaButton);
    await fillExerciseForm(page, { name: 'Bench Press', reps: 10, weight: 135, unit: 'lbs' });
    await page.click(SEL.formSubmitBtn);

    await page.waitForSelector(SEL.signoutBtn);
    const row = page.locator('table tbody tr').first();
    await expect(row).toContainText('Bench Press');
    await expect(row).toContainText('10');
    await expect(row).toContainText('135 lbs');
  });

  test('Duplicate — pre-filled form, two rows after submit', async ({ page }) => {
    // Create initial exercise
    await page.click(SEL.ctaButton);
    await fillExerciseForm(page, { name: 'Bench Press', reps: 10, weight: 135, unit: 'lbs' });
    await page.click(SEL.formSubmitBtn);
    await page.waitForSelector('button[aria-label="Duplicate Bench Press"]');

    // Click duplicate
    await page.click('button[aria-label="Duplicate Bench Press"]');
    await expect(page.locator(SEL.formHeading)).toHaveText('How was it this time?');
    // Verify form is pre-filled
    await expect(page.locator(SEL.formName)).toHaveValue('Bench Press');
    // Submit the duplicate
    await page.click(SEL.formSubmitBtn);

    await page.waitForSelector(SEL.signoutBtn);
    await expect(page.locator('table tbody tr')).toHaveCount(2);
  });

  test('Empty form after duplicate — "Log Exercise" clears draft', async ({ page }) => {
    // Create and duplicate
    await page.click(SEL.ctaButton);
    await fillExerciseForm(page, { name: 'Bench Press', reps: 10, weight: 135, unit: 'lbs' });
    await page.click(SEL.formSubmitBtn);
    await page.waitForSelector('button[aria-label="Duplicate Bench Press"]');
    await page.click('button[aria-label="Duplicate Bench Press"]');
    await page.click(SEL.formSubmitBtn);

    // Wait for home page — confirm we see the table with 2 rows
    await page.waitForURL('**/');
    await expect(page.locator('table tbody tr')).toHaveCount(2);

    // Click "Log Exercise" — this calls setExerciseDraft(null) then navigates
    await page.click(SEL.ctaButton);

    // Wait for create page to render with cleared draft
    await page.waitForURL('**/create');
    await expect(page.locator(SEL.formHeading)).toHaveText("What'd you get up to?");
    await expect(page.locator(SEL.formName)).toHaveValue('');
  });

  test('Edit — updates exercise in table', async ({ page }) => {
    await page.click(SEL.ctaButton);
    await fillExerciseForm(page, { name: 'Bench Press', reps: 10, weight: 135, unit: 'lbs' });
    await page.click(SEL.formSubmitBtn);
    await page.waitForSelector('button[aria-label="Edit Bench Press"]');

    await page.click('button[aria-label="Edit Bench Press"]');
    await expect(page.locator(SEL.formHeading)).toHaveText('Make a change');

    // Change name and reps
    await page.fill(SEL.formName, 'Incline Press');
    await page.fill(SEL.formReps, '8');
    await page.click('button[type="submit"][form="exercise-form"]');

    await page.waitForSelector(SEL.signoutBtn);
    const row = page.locator('table tbody tr').first();
    await expect(row).toContainText('Incline Press');
    await expect(row).toContainText('8');
  });

  test('Delete — row removed from table', async ({ page }) => {
    await page.click(SEL.ctaButton);
    await fillExerciseForm(page, { name: 'Bench Press', reps: 10, weight: 135, unit: 'lbs' });
    await page.click(SEL.formSubmitBtn);
    await page.waitForSelector('button[aria-label="Delete Bench Press"]');

    await deleteExercise(page, 'Bench Press');
    // After delete, welcome shows again (isFirstVisit is true for the whole session)
    await expect(page.locator('.empty-hint')).toBeVisible();
  });

  test('Create with notes — notes saved and visible in detail', async ({ page }) => {
    await page.click(SEL.ctaButton);
    await fillExerciseForm(page, { name: 'Deadlift', reps: 5, weight: 315, unit: 'lbs', notes: 'Felt strong today' });
    await page.click(SEL.formSubmitBtn);
    await page.waitForSelector('table tbody tr');

    // Click row to view detail
    await page.click('table tbody tr.clickable-row');
    await expect(page.locator(SEL.detailCard)).toBeVisible();
    await expect(page.locator(SEL.detailName)).toContainText('Deadlift');
    await expect(page.locator(SEL.detailNotes)).toContainText('Felt strong today');
  });

  test('Detail page — click row to view, back navigates home', async ({ page }) => {
    await page.click(SEL.ctaButton);
    await fillExerciseForm(page, { name: 'Squat', reps: 5, weight: 225, unit: 'lbs' });
    await page.click(SEL.formSubmitBtn);
    await page.waitForSelector('table tbody tr.clickable-row');

    await page.click('table tbody tr.clickable-row');
    await expect(page.locator(SEL.detailCard)).toBeVisible();
    await expect(page.locator(SEL.detailName)).toContainText('Squat');

    // Back button returns to home
    await page.click('.back-btn');
    await expect(page.locator('table')).toBeVisible();
  });

  test('No welcome flash on session restore with exercises', async ({ page }) => {
    // Create an exercise so the account is non-empty
    await page.click(SEL.ctaButton);
    await fillExerciseForm(page, { name: 'Bench Press', reps: 10, weight: 135, unit: 'lbs' });
    await page.click(SEL.formSubmitBtn);
    await page.waitForSelector('table tbody tr.clickable-row');

    // Reload — simulates session restore with existing exercises
    await page.reload();
    await page.waitForSelector(SEL.signoutBtn);

    // Welcome should never have appeared — exercises loaded before welcome could show
    await expect(page.locator(SEL.welcomeLine)).toHaveCount(0);
    // Table should have the exercise
    await expect(page.locator('table tbody tr.clickable-row')).toHaveCount(1);
  });

  test('Persist after reload — exercises survive refresh', async ({ page }) => {
    // Create first exercise
    await page.click(SEL.ctaButton);
    await page.waitForSelector(SEL.formName);
    await fillExerciseForm(page, { name: 'Squat', reps: 5, weight: 225, unit: 'lbs' });
    await page.click(SEL.formSubmitBtn);
    await page.waitForURL('**/');
    await expect(page.locator('table tbody tr')).toHaveCount(1);

    // Create second exercise — wait for animation to settle
    await page.click(SEL.ctaButton);
    await page.waitForSelector(SEL.formName);
    await fillExerciseForm(page, { name: 'Deadlift', reps: 3, weight: 315, unit: 'lbs' });
    await page.locator(SEL.formSubmitBtn).click({ force: true });
    await page.waitForURL('**/');

    await expect(page.locator('table tbody tr')).toHaveCount(2);

    // Reload
    await page.reload();
    await page.waitForSelector(SEL.signoutBtn);
    await expect(page.locator('table tbody tr')).toHaveCount(2);
  });

  test('Delete cancel — exercise stays in table', async ({ page }) => {
    await page.click(SEL.ctaButton);
    await fillExerciseForm(page, { name: 'Bench Press', reps: 10, weight: 135, unit: 'lbs' });
    await page.click(SEL.formSubmitBtn);
    await page.waitForSelector('button[aria-label="Delete Bench Press"]');

    // Click delete, then cancel
    await page.click('button[aria-label="Delete Bench Press"]');
    await page.waitForSelector(SEL.overlay);
    await page.click(SEL.overlayCancel);

    // Exercise still there
    await expect(page.locator('table tbody tr')).toHaveCount(1);
    await expect(page.locator('table tbody tr').first()).toContainText('Bench Press');
  });

  test('Discard guard — dirty form shows confirm, cancel stays on form', async ({ page }) => {
    await page.click(SEL.ctaButton);
    await page.waitForSelector(SEL.formName);

    // Make the form dirty
    await page.fill(SEL.formName, 'Squat');

    // Click back
    await page.click('.back-btn');
    await page.waitForSelector(SEL.overlay);
    await expect(page.locator('.overlay-card')).toContainText('Discard unsaved changes?');

    // Cancel — stay on form
    await page.click(SEL.overlayCancel);
    await expect(page.locator(SEL.formName)).toHaveValue('Squat');
  });

  test('Discard guard — confirm navigates home', async ({ page }) => {
    await page.click(SEL.ctaButton);
    await page.waitForSelector(SEL.formName);

    // Make the form dirty
    await page.fill(SEL.formName, 'Squat');

    // Click back, then confirm discard
    await page.click('.back-btn');
    await page.waitForSelector(SEL.overlay);
    await page.click(SEL.overlayConfirm);

    // Back on home page
    await expect(page.locator(SEL.signoutBtn)).toBeVisible();
  });
});
