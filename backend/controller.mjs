import express from "express";
import cookieParser from "cookie-parser";
import * as model from "./model.mjs";
import { authRouter } from "./auth.mjs";
import { requireAuth } from "./middleware.mjs";
import "dotenv/config";
import cors from "cors";

const app = express();

const ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

app.use(
  cors({
    origin: ORIGIN,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

const isReadOnly =
  process.env.NODE_ENV === "production" &&
  process.env.DEMO_READ_ONLY === "true";

app.use((req, res, next) => {
  if (!isReadOnly) return next();
  if (
    req.method === "GET" ||
    req.method === "HEAD" ||
    req.method === "OPTIONS"
  ) {
    return next();
  }

  return res.status(403).json({
    error: "Demo is read-only. Run locally for full access.",
  });
});

// ── auth routes (public) ────────────────────────────────
app.use("/api/auth", authRouter);

// ── everything below requires authentication ────────────
app.use("/api/exercises", requireAuth);

function todayIsoLocal() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isDateValid(date) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

function validateExerciseBody(body) {
  const allowedFields = ["name", "reps", "weight", "unit", "date"].sort();
  const requestFields = Object.keys(body).sort();
  const fieldsMatch =
    JSON.stringify(allowedFields) === JSON.stringify(requestFields);

  if (!fieldsMatch) {
    return {
      valid: false,
      error: "Please complete all required fields.",
    };
  }

  let { name, reps, weight, unit, date } = body;

  if (typeof name !== "string" || !name.trim()) {
    return {
      valid: false,
      error: "Please enter an exercise name.",
    };
  }

  if (typeof reps !== "number" || !Number.isFinite(reps) || reps <= 0) {
    return {
      valid: false,
      error: "Reps must be a number greater than zero.",
    };
  }

  if (!["lbs", "kgs", "bodyweight"].includes(unit)) {
    return {
      valid: false,
      error: "Please select a valid unit.",
    };
  }

  if (!isDateValid(date)) {
    return {
      valid: false,
      error: "Date must be in YYYY-MM-DD format.",
    };
  }

  if (date > todayIsoLocal()) {
    return {
      valid: false,
      error: "Workout date cannot be in the future.",
    };
  }

  if (typeof weight !== "number" || !Number.isFinite(weight) || weight <= 0) {
    return {
      valid: false,
      error: "Weight must be a number greater than zero.",
    };
  }
  // order matters
  if (unit === "bodyweight") {
    weight = 0;
  }

  return {
    valid: true,
    data: {
      name: name.trim(),
      reps,
      weight,
      unit,
      date,
    },
  };
}

// health check (public)
app.get("/health", async (_, res) => {
  try {
    res.status(200).json({ status: "ok" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
});

// create new exercise (scoped to user)
app.post("/api/exercises", async (req, res) => {
  try {
    const validation = validateExerciseBody(req.body);

    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const exercise = await model.createExercise({
      ...validation.data,
      userId: req.userId,
    });
    res.status(201).json(exercise);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
});

// get exercises (scoped to user)
app.get("/api/exercises", async (req, res) => {
  try {
    const results = await model.findExercises({
      ...req.query,
      userId: req.userId,
    });
    res.status(200).json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
});

// get exercise by id (scoped to user)
app.get("/api/exercises/:_id", async (req, res) => {
  try {
    const result = await model.findExerciseById(req.params._id);

    if (result === null || result.userId?.toString() !== req.userId) {
      return res.status(404).json({ error: "Not found" });
    }

    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
});

// update (scoped to user)
app.put("/api/exercises/:_id", async (req, res) => {
  try {
    const validation = validateExerciseBody(req.body);

    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    // only update if the exercise belongs to this user
    const result = await model.updateExercise(
      req.params._id,
      validation.data,
      req.userId
    );

    if (result === null) {
      return res.status(404).json({ error: "Not found" });
    }

    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
});

// delete all (scoped to user)
app.delete("/api/exercises", async (req, res) => {
  try {
    const result = await model.deleteExercises({
      ...req.query,
      userId: req.userId,
    });
    res.status(200).json({ deletedCount: result.deletedCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
});

// delete by id (scoped to user)
app.delete("/api/exercises/:_id", async (req, res) => {
  try {
    const result = await model.deleteById(req.params._id, req.userId);

    if (result === 0) {
      return res.status(404).json({ error: "Not found" });
    }

    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
});

const PORT = process.env.PORT || 5000;

(async () => {
  await model.connect();
  app.listen(PORT, () => console.log(`Server listening on port ${PORT}...`));
})();