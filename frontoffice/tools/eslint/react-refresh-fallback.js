const plugin = {
  meta: {
    name: 'react-refresh-fallback',
    version: '0.1.0',
  },
  rules: {
    'only-export-components': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'ensure that modules only export React components',
          recommended: true,
        },
        schema: [
          {
            type: 'object',
            properties: {
              allowConstantExport: {
                type: 'boolean',
              },
            },
            additionalProperties: false,
          },
        ],
        messages: {
          preferComponentExports:
            'Ensure this file only exports React components to preserve fast refresh state.',
        },
      },
      create() {
        return {};
      },
    },
  },
  configs: {},
};

plugin.configs.recommended = {
  plugins: {
    'react-refresh': plugin,
  },
  rules: {
    'react-refresh/only-export-components': 'warn',
  },
};

plugin.configs.vite = plugin.configs.recommended;

export default plugin;
