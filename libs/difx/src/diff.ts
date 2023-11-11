import { ActionType, IndexedKeyValue, Patch, Options } from './types';
import { isArray, isObject } from '@pscale/util';

/**
 * Differentiate two array and get the patch
 *
 * @param src source object
 * @param tar target object
 * @param opts options
 * @return patch object
 */
export const diff = (
  src: unknown,
  tar: unknown,
  opts = {} as Options
): Patch => {
  // Mark all elements from list1 in the map
  const { reorder, key } = opts;
  const getObjectKey = (val): string =>
    (val && key && val[key]) || JSON.stringify(val);

  const isSrcArr = isArray(src);
  const isTarArr = isArray(tar);
  const srcMap = Object.entries(src).reduce((acc, [key, val], idx) => {
    key = isSrcArr ? getObjectKey(val) : key;
    acc[key] = { idx, key, val };
    return acc;
  }, {} as Record<string, IndexedKeyValue>);

  const matches = [];

  // Iterate over list2 and check against the map
  const patch: Patch = {
    ...Object.entries(tar).reduce((acc, [tarKey, tarVal], tarIdx) => {
      const key = isTarArr ? getObjectKey(tarVal) : tarKey;
      if (Object.prototype.hasOwnProperty.call(srcMap, key)) {
        const { idx: srcIdx, val: srcVal } = srcMap[key];
        if (isArray(srcVal) && isArray(tarVal)) {
          const subPatch = diff(srcVal, tarVal, opts);
          // only REORDER
          if (Object.keys(subPatch).length > (reorder ? 1 : 0)) {
            acc[ActionType.MERGE] = (acc[ActionType.MERGE] || []).concat({
              idx: srcIdx,
              key,
              val: subPatch,
            });
          }
        } else if (isObject(srcVal) && isObject(tarVal)) {
          const subPatch = diff(srcVal, tarVal, opts);
          if (Object.keys(subPatch).length > (reorder ? 1 : 0)) {
            acc[ActionType.MERGE] = (acc[ActionType.MERGE] || []).concat({
              idx: srcIdx,
              key,
              val: subPatch,
            });
          }
        } else {
          if (srcVal !== tarVal) {
            acc[ActionType.UPDATE] = (acc[ActionType.UPDATE] || []).concat({
              idx: srcIdx,
              key,
              val: tarVal,
            });
          }
        }

        // TODO: need better approach
        matches.push({ srcIdx, tarIdx, key });

        // remove from map
        delete srcMap[key];
      } else {
        acc[ActionType.ADD] = (acc[ActionType.ADD] || []).concat({
          idx: tarIdx,
          key,
          val: tarVal,
        });
      }
      return acc;
    }, {}),
    ...Object.entries(srcMap).reduce((acc, [_, { idx, key, val }]) => {
      return {
        [ActionType.DELETE]: (acc[ActionType.DELETE] || []).concat({
          idx,
          key,
          val,
        }),
      };
    }, {} as Patch),
    // There is noting we can do for move before we apply it on the src.
    // For example, we can calculate the diff on [1, 2, 3] -> [3, 2, 1], then apply it on [3, 2, 1]
    // So we simply record the target index and source index map.
    ...(reorder
      ? {
          [ActionType.REORDER]: matches.map(({ srcIdx, tarIdx, key }) => ({
            idx: srcIdx,
            key,
            val: tarIdx,
          })),
        }
      : {}),
  };

  return patch;
};
