/* eslint-env jest */

import { ActionType, apply, preview, diff, toPreviewNodeList } from './diff';

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

  it('preview patch object with nested patch', () => {
    const patch = diff({ a: 1, b: { c: 3 } }, { a: 2, b: { c: 4 } });
    const previews = preview({ a: 1, b: { c: 3 } }, patch);
    const previewNode = toPreviewNodeList(previews, {
      tag: 'item',
    });
    expect(previews).toStrictEqual({
      act: ActionType.UPDATE,
      key: 'root',
      sub: [
        {
          act: ActionType.UPDATE,
          key: 'a',
          src: 1,
          tar: 2,
        },
        {
          act: ActionType.UPDATE,
          key: 'b',
          sub: [
            {
              act: ActionType.UPDATE,
              key: 'c',
              src: 3,
              tar: 4,
            },
          ],
        },
      ],
    });

    expect(previewNode).toStrictEqual([
      {
        tag: 'item',
        act: ActionType.UPDATE,
        src: '<object>',
        tar: '<object>',
        att: [
          {
            act: ActionType.UPDATE,
            key: 'a',
            src: 1,
            tar: 2,
          },
        ],
        sub: [
          {
            tag: 'b',
            act: ActionType.UPDATE,
            src: '<object>',
            tar: '<object>',
            att: [
              {
                act: ActionType.UPDATE,
                key: 'c',
                src: 3,
                tar: 4,
              },
            ],
          },
        ],
      },
    ]);
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
          idx: 1,
          key: '2',
          val: 1,
        },
        {
          idx: 2,
          key: '3',
          val: 0,
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
          idx: 1,
          key: 'b',
          val: 1,
        },
        {
          idx: 2,
          key: 'c',
          val: 0,
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

  // - root | <array>
  //   - id1 | <object>
  //     - id | id1 | id1
  //     - name | group1 | group1_new
  //     - users | <array>
  //       - id11 | <object>
  //         - id | id11 | undefined
  //         - name | user11 | undefined
  //       - id12 | <object>
  //         - id | id12 | id12
  //         - name | user12 | user12_new
  // .     - val | val | val
  //     - team | <object>
  //       - id | team1 | team1
  //       - name | team1 | team1
  //   - id2 | <object>
  //     - id | id2 | undefined
  //     - name | group2 | undefined
  //
  // =====>
  //
  // - root
  //   - group 1   | <root>  => update
  //     - user 11 | users   =>   delete
  //     - user 12 | users   =>   update
  //     - user 13 | users   =>   add
  //       - role1 | role    =>   none
  //   - group 2   | <root>  => delete
  //     - user 21 | users   =>   delete
  //     - user 22 | users   =>   delete
  //   - group 3   | <root>  => add
  //     - user 31 | users   =>   add
  //
  it('preview with complex real object', () => {
    const src = [
      {
        id: 'id1',
        name: 'group1',
        users: [
          { id: 'id11', name: 'user11' },
          {
            name: 'user12',
            id: 'id12',
            external: true,
            role: {
              id: 'admin',
              name: 'Agent Smith',
            },
          },
          { id: 'id13', name: 'user13' },
        ],
      },
      {
        id: 'id2',
        name: 'group2',
        users: [
          { id: 'id21', name: 'user21' },
          { id: 'id22', name: 'user22' },
        ],
      },
    ];

    const tar = [
      {
        id: 'id1',
        name: 'group1_new',
        users: [
          {
            id: 'id12',
            name: 'user12_new',
            modifiable: false,
            role: {
              id: 'admin',
              name: 'NEO the One',
            },
          },
          { id: 'id11', name: 'user11' },
          { id: 'id14', name: 'user14' },
        ], 
      },
      {
        id: 'id3',
        name: 'group3',
        users: [{ id: 'id31', name: 'user31' }],
      },
    ];
    const opts = { reorder: true, getKey: (val) => val?.id };
    const patch = diff(src, tar, opts);
    const previews = preview(src, patch, opts);
    const previewNode = toPreviewNodeList(previews, {
      tag: 'groups',
      name: 'name',
    });
    const result = apply(src, patch, opts);
    expect(previews).toStrictEqual({
      act: ActionType.UPDATE,
      key: 'root',
      arr: true,
      sub: [
        {
          act: ActionType.UPDATE,
          key: 'id1',
          sub: [
            {
              act: ActionType.NONE,
              key: 'id',
              src: 'id1',
              tar: 'id1',
            },
            {
              act: ActionType.UPDATE,
              key: 'name',
              src: 'group1',
              tar: 'group1_new',
            },
            {
              act: ActionType.UPDATE,
              key: 'users',
              arr: true,
              sub: [
                {
                  act: ActionType.UPDATE,
                  key: 'id12',
                  // TODO: better to be user12 which is name
                  sub: [
                    {
                      act: ActionType.NONE,
                      key: 'id',
                      src: 'id12',
                      tar: 'id12',
                    },
                    {
                      act: ActionType.UPDATE,
                      key: 'name',
                      src: 'user12',
                      tar: 'user12_new',
                      mov: true,
                    },
                    {
                      act: ActionType.ADD,
                      key: 'modifiable',
                      src: undefined,
                      tar: false,
                    },
                    {
                      act: ActionType.DELETE,
                      key: 'external',
                      src: true,
                      tar: undefined,
                    },
                    {
                      act: ActionType.UPDATE,
                      key: 'role',
                      sub: [
                        {
                          act: ActionType.NONE,
                          key: 'id',
                          src: 'admin',
                          tar: 'admin',
                        },
                        {
                          act: ActionType.UPDATE,
                          key: 'name',
                          src: 'Agent Smith',
                          tar: 'NEO the One',
                        },
                      ],
                    }
                  ],
                },
                {
                  act: ActionType.NONE,
                  key: 'id11',
                  mov: true,
                  sub: [
                    {
                      act: ActionType.NONE,
                      key: 'id',
                      src: 'id11',
                      tar: 'id11',
                    },
                    {
                      act: ActionType.NONE,
                      key: 'name',
                      src: 'user11',
                      tar: 'user11',
                    },
                  ],
                },
                {
                  act: ActionType.ADD,
                  key: 'id14',
                  sub: [
                    {
                      act: ActionType.ADD,
                      key: 'id',
                      src: undefined,
                      tar: 'id14',
                    },
                    {
                      act: ActionType.ADD,
                      key: 'name',
                      src: undefined,
                      tar: 'user14',
                    },
                  ],
                },
                {
                  act: ActionType.DELETE,
                  key: 'id13',
                  sub: [
                    {
                      act: ActionType.DELETE,
                      key: 'id',
                      src: 'id13',
                      tar: undefined,
                    },
                    {
                      act: ActionType.DELETE,
                      key: 'name',
                      src: 'user13',
                      tar: undefined,
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          act: ActionType.ADD,
          key: 'id3',
          sub: [
            {
              act: ActionType.ADD,
              key: 'id',
              src: undefined,
              tar: 'id3',
            },
            {
              act: ActionType.ADD,
              key: 'name',
              src: undefined,
              tar: 'group3',
            },
            {
              act: ActionType.ADD,
              key: 'users',
              arr: true,
              sub: [
                {
                  act: ActionType.ADD,
                  key: 'id31',
                  sub: [
                    {
                      act: ActionType.ADD,
                      key: 'id',
                      src: undefined,
                      tar: 'id31',
                    },
                    {
                      act: ActionType.ADD,
                      key: 'name',
                      src: undefined,
                      tar: 'user31',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          act: ActionType.DELETE,
          key: 'id2',
          sub: [
            {
              act: ActionType.DELETE,
              key: 'id',
              src: 'id2',
              tar: undefined,
            },
            {
              act: ActionType.DELETE,
              key: 'name',
              src: 'group2',
              tar: undefined,
            },
            {
              act: ActionType.DELETE,
              key: 'users',
              arr: true,
              sub: [
                {
                  act: ActionType.DELETE,
                  key: 'id21',
                  sub: [
                    {
                      act: ActionType.DELETE,
                      key: 'id',
                      src: 'id21',
                      tar: undefined,
                    },
                    {
                      act: ActionType.DELETE,
                      key: 'name',
                      src: 'user21',
                      tar: undefined,
                    },
                  ],
                },
                {
                  act: ActionType.DELETE,
                  key: 'id22',
                  sub: [
                    {
                      act: ActionType.DELETE,
                      key: 'id',
                      src: 'id22',
                      tar: undefined,
                    },
                    {
                      act: ActionType.DELETE,
                      key: 'name',
                      src: 'user22',
                      tar: undefined,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    expect(previewNode).toStrictEqual([
      {
        tag: 'groups',
        act: ActionType.UPDATE,
        src: 'group1',
        tar: 'group1_new',
        att: [
          { act: ActionType.NONE, key: 'id', src: 'id1', tar: 'id1' },
          {
            act: ActionType.UPDATE,
            key: 'name',
            src: 'group1',
            tar: 'group1_new',
          },
        ],
        sub: [
          {
            tag: 'users',
            act: ActionType.UPDATE,
            src: 'user12',
            tar: 'user12_new',
            att: [
              { act: ActionType.NONE, key: 'id', src: 'id12', tar: 'id12' },
              {
                act: ActionType.UPDATE,
                key: 'name',
                src: 'user12',
                tar: 'user12_new',
                mov: true,
              },
              {
                act: ActionType.ADD,
                key: 'modifiable',
                src: undefined,
                tar: false,
              },
              {
                act: ActionType.DELETE,
                key: 'external',
                src: true,
                tar: undefined,
              },
            ],
            sub: [
              {
                tag: 'role',
                act: ActionType.UPDATE,
                src: 'Agent Smith',
                tar: 'NEO the One',
                att: [
                  {
                    act: ActionType.NONE,
                    key: 'id',
                    src: 'admin',
                    tar: 'admin',
                  },
                  {
                    act: ActionType.UPDATE,
                    key: 'name',
                    src: 'Agent Smith',
                    tar: 'NEO the One',
                  },
                ],
              }
            ]
          },
          {
            tag: 'users',
            act: ActionType.NONE,
            src: 'user11',
            tar: 'user11',
            mov: true,
            att: [
              { act: ActionType.NONE, key: 'id', src: 'id11', tar: 'id11' },
              {
                act: ActionType.NONE,
                key: 'name',
                src: 'user11',
                tar: 'user11',
              },
            ],
          },
          {
            tag: 'users',
            act: ActionType.ADD,
            src: undefined,
            tar: 'user14',
            att: [
              { act: ActionType.ADD, key: 'id', src: undefined, tar: 'id14' },
              {
                act: ActionType.ADD,
                key: 'name',
                src: undefined,
                tar: 'user14',
              },
            ],
          },
          {
            tag: 'users',
            act: ActionType.DELETE,
            src: 'user13',
            tar: undefined,
            att: [
              {
                act: ActionType.DELETE,
                key: 'id',
                src: 'id13',
                tar: undefined,
              },
              {
                act: ActionType.DELETE,
                key: 'name',
                src: 'user13',
                tar: undefined,
              },
            ],
          },
        ],
      },
      {
        tag: 'groups',
        act: ActionType.ADD,
        src: undefined,
        tar: 'group3',
        att: [
          { act: ActionType.ADD, key: 'id', src: undefined, tar: 'id3' },
          { act: ActionType.ADD, key: 'name', src: undefined, tar: 'group3' },
        ],
        sub: [
          {
            tag: 'users',
            act: ActionType.ADD,
            src: undefined,
            tar: 'user31',
            att: [
              { act: ActionType.ADD, key: 'id', src: undefined, tar: 'id31' },
              {
                act: ActionType.ADD,
                key: 'name',
                src: undefined,
                tar: 'user31',
              },
            ],
          },
        ],
      },
      {
        tag: 'groups',
        act: ActionType.DELETE,
        src: 'group2',
        tar: undefined,
        att: [
          { act: ActionType.DELETE, key: 'id', src: 'id2', tar: undefined },
          {
            act: ActionType.DELETE,
            key: 'name',
            src: 'group2',
            tar: undefined,
          },
        ],
        sub: [
          {
            tag: 'users',
            act: ActionType.DELETE,
            src: 'user21',
            tar: undefined,
            att: [
              {
                act: ActionType.DELETE,
                key: 'id',
                src: 'id21',
                tar: undefined,
              },
              {
                act: ActionType.DELETE,
                key: 'name',
                src: 'user21',
                tar: undefined,
              },
            ],
          },
          {
            tag: 'users',
            act: ActionType.DELETE,
            src: 'user22',
            tar: undefined,
            att: [
              {
                act: ActionType.DELETE,
                key: 'id',
                src: 'id22',
                tar: undefined,
              },
              {
                act: ActionType.DELETE,
                key: 'name',
                src: 'user22',
                tar: undefined,
              },
            ],
          },
        ],
      },
    ]);

    expect(result).toStrictEqual(tar);
  });
});
