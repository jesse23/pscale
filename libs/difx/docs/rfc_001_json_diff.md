# RFC 001 - [Draft] JSON Diff 

## Background

A diff and patch design for markup languages, use JSON as base.

### Problem

Markup languages is different with text, use text diff we may not be able to get into the right level of granularity.

## Proposal

- Parse JSON data as tree, then have tree compare.
- Tree diff part will be similar like vDOM diff, which is in O(n) complexity.

### Value Diff

- for a given source and target value (object or primitive), check the type 1st.
- if both are array, do array diff
  - the outcome will be a sub patch on top of the array diff and it will be marked as `merge`.
- if both are object, do object diff
- Otherwise do value diff directly.
  - the outcome will be value replacement and it will be marked as `update`.

### Array Diff

- for each object in array, get `{index, key, value}` as value-with-context.
- For key we could have simple `JSON.stringify` as key for now.
- Build key to value-with-context map for both source and target, then:
  - For key only exist in source, they will be marked as `deleted`.
  - For key only exist in target, they will be marked as `added`.
  - For key exists in both:
    - if the index and value are same, they will be marked as `no change`.
    - if the value is different(by value diff), get the diff state and result from value diff.
    - if the index is different, we'll need a separate attribute to mark it as `moved`, since `moved` and `updated` are independent state.

### Object Diff

object diff is similar like array diff:
- for each key in object, get `{index, key, value}` as value-with-context. In most of the case, object attribute has order so that will be the index of a given attribute and the attribute name will be the key.
- Other part will be same as array diff.
- Because the diff result will be similar as Arrray diff, we'll need an additional attribute in the result to mark if the context is object or arrray.

### Interfaces

### Change Type

By description above, there will be state `no cange`, `add`, `delete`, `update`, `merge` and `reorder`

#### Patch

The patch result will follow interface below:
```typescript
{ [type: ChangeType]: { index, key, value } }
```
- For Add, the index will be target index, and value will be target value.
- For Delete, the index will be soure index, and the value will be source value.
- For Update, the index will be source index, and the value will be the target value.
- For Merge, the index will be source index, and the value will be sub patch on source value.
- For Reorder, the index and value will be source and target index.

### Other Assumptions

- `undefined` and `null` will be treated as primitive.
- Get key from an object can have different approach whch we could discuss in other RFC
- Movement test will be complex while considering add and delete, will have a separate RFC to discuss that.

## Estimation

- Time complexity will be `O(n)`, and space complexity will be also `O(n)` since map is needed. `n` is all the keys in the data.

## References

json example:
```json
{
    "textAttr": "value1",
    "textArrayAttr": [
        "value1",
        "value2"
    ],
    "objAttr": {
        "textAttr": "value2",
        "textAttr1": "value3"
    },
    "objArrayAttr1": [
        {
            "textAttr": "value3"
        }
    ],
    "objArrayAttr2": [
        {
            "textAttr": "value3"
        },
        {
            "textAttr": "value4"
        }
    ]
}
```
