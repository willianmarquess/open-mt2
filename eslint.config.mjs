import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  {
    ignores: ["src/core/infra/config/*"]
  },
  {
    languageOptions: { globals: globals.node },
  },
  pluginJs.configs.recommended,
  {
    rules: {
      'no-control-regex': 'off'
    }
  },
  {
    files: [
      "test/**"
    ],
    languageOptions: {
      globals: {
        ...globals.mocha
      }
    }
  }
];