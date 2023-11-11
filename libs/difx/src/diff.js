import { isArray, isPrimitive } from './utils';

/**
 *
 * @typedef {Object} Action
 * @property {number} idx - Index of the element that takes this action
 * @property {string} key - Key of the element that takes this action
 * @property {Object} val - content of the change - sub patch for merge case, src/tar value for other case
 *
 * @typedef {Object} Preview
 * @property {string} act - type of the action
 * @property {string} key - Key of the element that takes change
 * @property {string|number|boolean} [src] - Primitive value to present a source object or primitive value itself
 * @property {string|number|boolean} [tar] - Primitive value to present a target object or primitive value itself
 * @property {boolean} [arr] - true if the node is an array
 * @property {Preview[]} [sub] - sub attributes on current object
 * @property {boolean} [mov] - true if the node is moved
 *
 *
 * @typedef {Object} PreviewNode
 * @property {string} tag - tag on current node
 * @property {string} act - type of the action
 * @property {string} src - src name of current node
 * @property {string} tar - tar name of current node
 * @property {boolean} [mov] - true if the node is moved
 * @property {Preview[]} [att] - primitive attributes diff on current object
 * @property {PreviewNode[]} [sub] - children diff on current object
 *
 * This is not very useful
 * @typedef {'M' | 'U' | 'D' | 'R' | 'A' } ActionTypeEnum
 *
 *
 * @typedef {Object} Patch
 * @property {Action[]} [M] - Changes for Merge.
 * @property {Action[]} [U] - Changes for Update
 * @property {Action[]} [D] - Changes for Delete
 * @property {Action[]} [R] - Changes for Reorder - mostly be a snapshot for target indices
 * @property {Action[]} [A] - Changes for Add
 *
 * @typedef {Object} Option
 * @property {boolean} [reorder] - If true keep order info in diff for reorder.
 * @property {(val) => string} [getKey] - Call back to get key for object in array
 * @property {(val) => string} [getName] - Get display name for object
 *
 */

/**
 * Enum for tri-state values.
 * @readonly
 * @enum {string}
 */
export const ActionType = {
  MERGE: 'M',
  UPDATE: 'U',
  DELETE: 'D',
  REORDER: 'R',
  ADD: 'A',
  NONE: 'N',
};

/**
 * Differentiate two array and get the patch
 *
 * @param {Object} src source object
 * @param {Object} tar target object
 * @param {Option} opts options
 * @return {Patch} patch object
 */
export const diff = (src, tar, opts = {}) => {
  // Mark all elements from list1 in the map
  const { reorder, getKey } = opts;
  const getObjectKey = (val) => (getKey && getKey(val)) || JSON.stringify(val);

  const isSrcArr = isArray(src);
  const isTarArr = isArray(tar);
  const srcMap = Object.entries(src).reduce((acc, [key, val], idx) => {
    key = isSrcArr ? getObjectKey(val) : key;
    acc[key] = { idx, key, val };
    return acc;
  }, {});

  const matches = [];

  // Iterate over list2 and check against the map
  const patch = {
    ...Object.entries(tar).reduce(
      /**
       * @param {Record<string,Action[]>} acc
       * @param {[string, Object.<string,any>]} entries
       * @param {number} tarIdx
       * @returns {Record<string,Action[]>}
       */
      (acc, [tarKey, tarVal], tarIdx) => {
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
          } else if (
            !isPrimitive(srcVal) &&
            !isPrimitive(tarVal) &&
            !isArray(srcVal) &&
            !isArray(tarVal)
          ) {
            // do something
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
      },
      {}
    ),
    ...Object.entries(srcMap).reduce(
      /**
       * @param {Record<string,Action[]>} acc
       * @param {[string, any]} param1
       * @returns {Record<string,Action[]>}
       */
      (acc, [_, { idx, key, val }]) => {
        return {
          [ActionType.DELETE]: (acc[ActionType.DELETE] || []).concat({
            idx,
            key,
            val,
          }),
        };
      },
      {}
    ),
    // There is noting we can do for move before we apply it on the src.
    // For example, we can calculate the diff on [1, 2, 3] -> [3, 2, 1], then apply it on [3, 2, 1]
    // So we simply record the target index and source index map.
    ...(reorder
      ? {
          [ActionType.REORDER]: matches
            .map(({ srcIdx, tarIdx, key }) => ({
              idx: srcIdx,
              key,
              val: tarIdx,
            }))
            .sort((a, b) => a.idx - b.idx),
        }
      : {}),
  };

  return patch;
};

const expandDeleteObject = (val, getObjectKey) => {
  if (isPrimitive(val)) {
    return {
      src: val,
      tar: undefined,
    };
  } else {
    const isArr = isArray(val);
    return {
      ...(isArr ? { arr: true } : {}),
      sub: Object.entries(val).map(([k, v]) => ({
        act: ActionType.DELETE,
        key: isArr ? getObjectKey(v) : k,
        ...expandDeleteObject(v, getObjectKey),
      })),
    };
  }
};

const expandAddObject = (val, getObjectKey) => {
  if (isPrimitive(val)) {
    return {
      src: undefined,
      tar: val,
    };
  } else {
    const isArr = isArray(val);
    return {
      ...(isArr ? { arr: true } : {}),
      sub: Object.entries(val).map(([k, v]) => ({
        act: ActionType.ADD,
        key: isArr ? getObjectKey(v) : k,
        ...expandAddObject(v, getObjectKey),
      })),
    };
  }
};

/**
 * Preview patch on the source object
 *
 * @param {Object} src source object
 * @param {Patch} patch patch object
 * @param {Option} opts options
 * @return {Preview} result
 */
export const preview = (src, patch, opts = {}) => {
  const { getKey } = opts;
  const getObjectKey = (val) => (getKey && getKey(val)) || JSON.stringify(val);

  const isSrcArr = isArray(src);
  const srcAsArray = Object.entries(src).map(([k, v], idx) => ({
    idx,
    key: isSrcArr ? getObjectKey(v) : k,
    val: v,
  }));

  /** @type {Preview[]} PreviewObject */
  const res = srcAsArray.map(({ key }) => ({
    act: ActionType.NONE,
    key,
  }));

  // track changes
  let changed = false;

  // apply patch
  (patch[ActionType.MERGE] || []).forEach(({ idx, key, val }) => {
    if (idx < srcAsArray.length) {
      const { key: srcKey } = srcAsArray[idx];
      if (srcKey === key) {
        const { arr, sub } = preview(srcAsArray[idx].val, val, opts);
        changed = true;
        res[idx].act = ActionType.UPDATE;
        res[idx].sub = sub;
        if (arr) {
          res[idx].arr = arr;
        }
      } else {
        console.warn(
          'MERGE: Key not match, will skip now. Need to be enhanced if we want to do more'
        );
      }
    }
  });

  // apply update
  (patch[ActionType.UPDATE] || []).forEach(({ idx, key, val }) => {
    if (idx < srcAsArray.length) {
      const { key: srcKey, val: srcVal } = srcAsArray[idx];
      if (srcKey === key) {
        changed = true;
        res[idx].act = ActionType.UPDATE;
        // TODO: if either src or tar is not primitive we need sub
        res[idx].src = srcVal;
        res[idx].tar = val;
      } else {
        console.warn(
          'UPDATE: Key not match, will skip now. Need to be enhanced if we want to do more'
        );
      }
    }
  });

  // apply delete
  (patch[ActionType.DELETE] || []).forEach(({ idx, key }) => {
    if (idx < srcAsArray.length) {
      const { key: srcKey, val: srcVal } = srcAsArray[idx];
      if (srcKey === key) {
        changed = true;
        res[idx] = {
          act: ActionType.DELETE,
          key,
          ...expandDeleteObject(srcVal, getObjectKey),
        };
      } else {
        console.warn(
          'DELETE: Key not match, will skip now. Need to be enhanced if we want to do more'
        );
      }
    }
  });

  // apply none (expand)
  res.forEach((v, idx) => {
    if (v.act === ActionType.NONE) {
      const val = srcAsArray[idx].val;
      if (isPrimitive(val)) {
        v.src = val;
        v.tar = val;
      } else {
        const { arr, sub } = preview(srcAsArray[idx].val, {}, opts);
        if (arr) {
          v.arr = true;
        }
        v.sub = sub;
      }
    }
  });

  // apply move
  if (patch[ActionType.REORDER]) {
    const moves = patch[ActionType.REORDER].reduce((acc, { idx, key, val }) => {
      if (res[idx] && res[idx].key === key) {
        acc.push({
          idx,
          key,
          val,
        });
      } else {
        // TODO: search by key and update the idx
        console.warn(
          'REORDER: Key not match, will skip now. Need to be enhanced if we want to do more'
        );
      }
      return acc;
    }, []);

    const srcIndices = moves.map(({ idx }) => idx);

    const relatedMoves = moves
      .sort((a, b) => a.val - b.val)
      .reduce(
        (acc, { idx, key }, i) => {
          const { res, prevIdx } = acc;
          res.push({
            idx,
            key,
            val: srcIndices[i],
            mov: prevIdx > idx,
          });

          return {
            res,
            prevIdx: idx,
          };
        },
        {
          res: [],
          prevIdx: 0,
        }
      ).res;

    const clonedRes = [...res];
    relatedMoves.forEach(({ idx, val, mov }) => {
      res[val] = clonedRes[idx];
      if (mov) {
        changed = true;
        res[val].mov = true;
      }
    });
  }

  // apply add
  (patch[ActionType.ADD] || []).forEach(({ idx, key, val }) => {
    changed = true;
    res.splice(idx, 0, {
      act: ActionType.ADD,
      key,
      ...expandAddObject(val, getObjectKey),
    });
  });

  return {
    act: changed ? ActionType.UPDATE : ActionType.NONE,
    key: 'root',
    ...(isArray(src) ? { arr: true } : {}),
    sub: res,
  };
};

/**
 * Apply patch to the source object
 *
 * @param {Object} preview preview data
 * @return {Object} result
 */
export const applyPreview = (preview) => {
  if (preview.sub?.length > 0) {
    const res = preview.sub
      .filter((p) => p.act !== ActionType.DELETE)
      .map((p) => applyPreview(p));

    return {
      key: preview.key,
      tar: preview.arr
        ? res.map((v) => v.tar)
        : res.reduce((acc, { key, tar }) => {
            acc[key] = tar;
            return acc;
          }, {}),
    };
  } else {
    const { key, tar } = preview;
    return { key, tar };
  }
};

export const apply = (src, patch, opts) => {
  return applyPreview(preview(src, patch, opts)).tar;
};

/**
 * Convert preview to preview node
 *
 * @param {Preview} preview  preview data
 * @param {Object} opts options
 * @returns {PreviewNode} preview node array
 */
const toPreviewNode = (preview, opts) => {
  // getName API
  const getName = (p) => {
    const { src, tar } = (p.sub || []).filter((s) => s.key === opts.name)[0] || {
      src: '<object>',
      tar: '<object>',
    };
    return { src, tar };
  };

  const { att, sub } = (preview.sub || []).reduce(
    ({ att, sub }, p) => {
      if (p.arr) {
        p.sub.forEach((sp) => {
          if (sp.arr) {
            throw new Error('Not support array of array yet');
          } else if (sp.sub?.length > 0) {
            sub.push(
              toPreviewNode(sp, {
                ...opts,
                tag: p.key,
              })
            );
          } else {
            att.push({ ...sp, key: sp.key });
          }
        });
      } else if (p.sub?.length > 0) {
        sub.push(
          toPreviewNode(p, {
            ...opts,
            tag: p.key,
          })
        );
      } else {
        att.push(p);
      }
      return { att, sub };
    },
    {
      att: [],
      sub: [],
    }
  );

  // get att
  return {
    act: preview.act,
    tag: opts.tag,
    ...getName(preview),
    ...(preview.mov ? { mov: true } : {}),
    ...(att.length > 0 ? { att } : {}),
    ...(sub.length > 0 ? { sub } : {}),
  };
};

/**
 * convert preview to preview node list.
 *
 * @param {Preview} preview root preview object
 * @param {Object}  opts options
 * @returns {PreviewNode[]} preview node list
 */
export const toPreviewNodeList = (
  preview,
  opts = {
    tag: 'root',
  }
) => {
  // object array case
  if (preview.arr && preview.sub.filter((p) => !p.sub?.length).length === 0) {
    return preview.sub.map((p) => {
      return toPreviewNode(p, opts);
    });
  } else {
    return [toPreviewNode(preview, opts)];
  }
};
