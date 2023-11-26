# RFC 008 - [Done] Conditions and Functions

## Background

Conditions and Functions on the rules.

## Proposal

```sh
Item      => Product      |                       | Item.type == "product"
Item.name => Product.name | $val + "test"         |
Item      => SKU          |                       | Item.type == "sku"
Item.name => SKU.name     | Item.name + Item.desc |
```

### Condition Rule

- The 1st rule of each group still taking the responsibility to create the new item.
- Hence the condition on the 1st rule will decide the mapping.
- If 1st rule is not matched, all the following up rule will be bypassed.
- Condition start from the 2nd rule will be applied on matched item.

### Condition Syntax

- It will only supports traversal from start object.
- A quick string replacement proposal will be applied here for now, with caveats.

### Function Rule

- Function rule will be applied on the source value it gets traversed.
- If the source traversed result is object, it will pick the mapped object at target side.
- It supports the same traversal as condition rule.
- Not supporting function rule in object mapping

### Traversal

- Given a path, it will return the value by traversing the path from source.
- By default it simplifies the array with 1 child to single object.
