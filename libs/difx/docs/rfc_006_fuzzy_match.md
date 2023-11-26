# RFC 006 - [Draft] Fuzzy Match

## Background

For some of the JSON/XML presentation, there are really no explict key can used for matching in array. 

### Problem

For example:
```json
{
  "rules": [
    {
      "source": "Item.name",
      "target": "Sku.name"
    },
    {
      "source": "User.user_name",
      "target": "Owner.name"
    }
  ]
}
```

There is no really a key to identify the uniqueness of rule object here. But we still want some sort of the ability to identify `Update`, rather than just use `JSON.stringify` as key and got identified as `Delete` and `Add`.

## Proposal

### Fuzzy match

- A fuzzy factor will be defined form 0 to 1.
- For not impacting performance, the strict match is still going to happen first.
- Then for all the mismatch (add or delete objects), another round of matching will happen by fuzzy factor.
- If match found, remove it from add and remove list and move it to match list.

### Match Design

#### Compare Algorithm

- For simplicity consideration, currently the design is just `JSON.stringify(val).length * fuzzy`
- It could be other algorithm too, like string similarity, attribute names similarity...

#### Match in array

For strict mappping, we could have key to value map so the complexity can be controlled in `O(n)`. But there is no easy way to create similarity map for fuzzy match, so if we let it go with the maximum flexibility, it will go to `O(n^2)` complexity.

For fuzzy matching in array, we have assumption below:
- The matching will be in sequence if there is.
- So we'll trying to match delete list and add list with ascendent order.
- If mimatch happens, we will move the cursor up on the array that has more rest of the members 1st.

### Reparent 

The general algorithm we used in this project, which is based on virtual DOM, is lacking of support to reparent use case. So given JSON:
```json
{
  "id": "line1",
  "children": [
    {
      "id": "line2"
    }
  ]
}
```

to:
```json
{
  "id": "line1",
  "children": [
    {
      "id": "line3"
      "children": [
        {
          "id": "line2"
        }
      ]
    }
  ]

```

By default the result will be old line 2 removed and the new line 3 got added with its child line2.

To suppport reparent, we'll have to put the children node and parent node to diff together to figure that out.With new config `{ reparent: true }`:
- Get all the delete and add objects in a flattern map, with new attribute `path`.
- Assuming we are not supporting fuzzy match for reparent, then the rest of the part will be same - it will be a standard matching machenism to pull objects out from add and delete list.
- It will be hard to support fuzzy match here since there is really no sequence assumption we can use, the object they are not in the same level.

## Estimation

- For fuzzy match the time complexity will be `O(n)`.
- For reparent it will same as `O(n)` too.

