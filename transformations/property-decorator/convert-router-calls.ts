
import {Collection, ImportSpecifier, JSCodeshift} from "jscodeshift";

/**
 * transform $router and $route to router and route
 * @param j
 * @param root
 */
export function transformRouterCalls(j: JSCodeshift, root: Collection) {
    const useVueRouter: Set<string> = new Set();
    // $route => route
    const routeCalls: Collection = root.find(j.MemberExpression, {
        property: {
            name: '$route'
        }
    }).replaceWith(nodePath => {
        useVueRouter.add('useRoute');

        if (nodePath.node.property.type === 'Identifier') {
            return nodePath.node.property.name = 'route';
        }

        return nodePath.node;
    });

    // define route const
    if (routeCalls.length > 0) {
        root.find(j.ImportDeclaration).at(-1).insertAfter(
            j.variableDeclaration('const',
                [j.variableDeclarator(
                    j.identifier('route'),
                    j.callExpression(j.identifier('useRoute'), []))
                ]
            )
        );
    }

    // $router => router
    const routerCalls: Collection = root.find(j.MemberExpression, {
        property: {
            name: '$router'
        }
    }).replaceWith(nodePath => {
        useVueRouter.add('useRouter');

        if (nodePath.node.property.type === 'Identifier') {
            return nodePath.node.property.name = 'router';
        }

        return nodePath.node;
    });

    // define router const
    if (routerCalls.length > 0) {
        root.find(j.ImportDeclaration).at(-1).insertAfter(
            j.variableDeclaration('const',
                [j.variableDeclarator(
                    j.identifier('router'),
                    j.callExpression(j.identifier('useRouter'), []))
                ]
            )
        );
    }

    // import useRouter and useRoute from vue-router
    if (routerCalls.length > 0 || routeCalls.length > 0) {
        const specifiers: ImportSpecifier[] = [];
        useVueRouter.forEach(item => {
            const specifier = j.importSpecifier(j.identifier(item));
            specifiers.push(specifier);
        })

        root.find(j.ImportDeclaration).at(-1).insertAfter(
            j.importDeclaration(specifiers, j.stringLiteral('vue-router'))
        );
    }
}
