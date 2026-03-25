import { describe, it, before, after, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  request,
  startDB,
  stopDB,
  clearDB,
  createTestUser,
  makeExercise,
} from "./setup.mjs";

describe("Exercises API", () => {
  // tokens used as auth for users, ensures proper object authorization
  let token;
  let secondToken;

  before(async () => await startDB());
  after(async () => await stopDB());

  afterEach(async () => await clearDB());

  // helper — create a user and set token for this test
  async function freshUser() {
    const u = await createTestUser();
    token = u.accessToken;
    return u;
  }

  async function freshSecondUser() {
    const u = await createTestUser({ email: `other+${Date.now()}@example.com` });
    secondToken = u.accessToken;
    return u;
  }

  // ── auth gate ───────────────────────────────────────────
  describe("authentication required", () => {
    it("401 on GET /api/exercises without token", async () => {
      await request.get("/api/exercises").expect(401);
    });

    it("401 on POST /api/exercises without token", async () => {
      await request.post("/api/exercises").send(makeExercise()).expect(401);
    });

    it("401 with expired/invalid token", async () => {
      await request
        .get("/api/exercises")
        .set("Authorization", "Bearer expired.token.here")
        .expect(401);
    });
  });

  // ── create ──────────────────────────────────────────────
  describe("POST /api/exercises", () => {
    it("201 with valid payload", async () => {
      await freshUser();
      const res = await request
        .post("/api/exercises")
        .set("Authorization", `Bearer ${token}`)
        .send(makeExercise())
        .expect(201);

      assert.equal(res.body.name, "Bench Press");
      assert.equal(res.body.reps, 10);
      assert.equal(res.body.weight, 135);
      assert.equal(res.body.unit, "lbs");
      assert.ok(res.body._id);
    });

    it("201 with notes", async () => {
      await freshUser();
      const res = await request
        .post("/api/exercises")
        .set("Authorization", `Bearer ${token}`)
        .send(makeExercise({ notes: "New PR!" }))
        .expect(201);

      assert.equal(res.body.notes, "New PR!");
    });

    it("201 bodyweight — weight auto-zeroed", async () => {
      await freshUser();
      const res = await request
        .post("/api/exercises")
        .set("Authorization", `Bearer ${token}`)
        .send(makeExercise({ unit: "bodyweight", weight: 0 }))
        .expect(201);

      assert.equal(res.body.weight, 0);
      assert.equal(res.body.unit, "bodyweight");
    });

    it("400 missing required field (no unit)", async () => {
      await freshUser();
      const body = makeExercise();
      delete body.unit;
      const res = await request
        .post("/api/exercises")
        .set("Authorization", `Bearer ${token}`)
        .send(body)
        .expect(400);

      assert.ok(res.body.error);
    });

    it("400 missing required field (no date)", async () => {
      await freshUser();
      const body = makeExercise();
      delete body.date;
      await request
        .post("/api/exercises")
        .set("Authorization", `Bearer ${token}`)
        .send(body)
        .expect(400);
    });

    it("400 reps is not a number", async () => {
      await freshUser();
      await request
        .post("/api/exercises")
        .set("Authorization", `Bearer ${token}`)
        .send(makeExercise({ reps: "not a number" }))
        .expect(400);
    });

    it("400 zero weight with non-bodyweight unit", async () => {
      await freshUser();
      const res = await request
        .post("/api/exercises")
        .set("Authorization", `Bearer ${token}`)
        .send(makeExercise({ weight: 0, unit: "kgs" }))
        .expect(400);

      assert.match(res.body.error, /weight/i);
    });

    it("400 bad date format", async () => {
      await freshUser();
      const res = await request
        .post("/api/exercises")
        .set("Authorization", `Bearer ${token}`)
        .send(makeExercise({ date: "2025-aa-15" }))
        .expect(400);

      assert.match(res.body.error, /YYYY-MM-DD/i);
    });

    it("400 future date", async () => {
      await freshUser();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const y = tomorrow.getFullYear();
      const m = String(tomorrow.getMonth() + 1).padStart(2, "0");
      const d = String(tomorrow.getDate()).padStart(2, "0");

      const res = await request
        .post("/api/exercises")
        .set("Authorization", `Bearer ${token}`)
        .send(makeExercise({ date: `${y}-${m}-${d}` }))
        .expect(400);

      assert.match(res.body.error, /future/i);
    });

    it("400 unknown extra fields", async () => {
      await freshUser();
      await request
        .post("/api/exercises")
        .set("Authorization", `Bearer ${token}`)
        .send(makeExercise({ injection: "drop table" }))
        .expect(400);
    });
  });

  // ── read ────────────────────────────────────────────────
  describe("GET /api/exercises", () => {
    it("returns only the authenticated user's exercises", async () => {
      await freshUser();
      await freshSecondUser();

      // user 1 creates an exercise
      await request
        .post("/api/exercises")
        .set("Authorization", `Bearer ${token}`)
        .send(makeExercise({ name: "Squat" }))
        .expect(201);

      // user 2 creates an exercise
      await request
        .post("/api/exercises")
        .set("Authorization", `Bearer ${secondToken}`)
        .send(makeExercise({ name: "Deadlift" }))
        .expect(201);

      // user 1 sees only their exercise
      const res = await request
        .get("/api/exercises")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      assert.equal(res.body.length, 1);
      assert.equal(res.body[0].name, "Squat");
    });

    it("filters by name", async () => {
      await freshUser();
      await request
        .post("/api/exercises")
        .set("Authorization", `Bearer ${token}`)
        .send(makeExercise({ name: "Squat" }));
      await request
        .post("/api/exercises")
        .set("Authorization", `Bearer ${token}`)
        .send(makeExercise({ name: "Deadlift" }));

      const res = await request
        .get("/api/exercises?name=Squat")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      assert.equal(res.body.length, 1);
      assert.equal(res.body[0].name, "Squat");
    });

    it("filters by unit", async () => {
      await freshUser();
      await request
        .post("/api/exercises")
        .set("Authorization", `Bearer ${token}`)
        .send(makeExercise({ unit: "lbs" }));
      await request
        .post("/api/exercises")
        .set("Authorization", `Bearer ${token}`)
        .send(makeExercise({ unit: "kgs", weight: 60 }));

      const res = await request
        .get("/api/exercises?unit=kgs")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      assert.equal(res.body.length, 1);
      assert.equal(res.body[0].unit, "kgs");
    });

    it("filters by date", async () => {
      await freshUser();
      await request
        .post("/api/exercises")
        .set("Authorization", `Bearer ${token}`)
        .send(makeExercise({ date: "2025-01-15" }));
      await request
        .post("/api/exercises")
        .set("Authorization", `Bearer ${token}`)
        .send(makeExercise({ date: "2025-02-20" }));

      const res = await request
        .get("/api/exercises?date=2025-02-20")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      assert.equal(res.body.length, 1);
      assert.equal(res.body[0].date, "2025-02-20");
    });
  });

  // ── read by id ──────────────────────────────────────────
  describe("GET /api/exercises/:_id", () => {
    it("returns exercise by id", async () => {
      await freshUser();
      const created = await request
        .post("/api/exercises")
        .set("Authorization", `Bearer ${token}`)
        .send(makeExercise())
        .expect(201);

      const res = await request
        .get(`/api/exercises/${created.body._id}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      assert.equal(res.body.name, "Bench Press");
    });

    it("404 for non-existent id", async () => {
      await freshUser();
      const fakeId = "669b336b8c8867f2cc165159";
      await request
        .get(`/api/exercises/${fakeId}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(404);
    });

    it("404 for malformed id", async () => {
      await freshUser();
      await request
        .get("/api/exercises/not-a-valid-id")
        .set("Authorization", `Bearer ${token}`)
        .expect(404);
    });

    it("404 when accessing another user's exercise", async () => {
      await freshUser();
      await freshSecondUser();

      const created = await request
        .post("/api/exercises")
        .set("Authorization", `Bearer ${token}`)
        .send(makeExercise())
        .expect(201);

      // second user tries to read it
      await request
        .get(`/api/exercises/${created.body._id}`)
        .set("Authorization", `Bearer ${secondToken}`)
        .expect(404);
    });
  });

  // ── update ──────────────────────────────────────────────
  describe("PUT /api/exercises/:_id", () => {
    it("updates exercise fields", async () => {
      await freshUser();
      const created = await request
        .post("/api/exercises")
        .set("Authorization", `Bearer ${token}`)
        .send(makeExercise())
        .expect(201);

      const res = await request
        .put(`/api/exercises/${created.body._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send(makeExercise({ reps: 15, weight: 155, notes: "Easy set" }))
        .expect(200);

      assert.equal(res.body.reps, 15);
      assert.equal(res.body.weight, 155);
      assert.equal(res.body.notes, "Easy set");
    });

    it("400 with invalid update payload", async () => {
      await freshUser();
      const created = await request
        .post("/api/exercises")
        .set("Authorization", `Bearer ${token}`)
        .send(makeExercise())
        .expect(201);

      await request
        .put(`/api/exercises/${created.body._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send(makeExercise({ reps: -1 }))
        .expect(400);
    });

    it("404 for non-existent id", async () => {
      await freshUser();
      const fakeId = "669b336b8c8867f2cc165159";
      await request
        .put(`/api/exercises/${fakeId}`)
        .set("Authorization", `Bearer ${token}`)
        .send(makeExercise())
        .expect(404);
    });

    it("404 for malformed id", async () => {
      await freshUser();
      await request
        .put("/api/exercises/not-a-valid-id")
        .set("Authorization", `Bearer ${token}`)
        .send(makeExercise())
        .expect(404);
    });

    it("404 when updating another user's exercise", async () => {
      await freshUser();
      await freshSecondUser();

      const created = await request
        .post("/api/exercises")
        .set("Authorization", `Bearer ${token}`)
        .send(makeExercise())
        .expect(201);

      await request
        .put(`/api/exercises/${created.body._id}`)
        .set("Authorization", `Bearer ${secondToken}`)
        .send(makeExercise({ reps: 99 }))
        .expect(404);
    });
  });

  // ── delete by id ────────────────────────────────────────
  describe("DELETE /api/exercises/:_id", () => {
    it("204 on successful delete", async () => {
      await freshUser();
      const created = await request
        .post("/api/exercises")
        .set("Authorization", `Bearer ${token}`)
        .send(makeExercise())
        .expect(201);

      await request
        .delete(`/api/exercises/${created.body._id}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(204);
    });

    it("exercise is gone after delete", async () => {
      await freshUser();
      const created = await request
        .post("/api/exercises")
        .set("Authorization", `Bearer ${token}`)
        .send(makeExercise())
        .expect(201);

      await request
        .delete(`/api/exercises/${created.body._id}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(204);

      await request
        .get(`/api/exercises/${created.body._id}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(404);
    });

    it("404 for non-existent id", async () => {
      await freshUser();
      const fakeId = "669b336b8c8867f2cc165159";
      await request
        .delete(`/api/exercises/${fakeId}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(404);
    });

    it("404 for malformed id", async () => {
      await freshUser();
      await request
        .delete("/api/exercises/not-a-valid-id")
        .set("Authorization", `Bearer ${token}`)
        .expect(404);
    });

    it("404 when deleting another user's exercise", async () => {
      await freshUser();
      await freshSecondUser();

      const created = await request
        .post("/api/exercises")
        .set("Authorization", `Bearer ${token}`)
        .send(makeExercise())
        .expect(201);

      await request
        .delete(`/api/exercises/${created.body._id}`)
        .set("Authorization", `Bearer ${secondToken}`)
        .expect(404);
    });
  });

  // ── bulk delete ─────────────────────────────────────────
  describe("DELETE /api/exercises", () => {
    it("deletes all user exercises", async () => {
      await freshUser();
      await request
        .post("/api/exercises")
        .set("Authorization", `Bearer ${token}`)
        .send(makeExercise({ name: "Squat" }));
      await request
        .post("/api/exercises")
        .set("Authorization", `Bearer ${token}`)
        .send(makeExercise({ name: "Deadlift" }));

      const res = await request
        .delete("/api/exercises")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      assert.equal(res.body.deletedCount, 2);
    });

    it("bulk delete with name filter", async () => {
      await freshUser();
      await request
        .post("/api/exercises")
        .set("Authorization", `Bearer ${token}`)
        .send(makeExercise({ name: "Squat" }));
      await request
        .post("/api/exercises")
        .set("Authorization", `Bearer ${token}`)
        .send(makeExercise({ name: "Deadlift" }));

      const res = await request
        .delete("/api/exercises?name=Squat")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      assert.equal(res.body.deletedCount, 1);

      // Deadlift still exists
      const remaining = await request
        .get("/api/exercises")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      assert.equal(remaining.body.length, 1);
      assert.equal(remaining.body[0].name, "Deadlift");
    });

    it("does not delete other user's exercises", async () => {
      await freshUser();
      await freshSecondUser();

      await request
        .post("/api/exercises")
        .set("Authorization", `Bearer ${token}`)
        .send(makeExercise({ name: "Squat" }));
      await request
        .post("/api/exercises")
        .set("Authorization", `Bearer ${secondToken}`)
        .send(makeExercise({ name: "Deadlift" }));

      await request
        .delete("/api/exercises")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      // second user's exercise untouched
      const remaining = await request
        .get("/api/exercises")
        .set("Authorization", `Bearer ${secondToken}`)
        .expect(200);

      assert.equal(remaining.body.length, 1);
      assert.equal(remaining.body[0].name, "Deadlift");
    });
  });
});
