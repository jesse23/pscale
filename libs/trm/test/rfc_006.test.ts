import { DataGraph } from "../src/types";
import { KEY_TYPE } from "../src/const";
import { createProcess } from "../src/process";
import { parseRuleTable } from "../src/rule";

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

    expect(output).toStrictEqual(expected);
  });
});
