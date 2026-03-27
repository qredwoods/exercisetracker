/** Shared helpers for E2E tests */

/** Selector constants */
export const SEL = {
  // Auth
  authCard: '.auth-card',
  authError: '.auth-error',
  authSubmit: '.auth-submit',
  authToggleBtn: '.auth-toggle-btn',
  ageConfirm: '.age-confirm input[type="checkbox"]',

  // Home
  welcomeLine: '.welcome-line',
  signoutBtn: '.signout-btn',
  ctaButton: '.cta-row-fixed .cta-button',
  exerciseTable: 'table',

  // Form
  formHeading: '.form-heading',
  formError: '.form-error',
  formName: '#exercise-form-name',
  formReps: '#exercise-form-reps',
  formWeight: '#exercise-form-weight',
  formUnit: '#exercise-form-unit',
  formDate: '#exercise-form-date',
  formNotes: '.notes-input',
  formSubmitBtn: 'button[type="submit"][form="exercise-form"]',

  // Detail
  detailCard: '.detail-card',
  detailName: '.detail-name',
  detailNotes: '.detail-notes-text',

  // Overlay
  overlay: '.overlay',
  overlayConfirm: '.overlay-btn--confirm',
  overlayCancel: '.overlay-btn--cancel',
};

/** Generate a unique test user */
export function generateUser() {
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 6);
  return {
    firstName: 'Test',
    lastName: 'User',
    email: `test+${ts}${rand}@example.com`,
    password: 'TestPass1',
  };
}

/** Today as YYYY-MM-DD */
export function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Sign up a new user via the UI */
export async function signupViaUI(page, user) {
  await page.context().clearCookies();
  await page.goto('/');
  // Switch to signup mode
  // Already on signup mode by default
  // Fill signup fields
  await page.fill('input[placeholder="First name"]', user.firstName);
  await page.fill('input[placeholder="Last name"]', user.lastName);
  await page.fill('input[placeholder="Email"]', user.email);
  await page.fill('input[placeholder="Password"]', user.password);
  await page.fill('input[placeholder="Confirm password"]', user.password);
  await page.check(SEL.ageConfirm);
  await page.click(SEL.authSubmit);
  // Wait for home page
  await page.waitForSelector(SEL.signoutBtn, { timeout: 10000 });
}

/** Log in an existing user via the UI */
export async function loginViaUI(page, email, password) {
  await page.goto('/');
  await page.click(SEL.authToggleBtn);
  await page.fill('input[placeholder="Email"]', email);
  await page.fill('input[placeholder="Password"]', password);
  await page.click(SEL.authSubmit);
  // Wait for home page (signout button means we're logged in)
  await page.waitForSelector(SEL.signoutBtn, { timeout: 10000 });
}

/** Fill the exercise form (does NOT submit) */
export async function fillExerciseForm(page, { name, reps, weight, unit, notes }) {
  if (name !== undefined) {
    await page.fill(SEL.formName, name);
  }
  if (reps !== undefined) {
    await page.fill(SEL.formReps, String(reps));
  }
  if (unit !== undefined) {
    await page.selectOption(SEL.formUnit, unit);
  }
  if (weight !== undefined) {
    await page.fill(SEL.formWeight, String(weight));
  }
  if (notes !== undefined) {
    await page.fill(SEL.formNotes, notes);
  }
}

/**
 * Submit the exercise form bypassing browser native validation.
 * Native min/max constraints on number/date inputs block the submit event,
 * preventing our JS validation from running. This dispatches submit directly.
 */
export async function submitExerciseForm(page) {
  await page.locator('#exercise-form').evaluate((form) => {
    form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
  });
}
