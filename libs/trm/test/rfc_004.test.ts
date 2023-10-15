import { createMutations, createTransforms, process } from "../src/process";
import { parseMutationRules, parseTransformRules } from "../src/parse";
import { DataGraph, RuleInput } from "../src/types";
import { KEY_TYPE } from "../src/const";

describe("integration test for rfc_004", () => {
  it("integration test for transform rules", () => {
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
          [KEY_TYPE]: "item",
          internal_name: "product 1",
          owned_by: "owner 1",
        },
        {
          [KEY_TYPE]: "item",
          internal_name: "product 2",
          owned_by: "owner 2",
        },
      ],
      owner: [
        {
          [KEY_TYPE]: "owner",
          name: "owner 1",
        },
        {
          [KEY_TYPE]: "owner",
          name: "owner 2",
        },
      ],
    };

    const mutationRules: RuleInput[] = [
      {
        act: "mutation",
        src: "product.owner",
        tar: "product.owner>user.id",
      },
    ];
    //["product.owner -> product.owner>user.id"];

    const transformRules: RuleInput[] = [
      {
        act: "transform",
        src: "product",
        tar: "item",
      },
      {
        act: "transform",
        src: "product.name",
        tar: "item.internal_name",
      },
      {
        act: "transform",
        src: "product.owner>user.name",
        tar: "item.owned_by",
      },
      {
        act: "transform",
        src: "user",
        tar: "owner",
      },
      {
        act: "transform",
        src: "user.name",
        tar: "owner.name",
      },
    ];

    const mutations = createMutations(parseMutationRules(mutationRules));

    const transforms = createTransforms(parseTransformRules(transformRules));

    const output = process(source, mutations, transforms);

    expect(output).toStrictEqual(expected);
  });
});
