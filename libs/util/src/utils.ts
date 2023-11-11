import { Primitive } from "./types";

/**
 * evaluate string as Javascript expression
 * @param input string as expression
 * @param params parameters as name value pair
 * @param ignoreError if true the error is not thrown
 * @param applyObject object will apply to the expr as this
 * @return evaluation result
 *
 * TODO: match name with function parameters
 * https://stackoverflow.com/questions/1007981/how-to-get-function-parameter-names-values-dynamically
 */
export const evalExpression = (
  input: string,
  params = {},
  ignoreError = false,
  applyObject = false
): unknown => {
  const names = params ? Object.keys(params) : [];
  const values = params ? Object.values(params) : [];
  try {
    const func = new Function(...names, `return ${input};`);
    return func.apply(applyObject, values);
  } catch (e) {
    if (!ignoreError) {
      throw new Error(`evalExpression('${input}') => ${e.message}`);
    } else {
      return undefined;
    }
  }
};

/**
 * get value from scope
 *
 * @param scope scope for evaluation
 * @param path path to fetch from scope
 * @returns value from specific path
 */
export const getValue = (scope: unknown, path: string): unknown => {
  // return _.get( scope, expr );
  // TODO: when the scope has .xxx, evalFunction will fail but _.get still success
  return evalExpression(path, scope, true) as unknown;
};

/**
 * fastest way to copy a pure JSON object, use on your own risk
 * https://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-deep-clone-an-object-in-javascript
 *
 * @param obj Current object
 * @returns new cloned object
 */
export const cloneDeepJsonObject = <T>(obj: T): T => {
  return obj ? JSON.parse(JSON.stringify(obj)) : obj;
};

/**
 * fastest way to compare a pure JSON object, use on your own risk
 * https://www.mattzeunert.com/2016/01/28/javascript-deep-equal.html
 *
 * @param a left value
 * @param b right value
 * @returns true if a equals b
 */
export const deepEqual = (a: unknown, b: unknown): boolean => {
  return isPrimitive(a) || isPrimitive(b)
    ? a === b
    : JSON.stringify(a) === JSON.stringify(b);
};

/**
 * Check value type is primitive or not
 * @param val input value
 * @returns true if input is number or string
 */
export const isPrimitive = (val: unknown): val is Primitive => {
  const type = typeof val;
  return type === "number" || type === "string" || type === "boolean";
};

export const isArray = Array.isArray;

export const isObject = (val: unknown): val is Record<string|number,unknown> => {
    // Check if obj is an object and not null
    if (typeof val !== 'object' || val === null || val === undefined) {
        return false;
    }

    // Check if obj is not an array
    if (Array.isArray(val)) {
        return false;
    }

    return true;

    // Optionally, you can also check if all keys are strings, which is always true for JavaScript objects
    // return Object.keys(obj).every(key => typeof key === 'string');
}
