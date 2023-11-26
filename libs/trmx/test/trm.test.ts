import { DataGraph } from "../src/types";
import { createProcess } from "../src/process";
import { parseRuleTable } from "../src/rule";
import { fromJSON, toJSON } from "../src/json";

describe("transform integration", () => {
  it("attribute transform for value not exist", () => {
    const source: DataGraph = {
      data: [
        {
          name: "product 1",
          desc: "product 1 desc",
        },
        {
          name: "product 2",
        },
      ] 
    };

    const expected = {
      data: [
        {
          name: "product 1",
          desc: "product 1 desc updated",
        },
        {
          name: "product 2",
        },
      ],
    };

    const opts = {
      rules: [
        "t | product.name | item.name",
        "t | product.desc | item.desc | $val + ' updated'",
      ],
      in: {
        format: 'json',
        template: (ds) => ({
          product: ds.data,
        }),
      },
      out: {
        format: 'json',
        template: (ds) => ({
          data: ds.item
        }),
      },
    };

    const process = createProcess(parseRuleTable(opts.rules));

    const output = toJSON(process(fromJSON([JSON.stringify(source)], { template: opts.in.template })),  opts.out.template);

    expect(JSON.parse(output.join(''))).toStrictEqual(expected);

  });
});