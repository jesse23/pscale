# RFC 005 - [Draft] Object Tree View

## Background

Approaches to display preview in UI

## Proposal

### Preview as Tree

Preview as tree is easy since preview interface is a tree structure. All we need is:

- The node interface is `{ source: Primitive, target: Primitive, sub: Preview[] }`, node will either have `source+target` or `sub`
- For the node has source and target, the value will be display
- For the node has sub, it will be expendable node. Attribute we could display its type like `<object>` or `<array>`.

### Preview as Object Tree

In real business use case, mostly we are using reference to object to present object relation ship. For exampl, given example below:

```json
{
  "id": "id1",
  "type": "sku",
  "name": "sku1",
  "owning_group": {
    "id": "id2",
    "type": "group",
    "name": "group1"
  },
  "owning_user": {
    "id": "id3",
    "type": "user",
    "name": "user1"
  }
}
```

The indention for this presentation is `user1 --(owning_group)--> group1`, a fit-for purpose presentation for that would be:

| attribute        | type  | source | target | key | idx | change |
| ---------------- | ----  | ------ | ------ | --- | --- | ------ |
| - <root>         | sku   | sku1   | sku1   | id1 | 0   | none   |
|   - owning_group | group | group1 | group1 | id2 | 3   | none   |
|   - owning_user  | user  | user1  | user1  | id3 | 4   | none   |


When clicking on specific node, for example, sku, it will be:

| attribute | type   | source | target | key  | idx | change |
| --------- | ------ | ------ | ------ | ---- | --- | ------ |
| id        | string | id1    | id1    | id   | 0   | none   |
| type      | string | sku    | sku    | type | 1   | none   |
| name      | string | sku1   | sku1   | name | 2   | none   |

- The key here is break `sub` to 2 different catgory based on the value type:
  - Value type is primitive => `att`
  - Value type is object    => `sub`
  Then for `sub`, show it as tree and `att` to show it as table.

- `type` here is the object type, we could give config or callback(`getType`) or fallback to `<object>`.
  - for primitive tablue `type` is fixed to `string|number|boolean|null|undefined`.

- The `source` and `target` for the object tree view, user would expect a name that make sense to present that object, and mostly it will not be ID since ID is not clear in a simple tree view as summary. We could have flow as below:
  - Give user a config or callback(`getName`) to fetch that string, like the `getKey` approach.
  - If that dosen't exist, fall back to 

- NOTE, the difference between this and preview is, preview can be apply back to source, and this is not for that purpose.

#### Value Type is Array
Given structure:
```json
{
  "id": "id1",
  "type": "sku",
  "name": "sku1",
  "owning_user": [
    {
      "id": "id2",
      "type": "user",
      "name": "user1"
    },
    {
      "id": "id3",
      "type": "user",
      "name": "user2",
    }
  ]
}
```

The comment expecation would be 2 user object be the direct children of sku, which is logically different with a preview structure:

| attribute       | type | source | target | key | idx | change |
| --------------- | ---- | ------ | ------ | --- | --- | ------ |
| - <root>        | sku  | sku1   | sku1   | id1 | 0   | none   |
|   - owning_user | user | user1  | user1  | id2 | 0   | none   |
|   - owning_user | user | user2  | user2  | id3 | 1   | none   |

If it is a primitive array like this:
```json
{
  "id": "id1",
  "name": "sku1",
  "comments": [
    "comment1",
    "comment2",
    "comment3"
  ]
}
```

It is expected that the value is owned by the parent object directly as below:

| attribute | type   | source   | target   | key      | idx | change |
| --------- | ------ | ------   | -------- | -------- | --- | ------ |
| id        | string | id1      | id1      | id       | 0   | none   |
| name      | string | sku1     | sku1     | name     | 1   | none   |
| comments  | string | comment1 | comment1 | comment1 | 0   | none   |
| comments  | string | comment2 | comment2 | comment2 | 1   | none   |
| comments  | string | comment3 | comment3 | comment3 | 2   | none   |

If it is hybrid case, the primitive part goes to the `att` and the object part goes to the `sub`.

- There is no need for `getKey` and `getName` to primitive value since it will be the value itself.
- There is no need for `getName`



## Estimation

Spilt `sub` from preview to `att` and `sub` in view data structure will be in `O(n)`.
