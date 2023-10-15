# RFC 001 - [Done] Rule Pattern

|            |          |
| ---------- | -------- |
| _Creator_  | @jesse23 |
| _Reviewer_ |          |
| _Approval_ |          |
| _End Date_ |          |

## Background

As a bootstrap, create a boilerplate for next step.

### Problem

- Need to use latest javascript practice.
- A basic running pattern for mapping.

## Proposal

### Infrastructure

- A basic step based on `esbuild` is good.
- Essential lint and format tools are needed.

## Other rough thoughts

### General Mapping Pattern

Generally for an operation in a dataset, it will always be `select something, then do something`. So we could have a rule pattern below as start:

```typescript
export interface Rule {
  select: (item: Record<string, unknown>) => boolean;
  update: (item: Record<string, unknown>) => Record<string, unknown>;
}
```

The action output might needs to be adjust a bit later for a startup boilerplate, `create a new object from the old` is clear.

Out of that, a generate `process` function to trigger rule pattern above will be sufficient.

### Common Pattern

- It falls into a process chain pattern.

```typescript
const result = (result = process(process(process(...process(graph)))));
```

- It will be a recursive traverse/mapping pattern as below:

```
Map:    Object -> ( Object | Primitive )
Update: Object -> (Edge | Primitive)
```

#### Map Example

```
- readFile('input.json')
- map(graph)
  - Anchor:   category                     => category1 (where category_name="shoe")
    - Leaf:   category.name                => category1.name
    - Anchor: category.product             => category1.item // convert all shoes to new system
      - Leaf: category.product.description => category1.item.description
- writeFile('output.json')
```

#### Update Example

```
- readFile('input.json')
- update(graph)
  - Leaf:     category.item (item.type='main') => category.primary_item
  - Leaf:     category.name + '_haha'          => category.name
- writeFile('output.json')
```

### Use Cases

#### XML

XML has a schema as below:

```typescript
interface Element {
  name: string;
  attributes: { [key: string]: string };
  children: Element[];
}
```

So it is very natural that the `name` here becomes the `A`, attributes become `A.a`. children here could be `A.children` or `A > B`.

Here we did play a trick that the root element will be ignored for the convenience of writing rules. For example, given a XML structure below:

```xml
<root>
  <object name="item1">
  <object name="item2">
</root>
```

Obviously writing `root > object : new_root > object` is not convenient.

But in general, this inconvenience could happen at any level. For example:

```xml
<root>
  <data>
    <object name="item1">
    <object name="item2">
  </data>
  <options>
    <option name="readonly" value="true">
  </options>
</root>
```

For now we will only deal with use case one and deal with this issue later. Also, most of the big data transfer will use a solution close to approach 1 to make the data as flatten as possible.

#### JSON

JSON, as compose data type, could be an `array` or an `object`:

```json
{
  "data": [
    {
      "type": "object",
      "name": "item1"
    },
    {
      "type": "object",
      "name": "item2"
    }
  ]
}
```

```json
[
  {
    "type": "object",
    "name": "item1"
  },
  {
    "type": "object",
    "name": "item2"
  }
]
```

We will start from use case 2 to make the discussion more clear.

There is no `element name` for JSON, which makes the definition of `A` is not clear.

## References

- [Setting up esbuild for TypeScript libraries](https://jamesthom.as/2021/05/setting-up-esbuild-for-typescript-libraries/)
- [Speed ​​up TypeScript with Jest](https://miyauchi.dev/posts/speeding-up-jest/)
