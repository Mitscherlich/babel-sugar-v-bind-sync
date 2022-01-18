import syntaxJSX from '@babel/plugin-syntax-jsx';
import camelize from 'camelcase';

const prefixes = ['on'];

const syncRe = /(.*)\_sync/;

module.exports = (babel) => {
  const t = babel.types;

  function genAssignmentCode(model) {
    return t.ExpressionStatement(t.AssignmentExpression('=', model, t.Identifier('$$val')));
  }

  function genListenerCode(model, body) {
    return t.ArrowFunctionExpression([t.Identifier('$$val')], t.BlockStatement(body));
  }

  function tranformAttribute(event, value) {
    return t.jSXAttribute(t.jSXIdentifier(event), t.jSXExpressionContainer(value));
  }

  function addAttribute(attributes, type, value) {
    if (attributes[type]) {
      let exists = false;
      if (t.isObjectProperty(value) && type === 'on') {
        attributes[type].properties.forEach((property) => {
          if (t.isObjectProperty(property) && property.key.value === value.key.value) {
            if (t.isArrayExpression(property.value)) {
              property.value.elements.push(value.value);
            } else {
              property.value = t.arrayExpression([property.value, value.value]);
            }
            exists = true;
          }
        });
        if (!exists) {
          attributes[type].properties.push(value);
        }
      }
    } else {
      attributes[type] = t.objectExpression([value]);
    }
  }

  function parseAttributeJSXAttribute(path, attributes = []) {
    const namePath = path.get('name');
    let prefix;
    let name;
    if (t.isJSXNamespacedName(namePath)) {
      name = `${namePath.get('namespace.name').node}:${namePath.get('name.name').node}`;
    } else {
      name = namePath.get('name').node;
    }

    if (prefixes.includes(name) && t.isJSXExpressionContainer(path.get('value'))) {
      return t.JSXSpreadAttribute(
        t.objectExpression([
          t.objectProperty(t.stringLiteral(name), path.get('value').node.expression),
        ]),
      );
    }

    prefix = prefixes.find((el) => name.startsWith(el));
    name = name.replace(new RegExp(`^${prefix}\-?`), '');
    name = name[0].toLowerCase() + name.substr(1);

    const valuePath = path.get('value');

    if (!t.isJSXExpressionContainer(valuePath)) {
      throw new Error(
        `getAttribute (attribute value): should be an JSXExpressionContainer but got ${valuePath.type}`,
      );
    }

    const value = valuePath.get('expression').node;
    const matched = name.match(syncRe);

    if (matched != null) {
      if (!t.isMemberExpression(value)) {
        const parentPath = path.get('parent');
        const parentName = parentPath.get('name.name').node;
        throw new Error(
          `getAttribute (attribute value): You should use MemberExpression with sync modifier, prop [${prop}] on node [${parentName}]`,
        );
      }

      return { prop: matched[1], value };
    }

    if (prefix) {
      addAttribute(attributes, prefix, t.objectProperty(t.stringLiteral(name), value));
      path.remove();
    }
  }

  function transformAttributes(attributes) {
    return t.objectExpression(
      Object.entries(attributes).map(([key, value]) =>
        t.objectProperty(t.stringLiteral(key), value),
      ),
    );
  }

  function getAttributes(paths) {
    const attributes = {};

    paths.forEach((path) => {
      parseAttributeJSXAttribute(path, attributes);
    });

    return !!Object.entries(attributes).length && transformAttributes(attributes);
  }

  return {
    inherits: syntaxJSX,
    visitor: {
      JSXAttribute(path) {
        const maybeSpreadNode = parseAttributeJSXAttribute(path);
        if (maybeSpreadNode && !t.isJSXSpreadAttribute(maybeSpreadNode)) {
          const { prop, value } = maybeSpreadNode;
          path.replaceWith(t.jSXAttribute(t.jSXIdentifier(prop), t.jSXExpressionContainer(value)));
          path.parent.attributes.push(
            tranformAttribute(`onUpdate:${camelize(prop)}`, genListenerCode(value, [
              genAssignmentCode(model),
            ])),
          )
        }
      },
      JSXOpeningElement: {
        exit(path) {
          const attributes = getAttributes(path.get('attributes'));
          if (attributes) {
            path.node.attributes.push(t.JSXSpreadAttribute(attributes));
          }
        },
      },
    },
  };
};
