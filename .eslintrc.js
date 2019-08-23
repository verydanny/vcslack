module.exports = {
  parserOptions: {
    ecmaVersion: '2018',
    sourceType: 'module',
  },
  plugins: [
    'prettier'
  ],
  extends: [
    'prettier',
  ],
  env: {
    es6: true,
    node: true
  },
  rules: {
    'prettier/prettier': ['error', {
      singleQuote: true,
      semi: false,
      bracketSpacing: true
    }]
  },
  overrides: [
    {
      files: ['**/*.{ts,tsx}'],
      parser: '@typescript-eslint/parser',
      plugins: [
        '@typescript-eslint',
      ],
      extends: [
        'plugin:@typescript-eslint/recommended',
        'prettier/@typescript-eslint',
      ],
      rules: {
        '@typescript-eslint/explicit-function-return-type': 0,
        '@typescript-eslint/no-explicit-any': 0,
        '@typescript-eslint/no-use-before-define': 0,
      },
    }
  ]
}
