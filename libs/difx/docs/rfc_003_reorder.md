# RFC 003 - [Draft] Value Reorder 

## Background

Value reorder on an array/object is not always required since some of the array and object are order unawareness. But there is solid requirement which order is important in array/object, for those case we need a way to identify how the element are moved with the consideration to delete and add.
 
### Problem

- Wihout considering add and delete, a simple index comparison could help to figure out which element is moved. But given soruce as `[1, 2]` and target as `[2, 1]`, there is only one element is moved in this case, not two.
- With a list that contains add and delete, the case will be more complex - for example, given source as `[1, 2, 3]` and target as `[3, 2]`, 2 will be identified as `not moved` since the index of 2 is same, but that might not be true.

## Proposal

- It cannot be done during the diff since the value order in source might be different with the destination we apply to. During diff, all the match value will be stored as `{srcIdx, tarIdx, key}`, then the actual calculation will happen in preview/apply.
- By identifing add and delete, we should know which values exist in both source and target.
- For those values, we not only need absolute index for value mapping, but also the `relative index`, by discounting the added and deleted vaues, for the reorder check.
- If the order of `relative index` are not matching, then the certain element could be identified as `moved`.
  - For added value, there is a chance that, it is not in the source (since it is identified as add), but appears in the destination. For this case we might need to put it to the same `REORDER` flow since order for the value might change. 
  - Example - source: `[1,2]`, target: `[1,2,3]`, destination: `[3,1,2]`
- Finding 'minimum' moves will be a complex problem, for now it will be just a simple greedy algorithm to pick the `move` by whatever comes 1st.

## Estimation

- Multiple sorts are needed to find out the relative index for both source and target, so the time complexity is `O(n*log(n))`. Space complexity is `O(n)` before we achieve in-place replacement.

