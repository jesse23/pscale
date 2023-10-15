/* eslint-env node */
module.exports = {
  transform: {
    "^.+\\.tsx?$": [
      "esbuild-jest",
      {
        sourcemap: "both",
      },
    ],
  },
};
