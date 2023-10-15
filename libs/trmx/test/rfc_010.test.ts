import { DataGraph } from "../src/types";
import { createProcess } from "../src/process";
import { parseRuleTable } from "../src/rule";
import { KEY_TYPE } from "../src/const";
import { purifyGraph } from "../src/graph";

describe("integration test for rfc_010", () => {
  it("refby traversal", () => {
    const source: DataGraph = {
      product: [
        {
          [KEY_TYPE]: "product",
          name: "product 1",
          owner: "owner 1",
        },
        {
          [KEY_TYPE]: "product",
          name: "product 2",
          owner: "owner 1",
        },
      ],
      owner: [
        {
          [KEY_TYPE]: "owner",
          name: "owner 1",
        },
      ],
    };

    const expected: DataGraph = {
      user: [
        {
          name: "owner 1",
          items: ["product 1", "product 2"],
        },
      ],
    };

    const rules: string[] = [
      "m | product.owner            | product.owner>owner.name ",
      "t | owner.name               | user.name ",
      "t | owner<owner.product.name | user.items",
    ];

    const process = createProcess(parseRuleTable(rules));

    const output = process(source);

    expect(purifyGraph(output)).toStrictEqual(expected);
  });

  it("create refBy reference in transform", () => {
    const source: DataGraph = {
      product: [
        {
          [KEY_TYPE]: "product",
          name: "product 1",
          owner: "owner 1",
        },
        {
          [KEY_TYPE]: "product",
          name: "product 2",
          owner: "owner 1",
        },
      ],
      owner: [
        {
          [KEY_TYPE]: "owner",
          name: "owner 1",
        },
      ],
    };

    const expected: DataGraph = {
      item: [
        {
          name: "product 1",
          owned_by: "owner 1",
        },
        {
          name: "product 2",
          owned_by: "owner 1",
        },
      ],
      user: [
        {
          name: "owner 1",
        },
      ],
    };

    const rules: string[] = [
      "m | product.owner            | product.owner>owner.name",
      "t | owner.name               | user.name",
      "t | owner<owner.product.name | user<owned_by.item.name",
      "m | item.owned_by>user.name | item.owned_by",
    ];

    const process = createProcess(parseRuleTable(rules));

    const output = process(source);

    expect(purifyGraph(output)).toStrictEqual(expected);
  });
});
