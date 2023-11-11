export enum ActionType {
  MERGE = 'M',
  UPDATE = 'U',
  DELETE = 'D',
  REORDER = 'R',
  ADD = 'A',
  NONE = 'N',
}

export interface PreviewNode {
  // raw attr
  key: string;
  src: unknown;
  tar: unknown;
  type: ActionType;
  // tree attr
  nodeType: string;
  // nodeName: string; <- nodName is not needed since we will use src/tar to present the same
  level: number;
  move?: boolean;
  attributes?: PreviewNode[];
  children?: PreviewNode[];
  expanded?: boolean;
  selected?: boolean;
}

export interface Preview {
  // act: ActionType;
  act: string;
  key: string;
  src?: string|number|boolean;
  tar?: string|number|boolean;
  mov?: boolean;
  arr?: boolean;
  sub?: Preview[];
}


export interface PreviewObjectTreeNode {
  //act: ActionType;
  act: string;
  tag: string;
  src: string;
  tar: string;
  mov?: boolean;
  att?: Preview[];
  sub?: PreviewObjectTreeNode[];

  // tree specific
  idx?: number;
  level?: number;
  expanded?: boolean;
  selected?: boolean;
}