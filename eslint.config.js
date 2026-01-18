/**
 * ESLint Configuration with jsx-a11y for WCAG 2.2 AA Compliance
 *
 * 설치 필요:
 * npm install -D eslint eslint-plugin-jsx-a11y @eslint/js
 */

import jsxA11y from 'eslint-plugin-jsx-a11y';

export default [
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      'jsx-a11y': jsxA11y,
    },
    rules: {
      // WCAG 2.2 필수 규칙
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/aria-proptypes': 'error',
      'jsx-a11y/aria-unsupported-elements': 'error',
      'jsx-a11y/role-has-required-aria-props': 'error',
      'jsx-a11y/role-supports-aria-props': 'error',

      // 상호작용 요소
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/no-noninteractive-element-interactions': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',

      // 폼 요소
      'jsx-a11y/label-has-associated-control': 'warn',

      // 미디어
      'jsx-a11y/media-has-caption': 'warn',

      // 포커스 관리
      'jsx-a11y/no-autofocus': 'warn',
      'jsx-a11y/tabindex-no-positive': 'error',

      // 시맨틱
      'jsx-a11y/heading-has-content': 'error',
      'jsx-a11y/anchor-has-content': 'error',
      'jsx-a11y/anchor-is-valid': 'warn',
    },
  },
];
