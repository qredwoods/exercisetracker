import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { validateExerciseBody } from "../app.mjs";

// ── helpers ──────────────────────────────────────────────
function valid(overrides = {}) {
  return {
    name: "Squat",
    reps: 5,
    weight: 225,
    unit: "lbs",
    date: "2025-01-15",
    ...overrides,
  };
}

// ── happy path ───────────────────────────────────────────
describe("validateExerciseBody", () => {
  it("accepts a valid exercise", () => {
    const result = validateExerciseBody(valid());
    assert.equal(result.valid, true);
    assert.equal(result.data.name, "Squat");
    assert.equal(result.data.reps, 5);
    assert.equal(result.data.weight, 225);
  });

  it("trims name whitespace", () => {
    const result = validateExerciseBody(valid({ name: "  Squat  " }));
    assert.equal(result.valid, true);
    assert.equal(result.data.name, "Squat");
  });

  it("accepts exercise with notes", () => {
    const result = validateExerciseBody(valid({ notes: "Felt strong" }));
    assert.equal(result.valid, true);
    assert.equal(result.data.notes, "Felt strong");
  });

  it("trims notes whitespace", () => {
    const result = validateExerciseBody(valid({ notes: "  good set  " }));
    assert.equal(result.valid, true);
    assert.equal(result.data.notes, "good set");
  });

  it("defaults notes to empty string when absent", () => {
    const result = validateExerciseBody(valid());
    assert.equal(result.valid, true);
    assert.equal(result.data.notes, "");
  });

  it("defaults notes to empty string when non-string", () => {
    const result = validateExerciseBody(valid({ notes: 42 }));
    assert.equal(result.valid, true);
    assert.equal(result.data.notes, "");
  });

  it("accepts all three unit types", () => {
    for (const unit of ["lbs", "kgs", "bodyweight"]) {
      const payload = unit === "bodyweight"
        ? valid({ unit, weight: 0 })
        : valid({ unit });
      const result = validateExerciseBody(payload);
      assert.equal(result.valid, true, `unit "${unit}" should be valid`);
    }
  });

  it("auto-zeros weight for bodyweight unit", () => {
    const result = validateExerciseBody(valid({ unit: "bodyweight", weight: 999 }));
    assert.equal(result.valid, true);
    assert.equal(result.data.weight, 0);
  });

  // ── missing required fields ──────────────────────────
  describe("missing required fields", () => {
    for (const field of ["name", "reps", "weight", "unit", "date"]) {
      it(`rejects when ${field} is missing`, () => {
        const body = valid();
        delete body[field];
        const result = validateExerciseBody(body);
        assert.equal(result.valid, false);
      });
    }
  });

  // ── extra / unknown fields ───────────────────────────
  it("rejects unknown fields", () => {
    const result = validateExerciseBody(valid({ hacked: true }));
    assert.equal(result.valid, false);
    assert.match(result.error, /required fields/i);
  });

  // ── name validation ──────────────────────────────────
  it("rejects empty name", () => {
    const result = validateExerciseBody(valid({ name: "" }));
    assert.equal(result.valid, false);
    assert.match(result.error, /exercise name/i);
  });

  it("rejects whitespace-only name", () => {
    const result = validateExerciseBody(valid({ name: "   " }));
    assert.equal(result.valid, false);
    assert.match(result.error, /exercise name/i);
  });

  it("rejects non-string name", () => {
    const result = validateExerciseBody(valid({ name: 123 }));
    assert.equal(result.valid, false);
  });

  // ── reps validation ──────────────────────────────────
  it("rejects zero reps", () => {
    const result = validateExerciseBody(valid({ reps: 0 }));
    assert.equal(result.valid, false);
    assert.match(result.error, /reps/i);
  });

  it("rejects negative reps", () => {
    const result = validateExerciseBody(valid({ reps: -5 }));
    assert.equal(result.valid, false);
  });

  it("rejects non-number reps", () => {
    const result = validateExerciseBody(valid({ reps: "ten" }));
    assert.equal(result.valid, false);
  });

  it("rejects NaN reps", () => {
    const result = validateExerciseBody(valid({ reps: NaN }));
    assert.equal(result.valid, false);
  });

  it("rejects Infinity reps", () => {
    const result = validateExerciseBody(valid({ reps: Infinity }));
    assert.equal(result.valid, false);
  });

  // ── weight validation ────────────────────────────────
  it("rejects zero weight with lbs", () => {
    const result = validateExerciseBody(valid({ weight: 0, unit: "lbs" }));
    assert.equal(result.valid, false);
    assert.match(result.error, /weight/i);
  });

  it("rejects negative weight with kgs", () => {
    const result = validateExerciseBody(valid({ weight: -10, unit: "kgs" }));
    assert.equal(result.valid, false);
  });

  it("rejects non-number weight", () => {
    const result = validateExerciseBody(valid({ weight: "heavy" }));
    assert.equal(result.valid, false);
  });

  // ── unit validation ──────────────────────────────────
  it("rejects invalid unit", () => {
    const result = validateExerciseBody(valid({ unit: "stones" }));
    assert.equal(result.valid, false);
    assert.match(result.error, /valid unit/i);
  });

  // ── date validation ──────────────────────────────────
  it("rejects bad date format", () => {
    const result = validateExerciseBody(valid({ date: "01/15/2025" }));
    assert.equal(result.valid, false);
    assert.match(result.error, /YYYY-MM-DD/i);
  });

  it("rejects partial date", () => {
    const result = validateExerciseBody(valid({ date: "2025-01" }));
    assert.equal(result.valid, false);
  });

  it("rejects future date", () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const y = tomorrow.getFullYear();
    const m = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const d = String(tomorrow.getDate()).padStart(2, "0");
    const result = validateExerciseBody(valid({ date: `${y}-${m}-${d}` }));
    assert.equal(result.valid, false);
    assert.match(result.error, /future/i);
  });

  it("accepts today's date", () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const result = validateExerciseBody(valid({ date: `${y}-${m}-${d}` }));
    assert.equal(result.valid, true);
  });
});
