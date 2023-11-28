
import {
  CallExpression,
  Collection, ExportDefaultDeclaration,
  Identifier,
  JSCodeshift,
  ObjectExpression,
  ObjectProperty,
  ReturnStatement
} from "jscodeshift";

export function convertSetupFunction(root: Collection<any>, j: JSCodeshift, defineComponent: Collection<ExportDefaultDeclaration>) {
  const setupBlock = defineComponent.find(j.ObjectMethod, {key: {name: 'setup'}});
  setupBlock.forEach(setupCase => {
    let filteredBody = setupCase.node.body.body.filter(statement => statement.type !== j.ReturnStatement.toString());
    let returnStatements = setupCase.node.body.body.filter(statement => statement.type === j.ReturnStatement.toString());
    root.find(j.MemberExpression, {
      property: {
        name: 'emit'
      }
    }).replaceWith(nodePath => (nodePath.node.property as Identifier).name = (nodePath.node.property as Identifier).name);
    defineComponent.insertAfter(filteredBody);
    ((returnStatements[0] as ReturnStatement).argument as ObjectExpression).properties.forEach(property => {
      let prop = (property as ObjectProperty);
      if (prop.value.type === 'CallExpression') {
        defineComponent.insertAfter(j.variableDeclaration('const', [
          j.variableDeclarator(
            j.identifier((prop.key as Identifier).name),
            j.callExpression(
              j.identifier(((prop.value as CallExpression).callee as Identifier).name),
              (prop.value as CallExpression).arguments
            ))
        ]));
      }
    });
  });
  setupBlock.remove();
}
