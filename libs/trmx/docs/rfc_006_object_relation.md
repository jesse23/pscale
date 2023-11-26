# RFC 006 - [Done] object relation

## Background

Figure out a way to map object relation.

### Problem

Given mapping rule example:

```sh
user               => owner
user.name          => owner.name
product            => item
product.name       => item.internal_name
product.owner.name => item.owned_by
```

The `product.owner.name => item.owned_by`, actually requires 2 things:

- link/join product and user by id.
- map the `product.owner->user` to `item.owned_by->owner`.

## Proposal

```sh
# key to ref
product.owner             -> product.owner>user.id
# product.owner           -> product.owner | lookup("user", "id")

# mapping
user                      => owner
user.name                 => owner.name
product                   => item
product.name              => item.internal_name
product.owner>user        => item.owned_by>owner
# product.owner>user      => item.owned_by | getTransformObject
# product.owner>user.name => item.owned_by

# ref to key
item.owned_by>owner.name -> item.owned_by
```

### `>` operator

- at source side, `>` operator means to get the ref of the object.
- at target side, `>` operator means:
  - if relation exists, do the traversal to get the next level object.
  - if relation not exists, do the link/join operation by proper look up.

Then rule syntax is a descriptive way to define the mapping, so as soon as the rule is clearly defined the relation, how to apply the rules is just a technical problem.
