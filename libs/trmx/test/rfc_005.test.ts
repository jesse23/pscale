import { DataGraph, RuleInput } from "../src/types";
import { KEY_TYPE } from "../src/const";
import { createMutations, createProcess, process } from "../src/process";
import { parseTransformRules } from "../src/parse";
import { parseRuleTable } from "../src/rule";
import { purifyGraph } from "../src/graph";

describe("integration test for rfc_005", () => {
  it("integration test for mutation rules", () => {
    const source: DataGraph = {
      product: [
        {
          id: "id1",
          name: "product 1",
          owner: "id3",
        },
        {
          id: "id2",
          name: "product 2",
          owner: "id4",
        },
      ],
      user: [
        {
          id: "id3",
          name: "owner 1",
        },
        {
          id: "id4",
          name: "owner 2",
        },
      ],
    };

    const expected: DataGraph = {
      product: [
        {
          id: "id1",
          name: "product 1",
          alias: "product 1",
          owner: "id3",
        },
        {
          id: "id2",
          name: "product 2",
          alias: "product 2",
          owner: "id4",
        },
      ],
      user: [
        {
          id: "id3",
          name: "owner 1",
          alias: "owner 1",
        },
        {
          id: "id4",
          name: "owner 2",
          alias: "owner 2",
        },
      ],
    };

    const rules: RuleInput[] = [
      {
        act: "mutation",
        src: "product.name",
        tar: "product.alias",
      },
      {
        act: "mutation",
        src: "user.name",
        tar: "user.alias",
      },
    ];

    const mutations = createMutations(parseTransformRules(rules));

    const output = process(source, mutations, []);

    expect(purifyGraph(output)).toStrictEqual(expected);
  });

  it("integration test for mutation rules with transform and rule set", () => {
    const source: DataGraph = {
      product: [
        {
          [KEY_TYPE]: "product",
          id: "id1",
          name: "product 1",
          owner: "id3",
        },
        {
          [KEY_TYPE]: "product",
          id: "id2",
          name: "product 2",
          owner: "id4",
        },
      ],
    };

    const expected: DataGraph = {
      sku: [
        {
          name: "product 1",
          desc: "product 1",
        },
        {
          name: "product 2",
          desc: "product 2",
        },
      ],
    };

    const rules: string[] = [
      "m | product.name       | product.alias",
      "t | product            | item",
      "t | product.alias      | item.internal_name",
      "m | item.internal_name | item.name",
      "t | item               | sku",
      "t | item.name          | sku.desc",
      "m | sku.desc           | sku.name",
    ];

    const process = createProcess(parseRuleTable(rules));

    const output = process(source);

    expect(purifyGraph(output)).toStrictEqual(expected);
  });
});
