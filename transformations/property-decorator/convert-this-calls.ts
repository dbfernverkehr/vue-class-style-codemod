
import {Collection, JSCodeshift} from "jscodeshift";

/**
 * Remove 'this.' in a hacky way
 * @param root
 * @param j
 */
export function transformThisCalls(root: Collection, j: JSCodeshift) {
    root.find(j.MemberExpression, {
        object: {
            type: 'ThisExpression'
        }
    }).replaceWith(nodePath => {
        if (nodePath.node.property.type === 'Identifier') {
            return nodePath.node.property.name;
        }
        return nodePath.node;
    });
}
