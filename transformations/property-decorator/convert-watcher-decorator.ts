
import {
    ASTPath, CallExpression,
    ClassDeclaration,
    ClassMethod,
    Collection,
    Core,
    Decorator,
    ExpressionStatement, Identifier,
    JSCodeshift, StringLiteral
} from "jscodeshift";
import {ContextCollections} from "./ContextCollections";
import {generateFunctionDeclaration} from "./convert-methods";

/**
 * Replacement of methods with watcher decorator
 * @param classComponent
 * @param j
 * @param root
 * @param collections
 */
export function transformWatchDecorators(classComponent: Collection<ClassDeclaration>, j: JSCodeshift, root: Collection, collections: ContextCollections) {
    const methodsWithWatchDecorator: Collection<ClassMethod> = classComponent.find(j.ClassMethod, {
        kind: 'method',
        // @ts-ignore
        decorators: {
            0: {
                expression: {
                    callee: {
                        name: 'Watch'
                    }
                }
            }
        }
    });

    collections.collectionsToRemove.push(methodsWithWatchDecorator);

    methodsWithWatchDecorator.forEach((path: ASTPath<ClassMethod>) => {
        let items = generateFunctionDeclaration(root, j, path, collections);
        if (Array.isArray(items)) items.forEach(item => collections.replacements.push(item));
        else collections.replacements.push(items);
        path.node.decorators?.forEach(decorator => {
            collections.replacements.push(generateWatchExpression(root, j, path, decorator, collections))
        });
    });
}

/**
 * Generate watch call
 *
 * @param root
 * @param j
 * @param path
 * @param decorator
 * @param collections
 */
function generateWatchExpression(root: ReturnType<Core>, j: JSCodeshift, path: ASTPath<ClassMethod>, decorator: Decorator, collections: ContextCollections): ExpressionStatement {
    collections.importFromVue.add('watch');
    const key: Identifier = path.node.key as Identifier;
    let watchIdentifier = "";

    const expression: CallExpression = decorator.expression as CallExpression;
    if (expression.arguments.length > 0) {
        watchIdentifier = (expression.arguments[0] as StringLiteral).value;
    }

    return j.expressionStatement(
        j.callExpression(
            j.identifier('watch'),
            [
                j.identifier(watchIdentifier ?? ''),
                j.identifier(key.name)
            ]
        )
    )
}
