/* global it, describe */
import assert from 'assert';

import { eReducer, entropyToHex, getEntropy } from '../../screen/wallets/entropy';

describe('Entropy reducer and format', () => {
  it('handles push and pop correctly', () => {
    let state = eReducer(undefined, { type: null });
    assert.equal(entropyToHex(state), '0x');

    state = eReducer(state, { type: 'push', value: 0, bits: 1 });
    assert.equal(entropyToHex(state), '0x0');

    state = eReducer(state, { type: 'push', value: 0, bits: 1 });
    assert.equal(entropyToHex(state), '0x0');

    state = eReducer(state, { type: 'push', value: 0, bits: 3 });
    assert.equal(entropyToHex(state), '0x00');

    state = eReducer(state, { type: 'pop' });
    assert.equal(entropyToHex(state), '0x0');

    state = eReducer(state, { type: 'pop' });
    state = eReducer(state, { type: 'pop' });
    assert.equal(entropyToHex(state), '0x');

    state = eReducer(state, { type: 'push', value: 1, bits: 1 });
    assert.equal(entropyToHex(state), '0x1'); // 0b1

    state = eReducer(state, { type: 'push', value: 0, bits: 1 });
    assert.equal(entropyToHex(state), '0x2'); // 0b10

    state = eReducer(state, { type: 'push', value: 0b01, bits: 2 });
    assert.equal(entropyToHex(state), '0x9'); // 0b1001

    state = eReducer(state, { type: 'push', value: 0b10, bits: 2 });
    assert.equal(entropyToHex(state), '0x26'); // 0b100110
  });

  it('handles 128 bits correctly', () => {
    const state = eReducer(undefined, { type: 'push', value: 0, bits: 128 });
    assert.equal(entropyToHex(state), '0x00000000000000000000000000000000');
  });

  it('handles 256 bits correctly', () => {
    let state = eReducer(undefined, { type: null }); // get init state

    // eslint-disable-next-line no-unused-vars
    for (const i of [...Array(256)]) {
      state = eReducer(state, { type: 'push', value: 1, bits: 1 });
    }
    assert.equal(entropyToHex(state), '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
  });

  it('handles pop when empty without error', () => {
    const state = eReducer(undefined, { type: 'pop' });
    assert.equal(entropyToHex(state), '0x');
  });

  it('Throws error if you try to push value exceeding size in bits', () => {
    assert.throws(() => eReducer(undefined, { type: 'push', value: 8, bits: 3 }), {
      name: 'TypeError',
      message: "Can't push value exceeding size in bits",
    });
  });
});

describe('getEntropy function', () => {
  it('handles coin', () => {
    assert.deepEqual(getEntropy(0, 2), { value: 0, bits: 1 });
    assert.deepEqual(getEntropy(1, 2), { value: 1, bits: 1 });
  });

  it('handles 6 sides dice', () => {
    assert.deepEqual(getEntropy(0, 6), { value: 0, bits: 2 });
    assert.deepEqual(getEntropy(1, 6), { value: 1, bits: 2 });
    assert.deepEqual(getEntropy(2, 6), { value: 2, bits: 2 });
    assert.deepEqual(getEntropy(3, 6), { value: 3, bits: 2 });
    assert.deepEqual(getEntropy(4, 6), { value: 0, bits: 1 });
    assert.deepEqual(getEntropy(5, 6), { value: 1, bits: 1 });
  });

  it('handles odd numbers', () => {
    assert.deepEqual(getEntropy(0, 3), { value: 0, bits: 1 });
    assert.deepEqual(getEntropy(1, 3), { value: 1, bits: 1 });
    assert.deepEqual(getEntropy(2, 3), null);
  });
});
