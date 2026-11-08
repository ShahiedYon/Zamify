import './site.js';
const input = document.querySelector('#glossary-search');
const cards = [...document.querySelectorAll('.glossary-card')];
const clear = document.querySelector('#clear-search');
function filterTerms() {
  const words = input.value.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  let count = 0;
  cards.forEach(card => {
    const text = card.dataset.search.toLocaleLowerCase();
    card.hidden = !words.every(word => text.includes(word));
    if (!card.hidden) count++;
  });
  document.querySelector('#search-count').textContent = `${count} of ${cards.length} terms${words.length ? ' match your search' : ' to explore'}`;
  document.querySelector('#no-results').hidden = count !== 0;
  clear.hidden = !input.value;
}
input.value = new URLSearchParams(location.search).get('q') || '';
input.addEventListener('input', filterTerms);
function clearSearch() { input.value = ''; filterTerms(); input.focus(); }
clear.addEventListener('click', clearSearch);
document.querySelector('#show-all-terms').addEventListener('click', clearSearch);
filterTerms();
