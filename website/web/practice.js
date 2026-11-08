import { QUESTIONS, DOMAINS } from './questions.js';
import { STORAGE_KEY, newSession, blankChoice, validChoice, isCorrect, loadSession, scoreSession } from './practice-model.js';
import { escapeHtml as esc } from './site.js';

const root = document.querySelector('#practice-root');
const storageNotice = document.querySelector('#storage-notice');
const resetDialog = document.querySelector('#reset-dialog');
let state;
let storage;
try {
  storage = window.localStorage;
  const loaded = loadSession(storage);
  state = loaded.state;
  storageNotice.hidden = loaded.available;
} catch {
  state = newSession();
  storageNotice.hidden = false;
}

function persist() {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    storageNotice.hidden = true;
  } catch { storageNotice.hidden = false; }
}

function currentDraft(question) {
  if (state.draft?.id !== question.id) {
    state.draft = { id: question.id, choice: blankChoice(question), assisted: false, hint: false, clues: false };
  }
  return state.draft;
}

function questionText(question, highlight) {
  if (!highlight) return esc(question.q);
  const phrases = [...(question.keyPoints || []), ...(question.clues || []).map(clue => clue.text)];
  const spans = [];
  phrases.sort((a, b) => b.length - a.length).forEach(phrase => {
    const start = question.q.indexOf(phrase);
    const end = start + phrase.length;
    if (start >= 0 && !spans.some(span => start < span.end && end > span.start)) spans.push({ start, end });
  });
  spans.sort((a, b) => a.start - b.start);
  let cursor = 0;
  let text = '';
  spans.forEach(span => {
    text += esc(question.q.slice(cursor, span.start)) + '<mark>' + esc(question.q.slice(span.start, span.end)) + '</mark>';
    cursor = span.end;
  });
  return text + esc(question.q.slice(cursor));
}

function instructions(question) {
  if (question.kind === 'multi') return `Choose ${question.answer.length} answers.`;
  if (question.kind === 'order') return 'Choose a stage for each position, in order. Use each stage once.';
  if (question.kind === 'match') return 'Choose the best match for each requirement. Use each option once.';
  return 'Choose one answer.';
}

function renderChoices(question, choice, locked) {
  if (question.kind === 'order' || question.kind === 'match') {
    return question.answer.map((correct, row) => {
      const prompt = question.kind === 'order' ? `Step ${row + 1}` : question.prompts[row];
      const label = question.kind === 'order' ? prompt : `${row + 1}. ${prompt}`;
      if (locked) {
        const hit = choice[row] === correct;
        return `<div class="select-row"><p class="format-cue">${esc(label)}</p><p class="select-result">Your choice · ${esc(question.options[choice[row]])}</p>${hit ? `<p class="select-result"><strong>✓ Correct ${question.kind === 'order' ? 'stage' : 'match'}</strong></p>` : `<p class="select-result"><strong>Correct · ${esc(question.options[correct])}</strong></p>`}</div>`;
      }
      return `<div class="select-row"><label for="choice-${row}">${esc(label)}</label><select id="choice-${row}" data-row="${row}"><option value="">Choose an option…</option>${question.options.map((option, index) => `<option value="${index}" ${choice[row] === index ? 'selected' : ''} ${choice.includes(index) && choice[row] !== index ? 'disabled' : ''}>${esc(option)}</option>`).join('')}</select></div>`;
    }).join('');
  }
  const type = question.kind === 'multi' ? 'checkbox' : 'radio';
  return question.options.map((option, index) => {
    const selected = question.kind === 'single' ? choice === index : choice.includes(index);
    const correct = question.kind === 'single' ? question.answer === index : question.answer.includes(index);
    const className = locked && correct ? ' correct-option' : locked && selected ? ' incorrect-option' : '';
    const reachedLimit = question.kind === 'multi' && choice.length === question.answer.length && !selected;
    return `<label class="answer-option${className}"><input type="${type}" name="answer-${question.id}" data-answer value="${index}" ${selected ? 'checked' : ''} ${locked || reachedLimit ? 'disabled' : ''}><span class="answer-letter" aria-hidden="true">${String.fromCharCode(65 + index)}</span><span class="answer-text">${esc(option)}</span>${locked && correct ? '<span class="answer-state">✓ Correct</span>' : locked && selected ? '<span class="answer-state">Your choice</span>' : ''}</label>`;
  }).join('');
}

function rationaleHtml(question) {
  return `<details class="rationales"><summary>Understand every option</summary><ul class="rationale-list">${question.options.map((option, index) => `<li><strong>${String.fromCharCode(65 + index)}. ${esc(option)}</strong>${esc(question.reasons[index])}</li>`).join('')}</ul><p class="format-cue">Put it into practice</p><p>${esc(question.transfer)}</p></details><a class="source-link" href="${esc(question.source)}" target="_blank" rel="noopener noreferrer">Read the AWS reference ↗</a>`;
}

function feedbackHtml(question, record, headingId = '') {
  const hit = isCorrect(question, record.choice);
  return `<section class="feedback${hit ? '' : ' incorrect'}"><h2 ${headingId ? `id="${headingId}" tabindex="-1"` : ''}>${hit ? '✓ You’ve got the idea.' : 'A useful one to revisit.'}</h2><p>${esc(question.why)}</p><p class="trap"><strong>Watch for this trap.</strong> ${esc(question.trap)}</p>${record.assisted ? '<p class="micro">You used learning help on this question. It is marked as assisted in your summary.</p>' : ''}</section>${rationaleHtml(question)}`;
}

function renderQuestion(focus = false) {
  const question = QUESTIONS[state.index];
  const record = state.answers[state.index];
  const draft = record ? null : currentDraft(question);
  const choice = record ? record.choice : draft.choice;
  const answered = state.answers.length;
  const canSubmit = validChoice(question, choice);
  const last = state.index === QUESTIONS.length - 1;
  const dots = QUESTIONS.map((q, index) => {
    const answer = state.answers[index];
    const doneClass = answer ? (isCorrect(q, answer.choice) ? ' done' : ' needs-review') : '';
    return `<button class="question-dot${doneClass}" data-jump="${index}" aria-label="Question ${index + 1}${answer ? ', answered' : ''}" ${index === state.index ? 'aria-current="step"' : ''} ${index > answered ? 'disabled' : ''}>${index + 1}</button>`;
  }).join('');
  root.innerHTML = `<div class="practice-layout"><aside class="practice-sidebar" aria-label="Practice navigation"><div><p class="eyebrow">Your first chapter</p><h2>AWS AI Practitioner</h2><p class="mini-label">10 questions · Take your time</p></div><div class="question-dots">${dots}</div><div class="side-coach"><img src="/assets/zami.svg" alt="" width="67" height="67"><p>“Look for what the question needs. Then find the answer that meets it.”</p></div><button class="quiet-button" data-action="reset">Reset practice</button></aside><article class="question-card"><div class="question-meta"><span>${esc(DOMAINS[question.domain - 1])}</span><span>QUESTION ${state.index + 1} / 10</span></div><div class="progress-track" role="progressbar" aria-label="Questions answered" aria-valuemin="0" aria-valuemax="10" aria-valuenow="${answered}"><span style="width:${answered * 10}%"></span></div><h1 id="question-title" tabindex="-1">${questionText(question, draft?.clues)}</h1><p id="format-cue" class="format-cue">${instructions(question)}</p><fieldset class="answers" aria-labelledby="question-title" aria-describedby="format-cue">${renderChoices(question, choice, !!record)}</fieldset>${record ? feedbackHtml(question, record, 'feedback-title') : `<div class="learning-tools"><button data-action="hint" aria-expanded="${draft.hint}" aria-controls="hint-panel">${draft.hint ? 'Hide' : 'Show'} a hint</button><button data-action="clues" aria-pressed="${draft.clues}">${draft.clues ? 'Hide' : 'Highlight'} key details</button><a class="text-link" href="/glossary/" target="_blank" rel="noopener noreferrer">Open glossary ↗</a></div><div id="hint-panel" class="hint-panel" ${draft.hint ? '' : 'hidden'}><strong>A nudge from Zami</strong>${esc(question.hint)}</div>`}<div class="question-actions"><small>${record ? 'Your first answer is recorded. Revisit the reasoning whenever you like.' : draft.assisted ? 'Learning help used · This answer will be marked assisted.' : 'Your first answer counts. Hints are here if you need them.'}</small><button class="button" data-action="${record ? 'next' : 'submit'}" ${!record && !canSubmit ? 'disabled' : ''}>${record ? (last ? 'See my results' : 'Next question') : 'Check my answer'} <span aria-hidden="true">→</span></button></div></article></div>`;
  if (focus) document.querySelector('#question-title').focus({ preventScroll: true });
}

function renderResults() {
  const score = scoreSession(state.answers);
  root.innerHTML = `<section class="result-page"><div class="result-banner"><div><p class="eyebrow">All 10 questions explored</p><h1 id="result-heading" tabindex="-1">One step clearer.</h1><p>${score.correct === 10 ? 'You answered every question correctly. Revisit the explanations to strengthen the ideas behind your choices.' : 'Every answer gives you something to build on. Review the questions below and make the reasoning stick.'}</p></div><img src="/assets/zami.svg" alt="Zami celebrating your completed practice" width="155" height="155"></div><div class="result-stats"><div class="result-stat"><strong>${score.correct}/10</strong><span>Correct first answers</span></div><div class="result-stat"><strong>${score.unassisted}/10</strong><span>Correct without learning help</span></div><div class="result-stat"><strong>${score.assisted}</strong><span>Questions with learning help</span></div></div><p class="result-disclaimer">This is your result for these 10 practice questions. It is not an exam-readiness estimate. Repeating the same questions can raise your score through familiarity.</p><div class="result-actions"><a class="button" href="#answer-review">Review my answers ↓</a><button class="button secondary" data-action="reset">Try all 10 again</button><a class="text-link" href="/glossary/">Explore the glossary ↗</a></div><h2 id="answer-review" class="review-title">Let’s make it stick.</h2>${QUESTIONS.map((question, index) => {
    const record = state.answers[index];
    const hit = isCorrect(question, record.choice);
    return `<details class="review-item${hit ? '' : ' review-wrong'}"><summary>${index + 1}. ${esc(question.concept)}<span>${hit ? '✓ Correct' : 'Revisit this concept'}${record.assisted ? ' · Assisted' : ''}</span></summary><p class="review-question">${esc(question.q)}</p><div class="review-choices">${renderChoices(question, record.choice, true)}</div>${feedbackHtml(question, record)}</details>`;
  }).join('')}</section>`;
}

function render(focus = false) {
  if (state.complete) {
    renderResults();
    if (focus) document.querySelector('#result-heading').focus({ preventScroll: true });
  } else renderQuestion(focus);
}

root.addEventListener('change', event => {
  const target = event.target;
  const question = QUESTIONS[state.index];
  if (state.answers[state.index]) return;
  const draft = currentDraft(question);
  if (target.matches('input[data-answer]')) {
    const value = Number(target.value);
    if (question.kind === 'single') draft.choice = value;
    else draft.choice = [...root.querySelectorAll('input[data-answer]:checked')].map(input => Number(input.value));
  } else if (target.matches('select[data-row]')) {
    draft.choice[Number(target.dataset.row)] = target.value === '' ? null : Number(target.value);
  } else return;
  persist();
  // Update controls in place to preserve keyboard focus and radio-key navigation.
  root.querySelector('[data-action="submit"]').disabled = !validChoice(question, draft.choice);
  if (question.kind === 'multi') {
    root.querySelectorAll('input[data-answer]').forEach(input => {
      input.disabled = !input.checked && draft.choice.length >= question.answer.length;
    });
  }
  if (question.kind === 'order' || question.kind === 'match') {
    root.querySelectorAll('select[data-row]').forEach(select => {
      [...select.options].forEach(option => {
        option.disabled = option.value !== '' && draft.choice.includes(Number(option.value)) && select.value !== option.value;
      });
    });
  }
});

root.addEventListener('click', event => {
  const target = event.target.closest('button');
  if (!target || target.disabled) return;
  const question = QUESTIONS[state.index];
  if (target.dataset.jump !== undefined) {
    const nextIndex = Number(target.dataset.jump);
    if (nextIndex > state.answers.length) return;
    state.index = nextIndex;
    persist();
    renderQuestion(true);
    return;
  }
  const action = target.dataset.action;
  if (action === 'reset') { resetDialog.showModal(); return; }
  if (action === 'hint' || action === 'clues') {
    if (state.answers[state.index]) return;
    const draft = currentDraft(question);
    draft[action] = !draft[action];
    draft.assisted = true;
    persist();
    if (action === 'hint') {
      target.setAttribute('aria-expanded', String(draft.hint));
      target.textContent = draft.hint ? 'Hide a hint' : 'Show a hint';
      document.querySelector('#hint-panel').hidden = !draft.hint;
    } else {
      target.setAttribute('aria-pressed', String(draft.clues));
      target.textContent = draft.clues ? 'Hide key details' : 'Highlight key details';
      document.querySelector('#question-title').innerHTML = questionText(question, draft.clues);
    }
    root.querySelector('.question-actions small').textContent = 'Learning help used · This answer will be marked assisted.';
    return;
  }
  if (action === 'submit') {
    if (state.answers[state.index]) return;
    const draft = currentDraft(question);
    if (!validChoice(question, draft.choice)) return;
    state.answers.push({ id: question.id, choice: draft.choice, assisted: draft.assisted });
    state.draft = null;
    persist();
    renderQuestion();
    document.querySelector('#feedback-title').focus({ preventScroll: true });
    document.querySelector('#feedback-title').scrollIntoView({ block: 'nearest', behavior: 'instant' });
  }
  if (action === 'next' && state.answers[state.index]) {
    if (state.index === QUESTIONS.length - 1) state.complete = true;
    else state.index++;
    persist();
    render(true);
    root.scrollIntoView({ block: 'start', behavior: 'instant' });
  }
});

document.querySelector('#reset-cancel').addEventListener('click', () => resetDialog.close());
document.querySelector('#reset-confirm').addEventListener('click', () => {
  state = newSession();
  persist();
  resetDialog.close();
  render(true);
  root.scrollIntoView({ block: 'start', behavior: 'instant' });
});
render();
