import { DataGraph } from "../src/types";
import { createProcess } from "../src/process";
import { parseRuleTable } from "../src/rule";
import { fromJSON, toJSON } from "../src/graph";

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
      in: [
        "{",
        "  product: ds.data,",
        "  user: ds.data.map(p => p.owned_by),",
        "}",
      ],
      rules: [
        "t | product.name               | item.name ",
        "t | product.owned_by>user.name | item<items.user.name",
      ],
      out: ["{", "  data: ds.user,", "}"],
    };

    const process = createProcess(parseRuleTable(opts.rules));

    const output = toJSON(process(fromJSON(source, opts.in)), opts.out);

    expect(output).toStrictEqual(expected);
  });
});
