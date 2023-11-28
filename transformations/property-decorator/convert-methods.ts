
import {
    ASTPath,
    ClassDeclaration,
    ClassMethod,
    Collection,
    Core,
    ExpressionStatement,
    FunctionDeclaration, Identifier,
    JSCodeshift
} from "jscodeshift";
import {ContextCollections} from "./ContextCollections";
import * as K from 'ast-types/gen/kinds'
import {lifecycleMap} from "./lifecycleMap";

/**
 * Replacement of methods
 * @param classComponent
 * @param j
 * @param root
 * @param collections
 */
export function transformMethods(classComponent: Collection<ClassDeclaration>, j: JSCodeshift, root: Collection, collections: ContextCollections) {
    const methods: Collection<ClassMethod> = classComponent
        .find(j.ClassMethod, {kind: 'method'})
        .filter(method => method.node.decorators === null)

    collections.collectionsToRemove.push(methods);

    methods.forEach((path: ASTPath<ClassMethod>) => {
        let statements = generateFunctionDeclaration(root, j, path, collections);
        if (Array.isArray(statements)) statements.forEach(statement => collections.replacements.push(statement));
        else collections.replacements.push(statements);
    });

}

/**
 * Replace methods with function in setup script
 *
 * From:
 *   public buttonClicked(): void {
 *     this.$emit('buttonClicked');
 *   }
 *
 * To:
 *  const buttonClicked = (): void => {
 *    this.$emit('buttonClicked');
 *  }
 *
 * @param root
 * @param j
 * @param path
 * @param collections
 */
export function generateFunctionDeclaration(root: ReturnType<Core>, j: JSCodeshift, path: ASTPath<ClassMethod>, collections: ContextCollections): FunctionDeclaration | ExpressionStatement | K.StatementKind[] {
    const {comments, returnType, body, params, async} = path.node;
    const key: Identifier = path.node.key as Identifier;
    const functionIdentifier: Identifier = j.identifier(key.name);
    const functionDeclaration: FunctionDeclaration = j.functionDeclaration(functionIdentifier, params, body);
    functionDeclaration.returnType = returnType;
    functionDeclaration.async = async;
    if (key.name in lifecycleMap) {
        const index: string = key.name;
        const lifecycle: string | null = lifecycleMap[index];
        let expressionStatement: ExpressionStatement;
        if (lifecycle !== null) {
            collections.importFromVue.add(lifecycle);

            expressionStatement = j.expressionStatement(
                j.callExpression(
                    j.identifier(lifecycle),
                    [
                        j.arrowFunctionExpression(params, body)
                    ]
                )
            );
            expressionStatement.comments = comments;

            return expressionStatement;
        } else {
            return body.body;
        }
    }
    functionDeclaration.comments = comments;
    if(path.node.accessibility === 'public') {
      collections.publicMethods.push(key.name);
    }
    return functionDeclaration

}


