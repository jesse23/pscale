import {
  ActionType,
  IndexedKeyValue,
  Patch,
  Options,
  Change,
  ChangeContent,
} from './types';
import { isArray, isPrimitive } from '@pscale/util';

/**
 * expand deleted element/attribute to preview
 *
 * @param val value as element/attribute
 * @param getObjectKey call back to get key from object
 * @returns preview content for current object
 */
const expandDeleteObject = (
  val: unknown,
  getObjectKey: (string) => string
): ChangeContent => {
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

/**
 * expand added element/attribute to preview
 *
 * @param val value as element/attribute
 * @param getObjectKey call back to get key from object
 * @returns preview content for current object
 */
const expandAddObject = (
  val: unknown,
  getObjectKey: (string) => string
): ChangeContent => {
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
 * Differentiate two array and get the patch
 *
 * @param src source object
 * @param patch target object
 * @param opts options
 * @return patch object
 */
export const preview = (
  src: unknown,
  patch: Patch,
  opts = {} as Options
): Change => {
  const { key } = opts;
  const getObjectKey = (val): string =>
    (val && key && val[key]) || JSON.stringify(val);

  const isSrcArr = isArray(src);
  const srcAsArray: IndexedKeyValue[] = Object.entries(src).map(
    ([k, v], idx) => ({
      idx,
      key: isSrcArr ? getObjectKey(v) : k,
      val: v,
    })
  );

  const srcKeyMap = srcAsArray.reduce((acc, idxKeyVal) => {
    acc[idxKeyVal.key] = idxKeyVal;
    return acc;
  }, {} as Record<string, IndexedKeyValue>);

  const res: Change[] = srcAsArray.map(({ key }) => ({
    act: ActionType.NONE,
    key,
  }));

  // track changes
  let changed = false;

  // apply patch
  (patch[ActionType.MERGE] || []).forEach(({ idx, key, val }) => {
    const srcIdxKeyVal =
      srcAsArray[idx] && srcAsArray[idx].key === key
        ? srcAsArray[idx]
        : srcKeyMap[key];
    if (srcIdxKeyVal) {
      const { idx } = srcIdxKeyVal;
      const { act, arr, sub } = preview(srcIdxKeyVal.val, val, opts);
      changed = changed || act !== ActionType.NONE;
      res[idx].act = act;
      res[idx].sub = sub;
      if (arr) {
        res[idx].arr = arr;
      }
    } else {
      // console.log(`MERGE: No matching by {idx: ${idx}, key: ${key}, val: ${val}}.`);
    }
  });

  // apply update
  (patch[ActionType.UPDATE] || []).forEach(({ idx, key, val }) => {
    const srcIdxKeyVal =
      srcAsArray[idx] && srcAsArray[idx].key === key
        ? srcAsArray[idx]
        : srcKeyMap[key];
    if (srcIdxKeyVal) {
      const { val: srcVal } = srcIdxKeyVal;
      changed = true;
      res[idx].act = ActionType.UPDATE;
      if (isPrimitive(srcVal) && isPrimitive(val)) {
        res[idx].src = srcVal;
        res[idx].tar = val;
      } else {
        res[idx].sub = [
          {
            act: ActionType.ADD,
            key,
            ...expandAddObject(val, getObjectKey),
          },
          {
            act: ActionType.DELETE,
            key,
            ...expandDeleteObject(srcVal, getObjectKey),
          },
        ];
      }
    } else {
      // console.log(`UPDATE: No matching by {idx: ${idx}, key: ${key}, val: ${val}}.`);
    }
  });

  // apply delete
  (patch[ActionType.DELETE] || []).forEach(({ idx, key, /*val*/ }) => {
    const srcIdxKeyVal =
      srcAsArray[idx] && srcAsArray[idx].key === key
        ? srcAsArray[idx]
        : srcKeyMap[key];
    if (srcIdxKeyVal) {
      const { val: srcVal } = srcIdxKeyVal;
      changed = true;
      res[idx] = {
        act: ActionType.DELETE,
        key,
        ...expandDeleteObject(srcVal, getObjectKey),
      };
    } else {
      // console.log(`DELETE: No matching by {idx: ${idx}, key: ${key}, val: ${val}}.`);
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
    const srcTarIndices = patch[ActionType.REORDER].reduce(
      (acc, { idx, key, val }) => {
        const srcIdxKeyVal =
          srcAsArray[idx] && srcAsArray[idx].key === key
            ? srcAsArray[idx]
            : srcKeyMap[key];
        if (srcIdxKeyVal) {
          const { idx } = srcIdxKeyVal;
          acc.push({
            idx,
            key,
            val,
          });
        } else {
          // console.log(`REORDER: No matching by {idx: ${idx}, key: ${key}, val: ${val}}.`);
        }
        return acc;
      },
      []
    );

    // srcIndices:    srcIdx asc
    // srcTarIndices: tarIdx asc
    const srcIndices = [...srcTarIndices]
      .sort((a, b) => a.idx - b.idx)
      .map(({ idx }) => idx);

    const relativeMoves = srcTarIndices.reduce(
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
    relativeMoves.forEach(({ idx, val, mov }) => {
      res[val] = clonedRes[idx];
      if (mov) {
        changed = true;
        res[val].mov = true;
      }
    });
  }

  // apply add
  (patch[ActionType.ADD] || []).forEach(({ idx, key, val }) => {
    // TODO: if key exists the don't update
    if (srcKeyMap[key]) {
      // console.log(`ADD: {idx: ${idx}, key: ${key}, val: ${val}} already exists. Skip.`);
    } else {
      changed = true;
      res.splice(idx, 0, {
        act: ActionType.ADD,
        key,
        ...expandAddObject(val, getObjectKey),
      });
    }
  });

  return {
    act: changed ? ActionType.UPDATE : ActionType.NONE,
    key: 'root',
    ...(isArray(src) ? { arr: true } : {}),
    sub: res,
  };
};
