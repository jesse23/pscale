/**
 * Check value type is primitive or not
 * @param {any} val input value
 * @returns {boolean} true if input is number or string
 */
export const isPrimitive = (val) => {
  const type = typeof val;
  return type === "number" || type === "string" || type === "boolean" || val === null || val === undefined;
};

export const isArray = Array.isArray;
