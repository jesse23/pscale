import { DataGraph } from "../src/types";
import { KEY_TYPE } from "../src/const";
import { createProcess } from "../src/process";
import { parseRuleTable } from "../src/rule";
import { purifyGraph } from "../src/graph";

describe("integration test for rfc_008", () => {
  it("integration test for new object creation with condition", () => {
    const source: DataGraph = {
      product: [
        {
          [KEY_TYPE]: "product",
          name: "product 1",
          owner: "owner 1",
          owner_group: "group 1",
        },
        {
          [KEY_TYPE]: "product",
          name: "product 2",
          owner: "owner 1",
          owner_group: "group 1",
        },
      ],
    };

    const expected: DataGraph = {
      item: [
        {
          internal_name: "product 1 new",
          owned_by: "owner 1",
        },
      ],
      owner: [
        {
          name: "owner 1",
        },
      ],
    };

    const rules: string[] = [
      "t | product.name             | item.internal_name        | $val + ' new' | product.name == 'product 1'",
      "t | product.owner            | item.owned_by>owner.name",
      "t | product.owner_group      | item.owned_by>owner.group |               | product.owner_group == 'group 2'",
      "m | item.owned_by>owner.name | item.owned_by",
    ];

    const process = createProcess(parseRuleTable(rules));

    const output = process(source);

    expect(purifyGraph(output)).toStrictEqual(expected);
  });

  it("integration test for mutation with condition", () => {
    const source: DataGraph = {
      product: [
        {
          [KEY_TYPE]: "product",
          name: "product 1",
          owner: "owner 1",
          owner_group: "group 1",
        },
        {
          [KEY_TYPE]: "product",
          name: "product 2",
          owner: "owner 1",
          owner_group: "group 1",
        },
      ],
    };

    const expected: DataGraph = {
      product: [
        {
          name: "product 1",
          internal_name: "p",
          owner: "owner 1",
          owner_group: "group 1",
        },
        {
          name: "product 2",
          owner: "owner 1",
          owner_group: "group 1",
        },
      ],
    };

    const rules: string[] = [
      "m | product.name | product.internal_name | $val.slice(0,1) | product.name == 'product 1'",
    ];

    const process = createProcess(parseRuleTable(rules));

    const output = process(source);

    expect(purifyGraph(output)).toStrictEqual(expected);
  });
});
