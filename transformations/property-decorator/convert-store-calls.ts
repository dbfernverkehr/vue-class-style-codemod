
import {Collection, JSCodeshift} from "jscodeshift";

/**
 * transform $store to store
 * @param root
 * @param j
 */
export function transformStoreCalls(root: Collection, j: JSCodeshift) {
    const storeCalls: Collection = root.find(j.MemberExpression, {
        property: {
            name: '$store'
        }
    }).replaceWith(nodePath => {
        if (nodePath.node.property.type === 'Identifier') {
            return nodePath.node.property.name = 'store';
        }

        return nodePath.node;
    });

    if (storeCalls.length > 0) {
        // import useStore from vuex
        root.find(j.ImportDeclaration).at(-1).insertBefore(
            j.importDeclaration(
                [j.importSpecifier(j.identifier('useStore'))],
                j.stringLiteral('vuex')
            )
        );

        // define store
        root.find(j.ImportDeclaration).at(-1).insertBefore(
            j.variableDeclaration('const',
                [j.variableDeclarator(
                    j.identifier('store'),
                    j.callExpression(j.identifier('useStore'), []))
                ]
            )
        );
    }
}
