# RFC 010 - [Done] RefBy Relation

## Background

Approach to traverse reverse direction

### Problem

Given:

```sh
t | product.owner>user | item.owned_by>owner
```

Below use case make sense:

```sh
t | product.owner>user | item<owned_items.owner
```

## Proposal

- For each object reference is created, a reverse reference will be created.

- If we have graph reading in the future this needs to be create too otherwise we can't traverse the traversal.

- There might be other data structures to not putting attribute on object in the future

## Impact

- A `$refby` will be added to the object
