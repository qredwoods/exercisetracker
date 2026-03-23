import { Router } from "express";

const benchmarkRouter = Router();

const MUSCLE_GROUPS = {
  "Squat": "Legs", "Lunge": "Legs", "Romanian Deadlift": "Legs",
  "Bench Press": "Chest", "Overhead Press": "Shoulders",
  "Deadlift": "Back", "Barbell Row": "Back", "Pull-Up": "Back",
};

const EXERCISE_NAMES = Object.keys(MUSCLE_GROUPS);

// CPU-bound benchmark: generate LLM coaching profiles for synthetic users
benchmarkRouter.get("/", (_, res) => {
  const NUM_USERS = 2000;
  const EXERCISES_PER_USER = 800;
  const START_DATE = new Date("2025-09-23");

  // generate synthetic 6-month training history
  const data = [];
  for (let u = 0; u < NUM_USERS; u++) {
    for (let e = 0; e < EXERCISES_PER_USER; e++) {
      const dayOffset = Math.floor(e / 8) * 2; // ~4 sessions/week
      const date = new Date(START_DATE);
      date.setDate(date.getDate() + dayOffset);
      data.push({
        user: u,
        exercise: EXERCISE_NAMES[e % EXERCISE_NAMES.length],
        weight: Math.floor(Math.random() * 300) + 45,
        reps: Math.floor(Math.random() * 12) + 1,
        sets: Math.floor(Math.random() * 5) + 1,
        date,
      });
    }
  }

  // build per-user coaching profiles
  const profiles = [];
  for (let u = 0; u < NUM_USERS; u++) {
    const userExercises = data.filter((d) => d.user === u);

    // exercise frequency map
    const frequency = {};
    for (const d of userExercises) {
      frequency[d.exercise] = (frequency[d.exercise] || 0) + 1;
    }

    // progressive overload: avg weight in first half vs second half per exercise
    const overload = {};
    for (const name of EXERCISE_NAMES) {
      const entries = userExercises.filter((d) => d.exercise === name);
      const mid = Math.floor(entries.length / 2);
      const firstHalf = entries.slice(0, mid);
      const secondHalf = entries.slice(mid);
      const avg = (arr) => arr.reduce((s, d) => s + d.weight, 0) / (arr.length || 1);
      overload[name] = {
        early: Math.round(avg(firstHalf)),
        recent: Math.round(avg(secondHalf)),
        trend: avg(secondHalf) > avg(firstHalf) ? "increasing" : "stalled",
      };
    }

    // muscle group balance: total volume per group
    const muscleVolume = {};
    for (const d of userExercises) {
      const group = MUSCLE_GROUPS[d.exercise];
      muscleVolume[group] = (muscleVolume[group] || 0) + d.weight * d.reps * d.sets;
    }
    const totalVolume = Object.values(muscleVolume).reduce((a, b) => a + b, 0);
    const muscleBalance = {};
    for (const [group, vol] of Object.entries(muscleVolume)) {
      muscleBalance[group] = `${((vol / totalVolume) * 100).toFixed(1)}%`;
    }

    // weekly volume trend
    const weeklyVolume = {};
    for (const d of userExercises) {
      const week = Math.floor((d.date - START_DATE) / (7 * 24 * 60 * 60 * 1000));
      weeklyVolume[week] = (weeklyVolume[week] || 0) + d.weight * d.reps * d.sets;
    }

    // personal records per exercise
    const prs = {};
    for (const d of userExercises) {
      const estimated1RM = Math.round(d.weight * (1 + d.reps / 30));
      if (!prs[d.exercise] || estimated1RM > prs[d.exercise]) {
        prs[d.exercise] = estimated1RM;
      }
    }

    // build coaching prompt string (the expensive part: string concat)
    let prompt = `User ${u} Training Profile (6 months):\n`;
    prompt += `\nExercise Frequency:\n`;
    for (const [ex, count] of Object.entries(frequency)) {
      prompt += `  ${ex}: ${count} sessions\n`;
    }
    prompt += `\nProgressive Overload:\n`;
    for (const [ex, trend] of Object.entries(overload)) {
      prompt += `  ${ex}: ${trend.early}lbs → ${trend.recent}lbs (${trend.trend})\n`;
    }
    prompt += `\nMuscle Balance:\n`;
    for (const [group, pct] of Object.entries(muscleBalance)) {
      prompt += `  ${group}: ${pct}\n`;
    }
    prompt += `\nEstimated 1RMs:\n`;
    for (const [ex, rm] of Object.entries(prs)) {
      prompt += `  ${ex}: ${rm}lbs\n`;
    }
    prompt += `\nWeekly Volume Trend:\n`;
    for (const [week, vol] of Object.entries(weeklyVolume)) {
      prompt += `  Week ${week}: ${vol.toLocaleString()}lbs\n`;
    }

    profiles.push({ user: u, promptLength: prompt.length });
  }

  res.json({
    totalExercises: data.length,
    profilesGenerated: profiles.length,
    avgPromptLength: Math.round(profiles.reduce((s, p) => s + p.promptLength, 0) / profiles.length),
    sampleProfile: profiles[0],
  });
});

export { benchmarkRouter };
