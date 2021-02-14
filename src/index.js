import syntaxJSX from '@babel/plugin-syntax-jsx';
import camelize from 'camelcase';

const syncRe = /(.*)\_sync/;

function genListener(t, event, body) {
  return t.jSXAttribute(
    t.jSXIdentifier(`on${event}`),
    t.jSXExpressionContainer(
      t.ArrowFunctionExpression([t.Identifier('$$val')], t.BlockStatement(body)),
    ),
  );
}

function genAssignmentCode(t, model) {
  return t.ExpressionStatement(t.AssignmentExpression('=', model, t.Identifier('$$val')));
}

module.exports = function (babel) {
  const t = babel.types;
  return {
    inherits: syntaxJSX,
    visitor: {
      JSXOpeningElement(path) {
        path.get('attributes').forEach((attr) => {
          try {
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

              const listener = genListener(t, `Update:${camelize(prop)}`, [
                genAssignmentCode(t, model),
              ]);
              attr.insertAfter(listener);
            }
          } catch {
            // just ignore :)
          }
        });
      },
    },
  };
};
