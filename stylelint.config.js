/** @type {import('stylelint').Config} */
export default {
  // Extend standard baseline rules recommended for general CSS
  extends: ['stylelint-config-standard'],

  // Custom tweaks or overrides for your specific project
  rules: {
    indentation: 2,
    'color-hex-length': 'short',
    'block-no-empty': true,
  },
};
