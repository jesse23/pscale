import { RuleDef, TrvDef, RuleInput } from "./types";

const ATTR_TOKEN = ".";
const REF_TOKEN = ">";
const REFBY_TOKEN = "<";
const TRAVERSE_TOKEN_LENGTH = 5;

const isSymbol = (s: string): boolean => {
  return s === ATTR_TOKEN || s === REF_TOKEN || s === REFBY_TOKEN;
};

export const validateTraversalExpr = (tokens: string[]): boolean => {
  return tokens.every((t, idx) => isSymbol(t) || idx % 2 === 0);
};

export const parseTrvRule = (rule: string): TrvDef[] => {
  const trvTokens = rule.split(/([>.<])/).map((s) => s.trim());

  if (!validateTraversalExpr(trvTokens)) {
    throw new Error(`Invalid sub expression: ${rule}`);
  }

  const res = [];
  for (let i = 0; i < trvTokens.length; ) {
    const exprTokens = trvTokens.slice(i, i + TRAVERSE_TOKEN_LENGTH);
    // check if tokens is valid

    const [vs, op1, eg, op2, ve] = exprTokens;

    // A
    if (op1 === undefined && op2 === undefined) {
      res.push({ vs });
      // A.a
    } else if (op1 === ATTR_TOKEN && op2 === undefined) {
      res.push({ vs, eg });
      // A.a>B
    } else if (op1 === ATTR_TOKEN && op2 === REF_TOKEN) {
      res.push({ vs, eg, ve });
      // B<a.A
    } else if (op1 === REFBY_TOKEN && op2 === ATTR_TOKEN) {
      res.push({ vs, eg, ve, refBy: true });
      // not support use case
    } else {
      throw new Error(`Invalid sub expression: ${rule}`);
    }

    // reserve end as next start
    i += TRAVERSE_TOKEN_LENGTH - 1;
  }

  return res;
};

export const parseExpr = (clause: string, startType: string): string => {
  // convert traversal to trv( obj, traversalClause )
  const placeHolderForEscapeSingleQuote = "_____";
  const placeHolderForEscapeDoubleQuote = "=====";
  const trvRegex = new RegExp(`(${startType}((.|>|<)(\\w+))*)`, "g");
  return (clause || "")
    .replace(/\\'/g, placeHolderForEscapeSingleQuote)
    .replace(/\\"/g, placeHolderForEscapeDoubleQuote)
    .split(/('.*?')|(".*?")/)
    .filter(Boolean)
    .map((c) => {
      if (!c.startsWith("'") && !c.startsWith('"')) {
        return c.replace(trvRegex, "trv($src, '$1')");
      }
      return c;
    })
    .join("")
    .replace(placeHolderForEscapeSingleQuote, "'")
    .replace(placeHolderForEscapeDoubleQuote, '"');
};

export const getSourceType = (ruleDef: RuleDef): string => ruleDef.src[0].vs;

export const getTargetType = (ruleDef: RuleDef): string => ruleDef.tar[0].vs;

export const getTargetEndType = (ruleDef: RuleDef): string =>
  ruleDef.tar[ruleDef.tar.length - 1].vs;

export const parseMutationRules = (rules: RuleInput[]): RuleDef[] => {
  const mutatDef = rules
    .map((rule) => {
      const { src, tar, func, cond } = rule;
      const srcTrv = parseTrvRule(src);
      const tarTrv = parseTrvRule(tar);
      if (srcTrv.length > 0 && tarTrv.length > 0) {
        // parse condition
        const sourceType = srcTrv[0].vs;

        return {
          src: srcTrv,
          tar: tarTrv,
          func: parseExpr(func, sourceType),
          cond: parseExpr(cond, sourceType),
        };
      }
    })
    .filter(Boolean);

  return mutatDef;
};

export const parseTransformRules = (rules: RuleInput[]): RuleDef[][] => {
  return Object.values(
    rules.reduce((prev, rule) => {
      const { src, tar, func, cond } = rule;
      const srcTrv = parseTrvRule(src);
      const tarTrv = parseTrvRule(tar);

      if (srcTrv.length > 0 && tarTrv.length > 0) {
        const sourceType = srcTrv[0].vs;
        const targetType = tarTrv[0].vs;

        // aggregate transform rules by `srcType>tarType` for now
        const transformKey = `${sourceType}${REF_TOKEN}${targetType}`;
        return {
          ...prev,
          [transformKey]: [
            ...(prev[transformKey] || []),
            {
              src: srcTrv,
              tar: tarTrv,
              func: parseExpr(func, sourceType),
              cond: parseExpr(cond, sourceType),
            },
          ],
        };
      }

      return prev;
    }, {} as Record<string, RuleDef[]>)
  );
};
