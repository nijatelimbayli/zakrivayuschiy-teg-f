/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-standard-scss', 'stylelint-config-recess-order'],

  rules: {
    'selector-class-pattern': null,
    'no-empty-source': [true, { severity: 'warning' }],
    'color-hex-length': 'short',
    'color-named': 'never',
    'block-no-empty': true,
  },
};
