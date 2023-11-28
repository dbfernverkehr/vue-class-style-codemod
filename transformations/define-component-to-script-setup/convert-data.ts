
import {
  Collection,
  ExportDefaultDeclaration, Identifier,
  JSCodeshift,
  ObjectExpression,
  ObjectProperty,
  ReturnStatement, StringLiteral
} from "jscodeshift";

export function convertData(root: Collection<any>, j: JSCodeshift, defineComponent: Collection<ExportDefaultDeclaration>) {
  let dataBlock = defineComponent.find(j.ObjectMethod, {key: {name: 'data'}});
  dataBlock.forEach(block => {
    ((block.node.body.body[0] as ReturnStatement).argument as ObjectExpression).properties.forEach(property => {
      let key = ((property as ObjectProperty).key as Identifier).name;
      let value = ((property as ObjectProperty).value as StringLiteral).value;
      defineComponent.insertAfter(j.variableDeclaration('const', [
        j.variableDeclarator(
          j.identifier(key),
          j.callExpression(
            j.identifier('ref'), [j.identifier(value.toString())]
          ))
      ]));
    })
    block.replace();
  })
}
