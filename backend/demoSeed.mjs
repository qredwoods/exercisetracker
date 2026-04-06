/**
 * Generates seeded exercises for a demo user.
 * Dates are relative to today so the data always looks fresh.
 */

const WEIGHTED = [
  { name: 'Bench Press', minWeight: 135, maxWeight: 185, minReps: 5, maxReps: 10, unit: 'lbs' },
  { name: 'Squat',       minWeight: 185, maxWeight: 245, minReps: 5, maxReps: 8,  unit: 'lbs' },
  { name: 'Deadlift',    minWeight: 225, maxWeight: 315, minReps: 3, maxReps: 6,  unit: 'lbs' },
  { name: 'Overhead Press', minWeight: 85, maxWeight: 115, minReps: 6, maxReps: 10, unit: 'lbs' },
  { name: 'Barbell Row', minWeight: 135, maxWeight: 165, minReps: 6, maxReps: 10, unit: 'lbs' },
  { name: 'Front Squat', minWeight: 115, maxWeight: 165, minReps: 4, maxReps: 8, unit: 'lbs' },
  { name: 'Romanian Deadlift', minWeight: 135, maxWeight: 205, minReps: 6, maxReps: 10, unit: 'lbs' },
  { name: 'Walking Lunges', minWeight: 25, maxWeight: 50, minReps: 10, maxReps: 16, unit: 'lbs' },
  { name: 'Hip Thrust', minWeight: 135, maxWeight: 225, minReps: 8, maxReps: 12, unit: 'lbs' },
  { name: 'Step-Ups', minWeight: 20, maxWeight: 45, minReps: 8, maxReps: 14, unit: 'lbs' },
];

const BODYWEIGHT = [
  { name: 'Pull-ups',  minReps: 6,  maxReps: 12, unit: 'bodyweight', weight: 0 },
  { name: 'Push-ups',  minReps: 12, maxReps: 25, unit: 'bodyweight', weight: 0 },
  { name: 'Dips',      minReps: 8,  maxReps: 15, unit: 'bodyweight', weight: 0 },
  { name: 'Plank',     minReps: 1,  maxReps: 3, unit: 'bodyweight', weight: 0 },
  { name: 'Box Jumps', minReps: 6,  maxReps: 12, unit: 'bodyweight', weight: 0 },
];

// Training sessions — each is a list of exercise names
const SESSIONS = [
  ['Bench Press'],
  ['Push-ups', 'Bench Press', 'Overhead Press', 'Dips'],
  ['Pull-ups', 'Squat', 'Walking Lunges', 'Plank'],
  ['Deadlift', 'Barbell Row', 'Hip Thrust', 'Box Jumps'],
  ['Push-ups', 'Bench Press', 'Front Squat', 'Overhead Press', 'Dips'],
  ['Pull-ups', 'Romanian Deadlift', 'Barbell Row', 'Step-Ups', 'Plank'],
  ['Bench Press', 'Overhead Press', 'Push-ups', 'Dips'],
  ['Squat', 'Walking Lunges', 'Hip Thrust', 'Box Jumps', 'Plank'],
  ['Deadlift', 'Bench Press', 'Barbell Row', 'Pull-ups', 'Step-Ups'],
  ['Push-ups', 'Front Squat', 'Overhead Press', 'Dips', 'Pull-ups'],
  ['Bench Press', 'Romanian Deadlift', 'Hip Thrust', 'Push-ups', 'Plank'],
  ['Pull-ups', 'Squat', 'Walking Lunges', 'Overhead Press', 'Box Jumps', 'Dips'],
  ['Deadlift', 'Barbell Row', 'Front Squat', 'Step-Ups', 'Plank'],
  ['Bench Press', 'Hip Thrust', 'Overhead Press', 'Push-ups'],
  ['Pull-ups', 'Romanian Deadlift', 'Barbell Row', 'Bench Press', 'Walking Lunges'],
  ['Push-ups', 'Squat', 'Step-Ups', 'Dips', 'Plank'],
  ['Bench Press', 'Deadlift', 'Barbell Row', 'Hip Thrust', 'Box Jumps', 'Pull-ups'],
  ['Front Squat', 'Overhead Press', 'Push-ups', 'Dips'],
  ['Pull-ups', 'Bench Press', 'Romanian Deadlift', 'Walking Lunges', 'Plank'],
  ['Deadlift', 'Squat', 'Hip Thrust', 'Box Jumps', 'Push-ups'],
  ['Bench Press', 'Barbell Row', 'Step-Ups', 'Dips'],
];

const ALL_EXERCISES = [...WEIGHTED, ...BODYWEIGHT];
const exerciseMap = Object.fromEntries(ALL_EXERCISES.map(e => [e.name, e]));

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function roundTo5(n) {
  return Math.round(n / 5) * 5;
}

function clamp(n, min, max) {
  return Math.min(Math.max(n, min), max);
}

function formatDate(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function generateExerciseStats(template, occurrenceIndex, totalOccurrences) {
  const progress =
    totalOccurrences <= 1 ? 1 : occurrenceIndex / (totalOccurrences - 1);
  const isWeighted = template.unit !== 'bodyweight';
  const wobble = Math.random();
  const offDay = wobble < 0.14;
  const strongDay = wobble > 0.9;

  if (isWeighted) {
    const span = template.maxWeight - template.minWeight;
    let targetWeight = template.minWeight + span * progress;
    targetWeight += randInt(-5, 5);
    if (offDay) targetWeight -= randInt(5, 15);
    if (strongDay) targetWeight += randInt(5, 10);

    const weight = roundTo5(clamp(targetWeight, template.minWeight, template.maxWeight));

    const repSpan = template.maxReps - template.minReps;
    let targetReps = template.maxReps - Math.round(repSpan * progress * 0.45);
    targetReps += randInt(-1, 1);
    if (offDay) targetReps = Math.max(template.minReps, targetReps - 1);

    return {
      weight,
      reps: clamp(targetReps, template.minReps, template.maxReps),
    };
  }

  let targetReps = template.minReps + Math.round((template.maxReps - template.minReps) * progress * 0.8);
  targetReps += randInt(-1, 2);
  if (offDay) targetReps -= 1;
  if (strongDay) targetReps += 1;

  return {
    weight: template.weight,
    reps: clamp(targetReps, template.minReps, template.maxReps),
  };
}

function findLatestPRExercise(exercises) {
  const currentPRs = new Map();

  for (const ex of exercises) {
    const existing = currentPRs.get(ex.name);
    const value = ex.unit === 'bodyweight' ? ex.reps : ex.weight;

    if (!existing) {
      currentPRs.set(ex.name, { exercise: ex, value });
      continue;
    }

    if (
      value > existing.value ||
      (value === existing.value && ex.date > existing.exercise.date)
    ) {
      currentPRs.set(ex.name, { exercise: ex, value });
    }
  }

  let latestPR = null;
  for (const { exercise, value } of currentPRs.values()) {
    if (
      !latestPR ||
      exercise.date > latestPR.exercise.date ||
      (exercise.date === latestPR.exercise.date && value > latestPR.value)
    ) {
      latestPR = { exercise, value };
    }
  }

  return latestPR?.exercise ?? null;
}

export function generateDemoExercises(userId, demoExpiresAt) {
  const today = new Date();
  const exercises = [];

  // Structured spacing so the dashboard card has clearly different 7d / 30d / all-time states.
  // Includes exactly one exercise today, 9 in the last 7 days, and longer-running history beyond 2 months.
  const trainingDays = [0, 2, 4, 9, 12, 15, 18, 21, 24, 28, 32, 36, 41, 46, 52, 58, 65, 72, 80, 89, 98];

  const scheduledSessions = trainingDays.map((offset, sessionIdx) => {
    const date = new Date(today);
    date.setDate(date.getDate() - offset);
    return {
      date,
      dateStr: formatDate(date),
      session: SESSIONS[sessionIdx % SESSIONS.length],
    };
  });

  const sortedSessions = [...scheduledSessions].sort((a, b) =>
    a.dateStr.localeCompare(b.dateStr),
  );

  const totalOccurrencesByExercise = new Map();
  for (const { session } of sortedSessions) {
    for (const name of session) {
      totalOccurrencesByExercise.set(
        name,
        (totalOccurrencesByExercise.get(name) ?? 0) + 1,
      );
    }
  }

  const occurrenceIndexByExercise = new Map();

  sortedSessions.forEach(({ dateStr, session }) => {
    session.forEach(name => {
      const template = exerciseMap[name];
      const occurrenceIndex = occurrenceIndexByExercise.get(name) ?? 0;
      const totalOccurrences = totalOccurrencesByExercise.get(name) ?? 1;
      const { weight, reps } = generateExerciseStats(
        template,
        occurrenceIndex,
        totalOccurrences,
      );

      exercises.push({
        name,
        reps,
        weight,
        unit: template.unit,
        date: dateStr,
        notes: '',
        userId,
        ...(demoExpiresAt && { demoExpiresAt }),
      });

      occurrenceIndexByExercise.set(name, occurrenceIndex + 1);
    });
  });

  // Guarantee visible PRs: boost the most recent Squat and Pull-ups entries
  // so PR detection always has clear winners for the demo
  const mostRecentSquat = exercises.filter(e => e.name === 'Squat').sort((a, b) => b.date.localeCompare(a.date))[0];
  if (mostRecentSquat) mostRecentSquat.weight = 250; // above 245 max range

  const mostRecentPullups = exercises.filter(e => e.name === 'Pull-ups').sort((a, b) => b.date.localeCompare(a.date))[0];
  if (mostRecentPullups) mostRecentPullups.reps = 14; // above 12 max range

  const todayBench = exercises.find((e) => e.name === 'Bench Press' && e.date === formatDate(today));
  if (todayBench) {
    todayBench.notes = 'Quick check-in set today. Enough to keep the streak alive without turning it into a full session.';
  }

  // Add notes to recent exercises — technique, life, small wins
  const notesByName = {
    'Squat': 'New PR! Depth felt solid, no knee cave. Took a long walk yesterday and my hips were loose for once.',
    'Front Squat': 'Stayed lighter and cleaner today. Elbows finally stayed up the whole set.',
    'Deadlift': 'Grip gave out on the last rep. Need to try mixed grip next time or just chalk up.',
    'Romanian Deadlift': 'Hamstrings lit up fast. Tempo felt good once I stopped rushing the eccentric.',
    'Barbell Row': 'Kept it strict, no body english. Lower back was a little tight from sitting all day.',
    'Bench Press': 'Felt heavy today. Only slept 5 hours — baby was up at 3am. Still showed up.',
    'Overhead Press': 'Bar drifted forward on rep 6. Cue: squeeze glutes, stack ribs.',
    'Walking Lunges': 'Brutal in the best way. Balance felt better on the second round.',
    'Hip Thrust': 'Paused at the top and it changed everything. Glutes were done after set three.',
    'Step-Ups': 'Used these as a finisher and they smoked me more than expected.',
    'Dips': 'Shoulder felt good for once. Warmed up with band pull-aparts and it made a huge difference.',
    'Pull-ups': 'Finally hit 14 clean. No kipping. Been chasing this one for weeks.',
    'Push-ups': 'Superset with pull-ups. Arms were toast but got through it.',
    'Plank': 'Kept the ribs down and actually breathed this time. Much harder that way.',
    'Box Jumps': 'Stayed snappy and shut it down before the landings got sloppy.',
  };

  // Apply notes to the most recent instance of each exercise
  const noted = new Set();
  const byDate = [...exercises].sort((a, b) => b.date.localeCompare(a.date));
  for (const ex of byDate) {
    if (noted.has(ex.name)) continue;
    if (!ex.notes && notesByName[ex.name]) {
      ex.notes = notesByName[ex.name];
    }
    noted.add(ex.name);
  }

  const latestPRExercise = findLatestPRExercise(exercises);
  if (latestPRExercise && !latestPRExercise.notes) {
    latestPRExercise.notes = "Almost skipped this after working too late. Warming up felt good though. I'm getting somewhere.";
  }

  return exercises;
}
