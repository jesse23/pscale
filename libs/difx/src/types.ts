import { Primitive } from "@pscale/util";

// Type of the action
export enum ActionType {
  MERGE = 'M',
  UPDATE = 'U',
  DELETE = 'D',
  REORDER = 'R',
  ADD = 'A',
  NONE = 'N',
}

// Actions on a given attribute on data
export interface IndexedKeyValue {
  // Index of the element that apply the action
  idx: number;
  // Key of the element that apply the action
  key: string;
  // content of the change - sub patch for merge case, src/tar value for other case
  val: unknown;
}

export type Patch = {
  [key in ActionType]?: IndexedKeyValue[];
}

export interface ChangeContent {
  // source primitive value of the element/attribute
  src?: Primitive;
  // target primitive value of the element/attribute
  tar?: Primitive;
  // true if the element/attribute is moved
  mov?: boolean;
  // true if the value is array
  arr?: boolean;
  // changes on the sub elements/attributes
  sub?: Change[];
}

// changes with source and target as dif result
export interface Change extends ChangeContent {
  // type of the action - add, delete, update, none
  act: ActionType;
  // Key of the element/attribute in object or array for comparison
  key: string;
}

// change result as tree node
export interface ViewNode {
  // tag of current node - attribute name for JSON, tag name for XML
  tag: string;
  // type of the action - add, delete, update, none
  act: ActionType;
  // source display name
  src: string;
  // target display name
  tar: string;
  // true if the element/attribute is moved
  mov?: boolean;
  // changes for primitive attributes 
  att?: Change[];
  // changes for non-primitive attributes
  sub?: ViewNode[];
} 

export interface Options {
  // if true, keep order info in diff and apply to src in preview to get the order change
  reorder?: boolean;
  // attribute that used for getting the key
  key?: string;
  // if true, will have fuzzy match for array element
  fuzzy?: number;
}

export interface ViewOptions extends Options {
  // attribute that used for getting the display name
  name?: string;
  // attribute that used for getting the tag
  tag?: string;
  // tag for the top level element(s), internal purpose
  defaultTag?: string;
}
