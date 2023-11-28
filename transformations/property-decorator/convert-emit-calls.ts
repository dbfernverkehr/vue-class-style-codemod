
import {Collection, JSCodeshift} from "jscodeshift";

/**
* This function converts all $emit calls to emit calls.
 * @param j
 * @param root
 */
export function transformEmitCalls(j: JSCodeshift, root: Collection) {
    root.find(j.MemberExpression, {
        property: {
            name: '$emit'
        }
    }).replaceWith(nodePath => {
        if (nodePath.node.property.type === 'Identifier') {
            return nodePath.node.property.name = 'emit';
        }

        return nodePath.node;
    });
}
