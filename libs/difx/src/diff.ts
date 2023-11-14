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
  const { reorder, key, fuzzy } = opts;
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
          // NOTE: even only reorder, we still need to mark it as MERGE,
          // otherwise the delta info will be lost.
          if (Object.keys(subPatch).length > 0) {
            acc[ActionType.MERGE] = (acc[ActionType.MERGE] || []).concat({
              idx: srcIdx,
              key,
              val: subPatch,
            });
          }
        } else if (isObject(srcVal) && isObject(tarVal)) {
          const subPatch = diff(srcVal, tarVal, opts);
          if (Object.keys(subPatch).length > 0) {
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
  };

  // fuzzy matching for ADD and DELETE in additional
  // - use the length of the key (JSON.stringify(val) actually) to do the compare with fuzzy factor
  // - assuming the add and delete follows some order, trying to balance the forward step between add and delete
  // - balance between accuracy and performance, can be improve later
  if (fuzzy) {
    if (fuzzy > 0 && fuzzy < 1) {
      const maxFuzzyRange = 1 + fuzzy;
      const minFuzzyRange = 1 - fuzzy;
      const newAdd = [];
      const newDel = [];
      let i = 0,
        j = 0;
      const addLen = patch[ActionType.ADD]?.length || 0;
      const delLen = patch[ActionType.DELETE]?.length || 0;
      for (; i < addLen && j < delLen; ) {
        const add = patch[ActionType.ADD][i];
        const del = patch[ActionType.DELETE][j];
        if (
          add.key.length / del.key.length > minFuzzyRange &&
          add.key.length / del.key.length < maxFuzzyRange
        ) {
          const subPatch = diff(del.val, add.val, opts);
          patch[ActionType.MERGE] = (patch[ActionType.MERGE] || []).concat({
            idx: del.idx,
            key: del.key,
            val: subPatch,
          });
          matches.push({ srcIdx: del.idx, tarIdx: add.idx, key: add.key });
          i++;
          j++;
        } else {
          // move forward at the bigger side - try to find a balance between accuracy and performance
          const addLeft = addLen - i;
          const delLeft = delLen - j;
          if (addLeft > delLeft) {
            newAdd.push(add);
            i++;
          } else {
            newDel.push(del);
            j++;
          }
        }
      }

      for (; i < (patch[ActionType.ADD]?.length || 0); i++) {
        newAdd.push(patch[ActionType.ADD][i]);
      }

      for (; j < (patch[ActionType.DELETE]?.length || 0); j++) {
        newDel.push(patch[ActionType.DELETE][j]);
      }

      patch[ActionType.ADD] = newAdd;
      patch[ActionType.DELETE] = newDel;
    } else {
      console.warn(
        `fuzzy should be a number between 0 and 1, but got ${fuzzy}. Will ignore`
      );
    }
  }

  // then reorder
  if (reorder) {
    patch[ActionType.REORDER] = matches
      .map(({ srcIdx, tarIdx, key }) => ({
        idx: srcIdx,
        key,
        val: tarIdx,
      }))
      .sort((a, b) => a.val - b.val);
  }

  return patch;
};
