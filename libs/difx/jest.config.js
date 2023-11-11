/* eslint-env node */
module.exports = {
  transform: {
    "^.+\\.(t|j)sx?$": [
      "esbuild-jest",
      {
        sourcemap: "both",
      },
    ],
  },
};
