# RFC 001 - [Draft] JSON Diff 

## Background

A diff and patch design for markup languages, use JSON as base.

### Problem

Markup languages is different with text, use text diff we may not be able to get into the right level of granularity.

## Proposal

- It will be a design similar like vDOM diff which will be done in O(n).

### Node Diff
- for a given node(value), check the type 1st
- if they are the same type, check the attribute (either value or child object(s))
  - For literal attribute, mark as M if value is different
  - For child object(s), recursively go back to step 1
- if they are in different type, we can consider it as replace

### Assumptions
- There is no drastic node movement inside array structure.
  - If order doesn't matter use specific option.
- `undefined` is not supported

## Estimation

TBD

### Load

TBD

### Cost

TBD

## Questions

TBD

## References

json example:
```json
{
    "textAttr": "value1",
    "textArrayAttr": [
        "value1",
        "value2"
    ],
    "objAttr": {
        "textAttr": "value2",
        "textAttr1": "value3"
    },
    "objArrayAttr1": [
        {
            "textAttr": "value3"
        }
    ],
    "objArrayAttr2": [
        {
            "textAttr": "value3"
        },
        {
            "textAttr": "value4"
        }
    ]
}
```
