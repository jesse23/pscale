import {
  Data,
  SelectAction,
  UpdateAction,
  TrvDef,
  WhereAction,
  ApplyAction,
  Value,
  DataGraph,
} from './types';
import { evalExpression } from '@pscale/util';
import { VAR_SRC, VAR_VAL } from './const';
import { createObject, createRefs, trvByPaths } from './graph';

export const createWhereAction = (clause: string): WhereAction => {
  return {
    exec: (val, src, ctx) => {
      return clause
        ? Boolean(evalExpression(clause, { [VAR_VAL]: val, [VAR_SRC]: src, ...ctx }, true))
        : true;
    },
  };
};

export const createApplyAction = (clause: string): ApplyAction => {
  return {
    exec: (val, src, ctx) => {
      return clause
        ? (evalExpression(clause, { [VAR_VAL]: val, [VAR_SRC]: src, ...ctx }, true) as Value)
        : val;
    },
  };
};

export const createSelectAction = (trvDef: TrvDef[]): SelectAction => {
  return (
    trvDef.length > 0 && {
      exec: (src) => {
        return trvByPaths([src], trvDef).res;
      },
    }
  );
};

export const createUpdateAction = (
  trvDef: TrvDef[],
  enableObjectCreation = false
): UpdateAction => {
  return (
    trvDef.length > 0 && {
      exec: (src, values, graph) => {
        const { objs, trvIdx } = trvByPaths([src], trvDef);

        const { eg, refBy } = trvDef[trvIdx];

        const subGraph = {} as DataGraph;
        if (objs.length > 0) {
          if (trvIdx === trvDef.length - 1) {
            objs.forEach((obj: Data) => {
              // If edge exist, apply value - value here is true value
              // !eg is only for A | B case currently
              if (eg) {
                obj[eg] = values.length > 1 ? values : values[0];
              }
            });
          } else if (trvIdx === trvDef.length - 2) {
            // link
            const lastTrvDef = trvDef[trvIdx + 1];
            if (lastTrvDef.eg) {
              // TODO: how about partial match?
              const endResult = (graph[lastTrvDef.vs] || []).filter((obj) =>
                values.includes(obj[lastTrvDef.eg])
              );

              if (enableObjectCreation && endResult.length === 0) {
                // if not endResult create new objects
                const createdObjects = values.map((v) =>
                  createObject(lastTrvDef.vs, {
                    [lastTrvDef.eg]: v,
                  })
                );
                subGraph[lastTrvDef.vs] = createdObjects;
                endResult.push(...createdObjects);
              }

              if (endResult.length > 0) {
                // A.a > B.b
                createRefs(objs, endResult, eg, refBy);
              }
            } else {
              // A.a > B
              createRefs(objs, values as Data[], eg, refBy);
            }
          } else {
            // not supported yet, will skip
            console.log('not supported yet, will skip');
          }
        }
        return subGraph;
      },
    }
  );
};
