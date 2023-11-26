import {
  groupByStartType,
  parseTransformRules,
  parseTrvRule,
  validateTraversalExpr,
  parseExpr,
} from './parse';

describe('parseTrvRule', () => {
  it('test parseTrvRule', () => {
    // A<b1.B.b2>C<d.D.d2>E.e => A<b1.B|B.b2>C|C<d.D|D.d2>E|E.e
    // A.a>B.b => A.a>B|B.b
    expect(parseTrvRule('Item.attr>Sku.desc')).toStrictEqual([
      { vs: 'Item', eg: 'attr', ve: 'Sku' },
      { vs: 'Sku', eg: 'desc' },
    ]);
  });

  it('test parseTrvRule (refBy)', () => {
    // A<b1.B.b2>C<d.D.d2>E.e => A<b1.B|B.b2>C|C<d.D|D.d2>E|E.e
    // A.a>B.b => A.a>B|B.b
    expect(parseTrvRule('A<b1.B.b2>C<d1.D.d2>E.e')).toStrictEqual([
      { vs: 'A', eg: 'b1', ve: 'B', refBy: true },
      { vs: 'B', eg: 'b2', ve: 'C' },
      { vs: 'C', eg: 'd1', ve: 'D', refBy: true },
      { vs: 'D', eg: 'd2', ve: 'E' },
      { vs: 'E', eg: 'e' },
    ]);
  });
});

describe('validateTraversalExpr', () => {
  it('test validateTraversalExpr (true)', () => {
    // A<b1.B.b2>C<d.D.d2>E.e => A<b1.B|B.b2>C|C<d.D|D.d2>E|E.e
    // A.a>B.b => A.a>B|B.b
    expect(
      validateTraversalExpr(['Item', '.', 'attr', '>', 'Sku', '.', 'desc'])
    ).toBeTruthy();
  });

  it('test validateSubExpr (false)', () => {
    // A<b1.B.b2>C<d.D.d2>E.e => A<b1.B|B.b2>C|C<d.D|D.d2>E|E.e
    // A.a>B.b => A.a>B|B.b
    expect(
      validateTraversalExpr(['.', 'attr', '>', 'Sku', '.', 'desc'])
    ).toBeFalsy();
  });
});

describe('rule parser testing', () => {
  it('test groupByStartType', () => {
    const rules = [
      {
        act: 'transform',
        src: 'product',
        tar: 'item',
      },
      {
        act: 'transform',
        src: 'product.id',
        tar: 'item.id',
      },
      {
        act: 'transform',
        src: 'product.name',
        tar: 'item.internal_name',
      },
      {
        act: 'transform',
        src: 'product.owner>user.name',
        tar: 'item.owned_by',
      },
    ];

    expect(groupByStartType(parseTransformRules(rules))).toStrictEqual([
      [
        {
          src: [
            {
              vs: 'product',
            },
          ],
          tar: [
            {
              vs: 'item',
            },
          ],
          func: '',
          cond: '',
        },
        {
          src: [
            {
              vs: 'product',
              eg: 'id',
            },
          ],
          tar: [
            {
              vs: 'item',
              eg: 'id',
            },
          ],
          func: '',
          cond: '',
        },
        {
          src: [
            {
              vs: 'product',
              eg: 'name',
            },
          ],
          tar: [
            {
              vs: 'item',
              eg: 'internal_name',
            },
          ],
          func: '',
          cond: '',
        },
        {
          src: [
            {
              vs: 'product',
              eg: 'owner',
              ve: 'user',
            },
            {
              vs: 'user',
              eg: 'name',
            },
          ],
          tar: [
            {
              vs: 'item',
              eg: 'owned_by',
            },
          ],
          func: '',
          cond: '',
        },
      ],
    ]);
  });

  it('test parseTransformRules', () => {
    const rules = [
      {
        act: 'mutation',
        src: 'product.name',
        tar: 'product.internal_name',
      },
      {
        act: 'mutation',
        src: 'product.owner>user.name',
        tar: 'product.owned_by',
      },
      {
        act: 'mutation',
        src: 'user.name',
        tar: 'user.alias',
      },
    ];

    expect(parseTransformRules(rules)).toStrictEqual([
      {
        src: [
          {
            vs: 'product',
            eg: 'name',
          },
        ],
        tar: [
          {
            vs: 'product',
            eg: 'internal_name',
          },
        ],
        func: '',
        cond: '',
      },
      {
        src: [
          {
            vs: 'product',
            eg: 'owner',
            ve: 'user',
          },
          {
            vs: 'user',
            eg: 'name',
          },
        ],
        tar: [
          {
            vs: 'product',
            eg: 'owned_by',
          },
        ],
        func: '',
        cond: '',
      },
      {
        src: [
          {
            vs: 'user',
            eg: 'name',
          },
        ],
        tar: [
          {
            vs: 'user',
            eg: 'alias',
          },
        ],
        func: '',
        cond: '',
      },
    ]);
  });
});

describe('parseExpr testing', () => {
  it('test parseExpr with no traversal', () => {
    expect(parseExpr("'b' === true", 'A')).toStrictEqual("'b' === true");
  });

  it('test parseExpr at one side', () => {
    expect(parseExpr("A.a == 'b'", 'A')).toStrictEqual(
      "trv($src, 'A.a') == 'b'"
    );
  });

  it('test parseExpr at both side', () => {
    expect(parseExpr('A.a == A.b', 'A')).toStrictEqual(
      "trv($src, 'A.a') == trv($src, 'A.b')"
    );
  });

  it('test parseExpr with class mentioned in quote', () => {
    expect(parseExpr('A.a == \'h A h\' + "h A "', 'A')).toStrictEqual(
      "trv($src, 'A.a') == 'h A h' + \"h A \""
    );
  });
});
