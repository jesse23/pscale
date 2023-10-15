import { createProcess } from "../src/process";
import { parseRuleTable } from "../src/rule";
import { fromXML, toXML } from "../src/xml";
import { KEY_CHILD, KEY_ROOT, KEY_TEXT, KEY_TYPE } from "../src/const";

describe("integration test for rfc_012", () => {
  it("xml input & output", () => {
    const source = [
      "<data>",
      '  <product id="id1" name="product 1" owned_by="uid1" />',
      '  <product id="id2" name="product 2" owned_by="uid1" />',
      '  <owner id="id3" name="owner 1">',
      '    <ref uid="uid1" />',
      "  </owner>",
      "</data>",
    ];

    const expected = [
      "<xml>",
      '  <user uid="uid1" name="owner 1">',
      "    <item>",
      "      product 1",
      "    </item>",
      "    <item>",
      "      product 2",
      "    </item>",
      "  </user>",
      "</xml>",
    ];

    const opts = {
      rules: [
        `m | owner.${KEY_CHILD}>ref.uid | owner.uid`,
        "m | product.owned_by           | product.owned_by>owner.uid",
        `t | product.name               | item.${KEY_TEXT} `,
        "t | owner.uid                  | user.uid ",
        "t | owner.name                 | user.name ",
        `t | owner<owned_by.product     | user.${KEY_CHILD}>item`,
      ],
      out: [
        "{",
        `  ${KEY_ROOT}: {`,
        `    ${KEY_TYPE}: 'xml',`,
        `    ${KEY_CHILD}: ds.user,`,
        `  }`,
        "}",
      ],
    };

    const process = createProcess(parseRuleTable(opts.rules), false);

    const output = toXML(process(fromXML(source)), opts.out);

    expect(output).toStrictEqual(expected);
  });
});
