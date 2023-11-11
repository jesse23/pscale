import { ActionType } from './types';
import { diff } from './diff';
import { preview } from './preview';
import { apply } from './apply';

/**
 * test diff
 */
describe('diff array', () => {
  it('add and delete element', () => {
    expect(diff([1, 2, 3], [1, 4, 3])).toStrictEqual({
      [ActionType.DELETE]: [
        {
          idx: 1,
          key: '2',
          val: 2,
        },
      ],
      [ActionType.ADD]: [
        {
          idx: 1,
          key: '4',
          val: 4,
        },
      ],
    });
  });
});

describe('diff object', () => {
  it('add and delete attribute', () => {
    const patch = diff({ a: 1, b: 2, c: 3 }, { a: 1, d: 2, c: 3 });
    expect(patch).toStrictEqual({
      [ActionType.DELETE]: [
        {
          idx: 1,
          key: 'b',
          val: 2,
        },
      ],
      [ActionType.ADD]: [
        {
          idx: 1,
          key: 'd',
          val: 2,
        },
      ],
    });
  });

  it('update and patch attribute', () => {
    expect(diff({ a: 1, b: { c: 3 } }, { a: 2, b: { c: 4 } })).toStrictEqual({
      [ActionType.MERGE]: [
        {
          idx: 1,
          key: 'b',
          val: {
            [ActionType.UPDATE]: [
              {
                idx: 0,
                key: 'c',
                val: 4,
              },
            ],
          },
        },
      ],
      [ActionType.UPDATE]: [
        {
          idx: 0,
          key: 'a',
          val: 2,
        },
      ],
    });
  });
});

/**
 * test preview
 */
describe('preview patch array', () => {
  it('preview patch on same array', () => {
    const patch = diff([1, 2], [1, 2]);
    expect(preview([1, 2], patch)).toStrictEqual({
      act: ActionType.NONE,
      key: 'root',
      arr: true,
      sub: [
        {
          act: ActionType.NONE,
          key: '1',
          src: 1,
          tar: 1,
        },
        {
          act: ActionType.NONE,
          key: '2',
          src: 2,
          tar: 2,
        },
      ],
    });
  });
  it('preview patch array', () => {
    const patch = diff([1, 2, 3], [1, 4, 3]);
    expect(preview([1, 2, 3], patch)).toStrictEqual({
      act: ActionType.UPDATE,
      key: 'root',
      arr: true,
      sub: [
        {
          act: ActionType.NONE,
          key: '1',
          src: 1,
          tar: 1,
        },
        {
          act: ActionType.ADD,
          key: '4',
          src: undefined,
          tar: 4,
        },
        {
          act: ActionType.DELETE,
          key: '2',
          src: 2,
          tar: undefined,
        },
        {
          act: ActionType.NONE,
          key: '3',
          src: 3,
          tar: 3,
        },
      ],
    });
  });

  it('preview patch array on different source', () => {
    const patch = diff([1, 2, 3], [1, 4, 3]);
    expect(preview([1], patch)).toStrictEqual({
      act: ActionType.UPDATE,
      key: 'root',
      arr: true,
      sub: [
        {
          act: ActionType.NONE,
          key: '1',
          src: 1,
          tar: 1,
        },
        {
          act: ActionType.ADD,
          key: '4',
          src: undefined,
          tar: 4,
        },
      ],
    });
  });
});

describe('preview patch object', () => {
  it('preview patch object', () => {
    const patch = diff({ a: 1, b: 2, c: 3 }, { a: 1, d: 2, c: 3 });
    expect(preview({ a: 1, b: 2, c: 3 }, patch)).toStrictEqual({
      act: ActionType.UPDATE,
      key: 'root',
      sub: [
        {
          act: ActionType.NONE,
          key: 'a',
          src: 1,
          tar: 1,
        },
        {
          act: ActionType.ADD,
          key: 'd',
          src: undefined,
          tar: 2,
        },
        {
          act: ActionType.DELETE,
          key: 'b',
          src: 2,
          tar: undefined,
        },
        {
          act: ActionType.NONE,
          key: 'c',
          src: 3,
          tar: 3,
        },
      ],
    });
  });

  it('preview patch array on different source', () => {
    const patch = diff({ a: 1, b: 2, c: 3 }, { a: 1, d: 2, c: 3 });
    expect(preview({ a: 2 }, patch)).toStrictEqual({
      act: ActionType.UPDATE,
      key: 'root',
      sub: [
        {
          act: ActionType.NONE,
          key: 'a',
          src: 2,
          tar: 2,
        },
        {
          act: ActionType.ADD,
          key: 'd',
          src: undefined,
          tar: 2,
        },
      ],
    });
  });

  it('preview patch object with array attr value', () => {
    const patch = diff({ a: 1, b: [1, 2] }, { a: 1, b: [2] });
    expect(preview({ a: 1, b: [1, 2] }, patch)).toStrictEqual({
      act: ActionType.UPDATE,
      key: 'root',
      sub: [
        {
          act: ActionType.NONE,
          key: 'a',
          src: 1,
          tar: 1,
        },
        {
          act: ActionType.UPDATE,
          key: 'b',
          arr: true,
          sub: [
            {
              act: ActionType.DELETE,
              key: '1',
              src: 1,
              tar: undefined,
            },
            {
              act: ActionType.NONE,
              key: '2',
              src: 2,
              tar: 2,
            },
          ],
        },
      ],
    });
  });
});

describe('apply patch array', () => {
  it('apply patch', () => {
    const patch = diff([1, 2, 3], [1, 4, 3]);
    expect(apply([1, 2, 3], patch)).toStrictEqual([1, 4, 3]);
  });

  it('apply patch array on different source', () => {
    const patch = diff([1, 2, 3], [1, 4, 3]);
    expect(apply([1], patch)).toStrictEqual([1, 4]);
  });
});

describe('apply patch array', () => {
  it('apply patch', () => {
    const patch = diff({ a: 1, b: 2, c: 3 }, { a: 1, d: 2, c: 3 });
    expect(apply({ a: 1, b: 2, c: 3 }, patch)).toStrictEqual({
      a: 1,
      d: 2,
      c: 3,
    });
  });

  it('apply patch array on different source', () => {
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

describe('reordering array', () => {
  it('diff with reordering array', () => {
    expect(diff([1, 2, 3], [3, 2], { reorder: true })).toStrictEqual({
      [ActionType.DELETE]: [
        {
          idx: 0,
          key: '1',
          val: 1,
        },
      ],
      [ActionType.REORDER]: [
        {
          idx: 2,
          key: '3',
          val: 0,
        },
        {
          idx: 1,
          key: '2',
          val: 1,
        },
      ],
    });
  });

  it('patch with reordering array', () => {
    const patch = diff([1, 2, 3], [3, 2], { reorder: true });
    expect(preview([1, 2, 3], patch)).toStrictEqual({
      act: ActionType.UPDATE,
      key: 'root',
      arr: true,
      sub: [
        {
          act: ActionType.DELETE,
          key: '1',
          src: 1,
          tar: undefined,
        },
        {
          act: ActionType.NONE,
          key: '3',
          src: 3,
          tar: 3,
        },
        {
          act: ActionType.NONE,
          key: '2',
          src: 2,
          tar: 2,
          mov: true,
        },
      ],
    });
  });

  it('patch with reordering array on different source', () => {
    const patch = diff([1, 2, 3], [3, 2], { reorder: true });
    expect(preview([1, 2, 4], patch)).toStrictEqual({
      act: ActionType.UPDATE,
      key: 'root',
      arr: true,
      sub: [
        {
          act: ActionType.DELETE,
          key: '1',
          src: 1,
          tar: undefined,
        },
        {
          act: ActionType.NONE,
          key: '2',
          src: 2,
          tar: 2,
        },
        {
          act: ActionType.NONE,
          key: '4',
          src: 4,
          tar: 4,
        },
      ],
    });
  });

  it('patch with reordering array on different source with new in source', () => {
    const patch = diff([1, 2, 3], [3, 2], { reorder: true });
    expect(preview([1, 3, 4, 2], patch)).toStrictEqual({
      act: ActionType.UPDATE,
      key: 'root',
      arr: true,
      sub: [
        {
          act: ActionType.DELETE,
          key: '1',
          src: 1,
          tar: undefined,
        },
        {
          act: ActionType.NONE,
          key: '3',
          src: 3,
          tar: 3,
        },
        {
          act: ActionType.NONE,
          key: '4',
          src: 4,
          tar: 4,
        },
        {
          act: ActionType.NONE,
          key: '2',
          src: 2,
          tar: 2,
        },
      ],
    });
  });
});

describe('reordering object attribute', () => {
  it('diff with reordering object attribute', () => {
    expect(
      diff({ a: 1, b: 2, c: 3 }, { c: 3, b: 2 }, { reorder: true })
    ).toStrictEqual({
      [ActionType.DELETE]: [
        {
          idx: 0,
          key: 'a',
          val: 1,
        },
      ],
      [ActionType.REORDER]: [
        {
          idx: 2,
          key: 'c',
          val: 0,
        },
        {
          idx: 1,
          key: 'b',
          val: 1,
        },
      ],
    });
  });

  it('preview with reordering array', () => {
    const patch = diff({ a: 1, b: 2, c: 3 }, { c: 3, b: 2 }, { reorder: true });
    expect(preview({ a: 1, b: 2, c: 3 }, patch)).toStrictEqual({
      act: ActionType.UPDATE,
      key: 'root',
      sub: [
        {
          act: ActionType.DELETE,
          key: 'a',
          src: 1,
          tar: undefined,
        },
        {
          act: ActionType.NONE,
          key: 'c',
          src: 3,
          tar: 3,
        },
        {
          act: ActionType.NONE,
          key: 'b',
          src: 2,
          tar: 2,
          mov: true,
        },
      ],
    });
  });

  it('preview with reordering array on different source', () => {
    const patch = diff({ a: 1, b: 2, c: 3 }, { c: 3, b: 2 }, { reorder: true });
    expect(preview({ a: 1, b: 2, d: 4 }, patch)).toStrictEqual({
      act: ActionType.UPDATE,
      key: 'root',
      sub: [
        {
          act: ActionType.DELETE,
          key: 'a',
          src: 1,
          tar: undefined,
        },
        {
          act: ActionType.NONE,
          key: 'b',
          src: 2,
          tar: 2,
        },
        {
          act: ActionType.NONE,
          key: 'd',
          src: 4,
          tar: 4,
        },
      ],
    });
  });

  it('preview with reordering array on different source with new in source', () => {
    const patch = diff({ a: 1, b: 2, c: 3 }, { c: 3, b: 2 }, { reorder: true });
    expect(preview({ a: 1, c: 3, d: 4, b: 2 }, patch)).toStrictEqual({
      act: ActionType.UPDATE,
      key: 'root',
      sub: [
        {
          act: ActionType.DELETE,
          key: 'a',
          src: 1,
          tar: undefined,
        },
        {
          act: ActionType.NONE,
          key: 'c',
          src: 3,
          tar: 3,
        },
        {
          act: ActionType.NONE,
          key: 'd',
          src: 4,
          tar: 4,
        },
        {
          act: ActionType.NONE,
          key: 'b',
          src: 2,
          tar: 2,
        },
      ],
    });
  });
});
