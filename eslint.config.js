const js = require('@eslint/js');
const pluginVue = require('eslint-plugin-vue');
const globals = require('globals');
const tseslint = require('typescript-eslint');
const vueParser = require('vue-eslint-parser');

module.exports = tseslint.config(
  {
    ignores: [
      'lib/proto/index.js',
      'lib/proto/index.d.ts',
      'lib/sandbox/schema.js',
      'lib/sandbox/schema.d.ts',
      '**/postcss.config.js',
      '**/tailwind.config.js',
    ],
  },
  js.configs.recommended,
  tseslint.configs.recommended,
  pluginVue.configs['flat/recommended'],
  {
    languageOptions: {
      globals: globals.node,
      // vue-eslint-parser handles <template>, and hands <script> and plain
      // .ts files to the parser named here.
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        sourceType: 'module',
        // ui/ has a <script lang="tsx"> component.
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      'no-constant-condition': ['error', { checkLoops: false }],
      'no-undef': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'vue/html-closing-bracket-newline': 'off',
      'vue/html-indent': 'off',
      'vue/html-self-closing': [
        'error',
        {
          html: {
            normal: 'never',
            void: 'always',
          },
        },
      ],
      'vue/max-attributes-per-line': 'off',
      'vue/multiline-html-element-content-newline': 'off',
      'vue/singleline-html-element-content-newline': 'off',
    },
  }
);
