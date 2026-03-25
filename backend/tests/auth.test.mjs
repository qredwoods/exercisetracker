import { describe, it, before, after, afterEach } from "node:test";
import assert from "node:assert/strict";
import { request, startDB, stopDB, clearDB, createTestUser } from "./setup.mjs";

describe("Auth API", () => {
  before(async () => await startDB());
  after(async () => await stopDB());
  afterEach(async () => await clearDB());

  // ── signup ──────────────────────────────────────────────
  describe("POST /api/auth/signup", () => {
    it("creates user and returns accessToken + refresh cookie", async () => {
      const res = await request
        .post("/api/auth/signup")
        .send({
          firstName: "Jane",
          lastName: "Doe",
          email: "jane@example.com",
          password: "StrongPass1",
          ageConfirmed: true,
        })
        .expect(201);

      assert.ok(res.body.accessToken);
      assert.equal(res.body.user.firstName, "Jane");
      assert.equal(res.body.user.lastName, "Doe");
      // passwordHash must never leak
      assert.equal(res.body.user.passwordHash, undefined);
      // refresh cookie set
      const cookies = res.headers["set-cookie"] || [];
      assert.ok(cookies.some((c) => c.startsWith("refreshToken=")));
    });

    it("409 on duplicate email", async () => {
      await createTestUser({ email: "dupe@example.com" });
      // user email created above, then a full sign up request hits with same email
      const res = await request
        .post("/api/auth/signup")
        .send({
          firstName: "A",
          lastName: "B",
          email: "dupe@example.com",
          password: "TestPass1",
          ageConfirmed: true,
        })
        .expect(409);

      assert.match(res.body.error, /already exists/i);
    });

    it("400 when age not confirmed", async () => {
      // does block when age check fails?
      const res = await request
        .post("/api/auth/signup")
        .send({
          firstName: "A",
          lastName: "B",
          email: "noage@example.com",
          password: "TestPass1",
          ageConfirmed: false,
        })
        .expect(400);

      assert.match(res.body.error, /13 or older/i);
    });

    it("400 when first/last name missing", async () => {
      const res = await request
        .post("/api/auth/signup")
        .send({
          email: "noname@example.com",
          password: "TestPass1",
          ageConfirmed: true,
        })
        .expect(400);

      assert.match(res.body.error, /name/i);
    });

    it("400 when name exceeds 50 characters", async () => {
      const res = await request
        .post("/api/auth/signup")
        .send({
          firstName: "A".repeat(51), // long name
          lastName: "B",
          email: "longname@example.com",
          password: "TestPass1",
          ageConfirmed: true,
        })
        .expect(400);

      assert.match(res.body.error, /50 characters/i);
    });

    it("400 on invalid email format", async () => {
      const res = await request
        .post("/api/auth/signup")
        .send({
          firstName: "A",
          lastName: "B",
          email: "not-an-email",
          password: "TestPass1",
          ageConfirmed: true,
        })
        .expect(400);

      assert.match(res.body.error, /valid email/i);
    });

    it("400 when password too short", async () => {
      const res = await request
        .post("/api/auth/signup")
        .send({
          firstName: "A",
          lastName: "B",
          email: "short@example.com",
          password: "Ab1",
          ageConfirmed: true,
        })
        .expect(400);

      assert.match(res.body.error, /8 characters/i);
    });

    it("400 when password too long", async () => {
      const res = await request
        .post("/api/auth/signup")
        .send({
          firstName: "A",
          lastName: "B",
          email: "long@example.com",
          password: "Aa1" + "x".repeat(126),
          ageConfirmed: true,
        })
        .expect(400);

      assert.match(res.body.error, /128 characters/i);
    });

    it("400 when password missing uppercase", async () => {
      const res = await request
        .post("/api/auth/signup")
        .send({
          firstName: "A",
          lastName: "B",
          email: "noupper@example.com",
          password: "testpass1",
          ageConfirmed: true,
        })
        .expect(400);

      assert.match(res.body.error, /uppercase/i);
    });

    it("400 when password missing lowercase", async () => {
      const res = await request
        .post("/api/auth/signup")
        .send({
          firstName: "A",
          lastName: "B",
          email: "nolower@example.com",
          password: "TESTPASS1",
          ageConfirmed: true,
        })
        .expect(400);

      assert.match(res.body.error, /lowercase/i);
    });

    it("400 when password missing digit", async () => {
      const res = await request
        .post("/api/auth/signup")
        .send({
          firstName: "A",
          lastName: "B",
          email: "nodigit@example.com",
          password: "TestPasss",
          ageConfirmed: true,
        })
        .expect(400);

      assert.match(res.body.error, /number/i);
    });

    it("400 when email and password both missing", async () => {
      await request
        .post("/api/auth/signup")
        .send({ firstName: "A", lastName: "B", ageConfirmed: true })
        .expect(400);
    });
  });

  // ── login ───────────────────────────────────────────────
  describe("POST /api/auth/login", () => {
    it("returns accessToken and refresh cookie for valid credentials", async () => {
      const { credentials } = await createTestUser();
      const res = await request
        .post("/api/auth/login")
        .send(credentials)
        .expect(200);

      assert.ok(res.body.accessToken);
      assert.ok(res.body.user);
      const cookies = res.headers["set-cookie"] || [];
      assert.ok(cookies.some((c) => c.startsWith("refreshToken=")));
    });

    it("401 on wrong password", async () => {
      const { credentials } = await createTestUser();
      const res = await request
        .post("/api/auth/login")
        .send({ email: credentials.email, password: "WrongPass1" })
        .expect(401);

      assert.match(res.body.error, /invalid email or password/i);
    });

    it("401 on nonexistent email", async () => {
      const res = await request
        .post("/api/auth/login")
        .send({ email: "ghost@example.com", password: "TestPass1" })
        .expect(401);

      assert.match(res.body.error, /invalid email or password/i);
    });

    it("same error for wrong password and nonexistent email", async () => {
      const { credentials } = await createTestUser();
      const wrongPw = await request
        .post("/api/auth/login")
        .send({ email: credentials.email, password: "WrongPass1" });
      const noUser = await request
        .post("/api/auth/login")
        .send({ email: "ghost@example.com", password: "TestPass1" });

      // identical error prevents email enumeration
      assert.equal(wrongPw.body.error, noUser.body.error);
    });

    it("400 when email/password missing", async () => {
      await request.post("/api/auth/login").send({}).expect(400);
    });

    it("400 on invalid email format", async () => {
      const res = await request
        .post("/api/auth/login")
        .send({ email: "not-valid", password: "TestPass1" })
        .expect(400);

      assert.match(res.body.error, /valid email/i);
    });
  });

  // ── refresh ─────────────────────────────────────────────
  describe("POST /api/auth/refresh", () => {
    it("rotates tokens — new access + new refresh cookie", async () => {
      const { cookies } = await createTestUser();
      const cookieHeader = cookies.map((c) => c.split(";")[0]).join("; ");

      const res = await request
        .post("/api/auth/refresh")
        .set("Cookie", cookieHeader)
        .expect(200);

      assert.ok(res.body.accessToken);
      const newCookies = res.headers["set-cookie"] || [];
      assert.ok(newCookies.some((c) => c.startsWith("refreshToken=")));
    });

    it("401 with no refresh cookie", async () => {
      const res = await request.post("/api/auth/refresh").expect(401);
      assert.match(res.body.error, /no refresh token/i);
    });

    it("401 with invalid refresh token", async () => {
      const res = await request
        .post("/api/auth/refresh")
        .set("Cookie", "refreshToken=garbage")
        .expect(401);

      assert.match(res.body.error, /invalid refresh token/i);
    });
  });

  // ── logout ──────────────────────────────────────────────
  describe("POST /api/auth/logout", () => {
    it("clears refresh cookie", async () => {
      const res = await request.post("/api/auth/logout").expect(200);

      assert.match(res.body.message, /logged out/i);
      const cookies = res.headers["set-cookie"] || [];
      // cookie should be cleared (expires in the past or empty value)
      assert.ok(cookies.some((c) => c.startsWith("refreshToken=")));
    });
  });

  // ── me ──────────────────────────────────────────────────
  describe("GET /api/auth/me", () => {
    it("returns authenticated user", async () => {
      const { accessToken } = await createTestUser();
      const res = await request
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      assert.ok(res.body.user);
      assert.equal(res.body.user.passwordHash, undefined);
    });

    it("401 without token", async () => {
      await request.get("/api/auth/me").expect(401);
    });

    it("401 with invalid token", async () => {
      await request
        .get("/api/auth/me")
        .set("Authorization", "Bearer garbage")
        .expect(401);
    });
  });

  // ── demo ────────────────────────────────────────────────
  describe("POST /api/auth/demo", () => {
    it("creates demo account with seeded exercises", async () => {
      const res = await request.post("/api/auth/demo").expect(201);

      assert.ok(res.body.accessToken);
      assert.equal(res.body.user.isDemo, true);

      // demo user should have exercises
      const exercises = await request
        .get("/api/exercises")
        .set("Authorization", `Bearer ${res.body.accessToken}`)
        .expect(200);

      assert.ok(exercises.body.length > 0);
    });
  });

  // ── health check ────────────────────────────────────────
  describe("GET /health", () => {
    it("returns ok", async () => {
      const res = await request.get("/health").expect(200);
      assert.equal(res.body.status, "ok");
    });
  });
});
