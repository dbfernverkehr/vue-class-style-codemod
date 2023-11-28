
import {ASTPath, ClassDeclaration, Collection, Identifier, JSCodeshift, MemberExpression} from "jscodeshift";

/**
 * Find all static expression of this class component and replace it
 * @param classComponent
 * @param root
 * @param j
 * @param collections
 */
export function transformStaticCalls(classComponent: Collection<ClassDeclaration>, root: Collection, j: JSCodeshift) {
    classComponent.forEach((nodePath: ASTPath<ClassDeclaration>) => {
        const {id} = nodePath.node;
        if (id) {
            // AnyComponent.open() ---> open()
            root.find(j.MemberExpression, {object: {name: id.name}, property: {type: 'Identifier'}})
                .replaceWith((nodePath: ASTPath<MemberExpression>) => {
                    const {property} = nodePath.node;

                    return (property as Identifier).name = (property as Identifier).name
                });
        }
    })
}
