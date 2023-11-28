
import {
    ASTPath, CallExpression,
    ClassDeclaration,
    ClassProperty,
    Collection,
    Core, Decorator, ExpressionStatement, Identifier,
    JSCodeshift, StringLiteral,
    VariableDeclaration
} from "jscodeshift";
import {ContextCollections} from "./ContextCollections";
/**
 * Replacement of props with provide decorator
 * @param classComponent
 * @param j
 * @param root
 * @param collections
 */
export function transformProvideDecorators(classComponent: Collection<ClassDeclaration>, j: JSCodeshift, root: Collection, collections: ContextCollections) {
    const propertiesWithProvideDecorator: Collection<ClassProperty> = classComponent.find(j.ClassProperty, {
        // @ts-ignore
        decorators: {
            0: {
                expression: {
                    callee: {
                        name: 'Provide'
                    }
                }
            }
        }
    });

    collections.collectionsToRemove.push(propertiesWithProvideDecorator);

    propertiesWithProvideDecorator.forEach(path => {
        collections.replacements.push(generateReactiveDeclaration(root, j, path, collections))
        collections.replacements.push(generateProvideExpression(root, j, path, collections))
    });
}

/**
 * Generate reactive properties
 * @param root
 * @param j
 * @param path
 * @param collections
 */
function generateReactiveDeclaration(root: ReturnType<Core>, j: JSCodeshift, path: ASTPath<ClassProperty>, collections: ContextCollections): VariableDeclaration {
    collections.importFromVue.add('reactive')

    const { comments, typeAnnotation} = path.node;
    const key: Identifier = path.node.key as Identifier;
    const varIdentifier: Identifier = j.identifier(key.name);
    varIdentifier.typeAnnotation = typeAnnotation;
    const defaultValue = j(path.node.value!).toSource();
    const functionIdentifier = j.identifier('reactive');

    const declarator = j.variableDeclarator(
        varIdentifier,
        j.callExpression(
            functionIdentifier,
            [j.identifier(defaultValue ?? '')]
        )
    );

    const declaration = j.variableDeclaration('const', [declarator]);
    declaration.comments = comments;

    return declaration;
}

/**
 * Generate provide expression
 * @param root
 * @param j
 * @param path
 * @param collections
 */
function generateProvideExpression(root: ReturnType<Core>, j: JSCodeshift, path: ASTPath<ClassProperty>, collections: ContextCollections): ExpressionStatement {
    collections.importFromVue.add('provide');

    const decorators: Decorator[] = 'decorators' in path.node ? (path.node.decorators as Decorator[]) : [];
    const key: Identifier = path.node.key as Identifier;
    let provideArg = key.name;

    const expression: CallExpression = decorators[0]?.expression as CallExpression;
    if (expression && expression.arguments.length > 0) {
        provideArg = (expression.arguments[0] as StringLiteral).value;
    }

    return j.expressionStatement(
        j.callExpression(
            j.identifier('provide'),
            [
                j.identifier(`'${provideArg}'`),
                j.identifier(key.name)
            ]
        )
    );
}
