
import {
    ASTPath,
    ClassDeclaration,
    ClassProperty,
    Collection,
    Core, Identifier,
    JSCodeshift,
    VariableDeclaration
} from "jscodeshift";
import {ContextCollections} from "./ContextCollections";

/**
 * Replacement of global properties
 * @param classComponent
 * @param j
 * @param root
 * @param collections
 */
export function transformGlobalProperties(classComponent: Collection<ClassDeclaration>, j: JSCodeshift, root: Collection, collections: ContextCollections) {
    const globalProperties: Collection<ClassProperty> = classComponent
        // @ts-ignore
        .find(j.ClassProperty, {readonly: true})
        .filter(props => !('decorators' in props.node));

    collections.collectionsToRemove.push(globalProperties);

    globalProperties.forEach(path => {
        let items = generateGlobalPropertiesDeclaration(root, j, path);
        if (items) collections.replacements.push(items);
    });
}

/**
 * Replace readonly properties with setup constants
 *
 * From:
 *    public readonly TYPE: Number = 0;
 *
 * To:
 *    const TYPE: Number = 0;
 *
 * @param root
 * @param j
 * @param path
 */
function generateGlobalPropertiesDeclaration(root: ReturnType<Core>, j: JSCodeshift, path: ASTPath<ClassProperty>): VariableDeclaration | null {
    const key: Identifier = path.node.key as Identifier;
    const value: Identifier = path.node.value as Identifier;
    const typeAnnotation = path.node.typeAnnotation;
    const comments = path.node.comments;
    if(typeAnnotation) {
        key.name = `${key.name}${j(typeAnnotation).toSource()}`
    }
    const declaration = j.variableDeclaration('const', [
        j.variableDeclarator(
            key,
            value
        )]);
    if(comments) declaration.comments = comments;
    return declaration;
}
