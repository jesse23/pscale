import {
  KEY_TRM,
  KEY_TYPE,
  KEY_REFBY,
  KEY_CHILD,
  KEY_ROOT,
  KEY_META,
} from "./const";
import { Primitive } from "@pscale/util";


/**
 * value in the data store.
 * Could be any primitive, array or map with string as key
 */
export type Value =
  | Primitive
  | Value[]
  | { [key: string]: Value };

/**
 * data store
 */
export interface Data {
  [key: string]: Value;
  [KEY_TRM]?: Data[];
  [KEY_CHILD]?: Data[];
  [KEY_TYPE]?: string;
  [KEY_REFBY]?: DataGraph;
  [KEY_META]?: Data;
}

export type DataFrame = Data[];

export type DataGraph = Record<string, DataFrame>;

export interface RuleInput {
  act: string;
  src: string;
  tar: string;
  func?: string;
  cond?: string;
  comments?: string;
}

export interface RuleSet {
  mutations: RuleInput[];
  transforms: RuleInput[];
}

export interface TrvDef {
  vs: string;
  eg?: string;
  ve?: string;
  refBy?: boolean;
}

export interface RuleDef {
  src: TrvDef[];
  tar: TrvDef[];
  func: string;
  cond: string;
}

export interface SelectAction {
  exec: (src: Data) => Data[];
}

export interface UpdateAction {
  exec: (src: Data, values: Value[], graph?: DataGraph) => DataGraph;
}

export interface WhereAction {
  exec: (val: Value, src: Data, ctx: Record<string, unknown>) => boolean;
}

export interface ApplyAction {
  exec: (val: Value, src: Data, ctx: Record<string, unknown>) => Value;
}

export interface ActionFlow {
  where: WhereAction;
  apply: ApplyAction;
  select: SelectAction;
  update: UpdateAction;
  // TODO: This target end type looks strange here
  targetEndType: string;
}

export interface Transform {
  sourceType: string;
  targetType: string;
  transform(src: DataFrame, graph: DataGraph): DataGraph;
}

export interface Mutation {
  sourceType: string;
  targetType: string;
  mutation(src: DataFrame, graph: DataGraph): DataGraph;
}

export interface XMLOutput {
  [KEY_ROOT]: Data;
}

export interface Options {
  rules: string[];
  in: InputFormat;
  out: OutputFormat;
}

export interface InputFormat {
  format: string;
  template: DataTemplateFn;
}

export interface OutputFormat {
  format: string;
  template: DataTemplateFn;
}

export interface DataTemplateFn {
  (ds: Data): Data;
}

export interface XMLParseOptions {
  elem_as?: 'object' | 'attr' | 'hybrid';
  attr_prefix?: string;
  template?: DataTemplateFn;
  asTree?: boolean;
}

export interface XMLOptions extends XMLParseOptions {
  tag?: string;
  lvl?: number;
}
