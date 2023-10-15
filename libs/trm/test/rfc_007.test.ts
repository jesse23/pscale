import { DataGraph } from "../src/types";
import { createProcess } from "../src/process";
import { parseRuleTable } from "../src/rule";
import { KEY_TYPE } from "../src/const";

describe("integration test for rfc_007", () => {
  it("integration test for new object creation", () => {
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
          internal_name: "product 1",
          owned_by: "owner 1",
        },
        {
          internal_name: "product 2",
          owned_by: "owner 1",
        },
      ],
      owner: [
        {
          name: "owner 1",
          group: "group 1",
        },
      ],
    };

    const rules: string[] = [
      "t | product.name             | item.internal_name",
      "t | product.owner            | item.owned_by>owner.name",
      "t | product.owner_group      | item.owned_by>owner.group",
      "m | item.owned_by>owner.name | item.owned_by",
    ];

    const process = createProcess(parseRuleTable(rules));

    const output = process(source);

    expect(output).toStrictEqual(expected);
  });

  it("integration test for new object creation with relation", () => {
    const source: DataGraph = {
      item: [
        {
          [KEY_TYPE]: "item",
          product_id: "id1",
          name: "product 1",
          size: "size 1",
          owner: "owner 1",
          owner_group: "group 1",
        },
        {
          [KEY_TYPE]: "item",
          product_id: "id2",
          name: "product 2",
          size: "size 2",
          owner: "owner 1",
          owner_group: "group 1",
        },
      ],
    };

    const expected: DataGraph = {
      product: [
        {
          id: "id1",
          name: "product 1",
          owned_by: "owner 1",
        },
        {
          id: "id2",
          name: "product 2",
          owned_by: "owner 1",
        },
      ],
      sku: [
        {
          size: "size 1",
          product_id: "id1",
          owned_by: "owner 1",
        },
        {
          size: "size 2",
          product_id: "id2",
          owned_by: "owner 1",
        },
      ],
      user: [
        {
          name: "owner 1",
          group: "group 1",
        },
      ],
    };

    const rules: string[] = [
      // sku
      "t | item.size                  | sku.size",
      "t | item.product_id            | sku.product_id>product.id",
      "t | item.owner                 | sku.owned_by>user.name",
      "t | item.owner_group           | sku.owned_by>user.group",
      // product
      "t | item.name                  | product.name",
      "t | item.owner                 | product.owned_by>user.name",
      // ref -> value
      "m | sku.product_id>product.id  | sku.product_id",
      "m | sku.owned_by>user.name     | sku.owned_by",
      "m | product.owned_by>user.name | product.owned_by",
    ];

    const process = createProcess(parseRuleTable(rules));

    const output = process(source);

    expect(output).toStrictEqual(expected);
  });
});
