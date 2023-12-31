import { DataGraph } from "../src/types";
import { createProcess } from "../src/process";
import { parseRuleTable } from "../src/rule";
import { fromJSON, toJSON } from "../src/json";

describe("integration test for rfc_011", () => {
  it("json input & output", () => {
    const source: DataGraph = {
      data: [
        {
          name: "product 1",
          owned_by: {
            name: "owner 1",
          },
        },
        {
          name: "product 2",
          owned_by: {
            name: "owner 2",
          },
        },
      ],
    };

    const expected = {
      data: [
        {
          name: "owner 1",
          items: {
            name: "product 1",
          },
        },
        {
          name: "owner 2",
          items: {
            name: "product 2",
          },
        },
      ],
    };

    const opts = {
      rules: [
        "t | product.name               | item.name ",
        "t | product.owned_by>user.name | item<items.user.name",
      ],
      in: {
        format: 'json',
        template: (ds) => ({
          product: ds.data,
          user: ds.data.map(p => p.owned_by)
        }),
      },
      out: {
        format: 'json',
        template: (ds) => ({
          data: ds.user
        }),
      },
    };

    const process = createProcess(parseRuleTable(opts.rules));

    const output = toJSON(process(fromJSON([JSON.stringify(source)], { template: opts.in.template })),  opts.out.template);

    expect(JSON.parse(output.join(''))).toStrictEqual(expected);
  });
});
