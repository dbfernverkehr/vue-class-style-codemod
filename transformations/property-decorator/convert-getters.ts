
import {
    ASTPath,
    ClassDeclaration,
    ClassMethod,
    Collection,
    Core,
    Identifier,
    JSCodeshift,
    VariableDeclaration
} from "jscodeshift";
import {ContextCollections} from "./ContextCollections";

/**
 * Replacement of getters with computed props
 * @param classComponent
 * @param j
 * @param root
 * @param collections
 */
export function transformGetters(classComponent: Collection<ClassDeclaration>, j: JSCodeshift, root: Collection, collections: ContextCollections) {
    const getters: Collection<ClassMethod> = classComponent.find(j.ClassMethod, {kind: 'get'});

    collections.collectionsToRemove.push(getters);

    getters.forEach((path: ASTPath<ClassMethod>) => collections.replacements.push(generateComputedDeclaration(root, j, path, collections)));
}

/**
 * Generate computed node
 *
 * From:
 *  public get showButton(): boolean {
 *    return counter > 0;
 *  }
 *
 * To:
 *  const showButton = computed<boolean>(() => {
 *    return counter > 0;
 *  });
 *
 * @param root
 * @param j
 * @param path
 * @param collections
 */
function generateComputedDeclaration(root: ReturnType<Core>, j: JSCodeshift, path: ASTPath<ClassMethod>, collections: ContextCollections): VariableDeclaration {
    collections.importFromVue.add('computed');
    if(path.node.accessibility === 'public') collections.publicMethods.push(((path.node.key) as Identifier).name);
    const {body, comments, returnType} = path.node;
    const key: Identifier = path.node.key as Identifier;
    const varIdentifier: Identifier = j.identifier(key.name);
    let functionIdentifier: Identifier;
    if(returnType) functionIdentifier = j.identifier(`computed<${j(returnType.typeAnnotation!).toSource()}>`);
    else functionIdentifier = j.identifier(`computed`);

    const declaration = j.variableDeclarator(
        varIdentifier,
        j.callExpression(
            functionIdentifier,
            [j.arrowFunctionExpression([], body)]
        )
    );
    declaration.comments = comments;

    return j.variableDeclaration('const', [declaration]);
}
