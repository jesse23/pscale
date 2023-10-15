import { RuleSet, RuleInput } from "./types";

const TYPE_TRANSFORM_TOKEN = "t";
const TYPE_MUTATION_TOKEN = "m";
const TYPE_TRANSFORM = "transform";
const TYPE_MUTATION = "mutation";

export const parseRuleTable = (rules: string[]): RuleInput[] => {
  const ruleTexts =
    rules.length > 1 &&
    // markdown - header row
    rules[0].match(/^ *\|/) &&
    // markdown - separator row
    rules[1].match(/^[|\-: ]+$/)
      ? rules
          .slice(2)
          .map((r) => r.replace(/^ *\|/, "").replace(/\| *$/, "").trim())
      : // csv - extract header row
      rules.length > 0 && !rules[0].match(/^ *[tm]/)
      ? rules.slice(1).map((r) => r.trim())
      : rules.map((r) => r.trim());

  return (
    ruleTexts
      // remove empty line
      .filter(Boolean)
      .map((r) => {
        const [act, src, tar, func, cond, comments] = r
          // split by `|` but not `||`
          .split(/(?<!\|)\|(?!\|)/)
          .map((s) => s.trim());
        return {
          // TODO: need better mapping
          act:
            act === TYPE_TRANSFORM_TOKEN
              ? "transform"
              : act === TYPE_MUTATION_TOKEN
              ? "mutation"
              : act,
          src,
          tar,
          ...(func && { func }),
          ...(cond && { cond }),
          ...(comments && { comments }),
        } as RuleInput;
      })
  );
};

export const groupByAct = (rules: RuleInput[]): RuleSet[] => {
  return rules
    .reduce(
      (prev, rule) => {
        const isMutation = rule.act === TYPE_MUTATION;
        const isTransform = rule.act === TYPE_TRANSFORM;
        const lastRuleSet = prev[prev.length - 1];
        if (isTransform) {
          lastRuleSet.transforms.push(rule);
        } else if (isMutation) {
          if (lastRuleSet.transforms.length > 0) {
            prev.push({ mutations: [rule], transforms: [] });
          } else {
            lastRuleSet.mutations.push(rule);
          }
        }
        return prev;
      },
      [
        {
          mutations: [],
          transforms: [],
        } as RuleSet,
      ]
    )
    .filter(
      (ruleSet) => ruleSet.mutations.length > 0 || ruleSet.transforms.length > 0
    );
};
