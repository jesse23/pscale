import { Options } from './types';
import { createProcess } from './process';
import { parseRuleTable } from './rule';
import { fromXML, toXML } from './xml';
import { fromJSON, toJSON } from './json';

export const trmx = (source: string[], opts: Options): string[] => {
  const process = createProcess(parseRuleTable(opts.rules));

  const srcGraph =
    opts.in.format === 'json' ? fromJSON(source, opts.in) : fromXML(source);

  const traGraph = process(srcGraph);

  return opts.out.format === 'json'
    ? toJSON(traGraph, opts.out.template)
    : toXML(traGraph, opts.out.template);
};

// difx used API
export const nodeFromXML = (source: string[]): Record<string, unknown> => {
  return fromXML(source, {asTree: true});
};

export { nodeToXML } from './xml';
