import { ViewNode } from "@pscale/difx";

export interface ViewTreeNode extends ViewNode {
  // tree specific
  idx?: number;
  level?: number;
  expanded?: boolean;
  selected?: boolean;
}