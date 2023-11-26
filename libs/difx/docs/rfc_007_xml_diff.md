# RFC 007 - [DONE] XML Diff

## Background

XML Diff will be simila as JSON Diff - the diff and apply part is generic and the differences is in the parser.

### Problem

As discussion in trmx projcet, XML presentation has 2 styles: Attribute Based and Object Based.

## Proposal

### Object Based XML

Object based XML present each element as an Object and the child element as child object array. It will have no difference with JSON Diff.

### Attribute Based XML

Attribute based XML: 
- present each element as attribute name
- all sub element together as one object value. 
- If element only contains text content, theen the text content becomes string value. Otherwise it will be onse special string attribute in that object value.
- Usually element attribute needs prefix to differenciate with sub element, otherwise it cannot be written back to XML.

Besides of features above, the XML Diff will be same as JSON Diff.

## Estimation

One additional XML parse and writing will be needed on top of the diff work. It will be roughly in `O(n)` complexity.

