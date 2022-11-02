const RULES = {
  OFF: 'off',
  WARN: 'warn',
  ERROR: 'error'
}

module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'plugin:react/recommended',
    'standard',
    'standard-jsx'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: [
    'react',
    '@typescript-eslint',
    'react-hooks'
  ],
  rules: {
    'no-unused-vars': RULES.WARN,
    'react/prop-types': RULES.OFF,
    'react/react-in-jsx-scope': RULES.ERROR,
    'react-hooks/rules-of-hooks': RULES.ERROR, // Checks rules of Hooks
    'react-hooks/exhaustive-deps': RULES.WARN, // Checks effect dependencies
    'no-use-before-define': RULES.WARN
  }
}
