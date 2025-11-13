// eslint.config.mjs
import antfu from '@antfu/eslint-config'

export default antfu({
  rules: {
    'no-unused-vars': 'off',
    'unused-imports/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
  },
  ignores: ['plugin/dist/**', 'node_modules/**', 'docs/public/**', 'docs/demos/*.{jsx,tsx}', '**/*.md'],
})
