import sharedConfig from '@central-comercial/config/eslint';

export default [
  ...sharedConfig,
  {
    name: 'central-comercial/api-domain-interface-boundary',
    files: ['src/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: '(^|/)interface(?:/|$)',
              message:
                'The domain layer must not import the interface layer. Move the dependency to interface or application.',
            },
          ],
        },
      ],
    },
  },
];
