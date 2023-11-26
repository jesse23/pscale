# RFC 011 - [Done] JSON Format

## Background

Approach to adopt data like JSON.

### Problem

Given the acceptable input as `Record<string, Data[]>`, how to convert various data format to it and vice versa.

## Proposal

### Input

- JSON Input, which has no element name, will need data fetch pattern below to convert to `Record<string, Data[]>`:

```javascript
{
  product: $.data,
  user: $.data.map(p => p.owned_by)
}
```

### Output

- JSON Output, a template based solution is required.

```javascript
{
  data: {
    products: $.product,
    users: $.user
  }
}
```

Since we anyway needs to support function, we can just use function to do the input and output processing.

Again this tool is not for format conversion but data model transform. Template based solution will be better than this for format conversion.
