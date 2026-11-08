import { loadSession } from './practice-model.js';

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('#mobile-nav');
menuButton?.addEventListener('click', () => {
  const expanded = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(expanded));
  menuButton.setAttribute('aria-label', expanded ? 'Close navigation' : 'Open navigation');
  menu.hidden = !expanded;
});
menu?.addEventListener('click', event => {
  if (!event.target.closest('a')) return;
  menu.hidden = true;
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation');
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu && !menu.hidden) {
    menu.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
    menuButton.focus();
  }
});

const hello = document.querySelector('#zami-hello');
const art = document.querySelector('.hero-art');
let greeting = 0;
let greetingTimer;
const greetings = [
  'Hi, I’m Zami! Ready to make a big idea feel a little smaller?',
  'A wrong answer is a good place to start learning. Let’s find the why.',
  'Ten questions. Five topic areas. Take it one idea at a time.',
  'AWS is our first chapter. There’s more AI learning ahead.'
];
hello?.addEventListener('click', () => {
  document.querySelector('#zami-message').textContent = greetings[greeting % greetings.length];
  greeting++;
  art.classList.remove('greet');
  requestAnimationFrame(() => requestAnimationFrame(() => art.classList.add('greet')));
  clearTimeout(greetingTimer);
  greetingTimer = setTimeout(() => art.classList.remove('greet'), 1900);
});
document.querySelector('#motion-toggle')?.addEventListener('click', event => {
  const paused = document.body.classList.toggle('motion-paused');
  event.currentTarget.setAttribute('aria-pressed', String(paused));
  event.currentTarget.textContent = paused ? 'Play animation' : 'Pause animation';
});

const resume = document.querySelector('[data-resume-link]');
if (resume) {
  try {
    const { state } = loadSession(window.localStorage);
    if (state.answers.length || state.draft) {
      resume.innerHTML = `${state.complete ? 'See my practice results' : 'Continue my practice'} <span aria-hidden="true">↗</span>`;
      const note = document.querySelector('#resume-note');
      note.textContent = state.complete ? 'Your answer review is ready.' : `${state.answers.length} of 10 questions answered. Your place is saved here.`;
      note.hidden = false;
    }
  } catch { /* Practice remains available when browser storage is blocked. */ }
}
