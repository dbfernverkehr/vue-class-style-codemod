
import {Collection, JSCodeshift} from "jscodeshift";
import {ContextCollections} from "./ContextCollections";

/**
 * transform relative props
 * @param root
 * @param j
 * @param collections
 */
export function transformReactiveProps(root: Collection, j: JSCodeshift, collections: ContextCollections) {
    for (const prop of collections.reactiveProperties) {
        root.find(j.MemberExpression, {
            // @ts-ignore
            object: prop
        }).replaceWith(path => {
            const object = path.node.object as unknown;

            if (typeof object === 'string') {
                const newObjectString = (object as string).replace(prop, prop + '.value')
                path.node.object = j.identifier(newObjectString);
            }

            return path.node
        })
    }
}
