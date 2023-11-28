
import {
    ASTPath, CallExpression,
    ClassDeclaration,
    ClassProperty,
    Collection,
    Core, Decorator, Identifier,
    JSCodeshift, StringLiteral,
    VariableDeclaration
} from "jscodeshift";
import {ContextCollections} from "./ContextCollections";
import * as K from 'ast-types/gen/kinds'

/**
 * Replacement of data properties
 * @param classComponent
 * @param j
 * @param root
 * @param collections
 */
export function transformDataProperties(classComponent: Collection<ClassDeclaration>, j: JSCodeshift, root: Collection, collections: ContextCollections) {
    const dataProperties: Collection<ClassProperty> = classComponent.find(j.ClassProperty)
        .filter(props => !('decorators' in props.node) && !('readonly' in props.node));

    collections.collectionsToRemove.push(dataProperties);

    dataProperties.forEach(path => collections.replacements.push(generateDataPropertiesDeclaration(root, j, path, collections)));
}

/**
 * Replace class properties with references
 *
 * From:
 *    value: string = "H"
 *
 * To:
 *    const value = ref<string>("H");
 *
 * @param root
 * @param j
 * @param path
 * @param collections
 */
export function generateDataPropertiesDeclaration(root: ReturnType<Core>, j: JSCodeshift, path: ASTPath<ClassProperty>, collections: ContextCollections): VariableDeclaration {
    collections.importFromVue.add('ref');

    const {value, comments, typeAnnotation} = path.node;
    const key: Identifier = path.node.key as Identifier;
    const decorators: Decorator[] = 'decorators' in path.node ? (path.node.decorators as Decorator[]) : [];
    const expression: CallExpression = decorators[0]?.expression as CallExpression;
    const argValue: string = (expression?.arguments[0] as StringLiteral)?.value;

    collections.reactiveProperties.push(key.name)
    const type = typeAnnotation ? j(typeAnnotation.typeAnnotation!).toSource() : null;

    const defaultValue = value ? j(value).toSource() : undefined;
    // Sets the identifier based on the verification of an existing argument-value.
    let varIdentifier: K.PatternKind;
    varIdentifier = argValue !== undefined ? j.identifier(argValue) : j.identifier(key.name);

    // identifier.typeAnnotation = typeAnnotation;
    const functionIdentifier = type ? j.identifier(`ref<${type}>`) : j.identifier('ref');

    const declarator = j.variableDeclarator(
        varIdentifier,
        j.callExpression(
            functionIdentifier,
            defaultValue ? [j.identifier(defaultValue)] : []
        )
    );


    const declaration = j.variableDeclaration('const', [declarator]);
    declaration.comments = comments;
    return declaration;
}
