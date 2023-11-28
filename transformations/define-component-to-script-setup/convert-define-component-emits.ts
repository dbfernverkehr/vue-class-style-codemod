
import {
  ArrayExpression,
  CallExpression,
  Collection,
  ExportDefaultDeclaration, Identifier,
  JSCodeshift, ObjectExpression, ObjectProperty,
  StringLiteral
} from "jscodeshift";
import {convertToKebabCase} from "../../src/operationUtils";

export function convertDefineComponentEmits(root: Collection<any>, j: JSCodeshift, defineComponent: Collection<ExportDefaultDeclaration>) {
  let emitProperties = defineComponent.find(j.ObjectProperty, node => (node.key as Identifier).name === 'emits');
  let emitSet: ObjectProperty[] = [];
  const emitNames = new Set<string>();
  let emitNamesSize = emitNames.size;
  root.find(j.ClassMethod, {
    kind: 'method',
    // @ts-ignore
    decorators: {
      0: {
        expression: {
          callee: {
            name: 'Emit'
          }
        }
      }
    }
  }).forEach(nodePath => {
    const {key, decorators} = nodePath.node;

    if (decorators!.length < 1) return;
    let argValue: undefined | string = undefined;
    let argType;
    const expression: CallExpression = decorators![0].expression as CallExpression;
    if(expression.arguments.length > 0 && expression.arguments[0].type === 'StringLiteral') {
      argValue = (expression.arguments[0] as StringLiteral)?.value;
    } else if(expression.arguments.length > 0 && expression.arguments[0].type === 'ObjectExpression') {
      (expression.arguments[0] as ObjectExpression).properties.forEach((prop: any) => {
        if(prop.key.name === 'name') {
          argValue = prop.value.value;
        }
        if(prop.key.name === 'type') {
          argType = prop.value;
        }
      });
    }
    let emit = j(j.objectProperty(j.identifier('e'), j.identifier("'" + convertToKebabCase(argValue || (key as Identifier).name) + "'"))).toSource();
    if (argType) {
      emit = emit + ', ' + j(j.objectProperty(j.identifier('value'), j.identifier(j(argType).toSource().toString().toLowerCase()))).toSource();
    }
    emitNames.add(argValue || (key as Identifier).name);
    if(emitNamesSize !== emitNames.size) {
      emitSet.push(j.objectProperty(j.identifier(`(${emit})`), j.identifier('void')));
      emitNamesSize = emitNames.size;
    }
  });
  // @ts-ignore
  root.find(j.CallExpression, {  callee: 'emit'}).forEach(nodePath => {
    const emit = j(j.objectProperty(j.identifier('e'), j.identifier("'" + convertToKebabCase((nodePath.node.arguments[0] as StringLiteral).value + "'")))).toSource();
    emitNames.add((nodePath.node.arguments[0] as StringLiteral).value);
    if(emitNamesSize !== emitNames.size) {
      emitSet.push(j.objectProperty(j.identifier(`(${emit})`), j.identifier('void')));
      emitNamesSize = emitNames.size;
    }
  });
  emitProperties.forEach(emitNodePath => (emitNodePath.value.value as ArrayExpression).elements.forEach((element: StringLiteral) => {
    const emit = j(j.objectProperty(j.identifier('e'), j.identifier("'" + convertToKebabCase(element.value + "'")))).toSource();
    emitNames.add(element.value);
    if(emitNamesSize !== emitNames.size) {
      emitSet.push(j.objectProperty(j.identifier(`(${emit})`), j.identifier('void')));
      emitNamesSize = emitNames.size;
    }
  }));
  const emits = j(j.objectExpression(emitSet)).toSource();
  if (emitSet.length > 0) {
    let newNode = j.variableDeclaration('const', [
      j.variableDeclarator(
        j.identifier('emits'),
        j.callExpression(
          j.identifier('defineEmits<'+ emits +'>' ),
          []
        )
      )
    ]);
    defineComponent.insertAfter(newNode);
  }
  emitProperties.remove();
}
