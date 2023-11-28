
import {
    ASTPath, CallExpression,
    ClassDeclaration,
    ClassProperty,
    Collection,
    Core,
    Decorator,
    Identifier,
    JSCodeshift, StringLiteral
} from "jscodeshift";
import {ContextCollections} from "./ContextCollections";


/**
 * Replacement of props with inject decorator
 * @param classComponent
 * @param j
 * @param root
 * @param collections
 */
export function transformInjectDecorators(classComponent: Collection<ClassDeclaration>, j: JSCodeshift, root: Collection, collections: ContextCollections) {
    const propertiesWithInjectDecorator: Collection<ClassProperty> = classComponent.find(j.ClassProperty, {
        // @ts-ignore
        decorators: {
            0: {
                expression: {
                    callee: {
                        name: 'Inject'
                    }
                }
            }
        }
    });

    collections.collectionsToRemove.push(propertiesWithInjectDecorator);

    propertiesWithInjectDecorator.forEach(path => collections.replacements.push(generatePropertyInjectDeclaration(root, j, path, collections)));
}

/**
 * Generate injected properties
 *
 * From:
 *  @Inject()
 *  public readonly controls!: Controls;
 *
 * To:
 *  const controls: Controls = inject('controls');
 *
 * @param root
 * @param j
 * @param path
 * @param collections
 */
function generatePropertyInjectDeclaration(root: ReturnType<Core>, j: JSCodeshift, path: ASTPath<ClassProperty>, collections: ContextCollections) {
    collections.importFromVue.add('inject');

    const {comments, typeAnnotation} = path.node;
    const decorators: Decorator[] = 'decorators' in path.node ? (path.node.decorators as Decorator[]) : [];
    const key: Identifier = path.node.key as Identifier;
    const varIdentifier: Identifier = j.identifier(key.name);

    varIdentifier.typeAnnotation = typeAnnotation;

    const functionIdentifier: Identifier = j.identifier('inject');
    let params: Identifier[] = [];

    if (decorators?.[0]) {
        const expression: CallExpression = (decorators?.[0].expression as CallExpression)

        if (expression.arguments?.[0]) {
            const arg = expression.arguments[0];

            if ('value' in arg) {
                params.push(j.identifier(`'${arg.value}'`));
            } else if ('properties' in arg) {

                for (const prop of arg.properties) {
                    if (prop.type === 'ObjectProperty' && prop.key.type === 'Identifier') {
                        if (prop.key.name === 'from') {
                            params[0] = j.identifier(`'${(prop.value as StringLiteral).value}'`);
                        } else if (prop.key.name === 'default') {
                            if (prop.value.type === 'StringLiteral') {
                                params[1] = j.identifier(`'${prop.value.value}'`);
                            } else {
                                params[1] = j.identifier(j(prop.value).toSource());
                            }
                        }
                    }
                }
            } else if ('name' in arg) {
                params.push(j.identifier((arg as Identifier).name))
            }

        } else {
            params.push(j.identifier(`'${key.name}'`));
        }
    }

    const declarator = j.variableDeclarator(
        varIdentifier,
        j.callExpression(
            functionIdentifier,
            params
        )
    );

    const declaration = j.variableDeclaration('const', [declarator]);
    declaration.comments = comments;

    return declaration;
}
