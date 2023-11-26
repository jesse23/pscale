# RFC 004 - [Draft] Preview and Apply

## Background

Ability to apply patch to destination, generate both preview and final result.

### Problem

While apply patch to a destimation, the destination might be different with source.

## Proposal

### Patch Flow

Given a patch result, while applying it to destination, we need to apply the patch in order below:

```
MERGE => UPDATE => DELETE => ADD => REORDER => (NO CHANGE)
```

- Merge and Update will rely on source index, so they will go first
- Delete relys on source index too but it start changes the index order.
- Add will rely on the target index which is close to the result after applying delete. But start from here we need to consider shift...will be discussed in follow up RFC. 
- Reorder needs to be recalculated based on index in destination data structure.

### Preview

- For `preview`, all the changes needs to be kept in the data structure with destination value and target value.
- For object value and array value, there will not be direct source and target, but a refence to sub preview.
- For reorder/move that still needs to be put as indepentent attribute.
- For no change, its attibute also needs to be expended iteratively with source-target value pair.

### Apply
- `apply` applies the preview to get the target object.
- For deleted items, they will be filtered
- For other preview type, it will be just taking the taget value

## Estimation

- For most of the case the complexity will be in `O(n)`, if the mapped value can be found by index.
- For extreme case that needs to fnd mapped object by key, the time complexity will still be `O(n)` and the space complexity will be `O(n)`


