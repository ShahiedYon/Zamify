import assert from 'node:assert/strict';
import fs from 'node:fs';
import { QUESTIONS } from '../web/questions.js';
import { newSession, normalizeSession, validChoice, isCorrect, scoreSession, loadSession, STORAGE_KEY } from '../web/practice-model.js';

assert.deepEqual(QUESTIONS.map(q => q.id), [1,29,6,10,11,13,45,16,59,65]);
assert.equal(QUESTIONS.length, 10);
assert.deepEqual(new Set(QUESTIONS.map(q => q.kind)), new Set(['single', 'order', 'match', 'multi']));
assert.equal(new Set(QUESTIONS.map(q => q.domain)).size, 5);
for (const question of QUESTIONS) {
  assert.equal(question.reasons.length, question.options.length);
  assert.ok(validChoice(question, question.answer));
  assert.ok(isCorrect(question, question.answer));
  assert.ok(!validChoice(question, -1));
  assert.ok(!validChoice(question, [99]));
  if (question.kind === 'multi') {
    assert.ok(isCorrect(question, [...question.answer].reverse()));
    assert.ok(!validChoice(question, [question.answer[0], question.answer[0]]));
    assert.ok(!validChoice(question, [question.answer[0]]));
  }
  if (['order', 'match'].includes(question.kind)) {
    assert.ok(!isCorrect(question, [...question.answer].reverse()));
    assert.ok(!validChoice(question, [0,0,1,2]));
    assert.ok(validChoice(question, [null, 0, null, 1], false));
  }
  assert.ok(question.source.startsWith('https://docs.aws.amazon.com/'));
  assert.ok(question.hint && question.why && question.trap && question.transfer);
}
const answers = QUESTIONS.map(q => ({id:q.id,choice:q.answer,assisted:false}));
answers[0].assisted = true;
const state = normalizeSession({version:1,index:9,answers,complete:true});
assert.deepEqual(scoreSession(state.answers), {correct:10,unassisted:9,assisted:1});
assert.equal(state.complete,true);
assert.equal(normalizeSession({version:1,answers:answers.slice(0,2),complete:true,index:99}).complete,false);
assert.equal(normalizeSession({version:1,answers:answers.slice(0,2),index:99}).index,2);
assert.equal(normalizeSession({version:1,answers:[{id:999,choice:1}]}).answers.length,0);
assert.deepEqual(normalizeSession(null),newSession());
const saved = new Map();
const storage={getItem:key=>saved.get(key)||null,setItem:(key,value)=>saved.set(key,value)};
storage.setItem(STORAGE_KEY,JSON.stringify(state));
assert.deepEqual(loadSession(storage).state,state);
assert.equal(loadSession({getItem(){throw Error('Storage blocked')}}).available,false);
saved.set(STORAGE_KEY,'bad-json');
assert.deepEqual(loadSession(storage).state,newSession());
const draft=normalizeSession({version:1,answers:[],draft:{id:1,choice:1,hint:true,assisted:false}}).draft;
assert.equal(draft.assisted,true);
const data=fs.readFileSync(new URL('../web/questions.js',import.meta.url),'utf8');
assert.ok(!data.includes('paid_pack'));
console.log('PASS · 10 approved questions, all four formats, grading, assisted scores, resume, invalid data and blocked storage');
