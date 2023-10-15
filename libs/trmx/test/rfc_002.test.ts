import { process } from "../src/process";
import { Data, DataGraph, Transform } from "../src/types";

describe("integration test for rfc_002", () => {
  it("integration test for core data model", () => {
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
      item: [
        {
          id: "id1",
          internal_name: "product 1",
          owned_by: "owner 1",
        },
        {
          id: "id2",
          internal_name: "product 2",
          owned_by: "owner 2",
        },
      ],
    };

    const transforms: Transform[] = [
      {
        sourceType: "product",
        targetType: "item",
        transform: (srcDF) => ({
          item: srcDF.map((src) => ({
            id: src.id,
            internal_name: src.name,
            owned_by: (src.owner as Data).name,
          })),
        }),
      },
    ];

    const preprocess = (input: DataGraph): DataGraph => {
      const idToObjMap = input.user.reduce((acc, obj) => {
        acc[obj.id as string] = obj;
        return acc;
      }, {});
      input.product.forEach((obj) => {
        obj.owner = idToObjMap[obj.owner as string];
      });
      return input;
    };

    // mock preprocessor
    const processedInput = preprocess(source);

    const output = process(processedInput, [], transforms);

    expect(output).toStrictEqual(expected);
  });
});
