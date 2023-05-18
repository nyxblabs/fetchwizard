import { defineBuildConfig } from "buildkarium";

export default defineBuildConfig({
  declaration: true,
  rollup: {
    emitCJS: true
  },
  entries: [
    "src/index",
    "src/node"
  ]
});
