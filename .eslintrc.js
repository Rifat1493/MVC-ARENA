module.exports = {
  root: true,
  env: {
    "browser": true,
    "jquery": true,
    "node": true
  },
  extends: ['eslint:recommended', 'plugin:vue/vue3-recommended'], // 'eslint:recommended', 
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@babel/eslint-parser',
    requireConfigFile: false,
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'vue/multi-word-component-names': 'off'
  },
  overrides: [
    {
      "files": [
        '**/__tests__/*.{j,t}s?(x)',
        '**/tests/unit/**/*.spec.{j,t}s?(x)'
      ],
      "env": {
        "jest": true
      }
    }
  ]
};