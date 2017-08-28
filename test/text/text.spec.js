'use strict';

const {Insert, Delete, snapshot, renderString, createFromOrderer} = require('../../build/text');
const {VectorClock} = require('../../build/order/vector-clock');
const f = require('../../build/functions');
const assert = require('assert');

function createOrderer(id, vector) {
  return new VectorClock(id, vector);
}

describe('text.Text', () => {
  const origin = createOrderer('origin', {origin: 0});

  describe('axioms for ordered inserts', () => {
    let a, b, c;

    beforeEach(() => {
      a = createFromOrderer(createOrderer('a', origin.vector));
      a.apply(new Insert(0, 'abc'));

      b = createFromOrderer(createOrderer('b', origin.vector));
      b.apply(new Insert(0, 'def'));

      c = createFromOrderer(createOrderer('c', origin.vector));
      c.apply(new Insert(0, 'ghi'));
    });

    it('should obey CRDT axioms', () => {
      f.axioms(assert, a, b, c);
    });

    it('should converge to text', () => {
      const merged = f.merge(f.merge(a, b), c);

      assert.equal(renderString(merged), 'ghidefabc');
    });
  });

  describe('axioms for ordered inserts and deletes', () => {
    let a, b, c;

    beforeEach(() => {
      a = createFromOrderer(createOrderer('a', origin.vector));
      a.apply(new Insert(0, 'abc'));
      a.apply(new Delete(0, 1));

      b = createFromOrderer(createOrderer('b', origin.vector));
      b.apply(new Insert(0, 'def'));
      b.apply(new Delete(0, 1));

      c = createFromOrderer(createOrderer('c', origin.vector));
      c.apply(new Insert(0, 'ghi'));
      c.apply(new Delete(0, 1));
    });

    it('should obey CRDT axioms', () => {
      f.axioms(assert, a, b, c);
    });

    it('should converge to text', () => {
      const merged = f.merge(f.merge(a, b), c);

      assert.equal(renderString(merged), 'hiefbc');
    });
  });

  describe('set of complex merging operations (integration more like tests)', () => {
    let a, b;

    it('conflict', () => {
      a = createFromOrderer(createOrderer('a', origin.vector));
      b = createFromOrderer(createOrderer('b', origin.vector));

      assert(a.order.id !== b.order.id);
      assert(!a.order.equal(b.order));

      a.apply(new Insert(0, 'a'));
      b = f.merge(b, a);
      a = snapshot(a);

      assert(a.order.id !== b.order.id);
      assert(!a.order.equal(b.order));

      a.apply(new Insert(1, 'a'));
      b = f.merge(b, a);
      a = snapshot(a);

      assert(a.order.id !== b.order.id);
      assert(!a.order.equal(b.order));

      a.apply(new Insert(2, 'a'));
      b = f.merge(b, a);
      a = snapshot(a);


      assert(a.order.id !== b.order.id);
      assert(!a.order.equal(b.order));

      b.apply(new Insert(3, 'b'));
      a = f.merge(a, b);
      b = snapshot(b);

      assert(a.order.id !== b.order.id);
      assert(!a.order.equal(b.order));

      a.apply(new Insert(0, 'c'));
      b = f.merge(b, a);
      a = snapshot(a);

      assert(a.order.id !== b.order.id);
      assert(!a.order.equal(b.order));

      assert.equal(renderString(a), 'caaab');
      assert.equal(renderString(b), 'caaab');
    });
  });
});
