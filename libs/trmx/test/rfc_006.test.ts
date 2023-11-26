import { DataGraph } from "../src/types";
import { KEY_TYPE } from "../src/const";
import { createProcess } from "../src/process";
import { parseRuleTable } from "../src/rule";
import { purifyGraph } from "../src/graph";
import { toJSON } from "../src/json";

describe("integration test for rfc_006", () => {
  it("integration test for object relation", () => {
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
      user: [
        {
          [KEY_TYPE]: "user",
          id: "id3",
          name: "owner 1",
        },
        {
          [KEY_TYPE]: "user",
          id: "id4",
          name: "owner 2",
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
          owned_by: "owner 2",
        },
      ],
      owner: [
        {
          name: "owner 1",
        },
        {
          name: "owner 2",
        },
      ],
    };

    const rules: string[] = [
      "m | product.owner            | product.owner>user.id",
      "t | user.name                | owner.name",
      "t | product.name             | item.internal_name",
      "t | product.owner>user       | item.owned_by>owner",
      "m | item.owned_by>owner.name | item.owned_by",
    ];

    const process = createProcess(parseRuleTable(rules));

    const output = process(source);

    expect(purifyGraph(output)).toStrictEqual(expected);
  });

it("object relation on same object type", () => {
    const source: DataGraph = {
      product: [
        {
          [KEY_TYPE]: "product",
          id: "id1",
          name: "product 1",
        },
        {
          [KEY_TYPE]: "product",
          id: "id11",
          name: "product 11",
          parentRef: "id1",
        },
        {
          [KEY_TYPE]: "product",
          id: "id12",
          name: "product 12",
          parentRef: "id1",
        },
        {
          [KEY_TYPE]: "product",
          id: "id111",
          name: "product 111",
          parentRef: "id11",
        },
        {
          [KEY_TYPE]: "product",
          id: "id112",
          name: "product 112",
          parentRef: "id11",
        },

      ],
    };

    const rules: string[] = [
      "m | product.parentRef         | product.parentRef>product.id",
      "m | product                   | product.isRoot | !Boolean(product.parentRef)",
      "t | product.name              | item.name",
      "t | product.isRoot            | item.isRoot",
      "t | product<parentRef.product | item.__child>item",
    ];

    const process = createProcess(parseRuleTable(rules));

    const output = process(source);

    expect(toJSON(output, ds => ds['item'].filter(i => i.isRoot)[0])).toStrictEqual(`
{
  "name": "product 1",
  "isRoot": true,
  "__child": [
    {
      "name": "product 11",
      "isRoot": false,
      "__child": [
        {
          "name": "product 111",
          "isRoot": false
        },
        {
          "name": "product 112",
          "isRoot": false
        }
      ]
    },
    {
      "name": "product 12",
      "isRoot": false
    }
  ]
}
    `.trim().split('\n'));
  });
});
