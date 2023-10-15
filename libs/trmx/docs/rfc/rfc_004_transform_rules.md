# RFC 004 - [Done] Transform Rules

|            |          |
| ---------- | -------- |
| _Creator_  | @jesse23 |
| _Reviewer_ |          |
| _Approval_ |          |
| _End Date_ |          |

## Background

Use DSL to define transform.

## Proposal

- Given a transform function:

```typescript
const transforms: Transform[] = [
  {
    source: "product",
    target: "item",
    transform: (srcDF) =>
      srcDF.map((src) => ({
        id: src.id,
        internal_name: src.name,
        owned_by: (src.owner as Data).name,
      })),
  },
];
```

With a more simplified syntax, it could be:

```sh
product            => item
product.id         => item.id
product.name       => item.internal_name
product.owner.name => item.owned_by
```
