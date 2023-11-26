import { Tag, parser as createParser } from 'sax';
import {
  KEY_CHILD,
  KEY_REFBY,
  KEY_ROOT,
  KEY_TEXT,
  KEY_TRM,
  KEY_TYPE,
} from './const';
import {
  Data,
  DataGraph,
  DataTemplateFn,
  XMLOptions,
  XMLOutput,
} from './types';
import { applyTemplate, createObject, setupGraph } from './graph';
import { XMLParseOptions } from './types';
import { isArray, isObject, isPrimitive } from '@pscale/util';

export const createNodeProcessor = (
  options: XMLParseOptions,
  g?: DataGraph
) => {
  const path = [{}] as Data[];
  let root = null as Data;

  return {
    root: () => root,
    addNode: (node: { name: string; attributes: Record<string, string> }) => {
      const type = node.name;
      const obj = createObject(type, (options.attr_prefix
          ? Object.entries(node.attributes).reduce((prev, [attr, val]) => {
              prev[`${options.attr_prefix}${attr}`] = val;
              return prev;
            }, {} as Record<string, string>)
          : node.attributes));

      path.push(obj);
      root = root || obj;
      if (
        g &&
        (options.elem_as === 'object' ||
          (options.elem_as === 'hybrid' && path.length === 2))
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
      const parent = path[path.length - 1] || {};
      parent[KEY_CHILD] = [].concat(parent[KEY_CHILD] || [], obj);

      if (options.elem_as === 'attr') {
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
      } else if (options.elem_as === 'hybrid') {
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
 * Convert XML to data node tree
 *
 * @param source XML input as string array
 * @param options XML parse options
 * @returns data node as tree
 */
export function fromXML(
  source: string[],
  options: { asTree: true }
): Record<string, unknown>;

/**
 * Convert XML to data graph
 *
 * @param source XML input as string array
 * @param options XML parse options
 * @returns data graph
 */
export function fromXML(source: string[], options?: XMLParseOptions): DataGraph;

// impl
export function fromXML(
  source: string[],
  options = {} as XMLParseOptions
): DataGraph | Record<string, unknown> {
  const graph = {} as DataGraph;
  // NOTE: strict mode will fail for the use case like `attr="aa && bb"`
  const parser = createParser(true);
  const proc = createNodeProcessor(
    {
      elem_as: 'object',
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

  parser.write(source.join('')).close();

  return options.asTree
    ? // TODO: here we have a topology issue:
      // given: <a><b>c</b></a>, its JSON format is {a: {b: 'c'}}
      // - proc.completeNode() will return {a: {b: 'c', __type: 'a' }, __type: 'xml'},
      // - proc.root() will only return {b: 'c', __type: 'a' }
      options.elem_as === 'attr'
      ? proc.completeNode()
      : proc.root()
    : setupGraph(
        options.elem_as === 'attr'
          ? applyTemplate(
              proc.completeNode(),
              options.template || ((ds) => ({ xml: [ds] }))
            )
          : graph
      );
}

export const nodeToXML = (
  val: unknown,
  tag = '',
  opts = {
    elem_as: 'object',
    attr_prefix: '',
    lvl: 0,
  } as XMLOptions
): string[] => {
  const { elem_as, attr_prefix, lvl: level } = opts;
  const lvl = level || 0;
  const indent = ' '.repeat(lvl * 2);
  const res = [] as string[];

  // get tag
  tag = tag || (val as Data)[KEY_TYPE] || '';
  if(!tag) {
    throw new Error(`[nodeToXML] tag is empty for ${JSON.stringify(val)}`);
  }

  if (isObject(val)) {
    const att = [];
    const sub = [];

    // attr
    Object.entries(val).forEach(([key, value]) => {
      if (
        key !== KEY_TRM &&
        key !== KEY_TYPE &&
        key !== KEY_CHILD &&
        key !== KEY_REFBY &&
        key !== KEY_TEXT
      ) {
        if (
          isPrimitive(value) &&
          // either elem_as_object, or prefix is set for elem_as_attr
          (elem_as !== 'attr' || (attr_prefix && key.startsWith(attr_prefix)))
        ) {
          att.push({ key, value });
        } else {
          if (elem_as === 'attr') {
            sub.push({ key, value });
          } else {
            console.warn(
              `[nodeToXML] object attribute is not supported for elem_as=${elem_as}, will ignore`
            );
          }
        }
      }
    });

    // KEY_CHILD
    if (elem_as !== 'attr' && val[KEY_CHILD]) {
      sub.push(
        ...[]
          .concat(val[KEY_CHILD])
          .map((c) => ({ key: c[KEY_TYPE] as string, value: c }))
      );
    }

    // elem and att
    const elemLine = [`${indent}<${tag}`];
    att.forEach(({ key, value }) => {
      elemLine.push(
        ` ${attr_prefix ? key.replace(attr_prefix, '') : key}="${value}"`
      );
    });
    elemLine.push('>');
    res.push(elemLine.join(''));

    // sub
    sub.forEach(({ key, value }) => {
      res.push(...nodeToXML(value, key, { ...opts, lvl: lvl + 1 }));
    });

    // text
    const text = (val[KEY_TEXT] as string)?.trim();
    if (text) {
      res.push(`${' '.repeat((lvl + 1) * 2)}${text}`);
    }

    // elem end
    res.push(`${indent}</${tag}>`);
  } else if (isPrimitive(val)) {
    if (elem_as === 'attr') {
      res.push(`${indent}<${tag}>${val === undefined ? '' : val}</${tag}>`);
    } else {
      console.warn(
        `[nodeToXML] primitive value is not supported for elem_as=${elem_as}, will ignore`
      );
    }
  } else if (isArray(val)) {
    if (elem_as === 'attr') {
      res.push(
        ...val.reduce((prev, curr) => {
          prev.push(...nodeToXML(curr, tag, { ...opts, lvl: lvl + 1 }));
          return prev;
        }, [])
      );
    } else {
      console.warn(
        `[nodeToXML] array value is not supported for elem_as=${elem_as}, will ignore`
      );
    }
  } else {
    throw new Error(
      `[nodeToXML] unsupported value type for ${JSON.stringify(val)}`
    );
  }
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
  // TODO: why do we need KEY_ROOT here?
  const rootNode = root[KEY_ROOT];
  return nodeToXML(rootNode);
};
