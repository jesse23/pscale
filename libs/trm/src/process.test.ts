import { trv } from "./process";
import { KEY_TYPE } from "./const";

describe("example test in test folder", () => {
  it("sanity test to test /test/*.spec.ts mode", () => {
    expect(true).toBe(true);
  });
});

describe("trv function", () => {
  it("trv to object", () => {
    const data = {
      [KEY_TYPE]: "product",
      name: "product 1",
      owner: {
        [KEY_TYPE]: "owner",
        name: "owner 1",
        group: {
          [KEY_TYPE]: "group",
          name: "group 1",
        },
      },
    };

    expect(trv(data, "product.owner>owner.group>group")).toStrictEqual({
      [KEY_TYPE]: "group",
      name: "group 1",
    });
  });

  it("trv to value", () => {
    const data = {
      [KEY_TYPE]: "product",
      name: "product 1",
      owner: {
        [KEY_TYPE]: "owner",
        name: "owner 1",
        group: {
          [KEY_TYPE]: "group",
          name: "group 1",
        },
      },
    };

    expect(trv(data, "product.owner>owner.group>group.name")).toStrictEqual(
      "group 1"
    );
  });

  it("trv to array", () => {
    const data = {
      [KEY_TYPE]: "product",
      name: "product 1",
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

    expect(trv(data, "product.owner>owner.name")).toStrictEqual([
      "owner 1",
      "owner 2",
    ]);
  });

  it("trv to no value", () => {
    const data = {
      [KEY_TYPE]: "product",
      name: "product 1",
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

    expect(trv(data, "product.owner>owner.name>A.a")).toStrictEqual(undefined);
  });

  it("trv as array", () => {
    const data = {
      [KEY_TYPE]: "product",
      name: "product 1",
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

    expect(trv(data, "product.owner>owner.name>A.a", true)).toStrictEqual([]);
    expect(trv(data, "product.name", true)).toStrictEqual(["product 1"]);
  });
});
