
import {
  Collection,
  ExportDefaultDeclaration,
  JSCodeshift,
} from "jscodeshift";
export function convertPropCalls(root: Collection<any>, j: JSCodeshift, defineComponent: Collection<ExportDefaultDeclaration>, propnames: string[]) {
    propnames.forEach((name) => {
      root.find(j.Identifier, {
        name: name
      }).filter(path => (path.parent.value.type !== 'MemberExpression' ? !(path.parent.value.type === 'ClassProperty' && path.parent.value.key == path.value) : path.parent.value.object.type === 'Identifier')).replaceWith(path => {return path.parent.value.type !== 'MemberExpression' || path.parent.value.object.name === name ? j.memberExpression(j.identifier('props'), j.identifier(name)) : j.identifier(name)});
    });
}
