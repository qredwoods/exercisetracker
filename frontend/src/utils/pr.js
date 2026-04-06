/**
 * PR detection engine — all client-side, E2E encryption compatible.
 * Operates on the already-decrypted exercises array in React state.
 */

function normalizeExerciseName(name) {
  return name.trim().toLowerCase();
}

/**
 * Compute personal records from an exercises array.
 *
 * Returns {
 *   currentPRs: Map<exerciseId, { exercise, value }>,
 *   historicPRs: Set<exerciseId>,
 *   latestPR: { exercise, value } | null
 * }
 *
 * - Weighted exercises: PR metric = weight
 * - Bodyweight exercises: PR metric = reps
 */
export function computePRs(exercises) {
  const currentPRs = new Map();
  const historicPRs = new Set();

  // Group by normalized exercise name
  const groups = new Map();
  for (const ex of exercises) {
    const key = normalizeExerciseName(ex.name);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(ex);
  }

  for (const [, group] of groups) {
    // Sort chronologically (ascending by date, then by position for stability)
    group.sort((a, b) => a.date.localeCompare(b.date));

    const isBodyweight = group[0].unit === "bodyweight";
    let runningMax = -1;
    let currentPR = null;

    for (const ex of group) {
      const value = isBodyweight ? ex.reps : ex.weight;

      if (value > runningMax) {
        runningMax = value;
        historicPRs.add(ex._id);
        currentPR = { exercise: ex, value };
      } else if (value === runningMax) {
        // Tie: more recent date takes over as current PR
        currentPR = { exercise: ex, value };
      }
    }

    if (currentPR) {
      currentPRs.set(currentPR.exercise._id, currentPR);
    }
  }

  // Latest PR = current PR with the most recent date across all exercise names
  let latestPR = null;
  for (const [, pr] of currentPRs) {
    if (!latestPR || pr.exercise.date > latestPR.exercise.date) {
      latestPR = pr;
    }
  }

  return { currentPRs, historicPRs, latestPR };
}

export function getCountVariants(exercises) {
  if (exercises.length === 0) {
    return [{ key: "all-time", count: 0, title: "Exercises", periodLabel: "all time" }];
  }

  const todayStr = toDateStr(new Date());
  const variants = [];

  const last24HoursCount = exercises.filter((ex) => ex.date === todayStr).length;
  if (last24HoursCount > 0) {
    variants.push({
      key: "24-hours",
      count: last24HoursCount,
      title: "Exercises",
      periodLabel: "last 24 hours",
    });
  }

  const last7DaysCutoff = toDateStr(daysAgo(7));
  const last7DaysCount = exercises.filter((ex) => ex.date > last7DaysCutoff).length;
  if (last7DaysCount > 0) {
    variants.push({
      key: "7-days",
      count: last7DaysCount,
      title: "Exercises",
      periodLabel: "last 7 days",
    });
  }

  const last30DaysCutoff = toDateStr(daysAgo(30));
  const last30DaysCount = exercises.filter((ex) => ex.date > last30DaysCutoff).length;
  if (last30DaysCount > 0) {
    variants.push({
      key: "30-days",
      count: last30DaysCount,
      title: "Exercises",
      periodLabel: "last 30 days",
    });
  }

  variants.push({
    key: "all-time",
    count: exercises.length,
    title: "Exercises",
    periodLabel: "all time",
  });

  return variants;
}

/**
 * Determine the most motivating count + label for the user's activity level.
 *
 * Tiers: last 24h → last 7 days → last 30 days → all time.
 * Picks the smallest window with at least 2 exercises when possible.
 */
export function getAdaptiveCount(exercises) {
  const variants = getCountVariants(exercises);
  return variants.find((variant) => variant.count >= 2) ?? variants[0];
}

/**
 * Time-aware greeting based on days since last exercise.
 * Returns null if no exercises (welcome message handles that case).
 */
export function getGreeting(exercises) {
  if (exercises.length === 0) return null;

  const todayStr = toDateStr(new Date());

  let mostRecent = exercises[0].date;
  for (const ex of exercises) {
    if (ex.date > mostRecent) mostRecent = ex.date;
  }

  const days = daysBetween(mostRecent, todayStr);

  if (days === 0) return "On a roll.";
  if (days <= 2) return "Right where you left off.";
  if (days <= 7) return "Good to see you.";
  if (days <= 28) return "Welcome back.";
  if (days <= 90) return `Still here. So are your ${exercises.length} workouts.`;
  return "It's been a while. Nothing's changed \u2014 pick up whenever.";
}

// ── helpers ──────────────────────────────────────────────

function toDateStr(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function daysBetween(dateStrA, dateStrB) {
  const a = new Date(dateStrA + "T00:00:00");
  const b = new Date(dateStrB + "T00:00:00");
  return Math.round(Math.abs(b - a) / (1000 * 60 * 60 * 24));
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}
