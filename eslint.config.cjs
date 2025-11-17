const config = require('@modusoperandi/eslint-config');
module.exports = [
  ...config.getFlatConfig({
    appPrefix: 'licit',
    strict: false,
    header: config.header.mit,
  }),
  {
    rules: {
      'sonarjs/todo-tag': 'warn',
    },
  },
];
