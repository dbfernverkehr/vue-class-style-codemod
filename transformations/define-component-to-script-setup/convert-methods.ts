
import {
  Collection,
  ExportDefaultDeclaration,
  Identifier,
  JSCodeshift,
  ObjectExpression,
  ObjectMethod,
  ObjectProperty
} from "jscodeshift";

export function convertMethods(root: Collection<any>, j: JSCodeshift, defineComponent: Collection<ExportDefaultDeclaration>) {
  let methods = defineComponent.find(j.ObjectProperty, node => (node.key as Identifier).name === 'methods');
  methods.forEach(method => {
    (method.value.value as ObjectExpression).properties.forEach(prop => {
      defineComponent.insertAfter(j.functionDeclaration(j.identifier(((prop as ObjectProperty).key as Identifier).name), (prop as ObjectMethod).params, (prop as ObjectMethod).body));
    })
    method.replace();
  });
}
