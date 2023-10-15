# RFC 005 - [Done] Mutation Rules

|            |          |
| ---------- | -------- |
| _Creator_  | @jesse23 |
| _Reviewer_ |          |
| _Approval_ |          |
| _End Date_ |          |

## Background

Rules to update data graph.

## Proposal

We can use symbol `->` to define update rules. It will be transforming on attribute to the other.

```sh
product.name -> product.alias
product.owner.name -> product.owned_by
```

### Multiple transforms

Given rule example below:

```sh
# 1st graph
product.name -> product.alias
product => item
product.alias => item.name
# 2nd graph
item.name -> item.alias
```

Obviously the 1st update rule and the 2nd update rule applies on different data graph. We could aggregate the rules by different process and use the 1st update rule as the beginning of the next process.
