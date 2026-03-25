import { Deck } from '../lib/deck.js';

function assert(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed');
}

async function run() {
  console.log('Running deck smoke tests...');
  const seed = 123456;
  const d1 = new Deck(seed);
  const d2 = new Deck(seed);

  d1.shuffle();
  d2.shuffle();

  assert(Array.isArray(d1.cards || d1.cards === undefined) || typeof d1.length === 'number', 'Deck shape unexpected');

  console.log('d1 length:', d1.length);
  console.log('Top card d1:', d1.peek());

  // small operations
  const topMoved = d1.smallTop();
  assert(topMoved.length >= 3 && topMoved.length <= 7, 'smallTop moved count out of range');

  const c = d1.dealOne();
  assert(c.card, 'dealOne returned no card');

  console.log('All smoke checks passed.');
}

run().catch(err => {
  console.error('Smoke tests failed:', err);
  process.exit(1);
});
