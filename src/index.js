import syntaxJSX from '@babel/plugin-syntax-jsx';
import camelize from 'camelcase';

module.exports = function (babel) {
  const t = babel.types;

  function genAssignmentCode(model) {
    return t.ExpressionStatement(t.AssignmentExpression('=', model, t.Identifier('$$val')));
  }

  function genListener(listeners, prop, body) {
    listeners[prop] = t.ArrowFunctionExpression([t.Identifier('$$val')], t.BlockStatement(body));
  }

  function transformListeners(listeners = {}) {
    return t.objectExpression(
      Object.keys(listeners).map((name) =>
        t.objectProperty(t.stringLiteral(name), listeners[name]),
      ),
    );
  }

  const syncRe = /(.*)\_sync/;

  return {
    inherits: syntaxJSX,
    visitor: {
      JSXOpeningElement(path) {
        const listeners = {};

        path.get('attributes').forEach((attr) => {
          const matched = attr.node.name.name.match(syncRe);
          if (matched) {
            const prop = matched[1];
            attr.node.name.name = prop;

            let model;

            attr.traverse({
              JSXExpressionContainer(path) {
                model = path.node.expression;
              },
            });

            if (!t.isMemberExpression(model)) {
              console.error(
                `You should use MemberExpression with sync modifier, prop [${prop}] on node [${path.node.name.name}]`,
              );
              return;
            }

            genListener(listeners, `update:${camelize(prop)}`, [genAssignmentCode(model)]);
          }
        });

        if (Object.entries(listeners).length !== 0) {
          path.node.attributes.push(t.JSXSpreadAttribute(transformListeners(listeners)));
        }
      },
    },
  };
};
