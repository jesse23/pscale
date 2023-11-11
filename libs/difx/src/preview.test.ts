import { ActionType } from './types';
import { diff } from './diff';
import { preview } from './preview';

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

describe('reordering array', () => {
  it('patch with reordering array', () => {
    const patch = diff([1, 2, 3], [3, 2, 1], { reorder: true });
    const change = preview([1, 2, 3], patch);
    expect(patch).toStrictEqual({
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
        {
          idx: 0,
          key: '1',
          val: 2,
        },
      ],
    });
    expect(change).toStrictEqual({
      act: ActionType.UPDATE,
      key: 'root',
      arr: true,
      sub: [
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
        {
          act: ActionType.NONE,
          key: '1',
          src: 1,
          tar: 1,
          mov: true,
        }
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

  it('preview with reordering object', () => {
    const patch = diff({ a: 1, b: 2, c: 3, d: 5 }, { c: 3, b: 4, a: 1, e:6 }, { reorder: true });
    const change = preview({ a: 1, b: 2, c: 3, d:5 }, patch);
    expect(patch).toStrictEqual({
      [ActionType.ADD]: [
        {
          idx: 3,
          key: 'e',
          val: 6,
        }
      ],
      [ActionType.DELETE]: [
        {
          idx: 3,
          key: 'd',
          val: 5,
        }
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
        {
          idx: 0,
          key: 'a',
          val: 2,
        },
      ],
      [ActionType.UPDATE]: [
        {
          idx: 1,
          key: 'b',
          val: 4,
        },
      ],
    });
    expect(change).toStrictEqual({
      act: ActionType.UPDATE,
      key: 'root',
      sub: [
        {
          act: ActionType.NONE,
          key: 'c',
          src: 3,
          tar: 3,
        },
        {
          act: ActionType.UPDATE,
          key: 'b',
          src: 2,
          tar: 4,
          mov: true,
        },
        {
          act: ActionType.NONE,
          key: 'a',
          src: 1,
          tar: 1,
          mov: true,
        },
        {
          act: ActionType.ADD,
          key: 'e',
          src: undefined,
          tar: 6,
        },
        {
          act: ActionType.DELETE,
          key: 'd',
          src: 5,
          tar: undefined,
        }
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
