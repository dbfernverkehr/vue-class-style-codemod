
import {Collection, JSCodeshift} from "jscodeshift";

/**
 * This function converts all $gettext and $gettextInterpolate calls to gettext and gettextInterpolate calls.
 * @param j
 * @param root
 */
export function transformGettextCalls(j: JSCodeshift, root: Collection) {
    const useGettext: Set<string> = new Set();
    // $gettext => gettext
    root.find(j.MemberExpression, {
        property: {
            name: '$gettext'
        }
    }).replaceWith(nodePath => {
        useGettext.add('$gettext');

        if (nodePath.node.property.type === 'Identifier') {
            return nodePath.node.property.name = '$gettext';
        }

        return nodePath.node;
    });

    // $gettextInterpolate => gettextInterpolate
    root.find(j.MemberExpression, {
        property: {
            name: '$gettextInterpolate'
        }
    }).replaceWith(nodePath => {
        useGettext.add('$gettextInterpolate');

        if (nodePath.node.property.type === 'Identifier') {
            return nodePath.node.property.name = '$gettextInterpolate';
        }

        return nodePath.node;
    });

    // import gettext methods
    if (useGettext.size > 0) {
        root.find(j.ImportDeclaration).at(-1).insertAfter(
            j.variableDeclaration('const',
                [j.variableDeclarator(
                    j.identifier('{ ' + [...useGettext].join(', ') + ' }'),
                    j.callExpression(j.identifier('useGettext'), []))
                ]
            )
        );
    }
}
