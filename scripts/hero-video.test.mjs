import assert from 'node:assert/strict';
import { test } from 'node:test';
import { primeScrollVideo } from '../app/hero-video.ts';

test('decoder initialization returns to the latest scroll position after play resolves', async () => {
  let resolve;
  const events = [];
  let target = 0;
  const pending = primeScrollVideo({play: () => new Promise(r => {resolve = r;}), pause: () => events.push('pause')}, () => true, () => events.push(target));
  target = 5.8;
  resolve();
  assert.equal(await pending, true);
  assert.deepEqual(events, ['pause', 5.8]);
});

test('blocked playback is handled without an unhandled rejection or retry loop', async () => {
  let calls = 0;
  let synced = 0;
  assert.equal(await primeScrollVideo({play: async () => {calls++; throw new Error('NotAllowedError');}, pause: () => assert.fail()}, () => true, () => synced++), false);
  assert.equal(calls, 1);
  assert.equal(synced, 1);
});

test('navigation, manual takeover or reduced motion while awaiting play prevents stale pause and seek', async () => {
  let active = true;
  let resolve;
  const pending = primeScrollVideo({play: () => new Promise(r => {resolve = r;}), pause: () => assert.fail()}, () => active, () => assert.fail());
  active = false;
  resolve();
  assert.equal(await pending, false);
});

test('inactive or reduced-motion initialization never starts playback', async () => {
  assert.equal(await primeScrollVideo({play: () => assert.fail(), pause: () => assert.fail()}, () => false, () => assert.fail()), false);
});
