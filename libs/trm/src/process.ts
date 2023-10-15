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
} from "./types";
import { KEY_TRM, KEY_TYPE } from "./const";
import {
  createApplyAction,
  createSelectAction,
  createUpdateAction,
  createWhereAction,
} from "./action";
import { trvByPath, trvByPaths } from "./graph";
import {
  parseTrvRule,
  parseMutationRules,
  parseTransformRules,
  getSourceType,
  getTargetType,
  getTargetEndType,
} from "./parse";

import { mergeDataGraph, purifyGraph } from "./graph";
import { groupByAct } from "./rule";

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
          if (!flow.where.exec(src, { trv })) {
            return g;
          }
          const res = flow.select.exec(src);
          const applied = res.map((r) =>
            flow.apply.exec(r, { trv })
          ) as Value[];
          const subGraph = flow.update.exec(src, applied, g);
          return mergeDataGraph(g, subGraph);
        }, graph),
    };
  });
};

export const createTransforms = (defsByType: RuleDef[][]): Transform[] => {
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
        return srcDF.reduce((g, src) => {
          // if flow[0].where.exec(src) is false, we don't need to do anything
          if (!flows[0].where.exec(src, { trv })) {
            return g;
          }

          // TODO: we shouldn't create new object if source traversal returns nothing
          const targetStartObjects = trvByPath([src], {
            eg: KEY_TRM,
            vs: sourceStartType,
            ve: targetStartType,
          });

          if (targetStartObjects.length === 0) {
            targetStartObjects.push({
              [KEY_TYPE]: targetStartType,
            });
            src[KEY_TRM] = (src[KEY_TRM] || []).concat(targetStartObjects);
            g = mergeDataGraph(g, {
              [targetStartType]: targetStartObjects,
            });
          }

          return flows.reduce((g1: DataGraph, flow: ActionFlow) => {
            if (!flow.where.exec(src, { trv })) {
              return g1;
            }
            const res = flow.select.exec(src).reduce(
              (acc2, value) =>
                acc2.concat(
                  typeof value === "object"
                    ? trvByPath([value], {
                        eg: KEY_TRM,
                        // TODO: need to remove targetEndType here
                        vs: "",
                        ve: flow.targetEndType,
                      })
                    : [value]
                ),
              []
            );
            const applied = res.map((r) =>
              flow.apply.exec(r, { trv })
            ) as Value[];
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
  rules: RuleInput[],
  purify = true
): ((source: DataGraph) => DataGraph) => {
  const ruleSet = groupByAct(rules);
  const processes = ruleSet.map(({ mutations: mRules, transforms: tRules }) => {
    const mutations = createMutations(parseMutationRules(mRules));
    const transforms = createTransforms(parseTransformRules(tRules));
    return (source: DataGraph) => process(source, mutations, transforms);
  });
  return (source: DataGraph) =>
    purify
      ? purifyGraph(processes.reduce((prev, p) => p(prev), source))
      : processes.reduce((prev, p) => p(prev), source);
};
