
import {Collection, JSCodeshift} from "jscodeshift";
import {ContextCollections} from "./ContextCollections";

/**
 * transform $nextTick to nextTick
 * @param j
 * @param root
 * @param collections
 */
export function transformNextTickCalls(j: JSCodeshift, root: Collection, collections: ContextCollections) {
    root.find(j.MemberExpression, {
        property: {
            name: '$nextTick'
        }
    }).replaceWith(nodePath => {
        collections.importFromVue.add('nextTick');

        if (nodePath.node.property.type === 'Identifier') {
            return nodePath.node.property.name = 'nextTick';
        }

        return nodePath.node;
    });
}
