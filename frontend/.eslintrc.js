// Self-contained ESLint config (no external lint meta-package).
const rules = {
  // ---- core ----
  'array-callback-return': 'error',
  eqeqeq: ['error', 'smart'], // legacy code relies on == null checks
  'for-direction': 'error',
  'guard-for-in': 'off',
  'no-async-promise-executor': 'error',
  'no-case-declarations': 'error',
  'no-debugger': 'error',
  'no-delete-var': 'error',
  'no-dupe-else-if': 'error',
  'no-duplicate-case': 'error',
  'no-eval': 'error',
  'no-ex-assign': 'error',
  'no-extra-boolean-cast': 'off',
  'no-global-assign': 'error',
  'no-invalid-regexp': 'error',
  'no-param-reassign': 'error',
  'no-promise-executor-return': 'error',
  'no-self-assign': 'error',
  'no-self-compare': 'error',
  'no-shadow-restricted-names': 'error',
  'no-sparse-arrays': 'error',
  'no-unsafe-finally': 'error',
  'no-unused-labels': 'error',
  'no-useless-catch': 'error',
  'no-useless-escape': 'error',
  'no-var': 'error',
  'no-with': 'error',
  'require-yield': 'error',
  'use-isnan': 'error',

  // ---- react ----
  'react/jsx-key': 'error',
  'react/jsx-no-comment-textnodes': 'error',
  'react/jsx-no-duplicate-props': 'error',
  'react/jsx-no-target-blank': 'error',
  'react/jsx-no-undef': 'error',
  'react/jsx-uses-react': 'error',
  'react/jsx-uses-vars': 'error',
  'react/no-children-prop': 'error',
  'react/no-danger-with-children': 'error',
  'react/no-deprecated': 'error',
  'react/no-direct-mutation-state': 'error',
  'react/no-find-dom-node': 'error',
  'react/no-is-mounted': 'error',
  'react/no-string-refs': 'error',
  'react/no-render-return-value': 'error',
  'react/no-unescaped-entities': 'error',
  'react/no-unknown-property': 'off',
  'react/require-render-return': 'error',
  'react/button-has-type': 'off',
  'react/jsx-no-useless-fragment': 'off',

  // ---- react hooks ----
  'react-hooks/rules-of-hooks': 'error',

  // ---- typescript ----
  '@typescript-eslint/no-confusing-non-null-assertion': 'error',
  '@typescript-eslint/no-dupe-class-members': 'error',
  '@typescript-eslint/no-invalid-this': 'error',
  '@typescript-eslint/no-loop-func': 'error',
  '@typescript-eslint/no-misused-new': 'error',
  '@typescript-eslint/no-namespace': 'error',
  '@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
  '@typescript-eslint/no-redeclare': 'error',
  '@typescript-eslint/no-this-alias': 'error',
  '@typescript-eslint/no-useless-constructor': 'error',
  '@typescript-eslint/triple-slash-reference': 'error',
  // existing codebase patterns; disabled code-neutrally instead of editing logic
  'typescript-sort-keys/interface': 'off',
  'sort-keys-fix/sort-keys-fix': 'off',
  '@typescript-eslint/ban-types': 'off',
  '@typescript-eslint/no-empty-interface': 'off',
  '@typescript-eslint/no-use-before-define': 'off',
  '@typescript-eslint/no-unused-vars': 'off', // unused-imports/no-unused-vars still warns
  '@typescript-eslint/no-unused-expressions': 'off',

  // ---- unicorn (recommended minus rules that fight the codebase) ----
  'unicorn/no-negated-condition': 'off',
  'unicorn/prefer-type-error': 'off',
  'unicorn/prefer-logical-operator-over-ternary': 'off',
  'unicorn/no-null': 'off',
  'unicorn/no-typeof-undefined': 'off',
  'unicorn/explicit-length-check': 'off',
  'unicorn/prefer-code-point': 'off',
  'unicorn/no-useless-undefined': 'off',
  'unicorn/prefer-ternary': 'off',
  'unicorn/prefer-spread': 'off',
  'unicorn/catch-error-name': 'off',
  'unicorn/no-array-for-each': 'off',
  'unicorn/prefer-number-properties': 'off',
  'unicorn/consistent-function-scoping': 'off',
  // React component files are PascalCase and short local identifiers are idiomatic
  'unicorn/filename-case': 'off',
  'unicorn/prevent-abbreviations': 'off',
  'unicorn/no-nested-ternary': 'off',
  'unicorn/no-array-callback-reference': 'off',
  'unicorn/no-anonymous-default-export': 'off',
  'unicorn/prefer-module': 'off',

  // unused-vars is handled by unused-imports/no-unused-vars (warning)
  'no-unused-vars': 'off',
  'unused-imports/no-unused-vars': 'warn',
};

module.exports = {
  ignorePatterns: [
    'node_modules',
    'coverage',
    '.coverage',
    'jest*',
    '_test_',
    '__test__',
    '*.test.ts',
    '*.test.tsx',
    'dist',
    'es',
    'lib',
    'logs',
    '.next',
  ],
  env: {
    browser: true,
    node: true,
    es2022: true,
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  settings: {
    react: { version: 'detect' },
  },
  extends: ['eslint:recommended', 'plugin:unicorn/recommended', 'plugin:@next/next/recommended'],
  plugins: [
    'react',
    'react-hooks',
    'unicorn',
    'import',
    'unused-imports',
    'simple-import-sort',
    'sort-keys-fix',
    'typescript-sort-keys',
  ],
  rules,
  overrides: [
    {
      files: ['**/*.{ts,tsx}'],
      parser: require.resolve('@typescript-eslint/parser'),
      parserOptions: {
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      plugins: ['@typescript-eslint'],
      // no-undef is redundant with TypeScript and false-positives on type-position
      // React references (React.FC etc.) in files without a React import.
      rules: {
        ...rules,
        'no-undef': 'off',
        'no-unused-vars': 'off',
        'unused-imports/no-unused-vars': 'off', // tsc reports unused TS symbols
      },
    },
    {
      // Legacy knowledge module calls useFetch* SWR wrappers inside callbacks;
      // rewriting them is a logic change, out of scope.
      files: ['src/app/knowledge/**'],
      rules: {
        'react-hooks/rules-of-hooks': 'off',
      },
    },
  ],
};
