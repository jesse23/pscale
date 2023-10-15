# RFC 009 - [Draft] Rule Formats

|            |          |
| ---------- | -------- |
| _Creator_  | @jesse23 |
| _Reviewer_ |          |
| _Approval_ |          |
| _End Date_ |          |

## Background

Support various rule formats.

### Problem

Current rule format looks not consistent with arrow and pipe:

```sh
Item.name => Product.name | $val + "test" | Item.type == "product"
```

## Proposal

### Table format

Table format could be align to all with pipe, and use 1st column to define type:

| Action    | Source       | Target       | Function       | Condition               | Comments    |
| --------- | ------------ | ------------ | -------------- | ----------------------- | ----------- |
| transform | Item.name    | Product.name | $val + ' new'  | Item.type == 'testItem' | No comments |
| mutation  | Product.name | Product.desc | $val + ' desc' |                         |             |

- `transform` and `mutation` are the same as `=>` and `->` in current rule format.
- `transform` and `mutation` could be simplified to `t` and `m`.
- Supports both csv type and md table type.
- Not supporting column re-arrange yet - it needs to be follow this order and the header will be ignored.

### JSON & YAML

Json and yaml are the same thing - json is a subset of yaml.

```json
[
  {
    "act": "transform",
    "src": "Item.name",
    "tar": "Product.name",
    "func": "$val + ' new'",
    "cond": "Item.type == 'testItem'",
    "comments": "No comments"
  },
  {
    "act": "mutation",
    "src": "Product.name",
    "tar": "Product.desc",
    "func": "$val + ' desc'"
  }
]
```

```yaml
- act: transform
  src: Item.name
  tar: Product.name
  func: $val + ' new'
  cond: Item.type == 'testItem'
  comments: No comments
- act: mutation
  src: Product.name
  tar: Product.desc
  func: $val + ' desc'
```

yaml is not going to be supported for now.

### XML

```xml
<rules>
  <rule act="transform" src="Item.name" tar="Product.name" func="$val + ' new'" cond="Item.type == 'testItem'"/>
  <rule act="mutation" src="Product.name" tar="Product.desc" func="$val + ' desc'"/>
</rules>
```

xml is not going to be supported for now.

# Ref

https://sheetjs.com
