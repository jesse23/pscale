import { KEY_CHILD, KEY_ROOT, KEY_TEXT } from './const';
import { purifyGraph } from './graph';
import { fromXML, toXML } from './xml';

describe('fromXML(elem_as_object)', () => {
  it('test fromXML(elem_as_object) for attribute and text', () => {
    expect(purifyGraph(fromXML(['<item a="b">text</item>']))).toStrictEqual({
      item: [
        {
          a: 'b',
          [KEY_TEXT]: 'text',
        },
      ],
    });
  });

  it('test fromXML(elem_as_object) for child element', () => {
    expect(
      purifyGraph(
        fromXML([
          '<item a="b"><item c="d">text</item><item e="f">text</item></item>',
        ])
      )
    ).toStrictEqual({
      item: [
        {
          a: 'b',
          [KEY_CHILD]: [
            {
              c: 'd',
              [KEY_TEXT]: 'text',
            },
            {
              e: 'f',
              [KEY_TEXT]: 'text',
            },
          ],
        },
        {
          c: 'd',
          [KEY_TEXT]: 'text',
        },
        {
          e: 'f',
          [KEY_TEXT]: 'text',
        },
      ],
    });
  });

  it('test fromXML(elem_as_object) for nested xml', () => {
    expect(
      purifyGraph(fromXML(['<a a="a"><b b="b"><c c="c"></c></b></a>']))
    ).toStrictEqual({
      a: [
        {
          a: 'a',
          [KEY_CHILD]: {
            b: 'b',
            [KEY_CHILD]: {
              c: 'c',
            },
          },
        },
      ],
      b: [
        {
          b: 'b',
          [KEY_CHILD]: {
            c: 'c',
          },
        },
      ],
      c: [
        {
          c: 'c',
        },
      ],
    });
  });
});

describe('fromXML(elem_as_attr)', () => {
  it('test fromXML(elem_as_attr) fortext', () => {
    expect(
      purifyGraph(fromXML(['<item>text</item>'], { elem_as: 'attr' })).xml[0]
    ).toStrictEqual({
      item: 'text',
    });
  });

  it('test fromXML(elem_as_attr) for attribute and text', () => {
    expect(
      purifyGraph(fromXML(['<item a="b">text</item>'], { elem_as: 'attr' }))
        .xml[0]
    ).toStrictEqual({
      item: {
        a: 'b',
        [KEY_TEXT]: 'text',
      },
    });
  });

  it('test fromXML(elem_as_attr) for child element', () => {
    expect(
      purifyGraph(
        fromXML(['<item a="b"><item>text</item></item>'], { elem_as: 'attr' })
      ).xml[0]
    ).toStrictEqual({
      item: {
        a: 'b',
        item: 'text',
      },
    });
  });

  it('test fromXML(elem_as_attr) for nested xml', () => {
    expect(
      purifyGraph(fromXML(['<a><b><c>result</c></b></a>'], { elem_as: 'attr' }))
        .xml[0]
    ).toStrictEqual({
      a: {
        b: {
          c: 'result',
        },
      },
    });
  });

  it('test fromXML(elem_as_attr) with attr prefix', () => {
    expect(
      purifyGraph(
        fromXML(['<a b="3"><b>result</b></a>'], {
          elem_as: 'attr',
          attr_prefix: '@',
        })
      ).xml[0]
    ).toStrictEqual({
      a: {
        '@b': '3',
        b: 'result',
      },
    });
  });

  it('test fromXML(elem_as_attr) for array', () => {
    expect(
      purifyGraph(
        fromXML(['<a><b>b1</b><c>c</c><b>b2</b>test</a>'], { elem_as: 'attr' })
      ).xml[0]
    ).toStrictEqual({
      a: {
        b: ['b1', 'b2'],
        c: 'c',
        [KEY_TEXT]: 'test',
      },
    });
  });

  it('test fromXML(elem_as_attr) for array', () => {
    expect(
      purifyGraph(
        fromXML(['<a>text1<b>b1</b>text2<b>b2</b></a>'], { elem_as: 'attr' })
      ).xml[0]
    ).toStrictEqual({
      a: {
        b: ['b1', 'b2'],
        [KEY_TEXT]: ['text1', 'text2'],
      },
    });
  });
});

describe('fromXML(elem_as_hybrid)', () => {
  it('test fromXML(elem_as_hybrid) for attribute and text', () => {
    expect(
      purifyGraph(fromXML(['<item a="b">text</item>'], { elem_as: 'hybrid' }))
    ).toStrictEqual({
      item: [
        {
          a: 'b',
          [KEY_TEXT]: 'text',
        },
      ],
    });
  });

  it('test fromXML(elem_as_hybrid) for element as attribute', () => {
    expect(
      purifyGraph(
        fromXML(['<item><attr>value</attr></item>'], { elem_as: 'hybrid' })
      )
    ).toStrictEqual({
      item: [
        {
          attr: 'value',
        },
      ],
    });
  });

  it('test fromXML(elem_as_hybrid) for element with text and sub element', () => {
    expect(
      purifyGraph(
        fromXML(['<item><attr>value<t></t></attr></item>'], {
          elem_as: 'hybrid',
        })
      )
    ).toStrictEqual({
      attr: [
        {
          [KEY_TEXT]: 'value',
          t: undefined,
        },
      ],
      item: [
        {
          [KEY_CHILD]: {
            [KEY_TEXT]: 'value',
            t: undefined,
          },
        },
      ],
    });
  });

  it('test fromXML(elem_as_hybrid) for nested element without attribute', () => {
    expect(
      purifyGraph(
        fromXML(
          [
            '<item><group><attr>value1</attr><attr>value2</attr></group></item>',
          ],
          {
            elem_as: 'hybrid',
          }
        )
      )
    ).toStrictEqual({
      group: [
        {
          attr: ['value1', 'value2'],
        },
      ],
      item: [
        {
          [KEY_CHILD]: {
            attr: ['value1', 'value2'],
          },
        },
      ],
    });
  });

  it('test fromXML(elem_as_hybrid) for element with sub', () => {
    expect(
      purifyGraph(
        fromXML(
          [
            '<item>',
            '  <props>',
            '    <prop name="attr1" value="value1"></prop>',
            '    <prop name="attr2" value="value2"></prop>',
            '  </props>',
            '</item>',
          ],
          {
            elem_as: 'hybrid',
          }
        )
      )
    ).toStrictEqual({
      item: [
        {
          props: [
            {
              name: 'attr1',
              value: 'value1',
            },
            {
              name: 'attr2',
              value: 'value2',
            },
          ],
        },
      ],
      prop: [
        {
          name: 'attr1',
          value: 'value1',
        },
        {
          name: 'attr2',
          value: 'value2',
        },
      ],
    });
  });
});

describe('toXML', () => {
  it('test toXML for attribute and text', () => {
    expect(
      toXML(fromXML(['<item a="b">text</item>']), (ds) => ({
        [KEY_ROOT]: ds.item[0],
      }))
    ).toStrictEqual(['<item a="b">', '  text', '</item>']);
  });

  it('test toXML for child element', () => {
    expect(
      toXML(
        fromXML([
          '<item a="b"><item c="d">text</item><item e="f">text</item></item>',
        ]),
        (ds) => ({
          [KEY_ROOT]: ds.item[0],
        })
      )
    ).toStrictEqual([
      '<item a="b">',
      '  <item c="d">',
      '    text',
      '  </item>',
      '  <item e="f">',
      '    text',
      '  </item>',
      '</item>',
    ]);
  });

  it('test toXML for nested xml', () => {
    expect(
      toXML(fromXML(['<a a="a"><b b="b"><c c="c"></c></b></a>']), (ds) => ({
        [KEY_ROOT]: ds.a[0],
      }))
    ).toStrictEqual([
      '<a a="a">',
      '  <b b="b">',
      '    <c c="c">',
      '    </c>',
      '  </b>',
      '</a>',
    ]);
  });
});
