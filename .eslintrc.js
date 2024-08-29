module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'import'],
  extends: ['plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended', 'plugin:import/recommended'],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'func-style': ['error', 'expression'],
    '@typescript-eslint/naming-convention': [
      'error',
      { selector: 'variableLike', format: ['camelCase', 'UPPER_CASE'] },
      { selector: 'property', format: ['camelCase'] },
      { selector: 'class', format: ['PascalCase'] },
      { selector: 'classMethod', format: ['camelCase'] },
      { selector: 'objectLiteralMethod', format: ['camelCase'] },
      {
        // object literal proptery 에 UPPER_CASE 허용
        // 사용 예: env, open api 데이터 Key
        selector: 'objectLiteralProperty',
        format: ['camelCase', 'UPPER_CASE'],
      },
    ],
    'prettier/prettier': ['error', { endOfLine: 'auto' }],
    '@typescript-eslint/explicit-function-return-type': ['warn', { allowExpressions: true }], // 함수의 반환 타입 명시
    '@typescript-eslint/no-explicit-any': 'error', // any 사용시 경고
    'no-else-return': 'warn', // else 뒤에 바로 return 경고
    'import/order': [
      // import 순서 정렬
      'error',
      {
        alphabetize: {
          order: 'asc', //alphaber 순서로 정렬
        },
        'newlines-between': 'always', // 그룹 별 newline 으로 구분
        //그룹은 기본 ["builtin", "external", "parent", "sibling", "index"] 순서입니다. 변경 가능
      },
    ],
  },
  overrides: [
    {
      files: ['**/*.constants.ts'],
      rules: {
        '@typescript-eslint/naming-convention': [
          'error',
          {
            selector: 'variable',
            format: ['camelCase', 'UPPER_CASE'],
          },
        ],
      },
    },
    {
      files: ['**/*.decorator.ts'],
      rules: {
        '@typescript-eslint/naming-convention': [
          'error',
          {
            selector: 'variable',
            format: ['camelCase', 'PascalCase'],
          },
        ],
      },
    },
  ],
  settings: {
    'import/resolver': {
      node: {
        moduleDirectory: ['node_modules', 'src'],
        extensions: ['.js', '.ts'],
      },
    },
  },
};
