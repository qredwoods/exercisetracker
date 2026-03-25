import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import supertest from "supertest";
import { app } from "../app.mjs";

let mongoServer;

export const request = supertest(app);

export async function startDB() {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
}

export async function stopDB() {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
}

export async function clearDB() {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}

// Sign up a test user and return { user, accessToken, cookies }
export async function createTestUser(overrides = {}) {
  const defaults = {
    firstName: "Test",
    lastName: "User",
    email: `test+${Date.now()}${Math.random().toString(36).slice(2, 6)}@example.com`,
    password: "TestPass1",
    ageConfirmed: true,
  };

  const body = { ...defaults, ...overrides };
  const res = await request
    .post("/api/auth/signup")
    .send(body)
    .expect(201);

  const cookies = res.headers["set-cookie"] || [];

  return {
    user: res.body.user,
    accessToken: res.body.accessToken,
    cookies,
    credentials: { email: body.email, password: body.password },
  };
}

// Build a valid exercise payload — override any field
export function makeExercise(overrides = {}) {
  return {
    name: "Bench Press",
    reps: 10,
    weight: 135,
    unit: "lbs",
    date: "2025-01-15",
    ...overrides,
  };
}
