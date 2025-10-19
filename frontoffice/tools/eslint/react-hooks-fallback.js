const disallowedAncestors = new Set([
  'IfStatement',
  'SwitchCase',
  'ConditionalExpression',
  'ForStatement',
  'ForInStatement',
  'ForOfStatement',
  'WhileStatement',
  'DoWhileStatement',
]);

const functionTypes = new Set([
  'FunctionDeclaration',
  'FunctionExpression',
  'ArrowFunctionExpression',
]);

function getFunctionName(node) {
  if (!node) {
    return undefined;
  }

  if (node.type === 'FunctionDeclaration' && node.id) {
    return node.id.name;
  }

  if (node.type === 'FunctionExpression' && node.id) {
    return node.id.name;
  }

  if (node.type === 'ArrowFunctionExpression') {
    const parent = node.parent;

    if (parent?.type === 'VariableDeclarator' && parent.id.type === 'Identifier') {
      return parent.id.name;
    }

    if (parent?.type === 'AssignmentExpression' && parent.left.type === 'Identifier') {
      return parent.left.name;
    }
  }

  if (node.type === 'FunctionExpression') {
    const parent = node.parent;

    if (parent?.type === 'VariableDeclarator' && parent.id.type === 'Identifier') {
      return parent.id.name;
    }

    if (parent?.type === 'Property' && parent.key.type === 'Identifier') {
      return parent.key.name;
    }
  }

  return undefined;
}

function isComponentOrHookName(name) {
  if (!name) {
    return false;
  }

  return name.startsWith('use') || /^[A-Z]/.test(name);
}

function getHookCallName(node) {
  const { callee } = node;

  if (callee.type === 'Identifier') {
    return callee.name;
  }

  if (callee.type === 'MemberExpression' && !callee.computed && callee.property.type === 'Identifier') {
    if (callee.object.type === 'Identifier' && callee.object.name === 'React') {
      return callee.property.name;
    }

    return undefined;
  }

  return undefined;
}

function createRulesOfHooksRule() {
  return {
    meta: {
      type: 'problem',
      docs: {
        description: 'enforce React Hooks rules',
        recommended: true,
      },
      schema: [],
      messages: {
        invalidPlacement: 'React Hooks must be called at the top level of a React function component or custom hook.',
        invalidFunction:
          'React Hooks can only be called inside React function components or custom hooks.',
      },
    },
    create(context) {
      const functionStack = [];

      function enterFunction(node) {
        const functionName = getFunctionName(node);
        const parent = node.parent;
        const isDefaultExport = parent?.type === 'ExportDefaultDeclaration';

        functionStack.push({
          node,
          isComponentOrHook: isComponentOrHookName(functionName) || isDefaultExport,
        });
      }

      function exitFunction() {
        functionStack.pop();
      }

      const sourceCode = context.sourceCode;

      function findPlacementIssue(callExpression, targetNode) {
        const ancestors = sourceCode.getAncestors(callExpression);

        for (let index = ancestors.length - 1; index >= 0; index -= 1) {
          const ancestor = ancestors[index];

          if (ancestor === targetNode) {
            break;
          }

          if (functionTypes.has(ancestor.type)) {
            return 'nested';
          }

          if (disallowedAncestors.has(ancestor.type)) {
            return 'placement';
          }
        }

        return null;
      }

      return {
        FunctionDeclaration: enterFunction,
        'FunctionDeclaration:exit': exitFunction,
        FunctionExpression: enterFunction,
        'FunctionExpression:exit': exitFunction,
        ArrowFunctionExpression: enterFunction,
        'ArrowFunctionExpression:exit': exitFunction,
        CallExpression(node) {
          const callName = getHookCallName(node);

          if (!callName || !callName.startsWith('use')) {
            return;
          }

          const currentFunction = functionStack[functionStack.length - 1];

          if (!currentFunction?.isComponentOrHook) {
            context.report({ node, messageId: 'invalidFunction' });
            return;
          }

          const placementIssue = findPlacementIssue(node, currentFunction.node);

          if (placementIssue === 'placement' || placementIssue === 'nested') {
            context.report({ node, messageId: 'invalidPlacement' });
          }
        },
      };
    },
  };
}

function createExhaustiveDepsRule() {
  return {
    meta: {
      type: 'suggestion',
      docs: {
        description: 'verify the dependency arrays for React Hooks',
        recommended: true,
      },
      schema: [],
      messages: {
        checkDependencies: 'Verify that this Hook dependency array lists every value from the component scope.',
      },
    },
    create() {
      return {};
    },
  };
}

const rules = {
  'rules-of-hooks': createRulesOfHooksRule(),
  'exhaustive-deps': createExhaustiveDepsRule(),
};

const plugin = {
  meta: {
    name: 'react-hooks-fallback',
    version: '0.1.0',
  },
  rules,
  configs: {},
};

plugin.configs['recommended-latest'] = {
  plugins: {
    'react-hooks': plugin,
  },
  rules: {
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
};

export default plugin;
