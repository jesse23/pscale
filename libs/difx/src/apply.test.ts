import { diff } from './diff';
import { apply } from './apply';

describe('apply patch array', () => {
  it('apply patch array', () => {
    const patch = diff([1, 2, 3], [1, 4, 3]);
    expect(apply([1, 2, 3], patch)).toStrictEqual([1, 4, 3]);
  });

  it('apply patch array on different source', () => {
    const patch = diff([1, 2, 3], [1, 4, 3]);
    expect(apply([1], patch)).toStrictEqual([1, 4]);
  });
});

describe('apply patch object', () => {
  it('apply patch object', () => {
    const patch = diff({ a: 1, b: 2, c: 3 }, { a: 1, d: 2, c: 3 });
    expect(apply({ a: 1, b: 2, c: 3 }, patch)).toStrictEqual({
      a: 1,
      d: 2,
      c: 3,
    });
  });

  it('apply patch object on different source', () => {
    const patch = diff({ a: 1, b: 2, c: 3 }, { a: 1, d: 2, c: 3 });
    expect(apply({ a: 2 }, patch)).toStrictEqual({
      a: 2,
      d: 2,
    });
  });

  it('apply patch object with nested patch', () => {
    const patch = diff({ a: 1, b: { c: 3 } }, { a: 2, b: { c: 4 } });
    expect(apply({ a: 1, b: { c: 3 } }, patch)).toStrictEqual({
      a: 2,
      b: { c: 4 },
    });
  });
});