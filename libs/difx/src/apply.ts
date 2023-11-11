import {
  ActionType,
  Patch,
  Options,
  Change,
} from './types';
import { preview } from './preview';


/**
 * Apply change to generate target object
 *
 * @param change change from diff 
 * @return result
 */
export const applyChange = (
  change: Change
): { key: string; tar: unknown } => {
  if (change.sub?.length > 0) {
    const res = change.sub
      .filter((p) => p.act !== ActionType.DELETE)
      .map((p) => applyChange(p));

    return {
      key: change.key,
      tar: change.arr
        ? res.map((v) => v.tar)
        : res.reduce((acc, { key, tar }) => {
            acc[key] = tar;
            return acc;
          }, {}),
    };
  } else {
    const { key, tar } = change;
    return { key, tar };
  }
};

/*
// Approach 2: Overload signatures
export function apply(src: unknown, patch: Patch, options: { dryRun: true }): Change;
export function apply(src: unknown, patch: Patch, options: { dryRun: false }): unknown;
*/

/**
 * Apply patch to given source and generate target object
 * @param src source object
 * @param patch patch
 * @param opts options
 * @returns target objects
 */
export const apply =(
  src: unknown,
  patch: Patch,
  opts = {} as Options,
): unknown => {
  return applyChange(preview(src, patch, opts)).tar;
}