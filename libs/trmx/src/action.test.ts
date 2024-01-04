import {
  createApplyAction,
  createSelectAction,
  createUpdateAction,
  createWhereAction,
} from "./action";
import { parseTrvRule } from "./parse";
import { KEY_REFBY, KEY_TYPE } from "./const";
import { purifyGraph } from "./graph";

describe("trvByPaths", () => {
  it("test trvByPaths", () => {
    const select = createSelectAction(parseTrvRule("A.a>B<c1.C.c2>D.d"));

    const D = {
      [KEY_TYPE]: "D",
      d: "test",
    };

    const C = {
      [KEY_TYPE]: "C",
      // c1: B,
      c2: D,
    };

    const B = {
      [KEY_TYPE]: "B",
      [KEY_REFBY]: {
        c1: [C],
      },
    };

    const A = {
      [KEY_TYPE]: "A",
      a: B,
    };

    expect(select.exec(A)).toStrictEqual(["test"]);
  });
});

describe("createSelectAction", () => {
  it("test createSelectAction", () => {
    const select = createSelectAction(parseTrvRule("Item.attr>Sku.desc"));

    const src = {
      attr: [
        {
          [KEY_TYPE]: "Sku",
          desc: "test1",
        },
        {
          [KEY_TYPE]: "Sku",
          desc: "test2",
        },
      ],
    };

    expect(select.exec(src)).toStrictEqual(["test1", "test2"]);
  });
});

describe("createUpdateAction", () => {
  it("test createUpdateAction (single traversal)", () => {
    const update = createUpdateAction(parseTrvRule("Item.attr"));

    const src = {};

    expect(update.exec(src, ["test1", "test2"], {})).toStrictEqual({});

    expect(src).toStrictEqual({
      attr: ["test1", "test2"],
    });
  });

  it("test createUpdateAction (multiple traversal)", () => {
    const update = createUpdateAction(parseTrvRule("Item.attr>Sku.desc"));

    const src = {
      [KEY_TYPE]: "Item",
      attr: [
        {
          [KEY_TYPE]: "Sku",
        },
        {
          [KEY_TYPE]: "Sku",
        },
      ],
    };

    expect(update.exec(src, ["test"], {})).toStrictEqual({});

    expect(src).toStrictEqual({
      [KEY_TYPE]: "Item",
      attr: [
        {
          [KEY_TYPE]: "Sku",
          desc: "test",
        },
        {
          [KEY_TYPE]: "Sku",
          desc: "test",
        },
      ],
    });
  });

  it("test createUpdateAction (link)", () => {
    const update = createUpdateAction(parseTrvRule("Item.attr>Sku.desc"));

    const g = {
      Item: [{}],
      Sku: [
        {
          id: "id1",
          desc: "test",
        },
        {
          id: "id2",
          desc: "test1",
        },
      ],
    };

    const src = g.Item[0];

    expect(update.exec(src, ["test"], g)).toStrictEqual({});

    purifyGraph(g);

    expect(src).toStrictEqual({
      attr: {
        id: "id1",
        desc: "test",
      },
    });
  });
});

describe("createWhereAction", () => {
  it("test createWhereAction (false)", () => {
    const where = createWhereAction("$src.desc == 'test'");

    const src = {
      [KEY_TYPE]: "Sku",
      desc: "test1",
    };

    expect(where.exec(src, {}, {})).toStrictEqual(false);
  });

  it("test createWhereAction (true)", () => {
    const where = createWhereAction("$src.desc != 'test'");

    const src = {
      [KEY_TYPE]: "Sku",
      desc: "test1",
    };

    expect(where.exec(src, {}, {})).toStrictEqual(true);
  });
});

describe("createApplyAction", () => {
  it("test createApplyAction", () => {
    const apply = createApplyAction("$val.desc + '2'");

    const src = {
      [KEY_TYPE]: "Sku",
      desc: "test1",
    };

    expect(apply.exec(src, {}, {})).toStrictEqual("test12");
  });
});
