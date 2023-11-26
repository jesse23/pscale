# RFC 002 - [Draft] Get Key from Object

## Background

For diff in a list of value, we need a way to identify key for object so that we can decide if the object is updated or not.

For vDOM, it uses element name with key attribute together. If key is not defined by customer it will use index as key since any vDOM element will be in an array as one child of parent element.

## Proposal

### Basic Use Case

- If given value is primitive, we could use value itself (same as `JSON.stringify`) as key
- If value is object, we could provide and option to let user defined that which attribute we want to use, to fetch value as key.
  - It will fallback to `JSON.stringify` as default if key attribute is not found.

### Advance Use Case

- For different 'type' of object, if we need different approach to fetch the key, we could provide a call back, like `getKey(value: unknown): string` to make it more dynamic.
- If the value is array, the callback approach should be able to handle it.

## Estimation

- Complexity for the `JSON.stringify` might be costly. 
- Then length of the result of `JSON.stringify` will be a problem too - we might need string hash later.
