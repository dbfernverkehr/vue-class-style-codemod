
import {ClassDeclaration, Collection, JSCodeshift} from "jscodeshift";
import {ContextCollections} from "./ContextCollections";

/**
 * Replacement of <propname> to props.<propname>
 * @param classComponent
 * @param j
 * @param root
 * @param collections
 * @param propnames
 */
export function transformPropsCalls(classComponent: Collection<ClassDeclaration>, j: JSCodeshift, root: Collection, collections: ContextCollections) {
  collections.propNames.forEach((name) => {
        root.find(j.Identifier, {
            name: name
        }).filter(path => (path.parent.value.type !== 'MemberExpression' ? !(path.parent.value.type === 'ClassProperty' && path.parent.value.key == path.value) : path.parent.value.object.type === 'Identifier')).replaceWith(path => {return path.parent.value.type !== 'MemberExpression' || path.parent.value.object.name === name ? j.memberExpression(j.identifier('props'), j.identifier(name)) : j.identifier(name)});
    });
}
