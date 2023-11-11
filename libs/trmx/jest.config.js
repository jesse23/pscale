import { get } from 'alias-hq';

export default {
  moduleNameMapper: get('jest'),
  transform: {
    "^.+\\.(t|j)sx?$": [
      "esbuild-jest",
      {
        sourcemap: "both",
      },
    ],
  }
}
