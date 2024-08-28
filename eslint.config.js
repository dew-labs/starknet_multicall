import path from "node:path";
import { fileURLToPath } from "node:url";

import { FlatCompat } from "@eslint/eslintrc";
import eslint from "@eslint/js";
import pluginEslintComments from "@eslint-community/eslint-plugin-eslint-comments";
import pluginGitignore from "eslint-config-flat-gitignore";
import pluginDepend from "eslint-plugin-depend";
// import pluginDeprecation from 'eslint-plugin-deprecation'
import { plugin as pluginExceptionHandling } from "eslint-plugin-exception-handling";
import pluginImportX from "eslint-plugin-import-x";
import pluginJsonc from "eslint-plugin-jsonc";
import pluginNoBarrelFiles from "eslint-plugin-no-barrel-files";
import pluginNoOnlyTests from "eslint-plugin-no-only-tests";
import pluginNoRelativeImportPaths from "eslint-plugin-no-relative-import-paths";
import pluginNoSecrets from "eslint-plugin-no-secrets"; // TODO: Leave this functionality for another step
// eslint-disable-next-line import-x/default, import-x/no-named-as-default, import-x/no-named-as-default-member -- import-x error
import pluginNoUseExtendNative from "eslint-plugin-no-use-extend-native";
import pluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import pluginPromise from "eslint-plugin-promise";
import * as pluginRegexp from "eslint-plugin-regexp";
import pluginSecurity from "eslint-plugin-security";
import pluginSimpleImportSort from "eslint-plugin-simple-import-sort";
import pluginSonarjs from "eslint-plugin-sonarjs";
import pluginVitest from "eslint-plugin-vitest";
import globals from "globals";
// eslint-disable-next-line import-x/no-unresolved -- import-x error
import tsEslint from "typescript-eslint";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

//------------------------------------------------------------------------------

function createApplyTo(include, exclude = []) {
  return function (name, config) {
    if (Array.isArray(config)) {
      if (config.length > 1) {
        return config.map((cfg, index) => ({
          ...cfg,
          name: name + "-" + index,
          files: include,
          ignores: exclude,
        }));
      }

      config = config.at(0);
    }

    return [
      {
        ...config,
        name,
        files: include,
        ignores: exclude,
      },
    ];
  };
}

const applyToAll = createApplyTo(["**/*.?(c|m)[jt]s?(x)", "**/*.json?(c|5)"]);
// const applyToScript = createApplyTo(['**/*.?(c|m)[jt]s?(x)'])
const applyToJson = createApplyTo(
  ["**/*.json"],
  ["**/tsconfig.json", ".vscode/*.json", ".zed/*.json"]
);
const applyToJsonc = createApplyTo(["**/*.jsonc", ".vscode/*.json", ".zed/*.json"]);
const applyToJson5 = createApplyTo(["**/*.json5", "**/tsconfig.json"]);
const applyToJsonC5 = createApplyTo(["**/*.json?(c|5)"]);
const applyToTypescript = createApplyTo(["**/*.?(c|m)ts?(x)"]);
const applyToVitest = createApplyTo(
  ["**/__tests__/**/*.?(c|m)[jt]s?(x)", "**/*.{test,spec}.?(c|m)[jt]s?(x)"],
  []
);

//------------------------------------------------------------------------------

const coreConfigs = [
  ...applyToAll("core/eslint-recommended", eslint.configs.recommended),
  ...applyToAll("core/security", pluginSecurity.configs.recommended),
  ...applyToAll("core/promise", pluginPromise.configs["flat/recommended"]),
  ...applyToAll("core/import-x", ...compat.config(pluginImportX.configs.recommended)),
  ...applyToAll("core/no-use-extend-native", pluginNoUseExtendNative.configs.recommended),
  ...applyToAll("core/eslint-comments", {
    ...pluginEslintComments.configs.recommended,
    // workaround for https://github.com/eslint-community/eslint-plugin-eslint-comments/issues/215
    plugins: {
      "@eslint-community/eslint-comments": pluginEslintComments,
    },
  }),
  ...applyToAll("core/regexp", pluginRegexp.configs["flat/recommended"]),

  ...applyToAll("core/depend", pluginDepend.configs["flat/recommended"]),
  ...applyToAll("core/sonarjs", pluginSonarjs.configs.recommended), // drop this if using SonarQube or SonarCloud in favor of the IDE extension
  ...applyToAll("core/no-relative-import-paths", {
    plugins: {
      "no-relative-import-paths": pluginNoRelativeImportPaths,
    },
    rules: {
      "no-relative-import-paths/no-relative-import-paths": [
        "warn",
        { allowSameFolder: true, rootDir: "src", prefix: "@" },
      ],
    },
  }),
  ...applyToAll("core/simple-import-sort", {
    plugins: {
      "simple-import-sort": pluginSimpleImportSort,
    },
    rules: {
      "sort-imports": "off",
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
    },
  }),
  ...applyToAll("core/no-barrel-files", {
    plugins: {
      "no-barrel-files": pluginNoBarrelFiles, // switch to eslint-plugin-barrel-files?
    },
    rules: {
      "no-barrel-files/no-barrel-files": "error",
    },
  }),
  ...applyToAll("core/no-secrets", {
    plugins: {
      "no-secrets": pluginNoSecrets,
    },
    rules: {
      "no-secrets/no-secrets": [
        "error",
        {
          tolerance: 4.5,
        },
      ],
    },
  }),
  ...applyToAll("core/exception-handling", {
    plugins: {
      "exception-handling": pluginExceptionHandling,
    },
    rules: {
      // 'exception-handling/no-unhandled': 'error',
    },
  }),
  // 'plugin:jsdoc/recommended-typescript', // TODO: To be added later
  // 'plugin:unicorn/recommended', // TODO: To be added later
  // 'plugin:isaacscript/recommended' // TODO: To be added later
];

const jsonConfigs = [
  ...applyToJson("json/json", pluginJsonc.configs["flat/recommended-with-json"]),
  ...applyToJsonc("json/jsonc", pluginJsonc.configs["flat/recommended-with-jsonc"]),
  ...applyToJson5("json/json5", pluginJsonc.configs["flat/recommended-with-json5"]),
  ...applyToJsonC5("json", pluginJsonc.configs["flat/prettier"]),
];

const typescriptConfigs = [
  ...applyToTypescript("typescript/import-x", {
    ...pluginImportX.configs.typescript,
    settings: {
      "import-x/parsers": {
        "@typescript-eslint/parser": [".ts", ".tsx", ".mts", ".cts", ".mtsx", ".ctsx"],
      },
      "import-x/resolver": {
        typescript: {
          alwaysTryTypes: true,
        },
        node: true,
      },
    },
  }),
  // Disabled due to poor performance
  // ...applyToTypescript('typescript/deprecation', {
  //   plugins: {
  //     deprecation: fixupPluginRules(pluginDeprecation),
  //   },
  //   rules: {
  //     'deprecation/deprecation': 'error',
  //   },
  // }),
  ...applyToTypescript("typescript/strict", tsEslint.configs.strictTypeChecked),
  ...applyToTypescript("typescript/stylistic", tsEslint.configs.stylisticTypeChecked),
  ...applyToTypescript("typescript", {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Our own rules set
      "@typescript-eslint/consistent-type-exports": [
        "error",
        { fixMixedExportsWithInlineTypeSpecifier: false },
      ],
      "@typescript-eslint/promise-function-async": ["error"],
      "no-loop-func": "off",
      "@typescript-eslint/no-loop-func": "error",
      "@typescript-eslint/no-unnecessary-parameter-property-assignment": "error",
      "@typescript-eslint/no-unnecessary-qualifier": "error",
      "@typescript-eslint/no-useless-empty-export": "error",
      // Extends or disable rules of the presets
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          vars: "all",
          args: "after-used",
          caughtErrors: "all",
          ignoreRestSiblings: false,
          reportUsedIgnorePattern: true,
          varsIgnorePattern: "^(?!__)_.*|^_$",
          argsIgnorePattern: "^(?!__)_.*|^_$",
          caughtErrorsIgnorePattern: "^(?!__)_.*|^_$",
          destructuredArrayIgnorePattern: "^(?!__)_.*|^_$",
        },
      ],
      "@typescript-eslint/no-inferrable-types": "off",
      "@typescript-eslint/use-unknown-in-catch-callback-variable": "warn", // TODO: enable
      "@typescript-eslint/restrict-template-expressions": "warn", // TODO: enable
      "@typescript-eslint/restrict-plus-operands": "warn", // TODO: enable
    },
  }),
];

const testConfigs = [
  ...applyToVitest("testing/vitest", {
    plugins: {
      vitest: pluginVitest,
    },
    rules: pluginVitest.configs.all.rules,
    settings: {
      vitest: {
        typecheck: true,
      },
    },
    languageOptions: {
      globals: {
        ...pluginVitest.environments.env.globals,
        // pluginVitest.environments.env.globals lack some of the globals, see https://github.com/vitest-dev/vitest/blob/main/packages/vitest/src/constants.ts
        chai: true,
        expectTypeOf: true,
        assertType: true,
        onTestFinished: true,
        onTestFailed: true,
      },
    },
  }),
  ...applyToVitest("testing", {
    plugins: {
      "no-only-tests": pluginNoOnlyTests,
    },
    rules: {
      "no-only-tests/no-only-tests": "error", // TODO: check this rule
    },
  }),
  ...applyToVitest("testing/vitest/formatting", compat.extends("plugin:jest-formatting/strict")),
];

const config = tsEslint.config(
  pluginGitignore({
    root: true,
    files: [".gitignore"],
    strict: false,
  }),
  {
    ignores: ["public/*", "**/*.gen.ts", "vitest.config.ts.timestamp*", "src/abis/**/*"],
  },
  ...coreConfigs,
  ...jsonConfigs,
  ...typescriptConfigs,
  ...testConfigs,
  ...applyToAll("core", {
    languageOptions: {
      sourceType: "module",
      ecmaVersion: "latest",
      parserOptions: {
        ecmaFeatures: {
          impliedStrict: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.commonjs,
        ...globals.node,
        ...globals.worker,
        ...globals.serviceworker,
        ...globals.webextensions,
      },
    },
    rules: {
      "import-x/no-unresolved": "error",
      "import-x/order": "off",
      "import-x/namespace": "off",
      // 'unicorn/better-regex': 'warn',
      // 'unicorn/filename-case': [
      //   'error',
      //   {
      //     cases: {
      //       kebabCase: true,
      //       pascalCase: true,
      //     }
      //   }
      // ],
      "@eslint-community/eslint-comments/require-description": [
        "error",
        { ignore: ["eslint-enable"] },
      ],
      "sonarjs/no-duplicate-string": "warn",
      "promise/always-return": ["warn", { ignoreLastCallback: true }],
      "promise/no-callback-in-promise": [
        "warn",
        {
          exceptions: ["process.nextTick", "setImmediate", "setTimeout"],
        },
      ],
    },
  }),
  ...applyToAll("prettier", pluginPrettierRecommended) // Always the last
);

export default config;
