import { DataGraph, DataTemplateFn } from "./types";
import { applyTemplate, purifyGraph, setupGraph } from "./graph";

interface JSONParseOptions {
    template?: DataTemplateFn;
}

export const fromJSON = (json: string[], options = {} as JSONParseOptions ): DataGraph => {
  return setupGraph(applyTemplate(JSON.parse(json.join('')), options.template) as DataGraph);
};

export const toJSON = (graph: DataGraph, template: DataTemplateFn ): string[] => {
    return JSON.stringify(applyTemplate(purifyGraph(graph), template), null, 2).split('\n');
};