export { diff } from './diff';
export { view, viewChange } from './view';
export { apply, applyChange } from './apply';
export { preview } from './preview';
export { ActionType } from './types';
export type { Change, ViewNode } from './types';

/**
// high-level API 
const patch = diff(src, tar, opts);
const nodes = view(src, patch, opts);
const final = apply(src, patch, opts);

// low-level API
const change = preview(src, patch, opts);
const nodes  = viewChange(change, opts);
const final  = applyChange(change);
 */

/**
Base   - version 6.0
Source - version 6.1
Target - version 7.0
 */