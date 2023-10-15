import { Tag, parser as createParser } from "sax";
import {
  KEY_CHILD,
  KEY_REFBY,
  KEY_ROOT,
  KEY_TEXT,
  KEY_TRM,
  KEY_TYPE,
} from "./const";
import { Data, DataGraph, DataTemplateFn, XMLOutput } from "./types";
import { applyTemplate, setupGraph } from "./graph";

interface XMLParseOptions {
  elem_as?: "object" | "attr" | "hybrid";
  attr_prefix?: string;
  template?: DataTemplateFn;
}

export const createNodeProcessor = (
  options: XMLParseOptions,
  g?: DataGraph
) => {
  const path = [{}] as Data[];

  return {
    addNode: (node: { name: string; attributes: Record<string, string> }) => {
      const type = node.name;
      const obj = {
        [KEY_TYPE]: type,
        ...(options.attr_prefix
          ? Object.entries(node.attributes).reduce((prev, [attr, val]) => {
              prev[`${options.attr_prefix}${attr}`] = val;
              return prev;
            }, {} as Record<string, unknown>)
          : node.attributes),
      } as Data;

      path.push(obj);
      if (
        g &&
        (options.elem_as === "object" ||
          (options.elem_as === "hybrid" && path.length === 2))
      ) {
        // NOTE: this is needed otherwise the order will be wrong for item>item case.
        g[type] = ([] as Data[]).concat(g[type] || [], obj);
      }
    },
    addAttr: (name: string, value: string) => {
      const obj = path[path.length - 1];
      obj[name] = obj[name] ? [].concat(obj[name], value) : value;
    },
    completeNode: () => {
      const obj = path.pop();

      // add to parent as KEY_CHILD
      const key: string = KEY_CHILD;
      const parent = path[path.length - 1] || {};
      parent[key] = [].concat(parent[key] || [], obj);

      if (options.elem_as === "attr") {
        (obj[KEY_CHILD] || []).forEach((child) => {
          const { [KEY_TYPE]: type, [KEY_TEXT]: text, ...rest } = child;
          const value =
            Object.keys(rest).length === 0
              ? text
              : text === undefined
              ? rest
              : { [KEY_TEXT]: text, ...rest };
          obj[type] = obj[type] ? [].concat(obj[type] || [], value) : value;
        });
        delete obj[KEY_CHILD];
      } else if (options.elem_as === "hybrid") {
        const filteredChildren = (obj[KEY_CHILD] || []).reduce(
          (prev, child) => {
            const {
              [KEY_TYPE]: type,
              [KEY_TEXT]: text,
              [KEY_CHILD]: children,
              ...rest
            } = child;
            const shouldBeObject =
              Object.keys(rest).length > 0 ||
              (text !== undefined &&
                children !== undefined &&
                children.length > 0);
            if (shouldBeObject) {
              prev.push(child);
              // NOTE: add to graph here for now although it will have side effect for sequence
              g[type] = [].concat(g[type] || [], child);
            } else {
              const value = children && children.length > 0 ? children : text;
              obj[type] = obj[type] ? [].concat(obj[type] || [], value) : value;
            }
            return prev;
          },
          []
        );
        if (filteredChildren.length > 0) {
          obj[KEY_CHILD] = filteredChildren;
        } else {
          delete obj[KEY_CHILD];
        }
      }
      return obj;
    },
  };
};

/**
 * Convert XML to data graph
 *
 * @param input XML input as string
 * @param template template as string array
 * @returns data graph
 */
export const fromXML = (
  source: string[],
  options = {} as XMLParseOptions
): DataGraph => {
  const graph = {} as DataGraph;
  const parser = createParser(true);
  const proc = createNodeProcessor(
    {
      elem_as: "object",
      ...options,
    },
    graph
  );

  parser.onerror = function (e) {
    console.error(e);
    throw e;
  };

  parser.onopentag = (node) => proc.addNode(node as Tag);

  parser.ontext = (t) => t.trim() && proc.addAttr(KEY_TEXT, t.trim());

  parser.onclosetag = () => proc.completeNode();

  parser.onend = function () {
    // could have some summary print here
  };

  parser.write(source.join("")).close();

  // return ctx.path.pop() as DataGraph;
  return setupGraph(options.elem_as === "attr"
    ? applyTemplate(proc.completeNode(), options.template || ((ds) => ({ 'xml': [ds] })))
    : graph);
};

const nodeToXML = (node: Data, indent = 0): string[] => {
  const type = node[KEY_TYPE];
  const res = [] as string[];

  // element start
  const currElem = [`${" ".repeat(indent)}<${type}`];

  // attr
  Object.entries(node).forEach(([key, value]) => {
    if (
      key !== KEY_TRM &&
      key !== KEY_TYPE &&
      key !== KEY_CHILD &&
      key !== KEY_REFBY &&
      key !== KEY_TEXT
    ) {
      currElem.push(` ${key}="${value}"`);
    }
  });

  // elem end
  currElem.push(">");
  res.push(currElem.join(""));

  // child
  if (node[KEY_CHILD]) {
    ([] as Data[]).concat(node[KEY_CHILD]).forEach((child) => {
      res.push(...nodeToXML(child, indent + 2));
    });
  }

  // text
  const text = (node[KEY_TEXT] as string)?.trim();
  if (text) {
    res.push(`${" ".repeat(indent + 2)}${text}`);
  }

  // elem end
  res.push(`${" ".repeat(indent)}</${type}>`);

  return res;
};

/**
 * Convert data graph to XML
 * @param ds data graph
 * @param template template as string array
 * @returns XML as string array
 */
export const toXML = (ds: DataGraph, template: DataTemplateFn): string[] => {
  const root = applyTemplate(ds, template) as unknown as XMLOutput;
  return nodeToXML(root[KEY_ROOT]);
};
