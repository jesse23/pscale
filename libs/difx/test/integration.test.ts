import { ActionType } from '../src/types';
import { diff } from '../src/diff';
import { preview } from '../src/preview';
import { apply } from '../src/apply';
import { view, viewChange } from '../src/view';

describe('integration test', () => {
  it('diff, preview, view, apply for object', () => {
    const patch = diff({ a: 1, b: { c: 3 } }, { a: 2, b: { c: 4 } });
    const change = preview({ a: 1, b: { c: 3 } }, patch);
    const nodes = viewChange(change, {
      defaultTag: 'item',
    });
    expect(change).toStrictEqual({
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

    expect(nodes).toStrictEqual([
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
  // Change:
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
  // Change Nodes:
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
  it('diff, preview, view, apply for complex array', () => {
    const src = [
      {
        id: 'id1',
        name: 'group1',
        users: [
          { id: 'id11', name: 'user11' },
          {
            desc: 'external user',
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
            desc: 'external user',
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

    const opts = {
      reorder: true,
      key: 'id',
      defaultTag: 'groups',
      name: 'name',
    };

    // external use case
    const patch = diff(src, tar, opts);
    const nodes = view(src, patch, opts);
    const result = apply(src, patch, opts);
    // internal use case
    const change = preview(src, patch, opts);
    expect(change).toStrictEqual({
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
                      act: ActionType.NONE,
                      key: 'desc',
                      src: 'external user',
                      tar: 'external user',
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
                    },
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

    expect(nodes).toStrictEqual([
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
                act: ActionType.NONE,
                key: 'desc',
                src: 'external user',
                tar: 'external user',
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
              },
            ],
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
