import {
  ActionFlow,
  Data,
  DataFrame,
  DataGraph,
  Mutation,
  RuleDef,
  RuleInput,
  Transform,
  Value,
} from './types';
import { KEY_TRM } from './const';
import {
  createApplyAction,
  createSelectAction,
  createUpdateAction,
  createWhereAction,
} from './action';
import { createObject, trvByPath, trvByPaths } from './graph';
import {
  parseTrvRule,
  parseTransformRules,
  getSourceType,
  getTargetType,
  getTargetEndType,
  groupByStartType,
} from './parse';

import { mergeDataGraph } from './graph';
import { groupByAct } from './rule';

export const trv = (
  src: Data,
  trvPath: string,
  asArray = false
): Data[] | Data => {
  const res = trvByPaths([src], parseTrvRule(trvPath)).res as Data[];
  return asArray ? res : res.length > 1 ? res : res[0];
};

export const createMutations = (mutationDefs: RuleDef[]): Mutation[] => {
  return mutationDefs.map((def) => {
    const flow = {
      where: createWhereAction(def.cond),
      apply: createApplyAction(def.func),
      select: createSelectAction(def.src),
      update: createUpdateAction(def.tar, false),
    };
    return {
      sourceType: getSourceType(def),
      targetType: getTargetType(def),
      mutation: (srcDF: DataFrame, graph: DataGraph) =>
        srcDF.reduce((g: DataGraph, src: Data) => {
          const res = flow.select.exec(src);
   
          const applied = res.map((r) => {
            if(flow.where.exec(r, src, { trv })) {
              return flow.apply.exec(r, src, { trv })
            }
          }
          ).filter(v => v !== undefined) as Value[];

          if( applied.length === 0 ) {
            return g;
          }

          const subGraph = flow.update.exec(src, applied, g);
          return mergeDataGraph(g, subGraph);
        }, graph),
    };
  });
};

export const createTransforms = (ruleDefs: RuleDef[]): Transform[] => {
  const defsByType = groupByStartType(ruleDefs);
  return defsByType.map((transformDefs) => {
    const flows = transformDefs.map((def) => ({
      where: createWhereAction(def.cond),
      apply: createApplyAction(def.func),
      select: createSelectAction(def.src),
      update: createUpdateAction(def.tar, true),
      targetEndType: getTargetEndType(def),
    }));

    const sourceStartType = getSourceType(transformDefs[0]);
    const targetStartType = getTargetType(transformDefs[0]);

    return {
      sourceType: sourceStartType,
      targetType: targetStartType,
      transform: (srcDF: DataFrame, graph: DataGraph) => {
        return flows.reduce((g: DataGraph, flow: ActionFlow, idx: number) => {
          return srcDF.reduce((g1, src) => {
            const res = flow.select.exec(src).reduce(
              (acc2, value) =>
                acc2.concat(
                  typeof value === 'object'
                    ? trvByPath([value], {
                        eg: KEY_TRM,
                        // TODO: need to remove targetEndType here
                        vs: '',
                        ve: flow.targetEndType,
                      })
                    : [value]
                ),
              []
            );

            // TODO: need better condition support
            if (!flow.where.exec(null, src, { trv })) {
              return g1;
            }

            const applied = res.map((r) => {
              return flow.apply.exec(r, src, { trv });
            }) as Value[];

            const targetStartObjects = trvByPath([src], {
              eg: KEY_TRM,
              vs: sourceStartType,
              ve: targetStartType,
            });

            // - Only create targetStartObject on rule index 0
            // - We should put stopper when applied is empty
            if (targetStartObjects.length === 0 && idx === 0) {
              targetStartObjects.push(createObject(targetStartType));
              src[KEY_TRM] = (src[KEY_TRM] || []).concat(targetStartObjects);
              g1 = mergeDataGraph(g1, {
                [targetStartType]: targetStartObjects,
              });
            }

            return targetStartObjects.reduce((g2, targetObject) => {
              const newObjects = flow.update.exec(targetObject, applied, g2);
              src[KEY_TRM] = (src[KEY_TRM] || []).concat(
                ...Object.values(newObjects)
              );
              return mergeDataGraph(g2, newObjects);
            }, g1);
          }, g);
        }, graph);
      },
    };
  });
};

export const process = (
  source: DataGraph,
  mutations: Mutation[],
  transforms: Transform[]
): DataGraph => {
  const mutated = mutations.reduce(
    (prev, m) => m.mutation(prev[m.sourceType], prev),
    source
  );

  return transforms.length > 0
    ? transforms.reduce(
        (target, t) => t.transform(mutated[t.sourceType], target),
        {} as DataGraph
      )
    : mutated;
};

export const createProcess = (
  rules: RuleInput[]
): ((source: DataGraph) => DataGraph) => {
  const ruleSet = groupByAct(rules);
  const processes = ruleSet.map(({ mutations: mRules, transforms: tRules }) => {
    const mutations = createMutations(parseTransformRules(mRules));
    const transforms = createTransforms(parseTransformRules(tRules));
    return (source: DataGraph) => process(source, mutations, transforms);
  });
  return (source: DataGraph) => processes.reduce((prev, p) => p(prev), source);
};
