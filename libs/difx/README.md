# difx

Diff data structure in O(n) with some assumptions.

## Usage
```javascript
// high-level API 
const patch = diff(src, tar, opts);
const nodes = view(src, patch, opts);
const final = apply(src, patch, opts);

// low-level API
const patch = diff(src, tar, opts);
const change = preview(src, patch, opts);
const nodes  = viewChange(change, opts);
const final  = applyChange(change);
```
