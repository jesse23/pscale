# RFC 013 - [Draft] Elem Style XML Format

## Background

Approach to adopt data from Object Style XML.

Object Style XML is more like JSON:

- XML Element will be parsed as a JSON object - element name as key, and the children (no matter it is text or element) as value.
  - So if given element only have one text content, it will be parsed as attribute on parent object.
  - If element has no text content...it will be parsed as "" or null?
- For children in the same element name, they will be aggregated as array.
- For XML Attribute, there are different approaches:
  - parse them as attribute with special prefix, like `@_`.
  - or even aggregate them under a group like `@` or `meta`.
  - Treat them as normal attribute on object, then it has no different with `<elem>value</elem>`.

## Proposal

### Input

- by default, xml element will be treated as attribute with out prefix.
- there will be options to add prefix for attribute.
- for children in the same element name, tey will be aggregated as array.

### Output

- by default convert every attribute to sub element.
- If prefix provide, keep attribute with prefix as attribute.
