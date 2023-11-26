# RFC 004 - [Done] Transform Rules

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
