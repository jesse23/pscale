import { preview } from './preview';
import { ActionType, Change, Patch, ViewNode, ViewOptions } from './types';

/**
 * Convert change to view node
 *
 * @param change change from compare
 * @param opts options for converting view nodes
 * @returns view node
 */
const toNode = (change: Change, opts: ViewOptions): ViewNode => {
  const { att, sub } = (change.sub || []).reduce(
    ({ att, sub }, p) => {
      if (p.arr) {
        p.sub.forEach((sp) => {
          if (sp.arr) {
            throw new Error('Not support array of array yet');
          } else if (sp.sub?.length > 0) {
            sub.push(
              toNode(sp, {
                ...opts,
                defaultTag: p.key,
              })
            );
          } else {
            att.push({ ...sp, key: sp.key });
          }
        });
      } else if (p.sub?.length > 0) {
        sub.push(
          toNode(p, {
            ...opts,
            defaultTag: p.key,
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

  // getTag callback
  const getTag = (p) => {
    const { src, tar } = (p.sub || []).filter((s) => s.key === opts.tag)[0] || {
      src: undefined,
      tar: undefined,
    };

    // assuming tag is not going to change, so use whatever has value
    const res =
      src !== undefined
        ? String(src)
        : tar !== undefined
        ? String(tar)
        : undefined;
    return res || opts.defaultTag;
  };

  // getName callback
  const getName = (p, act) => {
    const tagName = getTag(p);
    const { src, tar } =
      (p.sub || []).filter((s) => s.key === opts.name)[0] ||
      (act === ActionType.ADD
        ? {
            src: undefined,
            tar: tagName || '<object>',
          }
        : act == ActionType.DELETE
        ? {
            src: tagName || '<object>',
            tar: undefined,
          }
        : {
            src: tagName || '<object>',
            tar: tagName || '<object>',
          });
    return { src, tar };
  };

  // get att
  return {
    act: change.act,
    tag: getTag(change),
    ...getName(change, change.act),
    ...(change.mov ? { mov: true } : {}),
    ...(att.length > 0 ? { att } : {}),
    ...(sub.length > 0 ? { sub } : {}),
  };
};

/**
 * convert top level change to view nod list.
 *
 * @param change top level change
 * @param  opts options for converting view nodes
 * @returns view nod list
 */
export const viewChange = (
  change: Change,
  opts = {
    defaultTag: 'root',
  } as ViewOptions
): ViewNode[] => {
  // object array case
  if (change.arr && change.sub.filter((p) => !p.sub?.length).length === 0) {
    return change.sub.map((p) => {
      return toNode(p, opts);
    });
  } else {
    return [toNode(change, opts)];
  }
};

export const view = (
  src: unknown,
  patch: Patch,
  opts = {} as ViewOptions
): ViewNode[] => {
  return viewChange(preview(src, patch, opts), opts);
};
