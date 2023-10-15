# RFC 007 - [Done] New Object Creation

|            |          |
| ---------- | -------- |
| _Creator_  | @jesse23 |
| _Reviewer_ |          |
| _Approval_ |          |
| _End Date_ |          |

## Background

Approach to split or create helper objects

### Problem

Given object:

```json
{
  "item": [
    {
      "product_id": "id1",
      "name": "product 1",
      "size": "size 1",
      "owner": "owner 1",
      "owner_group": "group 1"
    },
    {
      "product_id": "id2",
      "name": "product 2",
      "size": "size 2",
      "owner": "owner 1",
      "owner_group": "group 1"
    }
  ]
}
```

Sometimes it needs to be split to 2 object (table):

```json
{
  "product": [
    {
      "id": "id1",
      "name": "product 1",
      "owned_by": "owner 1"
    },
    {
      "id": "id2",
      "name": "product 2",
      "owned_by": "owner 1"
    }
  ],
  "sku": [
    {
      "size": "size 1",
      "product": "id1",
      "owned_by": "owner 1"
    },
    {
      "size": "size 2",
      "product": "id2",
      "owned_by": "owner 1"
    }
  ],
  "user": [
    {
      "name": "owner 1",
      "group": "group 1"
    }
  ]
}
```

## Proposal

A straightforward description will be something like below:

```sh
# sku
item.size                  => sku.size
# item                     => sku.product_id>product is not available for this case even we supports it.
item.product_id            => sku.product_id>product.id
item.owner                 => sku.owned_by>user.name
item.owner_group           => sku.owned_by>user.group

# product
item.name                  => product.name
item.owner                 => product.owned_by>user.name

# ref -> id
sku.product_id>product.id  -> sku.product_id
sku.owned_by>user.name     -> sku.owned_by
product.owned_by>user.name -> product.owned_by
```

Actually `product => item` is not needed too much, it could be inferred by the `product.name => item.name`.

The `>` operator is interpreted as same as what we have in the mutation rule, but besides of `find`, we are doing `findOrCreate` here.

### Array Use Case

Given:

```json
{
  "product": [
    {
      "id": "id1",
      "name": "product 1",
      "owner": ["owner 1", "owner 2"],
      "owner_group": "group 1"
    }
  ]
]
```

By using the same rule set we should be able to apply the same `findOrCreate` logic to attach with the right user object

### Differences between `A => B.b>C` and `A.a => B.b>C.c`

- `A => B.b>C` means for given A there will be a C object.
- `A.a => B.b>C.c` means for given A we will `findOrCreate` a C by attribute `C.c === A.a`
