import { QUESTIONS } from './questions.js';

export const STORAGE_KEY = 'zamify-web-practice-v1';

export function newSession() {
  return { version: 1, index: 0, answers: [], draft: null, complete: false };
}

export function blankChoice(question) {
  if (question.kind === 'single') return null;
  if (question.kind === 'multi') return [];
  return Array(question.answer.length).fill(null);
}

export function validChoice(question, choice, complete = true) {
  const inRange = value => Number.isInteger(value) && value >= 0 && value < question.options.length;
  if (question.kind === 'single') return inRange(choice) || (!complete && choice === null);
  if (!Array.isArray(choice)) return false;
  if (question.kind === 'multi') {
    return choice.every(inRange) && new Set(choice).size === choice.length &&
      (complete ? choice.length === question.answer.length : choice.length <= question.answer.length);
  }
  if (choice.length !== question.answer.length) return false;
  const selected = choice.filter(value => value !== null);
  return selected.every(inRange) && new Set(selected).size === selected.length &&
    (!complete || selected.length === question.answer.length);
}

export function isCorrect(question, choice) {
  if (!validChoice(question, choice)) return false;
  if (question.kind === 'single') return choice === question.answer;
  if (question.kind === 'multi') return question.answer.every(value => choice.includes(value));
  return question.answer.every((value, index) => value === choice[index]);
}

export function normalizeSession(raw) {
  const state = newSession();
  if (!raw || raw.version !== 1 || !Array.isArray(raw.answers)) return state;
  for (let i = 0; i < Math.min(raw.answers.length, QUESTIONS.length); i++) {
    const record = raw.answers[i];
    if (!record || record.id !== QUESTIONS[i].id || !validChoice(QUESTIONS[i], record.choice)) break;
    state.answers.push({ id: record.id, choice: record.choice, assisted: record.assisted === true });
  }
  const latest = Math.min(state.answers.length, QUESTIONS.length - 1);
  state.index = Number.isInteger(raw.index) ? Math.max(0, Math.min(raw.index, latest)) : latest;
  state.complete = raw.complete === true && state.answers.length === QUESTIONS.length;
  const next = QUESTIONS[state.answers.length];
  if (next && raw.draft?.id === next.id && validChoice(next, raw.draft.choice, false)) {
    state.draft = { id: next.id, choice: raw.draft.choice, hint: raw.draft.hint === true,
      clues: raw.draft.clues === true, assisted: raw.draft.assisted === true || raw.draft.hint === true || raw.draft.clues === true };
  }
  return state;
}

export function loadSession(storage) {
  try {
    return { state: normalizeSession(JSON.parse(storage.getItem(STORAGE_KEY))), available: true };
  } catch {
    return { state: newSession(), available: false };
  }
}

export function scoreSession(answers) {
  let correct = 0, unassisted = 0, assisted = 0;
  answers.forEach((answer, i) => {
    const hit = isCorrect(QUESTIONS[i], answer.choice);
    if (hit) correct++;
    if (hit && !answer.assisted) unassisted++;
    if (answer.assisted) assisted++;
  });
  return { correct, unassisted, assisted };
}
