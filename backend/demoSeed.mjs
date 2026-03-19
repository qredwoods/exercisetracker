/**
 * Generates ~25 seeded exercises for a demo user.
 * Dates are relative to today so the data always looks fresh.
 */

const WEIGHTED = [
  { name: 'Bench Press', minWeight: 135, maxWeight: 185, minReps: 5, maxReps: 10, unit: 'lbs' },
  { name: 'Squat',       minWeight: 185, maxWeight: 245, minReps: 5, maxReps: 8,  unit: 'lbs' },
  { name: 'Deadlift',    minWeight: 225, maxWeight: 315, minReps: 3, maxReps: 6,  unit: 'lbs' },
  { name: 'Overhead Press', minWeight: 85, maxWeight: 115, minReps: 6, maxReps: 10, unit: 'lbs' },
  { name: 'Barbell Row', minWeight: 135, maxWeight: 165, minReps: 6, maxReps: 10, unit: 'lbs' },
];

const BODYWEIGHT = [
  { name: 'Pull-ups',  minReps: 6,  maxReps: 12, unit: 'bodyweight', weight: 0 },
  { name: 'Push-ups',  minReps: 12, maxReps: 25, unit: 'bodyweight', weight: 0 },
  { name: 'Dips',      minReps: 8,  maxReps: 15, unit: 'bodyweight', weight: 0 },
];

// Training sessions — each is a list of exercise names
const SESSIONS = [
  ['Bench Press', 'Overhead Press', 'Dips'],
  ['Squat', 'Deadlift', 'Barbell Row'],
  ['Pull-ups', 'Push-ups', 'Bench Press'],
  ['Squat', 'Overhead Press', 'Dips'],
  ['Deadlift', 'Barbell Row', 'Pull-ups'],
  ['Bench Press', 'Push-ups', 'Dips'],
  ['Squat', 'Overhead Press', 'Pull-ups'],
  ['Deadlift', 'Bench Press', 'Barbell Row'],
];

const ALL_EXERCISES = [...WEIGHTED, ...BODYWEIGHT];
const exerciseMap = Object.fromEntries(ALL_EXERCISES.map(e => [e.name, e]));

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function roundTo5(n) {
  return Math.round(n / 5) * 5;
}

function formatDate(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function generateDemoExercises(userId, demoExpiresAt) {
  const today = new Date();
  const exercises = [];

  // Generate training days: ~10-12 sessions spread over last 25 days
  // Skip 1-2 days between sessions
  const trainingDays = [];
  let dayOffset = 1; // start yesterday
  for (let i = 0; i < SESSIONS.length && dayOffset <= 25; i++) {
    trainingDays.push(dayOffset);
    dayOffset += randInt(2, 3); // 1-2 rest days between
  }

  trainingDays.forEach((offset, sessionIdx) => {
    const date = new Date(today);
    date.setDate(date.getDate() - offset);
    const dateStr = formatDate(date);

    const session = SESSIONS[sessionIdx % SESSIONS.length];
    session.forEach(name => {
      const template = exerciseMap[name];
      const weight = template.weight !== undefined
        ? template.weight
        : roundTo5(randInt(template.minWeight, template.maxWeight));
      const reps = randInt(template.minReps, template.maxReps);

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
    });
  });

  return exercises;
}
