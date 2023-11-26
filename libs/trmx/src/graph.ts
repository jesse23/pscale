import { Data, DataGraph, DataTemplateFn, TrvDef } from './types';
import { KEY_REFBY, KEY_TYPE } from './const';
import { isArray } from '@pscale/util';

export const createRefs = (
  vsData: Data[],
  veData: Data[],
  eg: string,
  refBy = false
) => {
  const sources = refBy ? veData : vsData;
  const targets = refBy ? vsData : veData;

  sources.forEach((src) => {
    src[eg] = targets.length > 1 ? targets : targets[0];
    /*
    TODO: need to see if we want overwrite or append
    src[eg] = src[eg]
      ? [].concat(src[eg]).concat(targets)
      : targets.length > 1
      ? targets
      : targets[0];
      */
  });

  targets.forEach((target) => {
    if (!target[KEY_REFBY]) {
      target[KEY_REFBY] = {} as DataGraph;
    }

    // TODO: refBy we are doing concat, but what about src[edge]?
    target[KEY_REFBY][eg] = (target[KEY_REFBY][eg] || []).concat(sources);
  });
};

export const trvByPath = (objs: Data[], { ve, eg, refBy }: TrvDef): Data[] => {
  return objs.reduce((acc, obj) => {
    return (
      acc
        // NOTE: JS concat can handle both single value and array`
        .concat(
          !eg
            ? obj
            : !refBy
            ? obj[eg]
            : (obj[KEY_REFBY] && obj[KEY_REFBY][eg]) || []
        )
        .filter((v) => (v && ve ? v[KEY_TYPE] === ve : v !== undefined))
    );
  }, []);
};

export const trvByPaths = (
  srcObjs: Data[],
  trvDefs: TrvDef[]
): {
  objs: Data[];
  res: Data[];
  trvIdx: number;
} => {
  return trvDefs.reduce(
    ({ objs, res, trvIdx }, trvDef, idx) => {
      return res.length > 0
        ? {
            objs: res,
            res: trvByPath(res, trvDef),
            trvIdx: idx,
          }
        : // skip the rest of the trv when res is empty
          { objs, res, trvIdx };
    },
    {
      objs: srcObjs,
      res: srcObjs,
      trvIdx: -1,
    }
  );
};

/**
 * Merge input source to data graph
 *
 * @param graph data graph
 * @param source input source as delta
 * @returns merged data graph
 */
export const mergeDataGraph = (
  graph: DataGraph,
  source: DataGraph
): DataGraph => {
  return Object.entries(source).reduce(
    (acc, [key, df]) => ({
      ...acc,
      [key]: (graph[key] || []).concat(df),
    }),
    graph
  );
};

export const setupGraph = (graph: DataGraph): DataGraph => {
  // add KEY_TYPE
  Object.entries(graph).forEach(([type, df]) => {
    df.forEach((data) => {
      data[KEY_TYPE] = type;
    });
  });

  // build KEY_REFBY
  Object.values(graph).forEach((df) => {
    df.forEach((data) => {
      Object.entries(data).forEach(([key, value]) => {
        const obj = (
          isArray(value) ? value[0] : value === undefined ? {} : value
        ) as Data;
        if (obj[KEY_TYPE]) {
          createRefs([data], [].concat(value), key);
        }
      });
    });
  });

  return graph;
};

/**
 *
 * @param graph data graph
 * @returns data graph without special keys
 */
export const purifyGraph = (graph: DataGraph): DataGraph => {
  /*
  TODO: cannot use immtable for now
  return Object.entries(graph).reduce(
    (acc, [key, df]) => ({
      ...acc,
      [key]: df.map(({ [KEY_REFBY]: _, ...data }) => data),
    }),
    {}
  );
  */
  Object.values(graph).forEach((df) => {
    df.forEach((data) => {
      delete data[KEY_REFBY];
      delete data[KEY_TYPE];
    });
  });
  return graph;
};

/**
 * Apply template to data graph
 * @param ds data graph
 * @param template template function as callback
 * @returns JSON object
 */
export const applyTemplate = (ds: Data, templateFn: DataTemplateFn): DataGraph =>
  templateFn(ds) as DataGraph

export const createObject = (type: string, data = {} as Data): Data => {
  // console.log('createObject', type, data);
  return {
    [KEY_TYPE]: type,
    ...data,
  };
}
