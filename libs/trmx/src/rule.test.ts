import { groupByAct, parseRuleTable } from "./rule";

describe("test parseRuleTable", () => {
  it("test parseRuleTable (empty)", () => {
    const rules = [] as string[];

    expect(parseRuleTable(rules)).toStrictEqual([]);
  });

  it("test parseRuleTable (csv)", () => {
    const rules = [
      " m | product.name       | product.internal_name  ",
    ] as string[];

    expect(parseRuleTable(rules)).toStrictEqual([
      { act: "mutation", src: "product.name", tar: "product.internal_name" },
    ]);
  });

  it("test parseRuleTable (csv with header)", () => {
    const rules = [
      " action | src          | tar                   | func | cond                  | comments ",
      " m      | product.name | product.internal_name | '3'  | product.name = 'name' | test rule  ",
    ] as string[];

    expect(parseRuleTable(rules)).toStrictEqual([
      {
        act: "mutation",
        src: "product.name",
        tar: "product.internal_name",
        func: "'3'",
        cond: "product.name = 'name'",
        comments: "test rule",
      },
    ]);
  });

  it("test parseRuleTable (markdown)", () => {
    const rules = [
      " | action | src          | tar                   | func | cond                  | comments  | ",
      " | ------ | ------------ | --------------------- | ---- | --------------------- | --------- | ",
      " | m      | product.name | product.internal_name | '3'  | product.name = 'name' | test rule | ",
    ] as string[];

    expect(parseRuleTable(rules)).toStrictEqual([
      {
        act: "mutation",
        src: "product.name",
        tar: "product.internal_name",
        func: "'3'",
        cond: "product.name = 'name'",
        comments: "test rule",
      },
    ]);
  });
});

describe("test groupByAct", () => {
  it("test groupByAct (has rules)", () => {
    const rules = [
      "m | product.name       | product.internal_name",
      "m | product.owner.name | product.owned_by",
      "t | product            | item",
      "t | product.name       | item.name",
      "m | item.name          | item.alias",
      "t | item               | sku",
      "t | item.alias         | sku.desc",
      "m | sku.desc           | sku.name",
    ];

    expect(groupByAct(parseRuleTable(rules))).toStrictEqual([
      {
        mutations: [
          {
            act: "mutation",
            src: "product.name",
            tar: "product.internal_name",
          },
          {
            act: "mutation",
            src: "product.owner.name",
            tar: "product.owned_by",
          },
        ],
        transforms: [
          {
            act: "transform",
            src: "product",
            tar: "item",
          },
          {
            act: "transform",
            src: "product.name",
            tar: "item.name",
          },
        ],
      },
      {
        mutations: [
          {
            act: "mutation",
            src: "item.name",
            tar: "item.alias",
          },
        ],
        transforms: [
          {
            act: "transform",
            src: "item",
            tar: "sku",
          },
          {
            act: "transform",
            src: "item.alias",
            tar: "sku.desc",
          },
        ],
      },
      {
        mutations: [
          {
            act: "mutation",
            src: "sku.desc",
            tar: "sku.name",
          },
        ],
        transforms: [],
      },
    ]);
  });

  it("test groupByAct (empty)", () => {
    const rules = [] as string[];

    expect(groupByAct(parseRuleTable(rules))).toStrictEqual([]);
  });
});
