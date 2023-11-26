# RFC 012 - [Draft] Attribute Style XML Format

## Background

Approach to adopt data from Attribute Style XML.

Attribute Style XML is more like DOM:

- XML element as separate object, element name as KEY_TYPE.
- Attribute Value as it is on given object.
- Parent-Child relationship as relation on given object.

## Proposal

### Input

XML Input Parser will have simple rules below:

- Element name will be passed as type name of object. Attribute will be parsed as key-value pair on object. Text will be parsed as special attribute `KEY_TEXT` on object.

- Child element will be parsed as KEY_CHILD on object.

#### Advance Options

NOTE: Advance Options will break the equivalence between input and output.

- If element has no attribute, it could be simplified as attribute on parent object. And its innerNodes will be value.
- If case above has multiple levels, higher level will take priority.

```xml
<!--
  {
    note: {
      date: '2008-01-10',
      to: 'Tove',
      from: 'Jani',
    }
  }
-->
<note date="2008-01-10">
  <to>Tove</to>
  <from>Jani</from>
</note>
```

### Output

- Assuming all relation ship is mapped properly, for exporting a same element-as-object XML, as minimum a root node needs to be specified.
- Relations except `KEY_CHILD` needs to be decoupled as id, otherwise the attribute name will be converted to empty element.
- as JSON template, we could define a new attribute `KEY_ROOT` to present that as out template below, then other element will be traversed and written by KEY_CHILD.

```javascript
{
  [KEY_ROOT]: $.XML[0]
}
```

We can also define the root node in template:

```javascript
{
  [KEY_ROOT]: {
    [KEY_TYPE]: 'MY_XML',
    [KEY_CHILD]: $.product
  }
}
```

- For text content, the only approach is converting it to `KEY_TEXT` attribute.
- We could provide option to assume that attribute start with uppercase is a sub element.
- We could also provide an option to define `Type.Attr` to be sub element.

# Reference

- [fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser)
- [w3c school - xml attribute](https://www.w3schools.com/xml/xml_attributes.asp)

# Some advance XML cases

```xml
<note date="2008-01-10">
<!--
  {
    values: [
      {
        type: 'string',
        value: 'haha',
      },
      {
        type: 'bool',
        value: true,
      },
      {
        type: 'number',
        value: 2323,
      },
    [
  }
-->
<attr-a>
  <values>
    <string>haha</string>
    <bool>true</bool>
    <number value="2323"></number>
  </values>
</attr-a>
```
