/* Pure accuracy/streak tracking for the trainers and quizzes. Immutable: each
   record() returns a new object so the UI can store it and the tests can assert
   on it without hidden state. */

export function newStats() {
  return { attempts: 0, correct: 0, streak: 0, best: 0 };
}

export function record(stats, isCorrect) {
  const attempts = stats.attempts + 1;
  const correct = stats.correct + (isCorrect ? 1 : 0);
  const streak = isCorrect ? stats.streak + 1 : 0;
  const best = Math.max(stats.best, streak);
  return { attempts, correct, streak, best };
}

export function accuracyPct(stats) {
  if (stats.attempts === 0) return 0;
  return Math.round((stats.correct / stats.attempts) * 1000) / 10;
}
